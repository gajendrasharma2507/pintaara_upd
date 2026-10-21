#!/bin/bash
cd /home/u573062443/pintaara_api

# Update mail config for SMTP (OTP emails)
sed -i 's/^MAIL_MAILER=.*/MAIL_MAILER=smtp/' .env
sed -i 's/^MAIL_SCHEME=.*/MAIL_SCHEME=ssl/' .env
sed -i 's/^MAIL_HOST=.*/MAIL_HOST=smtp.hostinger.com/' .env
sed -i 's/^MAIL_PORT=.*/MAIL_PORT=465/' .env
sed -i 's/^MAIL_USERNAME=.*/MAIL_USERNAME=noreply@pintaara.com/' .env
sed -i 's/^MAIL_FROM_ADDRESS=.*/MAIL_FROM_ADDRESS=noreply@pintaara.com/' .env
sed -i 's/^MAIL_FROM_NAME=.*/MAIL_FROM_NAME="PINTAARA Fine Jewelry"/' .env

echo "=== Mail config ==="
grep "^MAIL_" .env

echo "=== Re-caching config ==="
php artisan config:cache

echo "=== Testing OTP send (dry run) ==="
php artisan tinker --execute="echo App\Services\OtpService::class . ' loaded OK';" 2>&1 | tail -3

echo "DONE"
