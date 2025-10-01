package config

import (
	"log"
	"os"
	"strconv"
	"time"
)

type Config struct {
	ServiceHost string
	ServicePort int

	// Housing upstream (u docker mreži - vidi docker-compose ispod)
	HousingBaseURL   string        // npr. http://student-housing-service:8080
	HousingTimeout   time.Duration // default 3s
	EnableCORS       bool
}

func GetConfig() *Config {
	port, _ := strconv.Atoi(envOr("SERVICE_PORT", "8081"))
	timeoutMs, _ := strconv.Atoi(envOr("HOUSING_TIMEOUT_MS", "3000"))
	cfg := &Config{
		ServiceHost:      envOr("SERVICE_HOST", "0.0.0.0"),
		ServicePort:      port,
		HousingBaseURL:   envOr("HOUSING_BASE_URL", "http://student-housing-service:8080"),
		HousingTimeout:   time.Duration(timeoutMs) * time.Millisecond,
		EnableCORS:       envOr("ENABLE_CORS", "false") == "true",
	}
	if cfg.HousingBaseURL == "" {
		log.Fatal("HOUSING_BASE_URL is required")
	}
	return cfg
}

func envOr(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
