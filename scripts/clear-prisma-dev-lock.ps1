$lockDir = Join-Path $env:LOCALAPPDATA "prisma-dev-nodejs\Data\durable-streams\ebook-marketplace"
$locks = @(
  (Join-Path $lockDir "server.lock"),
  (Join-Path $lockDir "server.lock.lock")
)

foreach ($file in $locks) {
  if (Test-Path $file) {
    Remove-Item -Force $file
    Write-Host "Removed: $file"
  }
}

Write-Host "Stale prisma dev locks cleared. Now run: npm run db:dev"
