import os
import paramiko

host = os.getenv('SSH_HOST', '145.79.209.237')
port = int(os.getenv('SSH_PORT', '65002'))
user = os.getenv('SSH_USER', 'u573062443')
password = os.environ['SSH_PASSWORD']
remote_base = '/home/u573062443/domains/admin.pintaara.com'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, port=port, username=user, password=password, timeout=30)

sftp = client.open_sftp()

try:
    sftp.stat(f"{remote_base}/resources/views/admin/appointments")
except FileNotFoundError:
    sftp.mkdir(f"{remote_base}/resources/views/admin/appointments")

files = [
    ("backend/database/migrations/2026_11_25_000002_add_email_to_appointments_table.php", f"{remote_base}/database/migrations/2026_11_25_000002_add_email_to_appointments_table.php"),
    ("backend/database/migrations/2026_11_25_000003_add_booking_url_to_appointments_table.php", f"{remote_base}/database/migrations/2026_11_25_000003_add_booking_url_to_appointments_table.php"),
    ("backend/app/Models/Appointment.php", f"{remote_base}/app/Models/Appointment.php"),
    ("backend/app/Models/EmailTemplate.php", f"{remote_base}/app/Models/EmailTemplate.php"),
    ("backend/app/Http/Controllers/Api/AppointmentApiController.php", f"{remote_base}/app/Http/Controllers/Api/AppointmentApiController.php"),
    ("backend/app/Http/Controllers/Admin/AdminAppointmentController.php", f"{remote_base}/app/Http/Controllers/Admin/AdminAppointmentController.php"),
    ("backend/resources/views/admin/appointments/index.blade.php", f"{remote_base}/resources/views/admin/appointments/index.blade.php"),
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
print("Bookings module deployed successfully!")
