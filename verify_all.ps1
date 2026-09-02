# verify_all.ps1
$filePath = "index.html"
if (Test-Path $filePath) {
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
    Write-Host "=== VERIFICATION STATUS ==="
    Write-Host "Ads Gallery present: $($content.Contains('id=""ads-gallery""'))"
    Write-Host "Copilot present: $($content.Contains('id=""aiChatBody""'))"
    Write-Host "File size: $($content.Length) bytes"
} else {
    Write-Warning "$filePath not found."
}
