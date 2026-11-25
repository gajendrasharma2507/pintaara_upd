import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('145.79.209.237', port=65002, username='u573062443', password='Prayosha@2026', timeout=30)

cmd = """cd /home/u573062443/domains/admin.pintaara.com && php artisan tinker --execute='
$order = App\\Models\\Order::find(5);
$service = app(App\\Services\\SequelLogisticsService::class);
$res = $service->createShipment($order, [
    "gross_weight" => 0.250,
    "net_weight" => 0.050,
    "boxes" => 1,
]);
dump($res);
dump($order->fresh()->only(["id", "order_number", "docket_number", "pickup_token", "tracking_link", "docket_print_url", "status", "fulfillment_status"]));
'"""

stdin, stdout, stderr = ssh.exec_command(cmd)
print("OUT:", stdout.read().decode('utf-8'))
print("ERR:", stderr.read().decode('utf-8'))
ssh.close()
