#!/usr/bin/env pwsh
# Pintaara Hostinger Deploy Script
# Uploads .env and runs all Laravel production commands via SSH (plink)

$PLINK    = "C:\Program Files\PuTTY\plink.exe"
$SSH_HOST = "145.79.210.26"
$SSH_PORT = "65002"
$SSH_USER = "u573062443"
$SSH_PASS = "Prayosha@2024"
$PSCP     = "C:\Program Files\PuTTY\pscp.exe"

# Remote Laravel root — adjust if needed
$REMOTE_ROOT = "domains/api.pintaara.com/public_html"

Write-Host "`n==[ Step 1: Find Laravel root ]==" -ForegroundColor Cyan
& $PLINK -ssh -P $SSH_PORT -pw $SSH_PASS -batch "$SSH_USER@$SSH_HOST" `
    "find /home/$SSH_USER -name 'artisan' 2>/dev/null | head -5"
