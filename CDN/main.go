package main

import (
	"log"
	"net/http"
	"os"

	"project-cdn/config"
	"project-cdn/handlers"
	logger "project-cdn/utils"

	"github.com/rs/cors"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize logger
	logInstance := logger.New()

	// Create storage folder if it doesn't exist
	if _, err := os.Stat(cfg.StorageFolder); os.IsNotExist(err) {
		if err := os.MkdirAll(cfg.StorageFolder, os.ModePerm); err != nil {
			logInstance.WithFields(map[string]interface{}{
				"error": err.Error(),
			}).Fatal("Failed to create storage folder")
		}
	}

	// Define allowed origins based on environment
	var allowedOrigins []string
	goEnv := os.Getenv("GO_ENV")
	if goEnv == "production" {
		allowedOrigins = []string{"*.onrender.com"} // Allow all subdomains of onrender.com
		logInstance.Info("Production environment detected. Allowing *.onrender.com")
	} else {
		allowedOrigins = []string{"http://localhost:3000", "http://localhost:4000", "http://localhost:4001"}
		logInstance.Info("Development environment detected. Allowing localhost origins")
	}

	// Setup CORS middleware
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
	})

	// Setup routes
	mux := http.NewServeMux()
	mux.HandleFunc("/upload", handlers.UploadHandler(cfg, logInstance))
	mux.HandleFunc("/download/", handlers.DownloadHandler(cfg, logInstance))
	mux.HandleFunc("/delete/", handlers.DeleteHandler(cfg, logInstance))

	// Wrap routes with CORS middleware
	handlerWithCors := corsHandler.Handler(mux)

	logInstance.Info("CDN Server running on " + cfg.ServerPort)
	log.Fatal(http.ListenAndServe(cfg.ServerPort, handlerWithCors))
}
