package student

import (
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"student-housting/types"
)

/* ===================== Helpers ===================== */

func parseUUID(c *gin.Context, name string) (uuid.UUID, bool) {
	idStr := c.Param(name)
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID: " + name})
		return uuid.Nil, false
	}
	return id, true
}

func pagination(c *gin.Context) (page, size, offset int) {
	page, _ = strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	size, _ = strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if size < 1 || size > 1000 {
		size = 10
	}
	offset = (page - 1) * size
	return
}

func jsonErr(c *gin.Context, code int, msg string) {
	c.JSON(code, gin.H{"error": msg})
}

func isValidStatus(s types.ApplicationStatus) bool {
	switch s {
	case types.StatusSubmitted, types.StatusAccepted, types.StatusRejected, types.StatusReserved:
		return true
	}
	return false
}

/* ===================== STUDENT ===================== */

func getStudents(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var students []types.User
		var totalCount int64

		searchQuery := c.DefaultQuery("name", "")
		page, pageSize, offset := pagination(c)

		if searchQuery != "" {
			// Requires pg_trgm extension for similarity(); otherwise replace with ILIKE.
			err := db.Raw(`
				SELECT * FROM users
				WHERE similarity(first_name, ?) > 0.3 OR similarity(last_name, ?) > 0.3 AND role = 'STUDENT'
				ORDER BY GREATEST(similarity(first_name, ?), similarity(last_name, ?)) DESC
				LIMIT ? OFFSET ?`,
				searchQuery, searchQuery, searchQuery, searchQuery, pageSize, offset,
			).Scan(&students).Error
			if err != nil {
				jsonErr(c, http.StatusInternalServerError, "failed to retrieve students")
				return
			}
			if err := db.Raw(`
				SELECT COUNT(*) FROM students
				WHERE similarity(first_name, ?) > 0.3 OR similarity(last_name, ?) > 0.3`,
				searchQuery, searchQuery,
			).Scan(&totalCount).Error; err != nil {
				jsonErr(c, http.StatusInternalServerError, "failed to count students")
				return
			}
		} else {
			if err := db.Model(&types.User{}).Count(&totalCount).Error; err != nil {
				jsonErr(c, http.StatusInternalServerError, "failed to count students")
				return
			}
			if err := db.Offset(offset).Limit(pageSize).Find(&students).Error; err != nil {
				jsonErr(c, http.StatusInternalServerError, "failed to retrieve students")
				return
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"students":   students,
			"pagination": gin.H{"page": page, "pageSize": pageSize, "totalCount": totalCount},
		})
	}
}

func getStudentByID(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, ok := parseUUID(c, "id")
		if !ok {
			return
		}
		var s types.User
		if err := db.First(&s, "id = ?", id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				jsonErr(c, http.StatusNotFound, "student not found")
				return
			}
			jsonErr(c, http.StatusInternalServerError, "failed to fetch student")
			return
		}
		c.JSON(http.StatusOK, s)
	}
}

type updateRoleReq struct {
	Role string `json:"role"` // "ADMIN" | "STUDENT" | "TEACHER"
}

func isValidRole(r string) bool {
	switch strings.ToUpper(strings.TrimSpace(r)) {
	case string(types.AdminRole), string(types.StudentRole), string(types.TeacherRole):
		return true
	default:
		return false
	}
}

func UpdateUserRole(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var body updateRoleReq
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json"})
			return
		}
		if !isValidRole(body.Role) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid role"})
			return
		}
		newRole := types.Role(strings.ToUpper(body.Role))

		var u types.User
		if err := db.First(&u, "id = ?", id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
				return
			}
			log.Printf("[UpdateUserRole] load user err: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load user"})
			return
		}

		// Update role
		if err := db.Model(&types.User{}).
			Where("id = ?", id).
			Update("role", newRole).Error; err != nil {
			log.Printf("[UpdateUserRole] update err: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update role"})
			return
		}

		u.Role = newRole
		c.JSON(http.StatusOK, u)
	}
}

