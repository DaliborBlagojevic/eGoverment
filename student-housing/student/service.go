package student

import (
	"gin/types"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func getStudents(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		var students []types.Student
		var totalCount int64

		searchQuery := c.DefaultQuery("name", "")
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
		offset := (page - 1) * pageSize

		if searchQuery != "" {
			err := db.Raw(`
				SELECT * FROM students
				WHERE similarity(name, ?) > 0.3 OR similarity(surname, ?) > 0.3
				ORDER BY GREATEST(similarity(name, ?), similarity(surname, ?)) DESC
				LIMIT ? OFFSET ?
			`, searchQuery, searchQuery, searchQuery, searchQuery, pageSize, offset).Scan(&students).Error

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve students"})
				return
			}

			err = db.Raw(`
				SELECT COUNT(*) FROM students
				WHERE similarity(name, ?) > 0.3 OR similarity(surname, ?) > 0.3
			`, searchQuery, searchQuery).Scan(&totalCount).Error

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count students"})
				return
			}
		} else {
			err := db.Model(&types.Student{}).Count(&totalCount).Offset(offset).Limit(pageSize).Find(&students).Error

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve students"})
				return
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"students": students,
			"pagination": gin.H{
				"page":       page,
				"pageSize":   pageSize,
				"totalCount": totalCount,
			},
		})
	}
}

func createStudent(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var s types.Student

		if err := c.ShouldBindJSON(&s); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json"})
			return
		}

		if strings.TrimSpace(s.Name) == "" || strings.TrimSpace(s.Surname) == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "name and surname are required"})
			return
		}

		if err := db.Create(&s).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create student"})
			return
		}

		c.JSON(http.StatusCreated, s)
	}
}
