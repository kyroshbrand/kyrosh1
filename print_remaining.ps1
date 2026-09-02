# print_remaining.ps1
$filePath = "index.html"
if (Test-Path $filePath) {
    $lines = Get-Content -Path $filePath -Encoding utf8
    $found = 0
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i].Contains("?")) {
            $found++
        }
    }
    Write-Host "Total lines containing '?' (including valid syntax): $found"
} else {
    Write-Warning "$filePath not found."
}