func createStudent(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var s types.User
		if err := c.ShouldBindJSON(&s); err != nil {
			jsonErr(c, http.StatusBadRequest, "invalid json")
			return
		}
		if strings.TrimSpace(s.FirstName) == "" || strings.TrimSpace(s.LastName) == "" {
			jsonErr(c, http.StatusBadRequest, "firstName and lastName are required")
			return
		}

		// Ako nije setovan role, postavi default na STUDENT
		if strings.TrimSpace(string(s.Role)) == "" {
			s.Role = types.StudentRole
		}

		if err := db.Create(&s).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to create student")
			return
		}
		c.JSON(http.StatusCreated, s)
	}
}

func updateStudent(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, ok := parseUintParam(c, "id")
		if !ok {
			return
		}
		var in types.User
		if err := c.ShouldBindJSON(&in); err != nil {
			jsonErr(c, http.StatusBadRequest, "invalid json")
			return
		}
		var s types.User
		if err := db.First(&s, "id = ?", id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				jsonErr(c, http.StatusNotFound, "student not found")
				return
			}
			jsonErr(c, http.StatusInternalServerError, "failed to fetch student")
			return
		}
		s.Index = in.Index
		s.FirstName = in.FirstName
		s.LastName = in.LastName
		s.Faculty = in.Faculty
		if err := db.Save(&s).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to update student")
			return
		}
		c.JSON(http.StatusOK, s)
	}
}

func changePassword(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, ok := parseUintParam(c, "id")
		if !ok {
			return
		}
		var in types.ChangePassReq
		if err := c.ShouldBindJSON(&in); err != nil {
			jsonErr(c, http.StatusBadRequest, "invalid json")
			return
		}

		var s types.User
		if err := db.First(&s, "id = ?", id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				jsonErr(c, http.StatusNotFound, "student not found")
				return
			}
			jsonErr(c, http.StatusInternalServerError, "failed to fetch student")
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(s.Password), []byte(in.OldPassword)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "incorect old password"})
			return
		}

		hash, err := bcrypt.GenerateFromPassword([]byte(in.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
			return
		}
		s.Password = string(hash)
		if err := db.Save(&s).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to update student")
			return
		}
		c.JSON(http.StatusOK, s)
	}
}

func deleteStudent(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, ok := parseUUID(c, "id")
		if !ok {
			return
		}
		if err := db.Delete(&types.User{}, "id = ?", id).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to delete student")
			return
		}
		c.Status(http.StatusNoContent)
	}
}

/* ===================== DORM ===================== */

func listDorms(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var dorms []types.Dorm
		page, size, offset := pagination(c)
		if err := db.Offset(offset).Limit(size).Find(&dorms).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to retrieve dorms")
			return
		}
		var cnt int64
		_ = db.Model(&types.Dorm{}).Count(&cnt).Error
		c.JSON(http.StatusOK, gin.H{"items": dorms, "pagination": gin.H{"page": page, "pageSize": size, "totalCount": cnt}})
	}
}

func getDorm(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, ok := parseUUID(c, "id")
		if !ok {
			return
		}
		var d types.Dorm
		if err := db.First(&d, "id = ?", id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				jsonErr(c, http.StatusNotFound, "dorm not found")
				return
			}
			jsonErr(c, http.StatusInternalServerError, "failed to fetch dorm")
			return
		}
		c.JSON(http.StatusOK, d)
	}
}

func createDorm(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var d types.Dorm
		if err := c.ShouldBindJSON(&d); err != nil {
			jsonErr(c, http.StatusBadRequest, "invalid json")
			return
		}
		if strings.TrimSpace(d.Name) == "" || strings.TrimSpace(d.Address) == "" {
			jsonErr(c, http.StatusBadRequest, "name and address are required")
			return
		}
		if d.ID == uuid.Nil {
			d.ID = uuid.New()
		}
		if err := db.Create(&d).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to create dorm")
			return
		}
		c.JSON(http.StatusCreated, d)
	}
}

func updateDorm(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, ok := parseUUID(c, "id")
		if !ok {
			return
		}
		var in types.Dorm
		if err := c.ShouldBindJSON(&in); err != nil {
			jsonErr(c, http.StatusBadRequest, "invalid json")
			return
		}
		var d types.Dorm
		if err := db.First(&d, "id = ?", id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				jsonErr(c, http.StatusNotFound, "dorm not found")
				return
			}
			jsonErr(c, http.StatusInternalServerError, "failed to fetch dorm")
			return
		}
		d.Name, d.Address = in.Name, in.Address
		if err := db.Save(&d).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to update dorm")
			return
		}
		c.JSON(http.StatusOK, d)
	}
}

