. "$PSScriptRoot\load-env.ps1"
Set-Location "$PSScriptRoot\..\ai-chatbot-service"
if (Test-Path ".\venv\Scripts\Activate.ps1") {
    . .\venv\Scripts\Activate.ps1
}
uvicorn main:app --reload --reload-dir app --port 8000
