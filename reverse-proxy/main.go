package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("missing env %s", key)
	}
	return v
}

func newReverseProxy(target string) *httputil.ReverseProxy {
	u, err := url.Parse(target)
	if err != nil {
		log.Fatalf("bad upstream %s: %v", target, err)
	}
	proxy := httputil.NewSingleHostReverseProxy(u)
	// Optional: tweak Transport timeouts
	proxy.Transport = &http.Transport{
		Proxy: http.ProxyFromEnvironment,
		// Add sane timeouts here if desired
	}
	// Preserve original Host if you need it:
	// proxy.Director = func(req *http.Request) { /* customize */ }
	return proxy
}

func jwtMiddleware(next http.Handler, secret []byte, exemptPaths map[string]bool) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Public endpoints (e.g., login, health)
		if exemptPaths[r.URL.Path] {
			next.ServeHTTP(w, r)
			return
		}

		// Only /api/* require auth in this demo
		if !strings.HasPrefix(r.URL.Path, "/api/") {
			next.ServeHTTP(w, r)
			return
		}

		auth := r.Header.Get("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			http.Error(w, "missing bearer token", http.StatusUnauthorized)
			return
		}
		tokenStr := strings.TrimPrefix(auth, "Bearer ")

		tok, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return secret, nil
		})
		if err != nil || !tok.Valid {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}
		// You can read claims if needed:
		// claims, _ := tok.Claims.(jwt.MapClaims)

		// Propagate user info to downstreams if desired:
		// r.Header.Set("X-User-ID", fmt.Sprint(claims["sub"]))

		next.ServeHTTP(w, r)
	})
}

func main() {
	jwtSecret := []byte(mustEnv("JWT_SECRET"))
	authURL := mustEnv("AUTH_SERVICE_URL")
	aURL := mustEnv("OPEN_DATA_SERVICE_URL")
	bURL := mustEnv("STUDENT_HOUSING_SERVICE_URL")

	authProxy := newReverseProxy(authURL)
	aProxy := newReverseProxy(aURL)
	bProxy := newReverseProxy(bURL)

	mux := http.NewServeMux()

	// Health
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	// Public: pass-through to auth-service for login/refresh/etc.
	mux.Handle("/auth/", http.StripPrefix("/auth", authProxy))

	// Protected API routes
	mux.Handle("/api/a/", http.StripPrefix("/api/a", aProxy))
	mux.Handle("/api/b/", http.StripPrefix("/api/b", bProxy))

	// (Optional) default 404
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.NotFound(w, r)
	})

	// Exemptions for middleware
	exempt := map[string]bool{
		"/healthz":     true,
		"/auth/login":  true,
		"/auth/refresh": true,
		"/auth/.well-known/jwks.json": true, // if you add JWKS later
		"/auth/":       true, // allow other auth endpoints
	}

	// Wrap with JWT middleware
	handler := jwtMiddleware(mux, jwtSecret, exempt)

	srv := &http.Server{
		Addr:              ":8080",
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Println("reverse-proxy listening on :8080")
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}

	// On shutdown:
	_ = srv.Shutdown(context.Background())
}
