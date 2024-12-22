package handlers

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strings"

	"project-cdn/config"
	"project-cdn/storage"
	logger "project-cdn/utils"

	"github.com/golang-jwt/jwt/v4"
)

// sanitizeFileName removes spaces and symbols and appends the user ID.
func sanitizeFileName(filename, userID string) string {
	// Replace spaces and symbols with underscores
	re := regexp.MustCompile(`[^\w.]`)
	sanitized := re.ReplaceAllString(filename, "_")
	return userID + "_" + sanitized
}

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

		// Validate and decode the JWT token
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			log.Warn("Authorization header missing")
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		// Extract the token from the Bearer header
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader { // No "Bearer " prefix found
			log.Warn("Invalid Authorization header format")
			http.Error(w, "Invalid Authorization header format", http.StatusUnauthorized)
			return
		}

		// Decode the JWT token (Replace with your JWT secret or method as needed)
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate the signing method (e.g., HMAC)
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.NewValidationError("unexpected signing method", jwt.ValidationErrorSignatureInvalid)
			}
			return []byte(cfg.JWTSecret), nil
		})
		if err != nil || !token.Valid {
			log.WithFields(map[string]interface{}{
				"error": err.Error(),
			}).Warn("Invalid token")
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Extract user ID from token claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || claims["id"] == nil {
			log.Warn("Invalid token claims")
			http.Error(w, "Invalid token claims", http.StatusUnauthorized)
			return
		}
		userID := claims["id"].(string)
		log.WithFields(map[string]interface{}{
			"userID": userID,
		}).Info("User ID extracted from token")

		// Check Content-Type header
		contentType := r.Header.Get("Content-Type")
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

		// Sanitize the filename
		sanitizedFilename := sanitizeFileName(header.Filename, userID)

		// Save the file to local storage
		filePath, err := storage.SaveToLocal(cfg, file, sanitizedFilename)
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
			"fileName": sanitizedFilename,
		}).Info("File saved successfully")

		// Generate the URL to access the file
		url := "/download/" + sanitizedFilename // Use `/` as separator

		// Send the response
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"url": url})

		log.WithFields(map[string]interface{}{
			"url": url,
		}).Info("Response sent")
	}
}
