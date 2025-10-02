package main

import (
	"fmt"
	"log"
	"open-data/config"
	"open-data/handlers"
	"open-data/upstream"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.GetConfig()

	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	if err := router.SetTrustedProxies(nil); err != nil {
		panic("Error setting trusted proxies")
	}

	// Upstream klijent ka student-housing servisu
	housingClient := upstream.NewHousingClient(cfg.HousingBaseURL, cfg.HousingTimeout)
	dormsHandler := handlers.NewDormsHandler(housingClient)

	// Health
	router.GET("/healthz", func(c *gin.Context) { c.JSON(200, gin.H{"ok": true}) })

	api := router.Group("")
	{
		// Dorms
		api.GET("/dorms", dormsHandler.ListDorms)
		api.GET("/dorms.pdf", dormsHandler.DormsPDF)

		// Students
		api.GET("/students", dormsHandler.ListStudents)
		api.GET("/students.pdf", dormsHandler.StudentsPDF)

		// Price plans
		api.GET("/price-plans", dormsHandler.ListPricePlans)
		api.GET("/price-plans.pdf", dormsHandler.PricePlansPDF)

		// Daily availability
		api.GET("/daily-availability", dormsHandler.ListDailyAvailability)
		api.GET("/daily-availability.pdf", dormsHandler.DailyAvailabilityPDF)

		// Application stats
		api.GET("/application-stats", dormsHandler.ListApplicationStats)
		api.GET("/application-stats.pdf", dormsHandler.ApplicationStatsPDF)

		// Payment stats
		api.GET("/payment-stats", dormsHandler.ListPaymentStats)
		api.GET("/payment-stats.pdf", dormsHandler.PaymentStatsPDF)
	}

	url := fmt.Sprintf("%s:%d", cfg.ServiceHost, cfg.ServicePort)
	if err := router.Run(url); err != nil {
		log.Fatal("greska prilikom pokretanja servera", err)
	}
}
