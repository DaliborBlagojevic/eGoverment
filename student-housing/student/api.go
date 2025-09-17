package student

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func WithStudentAPI(r *gin.RouterGroup, db *gorm.DB) {
	r.GET("/students", getStudents(db))
	r.GET("/students/:id", getStudentByID(db))
	r.POST("/students", createStudent(db))
	r.PUT("/students/:id", updateStudent(db))
	r.DELETE("/students/:id", deleteStudent(db))
}

func WithDormAPI(r *gin.RouterGroup, db *gorm.DB) {
	r.GET("/dorms", listDorms(db))
	r.GET("/dorms/:id", getDorm(db))
	r.POST("/dorms", createDorm(db))
	r.PUT("/dorms/:id", updateDorm(db))
	r.DELETE("/dorms/:id", deleteDorm(db))
}

func WithRoomAPI(r *gin.RouterGroup, db *gorm.DB) {
	r.GET("/rooms", listRooms(db)) // ?dormId=
	r.GET("/rooms/:id", getRoom(db))
	r.POST("/rooms", createRoom(db))
	r.PUT("/rooms/:id", updateRoom(db))
	r.DELETE("/rooms/:id", deleteRoom(db))
}

func WithApplicationAPI(r *gin.RouterGroup, db *gorm.DB) {
	r.GET("/applications", listApplications(db)) // ?studentId=&dormId=&status=
	r.GET("/applications/:id", getApplication(db))
	r.POST("/applications", createApplication(db))
	r.PUT("/applications/:id", updateApplication(db))
	r.DELETE("/applications/:id", deleteApplication(db))
}

func WithPaymentAPI(r *gin.RouterGroup, db *gorm.DB) {
	r.GET("/payments", listPayments(db)) // ?applicationId=
	r.GET("/payments/:id", getPayment(db))
	r.POST("/payments", createPayment(db))
	r.DELETE("/payments/:id", deletePayment(db))
}
