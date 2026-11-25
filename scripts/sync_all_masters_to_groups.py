import paramiko

def sync():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('145.79.209.237', port=65002, username='u573062443', password='Prayosha@2026', timeout=30)
    
    cmd = '''cd /home/u573062443/domains/admin.pintaara.com && php artisan tinker --execute="
\$masters = \\Illuminate\\Support\\Facades\\DB::table('customization_masters')->orderBy('sort_order')->get();
foreach (\$masters as \$m) {
    \$displayType = 'dropdown';
    if (\$m->input_type === 'swatch_image' || \$m->input_type === 'color_swatch') {
        \$displayType = 'image_swatch';
    } elseif (\$m->input_type === 'text_button') {
        \$displayType = 'text_button';
    }

    \$group = \\App\\Models\\ProductOptionGroup::updateOrCreate(
        ['code' => \$m->code],
        [
            'name' => \$m->name,
            'display_type' => \$displayType,
            'is_required' => (bool)\$m->is_required,
            'is_active' => (bool)\$m->is_active,
            'sort_order' => \$m->sort_order,
            'description' => \$m->description,
        ]
    );

    \$mValues = \\Illuminate\\Support\\Facades\\DB::table('customization_master_values')
        ->where('master_id', \$m->id)
        ->orderBy('sort_order')
        ->get();

    foreach (\$mValues as \$mv) {
        \\App\\Models\\ProductOptionValue::updateOrCreate(
            ['group_id' => \$group->id, 'code' => \$mv->code],
            [
                'value' => \$mv->value,
                'color_code' => \$mv->hex_color ?? null,
                'image' => \$mv->image ?? null,
                'price_delta' => \$mv->price_delta ?? 0,
                'stock_qty' => 10,
                'is_active' => (bool)\$mv->is_active,
                'sort_order' => \$mv->sort_order,
            ]
        );
    }
    echo 'Synced group: ' . \$group->name . ' (' . \$group->code . ') with ' . \$group->values()->count() . ' values' . PHP_EOL;
}
"'''
    stdin, stdout, stderr = client.exec_command(cmd)
    print("OUTPUT:\n", stdout.read().decode())
    print("STDERR:\n", stderr.read().decode())
    client.close()

if __name__ == '__main__':
    sync()
