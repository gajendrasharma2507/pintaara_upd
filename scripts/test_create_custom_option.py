import paramiko

def test():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password='Prayosha@2026', timeout=30)
    
    cmd = '''cd /home/u573062443/domains/admin.pintaara.com && php artisan tinker --execute="
// 1. Create Diamond Clarity option group
\$group = \\App\\Models\\ProductOptionGroup::firstOrCreate(
    ['code' => 'CLARITY'],
    [
        'name' => 'Diamond Clarity',
        'display_type' => 'text_button',
        'is_required' => false,
        'is_active' => true,
        'sort_order' => 7,
        'description' => 'Diamond clarity grades according to GIA standards'
    ]
);
echo 'Group: ' . \$group->name . ' (ID=' . \$group->id . ')' . PHP_EOL;

// 2. Add values: VS1, VS2, VVS1, VVS2
\$values = [
    ['value' => 'VS1', 'code' => 'VS1', 'price_delta' => 3000, 'stock_qty' => 15],
    ['value' => 'VS2', 'code' => 'VS2', 'price_delta' => 1500, 'stock_qty' => 20],
    ['value' => 'VVS1', 'code' => 'VVS1', 'price_delta' => 8000, 'stock_qty' => 10],
    ['value' => 'VVS2', 'code' => 'VVS2', 'price_delta' => 5500, 'stock_qty' => 12],
];

foreach (\$values as \$idx => \$v) {
    \$val = \\App\\Models\\ProductOptionValue::updateOrCreate(
        ['group_id' => \$group->id, 'code' => \$v['code']],
        [
            'value' => \$v['value'],
            'price_delta' => \$v['price_delta'],
            'stock_qty' => \$v['stock_qty'],
            'is_active' => true,
            'sort_order' => \$idx + 1,
        ]
    );
    echo '  Added Value: ' . \$val->value . ' (+₹' . \$val->price_delta . ')' . PHP_EOL;
}

// 3. Test assigning to Product 2 (PD-PD-CS-002)
\$product = \\App\\Models\\Product::find(2);
\$assignment = \\App\\Models\\ProductOptionAssignment::updateOrCreate(
    ['product_id' => \$product->id, 'group_id' => \$group->id],
    [
        'display_type' => 'text_button',
        'is_required' => false,
        'selected_values' => \$group->values()->pluck('id')->toArray(),
        'sort_order' => 7,
    ]
);
echo 'Assigned to ' . \$product->design_code . ': ' . \$group->name . ' (Values: ' . count(\$assignment->selected_values) . ')' . PHP_EOL;
"'''
    stdin, stdout, stderr = client.exec_command(cmd)
    print("OUTPUT:\n", stdout.read().decode())
    print("STDERR:\n", stderr.read().decode())

    client.close()

if __name__ == '__main__':
    test()
