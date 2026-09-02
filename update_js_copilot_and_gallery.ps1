# update_js_copilot_and_gallery.ps1
$filePath = "index.html"
if (Test-Path $filePath) {
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

    $targetSearch = "const aiBotFloatBtn = document.getElementById('aiBotFloatBtn');"
    $endSearch = "attachAiChipEvents();"

    $pos1 = $content.IndexOf($targetSearch)
    if ($pos1 -ge 0) {
        $headerPos = $content.LastIndexOf("// ====================================================", $pos1)
        $pos2 = $content.IndexOf($endSearch, $pos1)
        if ($headerPos -ge 0 -and $pos2 -gt $pos1) {
            Write-Host "AI Copilot and Gallery JS block is verified."
        }
    }

    [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
    Write-Host "Completed JS copilot and gallery script check."
} else {
    Write-Warning "$filePath not found."
}
