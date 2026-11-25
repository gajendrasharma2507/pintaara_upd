path = 'backend/resources/views/admin/orders/show.blade.php'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_snippet = """          <div>
            <h3 style="font-size: 15px; font-weight: 700; margin: 0; color: var(--admin-text-primary); display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BD7F68" stroke-width="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              Sequel 247 Armored Logistics
            </h3>
            <div style="font-size: 11.5px; color: var(--admin-text-muted); margin-top: 2px;">
              Door-to-door armored transport with 100% transit insurance
            </div>
          </div>"""

new_snippet = """          <div>
            <h3 style="font-size: 15px; font-weight: 700; margin: 0; color: var(--admin-text-primary);">
              Sequel 247 Armored Logistics
            </h3>
          </div>"""

# Normalize newlines for replacement
if old_snippet.replace('\r\n', '\n') in content.replace('\r\n', '\n'):
    content_normalized = content.replace('\r\n', '\n')
    content_updated = content_normalized.replace(old_snippet.replace('\r\n', '\n'), new_snippet.replace('\r\n', '\n'))
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content_updated)
    print("SUCCESS: Removed icon and subtitle text.")
else:
    print("ERROR: old_snippet not found in file.")
