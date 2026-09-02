$filePath = "index.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# 1. Remove the duplicate JS block from line 4404 to right before the currency system
$dupStart = "        }`r`n`r`n        function appendUserMessage(text) {"
if (-not $content.Contains($dupStart)) {
    $dupStart = "        }\n\n        function appendUserMessage(text) {"
}

$dupEnd = "        // ====================================================`r`n        // 💰 CURRENCY SYSTEM"
if (-not $content.Contains($dupEnd)) {
    $dupEnd = "        // ====================================================\n        // 💰 CURRENCY SYSTEM"
}

$posStart = $content.IndexOf("function appendUserMessage(text) {", $content.IndexOf("const adsGalleryData ="))
if ($posStart -gt 0) {
    # Find preceding '}'
    $bracePos = $content.LastIndexOf("}", $posStart)
    $currencyHeader = "// ====================================================" + "`r`n" + "        // 💰 CURRENCY SYSTEM"
    $posEnd = $content.IndexOf($currencyHeader, $posStart)
    if ($posEnd -lt 0) {
        $currencyHeader = "// ====================================================" + "`n" + "        // 💰 CURRENCY SYSTEM"
        $posEnd = $content.IndexOf($currencyHeader, $posStart)
    }

    if ($bracePos -gt 0 -and $posEnd -gt $bracePos) {
        $toRemove = $content.Substring($bracePos, $posEnd - $bracePos)
        # Note: $bracePos was the extra closing brace after the filter button loop!
        $content = $content.Remove($bracePos, $posEnd - $bracePos)
        Write-Host "Removed duplicate block successfully!"
    }
}

# 2. Fix any remaining comment question marks
$content = $content.Replace("?? AI AGENCY COPILOT FLOATING DRAWER & CHATBOT", "🤖 AI AGENCY COPILOT FLOATING DRAWER & CHATBOT")
$content = $content.Replace("?? ULTRA-CLEAN RESPONSIVE MEDIA QUERIES (MOBILE FIRST)", "📱 ULTRA-CLEAN RESPONSIVE MEDIA QUERIES (MOBILE FIRST)")
$content = $content.Replace("?? AI AGENCY GROWTH COPILOT (INTERACTIVE CHATBOT)", "🤖 AI AGENCY GROWTH COPILOT (INTERACTIVE CHATBOT)")

[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
Write-Host "Cleaned duplicate JS and remaining comments."
