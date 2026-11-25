import paramiko
import json
import base64
import os

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.79.209.237', port=65002, username='u573062443', password=os.getenv('SSH_PASSWORD', 'Prayosha@2026'), timeout=30)

matrix = {
    "22KT": {
        "finishes": ["YG"],
        "options": {
            "3": ["513"],
            "4": ["559", "560", "561", "525", "524", "527"],
            "5": ["554", "556"]
        },
        "options_by_name": {
            "SIZE": ["10"],
            "GEM / STONE OPTIONS": [
                "Lab-grown Diamond",
                "American Diamond (CZ)",
                "Moissanite",
                "Ceylon Blue Sapphire",
                "Zambian Emerald",
                "No Stone / Plain Metal"
            ],
            "Box Chain": ["box Chain", "Wheat Chain"]
        },
        "stones": [
            "Lab-grown Diamond",
            "American Diamond (CZ)",
            "Moissanite",
            "Ceylon Blue Sapphire",
            "Zambian Emerald",
            "No Stone / Plain Metal"
        ]
    },
    "18KT": {
        "finishes": ["WG"],
        "options": {
            "3": ["512", "513", "514", "515", "516"],
            "4": ["523", "559", "560", "561", "525", "524", "527"],
            "5": ["554", "556"]
        },
        "options_by_name": {
            "SIZE": ["9", "10", "11", "12", "13"],
            "GEM / STONE OPTIONS": [
                "Natural Diamond (VVS-VS)",
                "Lab-grown Diamond",
                "American Diamond (CZ)",
                "Moissanite",
                "Ceylon Blue Sapphire",
                "Zambian Emerald",
                "No Stone / Plain Metal"
            ],
            "Box Chain": ["box Chain", "Wheat Chain"]
        },
        "stones": [
            "Natural Diamond (VVS-VS)",
            "Lab-grown Diamond",
            "American Diamond (CZ)",
            "Moissanite",
            "Ceylon Blue Sapphire",
            "Zambian Emerald",
            "No Stone / Plain Metal"
        ]
    },
    "14KT": {
        "finishes": ["RG", "BLK"],
        "options": {
            "3": ["513", "514", "515"],
            "4": ["523", "559", "560", "561", "525", "524", "527"],
            "5": ["554", "556"]
        },
        "options_by_name": {
            "SIZE": ["10", "11", "12"],
            "GEM / STONE OPTIONS": [
                "Natural Diamond (VVS-VS)",
                "Lab-grown Diamond",
                "American Diamond (CZ)",
                "Moissanite",
                "Ceylon Blue Sapphire",
                "Zambian Emerald",
                "No Stone / Plain Metal"
            ],
            "Box Chain": ["box Chain", "Wheat Chain"]
        },
        "stones": [
            "Natural Diamond (VVS-VS)",
            "Lab-grown Diamond",
            "American Diamond (CZ)",
            "Moissanite",
            "Ceylon Blue Sapphire",
            "Zambian Emerald",
            "No Stone / Plain Metal"
        ]
    },
    "925 SILVER": {
        "finishes": [],
        "options": {
            "3": ["513", "514", "515", "516"],
            "4": ["560", "561", "524", "527"],
            "5": ["554", "556"]
        },
        "options_by_name": {
            "SIZE": ["10", "11", "12", "13"],
            "GEM / STONE OPTIONS": [
                "American Diamond (CZ)",
                "Moissanite",
                "Zambian Emerald",
                "No Stone / Plain Metal"
            ],
            "Box Chain": ["box Chain", "Wheat Chain"]
        },
        "stones": [
            "American Diamond (CZ)",
            "Moissanite",
            "Zambian Emerald",
            "No Stone / Plain Metal"
        ]
    }
}

b64_matrix = base64.b64encode(json.dumps(matrix).encode()).decode()

php_code = f"""
$prod = \\App\\Models\\Product::find(2);
$json = base64_decode('{b64_matrix}');
$prod->compatibility_matrix = json_decode($json, true);
$prod->save();
echo 'UPDATED_OK';
"""

b64_php = base64.b64encode(php_code.encode()).decode()
cmd = f"cd /home/u573062443/domains/admin.pintaara.com && php artisan tinker --execute=\"eval(base64_decode('{b64_php}'));\""
stdin, stdout, stderr = client.exec_command(cmd)
res = stdout.read().decode()
err = stderr.read().decode()
print("Result:", res)
if err:
    print("Error:", err)
client.close()