func deleteDorm(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, ok := parseUUID(c, "id")
		if !ok {
			return
		}
		if err := db.Delete(&types.Dorm{}, "id = ?", id).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to delete dorm")
			return
		}
		c.Status(http.StatusNoContent)
	}
}

/* ===================== ROOM ===================== */

func listRooms(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var rooms []types.Room
		page, size, offset := pagination(c)
		dormID := c.Query("dormId")
		q := db.Offset(offset).Limit(size)
		if dormID != "" {
			q = q.Where("dorm_id = ?", dormID)
		}
		if err := q.Find(&rooms).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to retrieve rooms")
			return
		}
		var cnt int64
		_ = db.Model(&types.Room{}).Count(&cnt).Error
		c.JSON(http.StatusOK, gin.H{"items": rooms, "pagination": gin.H{"page": page, "pageSize": size, "totalCount": cnt}})
	}
}

func getRoom(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, ok := parseUUID(c, "id")
		if !ok {
			return
		}
		var r types.Room
		if err := db.First(&r, "id = ?", id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				jsonErr(c, http.StatusNotFound, "room not found")
				return
			}
			jsonErr(c, http.StatusInternalServerError, "failed to fetch room")
			return
		}
		c.JSON(http.StatusOK, r)
	}
}

func createRoom(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var r types.Room
		if err := c.ShouldBindJSON(&r); err != nil {
			jsonErr(c, http.StatusBadRequest, "invalid json")
			return
		}
		if r.DormID == uuid.Nil || strings.TrimSpace(r.Number) == "" || r.Capacity <= 0 {
			jsonErr(c, http.StatusBadRequest, "dormId, number and capacity are required")
			return
		}
		if r.ID == uuid.Nil {
			r.ID = uuid.New()
		}
		if err := db.Create(&r).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to create room")
			return
		}
		c.JSON(http.StatusCreated, r)
	}
}

func updateRoom(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, ok := parseUUID(c, "id")
		if !ok {
			return
		}
		var in types.Room
		if err := c.ShouldBindJSON(&in); err != nil {
			jsonErr(c, http.StatusBadRequest, "invalid json")
			return
		}
		var r types.Room
		if err := db.First(&r, "id = ?", id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				jsonErr(c, http.StatusNotFound, "room not found")
				return
			}
			jsonErr(c, http.StatusInternalServerError, "failed to fetch room")
			return
		}
		r.Number, r.Capacity, r.Available = in.Number, in.Capacity, in.Available
		if err := db.Save(&r).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to update room")
			return
		}
		c.JSON(http.StatusOK, r)
	}
}

func deleteRoom(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, ok := parseUUID(c, "id")
		if !ok {
			return
		}
		if err := db.Delete(&types.Room{}, "id = ?", id).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to delete room")
			return
		}
		c.Status(http.StatusNoContent)
	}
}

/* ===================== APPLICATION ===================== */

func listApplications(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []types.Application
		page, size, offset := pagination(c)
		q := db.Offset(offset).Limit(size)
		if sid := c.Query("studentId"); sid != "" {
			q = q.Where("student_id = ?", sid)
		}
		if dormID := c.Query("dormId"); dormID != "" {
			// filter by dorm via room
			q = q.Joins("LEFT JOIN rooms r ON r.id = applications.room_id").Where("r.dorm_id = ?", dormID)
		}
		if status := c.Query("status"); status != "" {
			q = q.Where("status = ?", status)
		}
		if err := q.Order("created_at DESC").Find(&list).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to retrieve applications")
			return
		}
		var cnt int64
		_ = db.Model(&types.Application{}).Count(&cnt).Error
		c.JSON(http.StatusOK, gin.H{"items": list, "pagination": gin.H{"page": page, "pageSize": size, "totalCount": cnt}})
	}
}

func getApplication(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, ok := parseUUID(c, "id")
		if !ok {
			return
		}
		var a types.Application
		if err := db.First(&a, "id = ?", id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				jsonErr(c, http.StatusNotFound, "application not found")
				return
			}
			jsonErr(c, http.StatusInternalServerError, "failed to fetch application")
			return
		}
		c.JSON(http.StatusOK, a)
	}
}

