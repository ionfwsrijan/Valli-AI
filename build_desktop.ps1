$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$venvPath = Join-Path $projectRoot ".venv-desktop"
$venvPython = Join-Path $venvPath "Scripts\\python.exe"
Set-Location $projectRoot

Write-Host "Building frontend..."
Set-Location "$projectRoot\\frontend"
npm run build

Set-Location $projectRoot

if (-not (Test-Path $venvPython)) {
  Write-Host "Creating isolated desktop build environment..."
  python -m venv $venvPath
}

Write-Host "Installing desktop build dependencies..."
& $venvPython -m pip install --upgrade pip
& $venvPython -m pip install -r "$projectRoot\\backend\\requirements.txt" -r "$projectRoot\\desktop_requirements.txt"

Write-Host "Packaging desktop executable..."
& $venvPython -m PyInstaller `
  --noconfirm `
  --clean `
  --windowed `
  --onefile `
  --name "ValliAssessment" `
  --icon "$projectRoot\\assets\\valli_app_icon.ico" `
  --add-data "$projectRoot\\frontend\\dist;frontend\\dist" `
  --add-data "$projectRoot\\docs;docs" `
  --collect-data webview `
  --collect-submodules webview `
  --hidden-import uvicorn.logging `
  --hidden-import uvicorn.loops.auto `
  --hidden-import uvicorn.protocols.http.auto `
  --hidden-import uvicorn.protocols.websockets.auto `
  --hidden-import uvicorn.lifespan.on `
  --hidden-import webview.platforms.winforms `
  --hidden-import webview.platforms.edgechromium `
  "$projectRoot\\desktop_launcher.py"

Write-Host ""
Write-Host "Desktop app created at:"
Write-Host "$projectRoot\\dist\\ValliAssessment.exe"
