import os
import paramiko

host = os.getenv('SSH_HOST', '145.79.209.237')
port = int(os.getenv('SSH_PORT', '65002'))
user = os.getenv('SSH_USER', 'u573062443')
password = os.environ['SSH_PASSWORD']
remote_base = '/home/u573062443/domains/admin.pintaara.com'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print(f"Connecting to {host}:{port}...")
client.connect(host, port=port, username=user, password=password, timeout=30)
print("SSH Connected.")

sftp = client.open_sftp()

# Ensure remote directories exist
dirs = [
    f"{remote_base}/resources/views/admin/email-templates",
]
for d in dirs:
    try:
        sftp.stat(d)
    except FileNotFoundError:
        sftp.mkdir(d)

files = [
    ("backend/database/migrations/2026_11_25_000001_create_email_templates_table.php", f"{remote_base}/database/migrations/2026_11_25_000001_create_email_templates_table.php"),
    ("backend/app/Models/EmailTemplate.php", f"{remote_base}/app/Models/EmailTemplate.php"),
    ("backend/app/Services/EmailTemplateService.php", f"{remote_base}/app/Services/EmailTemplateService.php"),
    ("backend/app/Http/Controllers/Admin/AdminEmailTemplateController.php", f"{remote_base}/app/Http/Controllers/Admin/AdminEmailTemplateController.php"),
    ("backend/app/Mail/CustomTemplateMail.php", f"{remote_base}/app/Mail/CustomTemplateMail.php"),
    ("backend/app/Mail/AccountCreatedMail.php", f"{remote_base}/app/Mail/AccountCreatedMail.php"),
    ("backend/app/Mail/AccountDeletedMail.php", f"{remote_base}/app/Mail/AccountDeletedMail.php"),
    ("backend/app/Mail/EmailAddressChangedMail.php", f"{remote_base}/app/Mail/EmailAddressChangedMail.php"),
    ("backend/app/Mail/EmailVerificationLinkMail.php", f"{remote_base}/app/Mail/EmailVerificationLinkMail.php"),
    ("backend/app/Mail/EmailVerificationOtpMail.php", f"{remote_base}/app/Mail/EmailVerificationOtpMail.php"),
    ("backend/app/Mail/PasswordChangedMail.php", f"{remote_base}/app/Mail/PasswordChangedMail.php"),
    ("backend/app/Mail/PasswordResetMail.php", f"{remote_base}/app/Mail/PasswordResetMail.php"),
    ("backend/app/Mail/OrderConfirmationMail.php", f"{remote_base}/app/Mail/OrderConfirmationMail.php"),
    ("backend/app/Mail/ManufacturingInitiatedMail.php", f"{remote_base}/app/Mail/ManufacturingInitiatedMail.php"),
    ("backend/app/Mail/OrderDispatchedMail.php", f"{remote_base}/app/Mail/OrderDispatchedMail.php"),
    ("backend/app/Mail/OrderDeliveredMail.php", f"{remote_base}/app/Mail/OrderDeliveredMail.php"),
    ("backend/app/Mail/OrderDelayMail.php", f"{remote_base}/app/Mail/OrderDelayMail.php"),
    ("backend/app/Mail/OrderCancelledMail.php", f"{remote_base}/app/Mail/OrderCancelledMail.php"),
    ("backend/app/Mail/RefundProcessedMail.php", f"{remote_base}/app/Mail/RefundProcessedMail.php"),
    ("backend/resources/views/emails/custom_raw.blade.php", f"{remote_base}/resources/views/emails/custom_raw.blade.php"),
    ("backend/resources/views/admin/email-templates/index.blade.php", f"{remote_base}/resources/views/admin/email-templates/index.blade.php"),
    ("backend/resources/views/admin/email-templates/form.blade.php", f"{remote_base}/resources/views/admin/email-templates/form.blade.php"),
    ("backend/resources/views/layouts/admin.blade.php", f"{remote_base}/resources/views/layouts/admin.blade.php"),
    ("backend/routes/web.php", f"{remote_base}/routes/web.php"),
]

for local, remote in files:
    sftp.put(local, remote)
    print(f"✓ Uploaded {local}")

sftp.close()

cmd = (
    f"cd {remote_base} && "
    "php artisan migrate --force && "
    "php artisan tinker --execute='App\\Models\\EmailTemplate::ensureDefaultsExist(); echo \"Templates: \" . App\\Models\\EmailTemplate::count();' && "
    "php artisan view:clear && php artisan route:clear && php artisan config:clear && php artisan cache:clear"
)
stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
err = stderr.read().decode('utf-8', errors='replace')
if err:
    print("STDERR:", err)
client.close()
print("Email Templates deployed successfully!")
