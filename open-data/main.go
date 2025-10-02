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

	// Public API
	api := router.Group("")
	{
		api.GET("/dorms", dormsHandler.ListDorms)
		api.GET("/dorms.pdf", dormsHandler.DormsPDF)
	}

	url := fmt.Sprintf("%s:%d", cfg.ServiceHost, cfg.ServicePort)
	if err := router.Run(url); err != nil {
		log.Fatal("greska prilikom pokretanja servera", err)
	}
}
