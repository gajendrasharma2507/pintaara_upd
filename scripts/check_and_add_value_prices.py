import os
import paramiko

def check_and_add_col():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password=os.getenv('SSH_PASSWORD', 'Prayosha@2026'), timeout=20)
    
    cmd = """cd /home/u573062443/domains/admin.pintaara.com && php artisan tinker --execute="
if (!Schema::hasColumn('product_option_assignments', 'value_prices')) {
    Schema::table('product_option_assignments', function(\$table) {
        \$table->json('value_prices')->nullable()->after('selected_values');
    });
    echo 'ADDED value_prices COLUMN\n';
} else {
    echo 'value_prices ALREADY EXISTS\n';
}
print_r(Schema::getColumnListing('product_option_assignments'));
" """
    stdin, stdout, stderr = client.exec_command(cmd)
    print("OUTPUT:\n" + stdout.read().decode())
    print("ERRORS:\n" + stderr.read().decode())
    client.close()

if __name__ == '__main__':
    check_and_add_col()
