package logger

import (
	"os"

	"github.com/sirupsen/logrus"
)

// Logger is a wrapper for the logrus.Logger
type Logger struct {
	instance *logrus.Logger
}

// New creates and configures a new logger instance
func New() *Logger {
	logger := logrus.New()

	// Set log format
	if os.Getenv("ENV") == "production" {
		// JSON format for production logs
		logger.SetFormatter(&logrus.JSONFormatter{})
	} else {
		// Text format for local development
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}

	// Set log level
	level, err := logrus.ParseLevel(os.Getenv("LOG_LEVEL"))
	if err != nil {
		level = logrus.InfoLevel // Default to info level
	}
	logger.SetLevel(level)

	// Output logs to stdout
	logger.SetOutput(os.Stdout)

	return &Logger{instance: logger}
}

// Info logs an info message
func (l *Logger) Info(args ...interface{}) {
	l.instance.Info(args...)
}

// Warn logs a warning message
func (l *Logger) Warn(args ...interface{}) {
	l.instance.Warn(args...)
}

// Error logs an error message
func (l *Logger) Error(args ...interface{}) {
	l.instance.Error(args...)
}

// Fatal logs a fatal message and exits the program
func (l *Logger) Fatal(args ...interface{}) {
	l.instance.Fatal(args...)
}

// Debug logs a debug message
func (l *Logger) Debug(args ...interface{}) {
	l.instance.Debug(args...)
}

// WithFields creates a log entry with additional fields
func (l *Logger) WithFields(fields logrus.Fields) *logrus.Entry {
	return l.instance.WithFields(fields)
}

// Usage example (to be used in your other packages):
// logger := logger.New()
// logger.Info("This is an info message")
// logger.WithFields(logrus.Fields{"key": "value"}).Error("This is an error message")
