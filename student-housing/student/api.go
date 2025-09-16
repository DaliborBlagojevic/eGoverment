package student

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func WithStudentAPI(r *gin.RouterGroup, db *gorm.DB) {
	r.GET("/students", getStudents(db))
	r.POST("/students", createStudent(db))
}
