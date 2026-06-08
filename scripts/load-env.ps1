# Nạp biến từ .env gốc monorepo vào session PowerShell hiện tại.
# Cách dùng:
#   . .\scripts\load-env.ps1
#   cd land-tax\land-tax\land-tax-core-main; mvn spring-boot:run

$envFile = Join-Path $PSScriptRoot ".." ".env" | Resolve-Path -ErrorAction SilentlyContinue
if (-not $envFile -or -not (Test-Path $envFile)) {
    Write-Warning "Không tìm thấy .env tại thư mục gốc. Copy từ .env.example trước."
    return
}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }
    $eq = $line.IndexOf("=")
    if ($eq -lt 1) { return }
    $name = $line.Substring(0, $eq).Trim()
    $value = $line.Substring($eq + 1).Trim().Trim('"').Trim("'")
    Set-Item -Path "env:$name" -Value $value
}

Write-Host "Đã nạp biến môi trường từ $envFile"
