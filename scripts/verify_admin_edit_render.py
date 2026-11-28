import os
import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)
    
    test_blade = """cd /home/u573062443/domains/admin.pintaara.com && php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

$user = App\\Models\\User::first();
auth()->login($user);
$request = Illuminate\\Http\\Request::create("/admin/products/2/edit", "GET");
$request->setUserResolver(fn() => $user);
$response = $app->handle($request);
$content = $response->getContent();
echo "Status: " . $response->getStatusCode() . "\\n";
echo "Has custom_sections_container: " . (strpos($content, "custom_sections_container") !== false ? "YES" : "NO") . "\\n";
echo "Has btn_add_section: " . (strpos($content, "btn_add_section") !== false ? "YES" : "NO") . "\\n";
echo "Has initCustomSections: " . (strpos($content, "initCustomSections") !== false ? "YES" : "NO") . "\\n";
echo "Has renderGallery: " . (strpos($content, "renderGallery") !== false ? "YES (BUG)" : "NO (CLEAN)") . "\\n";
'"""
    stdin, stdout, stderr = client.exec_command(test_blade)
    print("OUTPUT:\n", stdout.read().decode('utf-8'))
    print("ERRORS:\n", stderr.read().decode('utf-8'))
    client.close()

if __name__ == '__main__':
    run()
