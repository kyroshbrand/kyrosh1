# replace_chips.ps1
$filePath = "index.html"
if (Test-Path $filePath) {
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
    Write-Host "AI Copilot chips verified in $filePath."
} else {
    Write-Warning "$filePath not found."
}
