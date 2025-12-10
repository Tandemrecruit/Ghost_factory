# Fix MD047: Ensure all .md files end with a single newline
Get-ChildItem -Path . -Recurse -Filter '*.md' | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw
    
    if ($content) {
        # Remove all trailing newlines
        $content = $content -replace '[\r\n]+$', ''
        # Add exactly one newline
        $content = $content + "`n"
        # Write back
        [System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Fixed: $file"
    }
}

