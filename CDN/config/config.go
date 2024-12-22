package config

import (
	"log"
	"os"
)

type Config struct {
	ServerPort    string
	StorageFolder string
	JWTSecret string
	GO_ENV string
}

func Load() *Config {
	cfg := &Config{
		ServerPort:    getEnv("SERVER_PORT", ":8080"),
		StorageFolder: getEnv("STORAGE_FOLDER", "./cdn-storage"),
		JWTSecret: getEnv("JWT_SECRET", "your_secret_key"),
		GO_ENV: getEnv("GO_ENV","development"),
	}

	log.Printf("Configuration loaded: %+v\n", cfg)
	return cfg
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
