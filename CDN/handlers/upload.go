package handlers

import (
	"encoding/json"
	"net/http"
	"path/filepath"
	"strings" // Import strings package to check for substring

	"project-cdn/config"
	"project-cdn/storage"
	logger "project-cdn/utils"
)

func UploadHandler(cfg *config.Config, log *logger.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Log the entire request headers
		log.WithFields(map[string]interface{}{
			"method":   r.Method,
			"endpoint": r.URL.Path,
			"headers":  r.Header, // Print headers for debugging
		}).Info("Request received")

		// Check request method
		if r.Method != http.MethodPost {
			log.Warn("Invalid request method")
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		// Check Content-Type header to allow multipart/form-data with boundary
		contentType := r.Header.Get("Content-Type")
		log.WithFields(map[string]interface{}{
			"Content-Type": contentType, // Log the Content-Type header
		}).Info("Content-Type header")

		if !strings.HasPrefix(contentType, "multipart/form-data") {
			log.Warn("Invalid or missing Content-Type header")
			http.Error(w, "Content-Type must be multipart/form-data", http.StatusBadRequest)
			return
		}

		// Parse the uploaded file
		file, header, err := r.FormFile("file")
		if err != nil {
			log.WithFields(map[string]interface{}{
				"error": err.Error(),
			}).Error("Failed to read file from request")
			http.Error(w, "Failed to read file", http.StatusBadRequest)
			return
		}
		defer file.Close()

		// Save the file to local storage
		filePath, err := storage.SaveToLocal(cfg, file, header.Filename)
		if err != nil {
			log.WithFields(map[string]interface{}{
				"error": err.Error(),
			}).Error("Failed to save file")
			http.Error(w, "Failed to save file", http.StatusInternalServerError)
			return
		}

		// Log the successful save
		log.WithFields(map[string]interface{}{
			"filePath": filePath,
			"fileName": header.Filename,
		}).Info("File saved successfully")

		// Generate the URL to access the file
		url := filepath.Join("/download", header.Filename)

		// Send the response
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"url": url})

		log.WithFields(map[string]interface{}{
			"url": url,
		}).Info("Response sent")
	}
}
