# check_suspicious.ps1
$filePath = "index.html"
if (Test-Path $filePath) {
    $lines = Get-Content -Path $filePath -Encoding utf8
    $suspiciousCount = 0
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $text = $lines[$i]
        if ($text.Contains("?")) {
            if ($text -notmatch '\?[a-zA-Z0-9_]+=' -and $text -notmatch '\?\.' -and $text -notmatch '\s\?\s') {
                $suspiciousCount++
            }
        }
    }
    Write-Host "Suspicious question marks check completed. Count: $suspiciousCount"
} else {
    Write-Warning "$filePath not found."
}
