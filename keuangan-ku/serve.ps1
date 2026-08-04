$port = 8080
$prefix = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Server running at $prefix ..."

$baseDir = "C:\Users\rendi\Desktop\keuangan-ku\public"

for ($i = 0; $i -lt 50; $i++) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = $request.Url.LocalPath
    if ($path -eq "/") { $path = "/index.html" }
    
    $localPath = Join-Path $baseDir $path.TrimStart('/')
    if (!(Test-Path $localPath) -or (Test-Path $localPath -PathType Container)) {
        $localPath = Join-Path "C:\Users\rendi\Desktop\keuangan-ku" $path.TrimStart('/')
    }

    if (Test-Path $localPath) {
        $bytes = [System.IO.File]::ReadAllBytes($localPath)
        if ($localPath.EndsWith(".html")) { $response.ContentType = "text/html" }
        elseif ($localPath.EndsWith(".js")) { $response.ContentType = "application/javascript" }
        elseif ($localPath.EndsWith(".css")) { $response.ContentType = "text/css" }
        elseif ($localPath.EndsWith(".json")) { $response.ContentType = "application/json" }
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
    }
    $response.OutputStream.Close()
}
$listener.Stop()
