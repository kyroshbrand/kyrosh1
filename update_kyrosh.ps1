# update_kyrosh.ps1 - Kyrosh Website Update Script
$filePath = "index.html"
if (Test-Path $filePath) {
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

    # 1. Fix Title & Head Metadata
    $content = $content.Replace(
        '<title>Kyrosh ? No.1 Digital Growth Agency | Websites, Software, Performance Ads & SEO</title>',
        '<title>Kyrosh ' + [char]0x2014 + ' No.1 Digital Growth Agency | Websites, Software, Performance Ads & SEO</title>'
    )
    $content = $content.Replace('"priceRange": "???"', '"priceRange": "' + [char]0x20B9 + [char]0x20B9 + [char]0x20B9 + '"')

    # 2. Fix Comments
    $content = $content.Replace('?? AI AGENCY COPILOT FLOATING DRAWER', [char]0xD83E + [char]0xDD16 + ' AI AGENCY COPILOT FLOATING DRAWER')
    $content = $content.Replace('?? ULTRA-CLEAN RESPONSIVE MEDIA QUERIES', [char]0xD83D + [char]0xDCF1 + ' ULTRA-CLEAN RESPONSIVE MEDIA QUERIES')
    $content = $content.Replace('?? AI AGENCY GROWTH COPILOT', [char]0xD83E + [char]0xDD16 + ' AI AGENCY GROWTH COPILOT')

    # 3. Fix HTML Badges, Buttons, Modals & Text
    $content = $content.Replace('<div style="font-size:46px; margin-bottom:10px;">??</div>', '<div style="font-size:46px; margin-bottom:10px;">' + [char]0xD83C + [char]0xDF89 + '</div>')
    $content = $content.Replace('title="What is Kyrosh ? Words From Founder Shaiban"', 'title="What is Kyrosh ' + [char]0x2014 + ' Words From Founder Shaiban"')
    $content = $content.Replace('Online ? Instant Strategy', 'Online ' + [char]0x2022 + ' Instant Strategy')
    $content = $content.Replace('TECHCORP ? GLOBAL BRAND ? NEXUS DIGITAL ? HYPERGROWTH ? LUMINA STUDIO ? APEX VENTURES ?', 'TECHCORP ' + [char]0x2022 + ' GLOBAL BRAND ' + [char]0x2022 + ' NEXUS DIGITAL ' + [char]0x2022 + ' HYPERGROWTH ' + [char]0x2022 + ' LUMINA STUDIO ' + [char]0x2022 + ' APEX VENTURES ' + [char]0x2022)

    # 4. Fix Services Tags & Arsenal
    $content = $content.Replace('360? Digital Arsenal', '360' + [char]0x00B0 + ' Digital Arsenal')
    $content = $content.Replace('Next.js ? React ? Headless', 'Next.js ' + [char]0x2022 + ' React ' + [char]0x2022 + ' Headless')
    $content = $content.Replace('Python ? Node ? AI Integrations', 'Python ' + [char]0x2022 + ' Node ' + [char]0x2022 + ' AI Integrations')
    $content = $content.Replace('Cinema 4D ? VFX ? Viral Hooks', 'Cinema 4D ' + [char]0x2022 + ' VFX ' + [char]0x2022 + ' Viral Hooks')
    $content = $content.Replace('Figma ? Vector Systems ? 3D Assets', 'Figma ' + [char]0x2022 + ' Vector Systems ' + [char]0x2022 + ' 3D Assets')
    $content = $content.Replace('Meta Ads ? Google 360 ? Scaling', 'Meta Ads ' + [char]0x2022 + ' Google 360 ' + [char]0x2022 + ' Scaling')
    $content = $content.Replace('#1 Rank ? GEO Schema ? AI Inbound', '#1 Rank ' + [char]0x2022 + ' GEO Schema ' + [char]0x2022 + ' AI Inbound')

    # 5. Fix Pricing Section
    $content = $content.Replace('? 39,999', [char]0x20B9 + '39,999')
    $content = $content.Replace('? 99,999', [char]0x20B9 + '99,999')
    $content = $content.Replace('? 1,99,999', [char]0x20B9 + '1,99,999')
    $content = $content.Replace('generating over ?1.8 Crore', 'generating over ' + [char]0x20B9 + '1.8 Crore')

    # 6. Fix Career Buttons & Status in JS
    $content = $content.Replace('if (careerSubmitBtn) careerSubmitBtn.innerHTML = ''? Application Submitted!'';', 'if (careerSubmitBtn) careerSubmitBtn.innerHTML = ''' + [char]0x2705 + ' Application Submitted!'';')
    $content = $content.Replace('careerSubmitBtn.innerHTML = ''<i class="fas fa-paper-plane"></i> Submit Application ?'';', 'careerSubmitBtn.innerHTML = ''<i class="fas fa-paper-plane"></i> Submit Application &rarr;'';')

    # 7. Fix Scheduler Buttons & Status in JS
    $content = $content.Replace('schedSubmitBtn.innerHTML = ''<i class="fas fa-check-circle"></i> Confirm Free Strategy Call ?'';', 'schedSubmitBtn.innerHTML = ''<i class="fas fa-check-circle"></i> Confirm Free Strategy Call &rarr;'';')
    $content = $content.Replace('schedSubmitBtn.innerHTML = ''? Strategy Call Confirmed!'';', 'schedSubmitBtn.innerHTML = ''' + [char]0x2705 + ' Strategy Call Confirmed!'';')

    [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
    Write-Host "Updated $filePath successfully."
} else {
    Write-Warning "$filePath not found."
}
