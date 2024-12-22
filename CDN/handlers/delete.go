package handlers

import (
	"net/http"
	"os"
	"path/filepath"

	"project-cdn/config"
	logger "project-cdn/utils"
)

func DeleteHandler(cfg *config.Config, log *logger.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		filename := r.URL.Path[len("/delete/"):]
		if filename == "" {
			log.Warn("Delete request without a filename")
			http.Error(w, "File name not specified", http.StatusBadRequest)
			return
		}

		filePath := filepath.Join(cfg.StorageFolder, filename)
		log.WithFields(map[string]interface{}{
			"filename": filename,
			"filePath": filePath,
		}).Info("Attempting to delete file")

		if err := os.Remove(filePath); err != nil {
			log.WithFields(map[string]interface{}{
				"error":    err.Error(),
				"filePath": filePath,
			}).Error("Failed to delete file")
			http.Error(w, "Failed to delete file", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
		log.WithFields(map[string]interface{}{
			"filename": filename,
		}).Info("File deleted successfully")
	}
}
