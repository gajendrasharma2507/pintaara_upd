import os
import paramiko

def verify():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password=os.environ['SSH_PASSWORD'], timeout=30)
    
    # 1. Eloquent test
    cmd1 = '''cd /home/u573062443/domains/admin.pintaara.com && php artisan tinker --execute="
\$groups = \\App\\Models\\ProductOptionGroup::with('values')->get();
echo 'Option Groups: ' . \$groups->count() . PHP_EOL;
foreach (\$groups as \$g) {
    echo '  ' . \$g->name . ' (' . \$g->code . ', ' . \$g->display_type . '): ' . \$g->values->count() . ' values' . PHP_EOL;
}
"'''
    stdin, stdout, stderr = client.exec_command(cmd1)
    print("Eloquent Output:\n", stdout.read().decode())
    print("Eloquent Stderr:\n", stderr.read().decode())
    
    # 2. Render route views test via tinker
    cmd2 = '''cd /home/u573062443/domains/admin.pintaara.com && php artisan tinker --execute="
try {
    \$v1 = view('admin.product-options.index', [
        'groups' => \\App\\Models\\ProductOptionGroup::with('values')->get(),
        'totalGroups' => 6,
        'totalValues' => 38,
        'activeGroups' => 6
    ])->render();
    echo 'View admin.product-options.index: RENDER SUCCESS (' . strlen(\$v1) . ' bytes)' . PHP_EOL;
} catch (\\Throwable \$e) {
    echo 'View admin.product-options.index ERROR: ' . \$e->getMessage() . PHP_EOL;
}

try {
    \$p = \\App\\Models\\Product::with(['collection', 'images', 'designLog', 'optionAssignments.group.values', 'variants.optionValues'])->find(2);
    \$v2 = view('admin.products.edit', [
        'product' => \$p,
        'collections' => \\App\\Models\\CollectionMaster::all(),
        'purities' => \\App\\Models\\MetalPurity::all(),
        'finishes' => \\App\\Models\\FinishOption::all(),
        'optionGroups' => \\App\\Models\\ProductOptionGroup::with('values')->get(),
        'rates' => [],
        'gstPercent' => 3.0
    ])->render();
    echo 'View admin.products.edit: RENDER SUCCESS (' . strlen(\$v2) . ' bytes)' . PHP_EOL;
} catch (\\Throwable \$e) {
    echo 'View admin.products.edit ERROR: ' . \$e->getMessage() . PHP_EOL;
}
"'''
    stdin, stdout, stderr = client.exec_command(cmd2)
    print("Render Output:\n", stdout.read().decode())
    print("Render Stderr:\n", stderr.read().decode())

    client.close()

if __name__ == '__main__':
    verify()
