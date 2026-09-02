# apply_fixes.ps1
$filePath = "index.html"
if (Test-Path $filePath) {
    $raw = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
    Write-Host "File $filePath loaded ($($raw.Length) bytes)."
} else {
    Write-Warning "$filePath not found."
}
