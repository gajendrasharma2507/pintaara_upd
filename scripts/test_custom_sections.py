import os
import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)
    
    test_script = """cd /home/u573062443/domains/admin.pintaara.com && php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

$p = App\\Models\\Product::where("design_code", "PD-PD-CS-002")->first();
if ($p) {
    $p->custom_sections = [
        ["title" => "Materials and Care", "content" => "- Clean with soft lint-free cloth.\\n- Store in provided archival box."]
    ];
    $p->save();
    echo "SAVED_OK: " . json_encode($p->fresh()->custom_sections) . "\\n";
}

$request = Illuminate\\Http\\Request::create("/api/products/PD-PD-CS-002", "GET");
$response = $app->handle($request);
$data = json_decode($response->getContent(), true);
echo "API response custom_sections: " . json_encode($data["data"]["custom_sections"] ?? "NONE") . "\\n";
'"""
    stdin, stdout, stderr = client.exec_command(test_script)
    print("OUTPUT:", stdout.read().decode('utf-8'))
    print("ERRORS:", stderr.read().decode('utf-8'))
    client.close()

if __name__ == '__main__':
    run()
