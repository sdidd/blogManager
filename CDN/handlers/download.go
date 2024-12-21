package handlers

import (
	"net/http"
	"path/filepath"

	"project-cdn/config"
	logger "project-cdn/utils"
)

func DownloadHandler(cfg *config.Config, log *logger.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		filename := r.URL.Path[len("/download/"):]
		if filename == "" {
			log.Warn("Download request without a filename")
			http.Error(w, "File name not specified", http.StatusBadRequest)
			return
		}

		filePath := filepath.Join(cfg.StorageFolder, filename)
		log.WithFields(map[string]interface{}{
			"filename": filename,
			"filePath": filePath,
		}).Info("Attempting to serve file")

		http.ServeFile(w, r, filePath)
		log.WithFields(map[string]interface{}{
			"filename": filename,
		}).Info("File served successfully")
	}
}