func createApplication(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var a types.Application
		if err := c.ShouldBindJSON(&a); err != nil {
			jsonErr(c, http.StatusBadRequest, "invalid json")
			return
		}
		if a.StudentID == uuid.Nil {
			jsonErr(c, http.StatusBadRequest, "studentId is required")
			return
		}
		if !isValidStatus(a.Status) {
			jsonErr(c, http.StatusBadRequest, "invalid status")
			return
		}
		if a.ID == uuid.Nil {
			a.ID = uuid.New()
		}
		a.CreatedAt = time.Now().UTC()
		if err := db.Create(&a).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to create application")
			return
		}
		c.JSON(http.StatusCreated, a)
	}
}

func updateApplication(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, ok := parseUUID(c, "id")
		if !ok {
			return
		}
		var in types.Application
		if err := c.ShouldBindJSON(&in); err != nil {
			jsonErr(c, http.StatusBadRequest, "invalid json")
			return
		}
		if !isValidStatus(in.Status) {
			jsonErr(c, http.StatusBadRequest, "invalid status")
			return
		}
		var a types.Application
		if err := db.First(&a, "id = ?", id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				jsonErr(c, http.StatusNotFound, "application not found")
				return
			}
			jsonErr(c, http.StatusInternalServerError, "failed to fetch application")
			return
		}
		a.Points = in.Points
		a.Status = in.Status
		a.RoomID = in.RoomID // may be nil
		if err := db.Save(&a).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to update application")
			return
		}
		c.JSON(http.StatusOK, a)
	}
}

func deleteApplication(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, ok := parseUUID(c, "id")
		if !ok {
			return
		}
		if err := db.Delete(&types.Application{}, "id = ?", id).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to delete application")
			return
		}
		c.Status(http.StatusNoContent)
	}
}

/* ===================== PAYMENT ===================== */

func listPayments(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []types.Payment
		page, size, offset := pagination(c)
		q := db.Offset(offset).Limit(size)
		if aid := c.Query("applicationId"); aid != "" {
			q = q.Where("application_id = ?", aid)
		}
		if err := q.Order("issued_at DESC").Find(&list).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to retrieve payments")
			return
		}
		var cnt int64
		_ = db.Model(&types.Payment{}).Count(&cnt).Error
		c.JSON(http.StatusOK, gin.H{"items": list, "pagination": gin.H{"page": page, "pageSize": size, "totalCount": cnt}})
	}
}

func getPayment(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, ok := parseUUID(c, "id")
		if !ok {
			return
		}
		var p types.Payment
		if err := db.First(&p, "id = ?", id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				jsonErr(c, http.StatusNotFound, "payment not found")
				return
			}
			jsonErr(c, http.StatusInternalServerError, "failed to fetch payment")
			return
		}
		c.JSON(http.StatusOK, p)
	}
}

func createPayment(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var p types.Payment
		if err := c.ShouldBindJSON(&p); err != nil {
			jsonErr(c, http.StatusBadRequest, "invalid json")
			return
		}
		if p.ApplicationID == uuid.Nil || strings.TrimSpace(p.Reference) == "" {
			jsonErr(c, http.StatusBadRequest, "applicationId and reference are required")
			return
		}
		if p.ID == uuid.Nil {
			p.ID = uuid.New()
		}
		if p.IssuedAt.IsZero() {
			p.IssuedAt = time.Now().UTC()
		}
		if err := db.Create(&p).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to create payment")
			return
		}
		c.JSON(http.StatusCreated, p)
	}
}

func deletePayment(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, ok := parseUUID(c, "id")
		if !ok {
			return
		}
		if err := db.Delete(&types.Payment{}, "id = ?", id).Error; err != nil {
			jsonErr(c, http.StatusInternalServerError, "failed to delete payment")
			return
		}
		c.Status(http.StatusNoContent)
	}
}

func parseUintParam(c *gin.Context, name string) (uint, bool) {
	raw := c.Param(name)
	if raw == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing " + name})
		return 0, false
	}
	n, err := strconv.ParseUint(raw, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid " + name})
		return 0, false
	}
	return uint(n), true
}
