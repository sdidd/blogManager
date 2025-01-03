# Define the services to run
$services = @(
    @{ Name = "redis"; Command = "node startRedis.js"; Directory = ".\Backend" },
    @{ Name = "frontend"; Command = "npm run dev"; Directory = ".\frontend" },
    @{ Name = "backend"; Command = "npm run dev"; Directory = ".\Backend" },
    @{ Name = "emailService"; Command = "npm run dev"; Directory = ".\EmailBackend" }
)

# Log file for all services
$logFile = ".\combined-log.txt"
# if (Test-Path $logFile) {
#     Remove-Item $logFile
# }

# Store all running processes
$processes = @()

# Start the services concurrently
foreach ($service in $services) {
    $name = $service.Name
    $command = $service.Command
    $directory = $service.Directory
    
    Write-Host "Starting $name in $directory..." -ForegroundColor Green
    
    # Start each service and redirect output to a common log file
    $process = Start-Process -NoNewWindow -PassThru -WorkingDirectory $directory `
        -FilePath "powershell" -ArgumentList "-Command `"$command | Tee-Object -FilePath '$logFile'`"" `
    
    # Keep track of processes
    $processes += @{ Name = $name; Process = $process }
}

# Monitor the log file in real-time
Write-Host "All services started. Press Ctrl+C to stop..." -ForegroundColor Yellow
Get-Content -Path $logFile -Wait | ForEach-Object {
    Write-Host "[LOG] $_" -ForegroundColor Cyan
}

# Cleanup processes on exit
try {
    foreach ($processData in $processes) {
        $process = $processData.Process
        if (!$process.HasExited) {
            Stop-Process -Id $process.Id -Force
            Write-Host "Stopped service: $($processData.Name)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "Error stopping processes: $_" -ForegroundColor Yellow
}
