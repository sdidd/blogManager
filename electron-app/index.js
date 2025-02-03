import { app, BrowserWindow } from "electron";
import path from "path";

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load React App (Development mode)
  mainWindow.loadURL("http://localhost:5173"); // Vite default port

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});
