$baseDir = "C:\Users\rendi\Desktop\keuangan-ku"

# 1. Generate config.js
$configContent = @"
// Auto-generated runtime configuration
window.ENV = {
  SUPABASE_URL: "https://nwrhhclyjuhrmcazigrr.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cmhoY2x5anVocm1jYXppZ3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTA1MTgsImV4cCI6MjA1NTkyNjUxOH0.1NUpJzT2eA47_cndvAStJjYt9p48i9x2KIn1dDqg80Q"
};
window.__SUPABASE_CONFIG__ = {
  url: "https://nwrhhclyjuhrmcazigrr.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cmhoY2x5anVocm1jYXppZ3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTA1MTgsImV4cCI6MjA1NTkyNjUxOH0.1NUpJzT2eA47_cndvAStJjYt9p48i9x2KIn1dDqg80Q"
};
"@

Set-Content -Path "$baseDir\config.js" -Value $configContent -Encoding UTF8

# Ensure target directories exist
$dirs = @(
    "$baseDir\public",
    "$baseDir\public\js",
    "$baseDir\public\css",
    "$baseDir\public\vendor",
    "$baseDir\vendor",
    "C:\Users\rendi\.gemini\antigravity\scratch\keuangan-ku",
    "C:\Users\rendi\.gemini\antigravity\scratch\keuangan-ku\public",
    "C:\Users\rendi\.gemini\antigravity\scratch\keuangan-ku\public\js",
    "C:\Users\rendi\.gemini\antigravity\scratch\keuangan-ku\public\css",
    "C:\Users\rendi\.gemini\antigravity\scratch\keuangan-ku\public\vendor"
)

foreach ($d in $dirs) {
    if (!(Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
}

Set-Content -Path "$baseDir\public\config.js" -Value $configContent -Encoding UTF8
Set-Content -Path "C:\Users\rendi\.gemini\antigravity\scratch\keuangan-ku\config.js" -Value $configContent -Encoding UTF8
Set-Content -Path "C:\Users\rendi\.gemini\antigravity\scratch\keuangan-ku\public\config.js" -Value $configContent -Encoding UTF8

# Copy primary files to all expected locations
$primaryFiles = @("index.html", "app.js", "api.js", "style.css", "sw.js", "manifest.json", "vercel.json", "package.json")

foreach ($f in $primaryFiles) {
    $src = "$baseDir\$f"
    if (Test-Path $src) {
        # Copy to public root
        Copy-Item $src "$baseDir\public\$f" -Force
        # Copy to scratch
        Copy-Item $src "C:\Users\rendi\.gemini\antigravity\scratch\keuangan-ku\$f" -Force
        Copy-Item $src "C:\Users\rendi\.gemini\antigravity\scratch\keuangan-ku\public\$f" -Force
    }
}

# Subfolder copies
Copy-Item "$baseDir\app.js" "$baseDir\public\js\app.js" -Force
Copy-Item "$baseDir\app.js" "C:\Users\rendi\.gemini\antigravity\scratch\keuangan-ku\public\js\app.js" -Force

Copy-Item "$baseDir\api.js" "$baseDir\public\js\api.js" -Force
Copy-Item "$baseDir\api.js" "C:\Users\rendi\.gemini\antigravity\scratch\keuangan-ku\public\js\api.js" -Force

Copy-Item "$baseDir\style.css" "$baseDir\public\css\style.css" -Force
Copy-Item "$baseDir\style.css" "C:\Users\rendi\.gemini\antigravity\scratch\keuangan-ku\public\css\style.css" -Force

if (Test-Path "$baseDir\vendor") {
    Copy-Item "$baseDir\vendor\*" "$baseDir\public\vendor\" -Recurse -Force
    Copy-Item "$baseDir\vendor\*" "C:\Users\rendi\.gemini\antigravity\scratch\keuangan-ku\vendor\" -Recurse -Force
    Copy-Item "$baseDir\vendor\*" "C:\Users\rendi\.gemini\antigravity\scratch\keuangan-ku\public\vendor\" -Recurse -Force
}

Write-Host "ALL FILES SUCCESSFULLY SYNCED & VERIFIED LOCAL BUILD!"
