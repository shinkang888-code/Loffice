# LibreOffice 설치본 분석 스크립트 (Windows)
# Usage: .\scripts\analyze-libreoffice-install.ps1

$InstallPath = "C:\Program Files\LibreOffice"

if (-not (Test-Path $InstallPath)) {
    Write-Error "LibreOffice not found at $InstallPath"
    exit 1
}

Write-Host "=== LibreOffice Install Analysis ===" -ForegroundColor Cyan
Write-Host "Path: $InstallPath"

# Version
$bootstrap = Join-Path $InstallPath "program\bootstrap.ini"
if (Test-Path $bootstrap) {
    $productKey = (Get-Content $bootstrap | Where-Object { $_ -match "ProductKey" }) -replace "ProductKey=", ""
    Write-Host "Version: $productKey"
}

# Totals
$allFiles = Get-ChildItem $InstallPath -Recurse -File -ErrorAction SilentlyContinue
$totalSize = ($allFiles | Measure-Object -Property Length -Sum).Sum
Write-Host "Files: $($allFiles.Count)"
Write-Host "Size:  $([math]::Round($totalSize / 1GB, 2)) GB"

# Per directory
$dirs = @("program", "share", "help", "presets")
foreach ($d in $dirs) {
    $p = Join-Path $InstallPath $d
    if (-not (Test-Path $p)) { continue }
    $fc = (Get-ChildItem $p -Recurse -File -EA SilentlyContinue | Measure-Object).Count
    Write-Host "`n--- $d ($fc files) ---" -ForegroundColor Yellow
    Get-ChildItem $p -Recurse -File -EA SilentlyContinue |
        Group-Object Extension |
        Sort-Object Count -Descending |
        Select-Object -First 6 |
        ForEach-Object { Write-Host ("  {0,-10} {1}" -f $_.Name, $_.Count) }
}

# Top DLLs
Write-Host "`n--- Top DLLs (program/) ---" -ForegroundColor Yellow
Get-ChildItem (Join-Path $InstallPath "program") -Filter "*.dll" -File |
    Sort-Object Length -Descending |
    Select-Object -First 10 Name, @{N='MB';E={[math]::Round($_.Length/1MB,1)}} |
    Format-Table -AutoSize

# Executables
Write-Host "--- Executables ---" -ForegroundColor Yellow
Get-ChildItem (Join-Path $InstallPath "program") -Filter "*.exe" -File |
    Select-Object Name | Sort-Object Name | Format-Table -AutoSize

Write-Host "`nDone. See docs/LIBREOFFICE-INSTALL-ANALYSIS.md for full report." -ForegroundColor Green
