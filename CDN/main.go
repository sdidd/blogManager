package main

import (
	"log"
	"net/http"
	"os"

	"project-cdn/config"
	"project-cdn/handlers"
	logger "project-cdn/utils"
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

	// Setup routes
	http.HandleFunc("/upload", handlers.UploadHandler(cfg, logInstance))
	http.HandleFunc("/download/", handlers.DownloadHandler(cfg, logInstance))
	http.HandleFunc("/delete/", handlers.DeleteHandler(cfg, logInstance))

	logInstance.Info("CDN Server running on " + cfg.ServerPort)
	log.Fatal(http.ListenAndServe(cfg.ServerPort, nil))
}
