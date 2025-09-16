package main

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type loginReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
type loginResp struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int64  `json:"expires_in"`
	TokenType   string `json:"token_type"`
}

func mustEnv(k string) string {
	v := os.Getenv(k)
	if v == "" {
		panic("missing env " + k)
	}
	return v
}

func main() {
	secret := []byte(mustEnv("JWT_SECRET"))
	issuer := os.Getenv("ISSUER")
	if issuer == "" {
		issuer = "auth"
	}

	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	r.GET("/healthz", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})

	r.POST("/login", func(c *gin.Context) {
		var req loginReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "bad request"})
			return
		}
		// Demo auth: password == "password"
		if req.Username == "" || req.Password != "password" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}

		claims := jwt.MapClaims{
			"sub":  req.Username,
			"iss":  issuer,
			"role": "user",
			"iat":  time.Now().Unix(),
			"exp":  time.Now().Add(15 * time.Minute).Unix(),
		}
		tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		signed, err := tok.SignedString(secret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "signing failed"})
			return
		}

		c.JSON(http.StatusOK, loginResp{
			AccessToken: signed,
			ExpiresIn:   15 * 60,
			TokenType:   "Bearer",
		})
	})

	addr := ":8080"
	if err := r.Run(addr); err != nil {
		panic(err)
	}
}
