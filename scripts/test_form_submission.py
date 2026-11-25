import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password='Prayosha@2026', timeout=30)
    
    test_sub = """cd /home/u573062443/domains/admin.pintaara.com && php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

$user = App\\Models\\User::first();
auth()->login($user);

$postData = [
    "name" => "Celestial Solitaire Pendant",
    "collection_master_id" => 1,
    "base_weight_grams" => 4.2,
    "description" => "Suspended celestial sphere holding a 0.50ct hand-cut diamond with radiant halo prongs.",
    "delivery_return" => "- 24-Hour Cancellation Window - Full Refund\\n- 10% Deduction of total Value upon return.",
    "custom_sections" => [
        ["title" => "MATERIALS & CARE", "content" => "- Clean with soft microfiber cloth.\\n- Avoid contact with perfumes and chlorine."],
        ["title" => "CERTIFICATION", "content" => "Accompanied by an official hallmark certificate."]
    ]
];

$request = Illuminate\\Http\\Request::create("/admin/products/2", "PUT", $postData);
$controller = $app->make(App\\Http\\Controllers\\Admin\\AdminWebController::class);
$response = $controller->updateProduct($request, 2);

echo "Controller Response: " . get_class($response) . "\\n";

$p = App\\Models\\Product::find(2);
echo "Saved custom_sections: " . json_encode($p->custom_sections) . "\\n";
'"""
    stdin, stdout, stderr = client.exec_command(test_sub)
    print("OUTPUT:\n", stdout.read().decode('utf-8'))
    print("ERRORS:\n", stderr.read().decode('utf-8'))
    client.close()

if __name__ == '__main__':
    run()
