# clean_duplicate_copilot_js.ps1
$filePath = "index.html"
if (Test-Path $filePath) {
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

    $posStart = $content.IndexOf("function appendUserMessage(text) {", $content.IndexOf("const adsGalleryData ="))
    if ($posStart -gt 0) {
        $bracePos = $content.LastIndexOf("}", $posStart)
        $currencyHeader = "CURRENCY SYSTEM (INR"
        $posEnd = $content.IndexOf($currencyHeader, $posStart)
        if ($posEnd -gt 0) {
            $secHeader = $content.LastIndexOf("// ====", $posEnd)
            if ($secHeader -gt $bracePos) {
                $content = $content.Substring(0, $bracePos) + "`r`n`r`n        " + $content.Substring($secHeader)
                Write-Host "Duplicate block removed cleanly."
            }
        }
    }

    [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
    Write-Host "Completed clean duplicate check."
} else {
    Write-Warning "$filePath not found."
}
