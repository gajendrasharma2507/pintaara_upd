import re
import subprocess
import tempfile
import os

def check_file(path):
    print(f"Checking {path}...")
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find <script> ... </script>
    scripts = re.findall(r'<script>(.*?)</script>', content, re.DOTALL)
    for idx, s in enumerate(scripts):
        # Replace blade tags {!! ... !!} or {{ ... }} with dummy json / strings
        cleaned = re.sub(r'\{!!.*?!!\}', '{}', s)
        cleaned = re.sub(r'\{\{.*?\}\}', '""', cleaned)
        cleaned = re.sub(r'@\w+.*', '', cleaned)

        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as tf:
            tf.write(cleaned)
            tf_path = tf.name

        res = subprocess.run(['node', '--check', tf_path], capture_output=True, text=True)
        os.remove(tf_path)
        if res.returncode != 0:
            print(f"❌ Syntax Error in {path} script #{idx}:\n{res.stderr}")
        else:
            print(f"✅ Syntax OK in {path} script #{idx}")

check_file('backend/resources/views/admin/products/create.blade.php')
check_file('backend/resources/views/admin/products/edit.blade.php')
