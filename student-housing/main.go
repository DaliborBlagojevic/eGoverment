package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"

	"student-housting/config"
	"student-housting/data"
	"student-housting/student"
)

func main() {
	cfg := config.GetConfig()

	// DB
	db, err := data.InitDB(cfg.DBHost, cfg.DBUser, cfg.DBPass, cfg.DBName, 5432)
	if err != nil {
		panic(fmt.Sprintf("Failed to connect to database: %v", err))
	}
	if err = data.AutoMigrate(db); err != nil {
		panic(err)
	}

	// UBACI JEDNOG STUDENTA SVAKI PUT
	// s := types.Student{
	// 	ID:        uuid.New(),
	// 	Index:     fmt.Sprintf("TEST-%d", time.Now().Unix()), // unique index
	// 	FirstName: "Auto",
	// 	LastName:  "Generated",
	// 	Faculty:   "FTN",
	// }
	// if err := db.Create(&s).Error; err != nil {
	// 	log.Println("❌ Failed to insert test student:", err)
	// } else {
	// 	log.Println("✅ Inserted test student:", s.ID, s.Index)
	// }

	// HTTP server
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery(), gin.Logger())

	r.GET("/healthz", func(c *gin.Context) { c.String(200, "ok") })

	api := r.Group("/api")
	student.WithStudentAPI(api, db)
	student.WithDormAPI(api, db)
	student.WithRoomAPI(api, db)
	student.WithApplicationAPI(api, db)
	student.WithPaymentAPI(api, db)

	addr := fmt.Sprintf("%s:%d", cfg.ServiceHost, cfg.ServicePort)
	if err := r.Run(addr); err != nil {
		log.Fatal("greska prilikom pokretanja servera: ", err)
	}
}
