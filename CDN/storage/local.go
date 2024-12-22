package storage

import (
	"fmt"
	"io"
	"os"
	"path/filepath"

	"project-cdn/config"
)

func SaveToLocal(cfg *config.Config, file io.Reader, filename string) (string, error) {
	filePath := filepath.Join(cfg.StorageFolder, filename)

	out, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %v", err)
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		return "", fmt.Errorf("failed to save file: %v", err)
	}

	return filePath, nil
}
