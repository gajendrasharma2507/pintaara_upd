import re

def update_file(path, is_edit=False):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern for renderCompatibilityMasterTable
    # We want to replace the table generation to include interactive checkboxes and handleMatrixCellChange()
    
    # 1. Update renderCompatibilityMasterTable and matrix change logic
    pattern = re.compile(
        r'function renderCompatibilityMasterTable\(\)\s*\{.*?'
        r'container\.innerHTML = html;\s*\}',
        re.DOTALL
    )

    new_render_fn = '''let currentMatrixData = {};

function handleMatrixCellChange() {
  const matrix = {};
  const normalizedPurities = Array.from(new Set(getCheckedPurities().map(normalizePurityKey)));

  normalizedPurities.forEach(p => {
    matrix[p] = { finishes: [], stones: [] };
  });

  document.querySelectorAll('.matrix-cell-chk').forEach(cb => {
    const p = cb.getAttribute('data-purity');
    const type = cb.getAttribute('data-type');
    const key = cb.getAttribute('data-key');
    if (!matrix[p]) matrix[p] = { finishes: [], stones: [] };

    if (cb.checked) {
      if (type === 'finish') {
        if (!matrix[p].finishes.includes(key)) matrix[p].finishes.push(key);
      } else if (type === 'stone') {
        if (!matrix[p].stones.includes(key)) matrix[p].stones.push(key);
      }
    }
  });

  currentMatrixData = matrix;
  const input = document.getElementById('compatibility_matrix_json');
  if (input) {
    input.value = JSON.stringify(matrix);
  }
}

function renderCompatibilityMasterTable() {
  const container = document.getElementById('compatibility_master_table_container');
  if (!container) return;

  const rawPurities = getCheckedPurities();
  const normalizedPurities = Array.from(new Set(rawPurities.map(normalizePurityKey)));
  const selectedFinishKeys = getSelectedFinishKeys();

  // Find selected stones from GEM / STONE group if present
  let activeStones = [];
  const gemGroup = (typeof optionGroupsData !== 'undefined' ? optionGroupsData : []).find(g => {
    const code = (g.code || '').toUpperCase();
    const name = (g.name || '').toUpperCase();
    return code === 'GEM' || name.includes('STONE') || name.includes('GEM');
  });

  if (gemGroup && gemGroup.id) {
    const checkedStoneCbs = document.querySelectorAll(`.group-val-chk-${gemGroup.id}:checked`);
    if (checkedStoneCbs.length > 0) {
      const checkedValNames = Array.from(checkedStoneCbs).map(cb => ({
        name: cb.getAttribute('data-val-name') || cb.value,
        id: cb.value
      }));
      activeStones = checkedValNames.map(v => {
        const vLower = v.name.toLowerCase();
        const matched = COMPATIBILITY_RULES_MASTER.stones.find(s => {
          const sName = s.name.toLowerCase();
          return sName.includes(vLower) || vLower.includes(sName.split(' ')[0]);
        });
        if (matched) {
          return { code: matched.code, name: v.name, purities: matched.purities };
        }
        return {
          code: 'CUSTOM_' + v.id,
          name: v.name,
          purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': true }
        };
      });
    }
  }

  // If no stones selected specifically or group disabled, show all standard stones
  if (activeStones.length === 0) {
    activeStones = COMPATIBILITY_RULES_MASTER.stones;
  }

  // Active finishes from selectedFinishKeys
  const activeFinishes = COMPATIBILITY_RULES_MASTER.finishes.filter(f => selectedFinishKeys.includes(f.key));
  const finishesToDisplay = activeFinishes.length > 0 ? activeFinishes : COMPATIBILITY_RULES_MASTER.finishes.slice(0, 4);

  // Build clean normal table with interactive checkboxes
  const purityBadges = {
    '22KT': '#D4AF37',
    '18KT': '#B8860B',
    '14KT': '#9A7C38',
    '925 SILVER': '#64748B'
  };

  let html = `
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; background: #FFFFFF;">
      <thead>
        <tr style="border-bottom: 2px solid #E2E8F0; background: #F8FAFC;">
          <th style="padding: 12px 18px; font-weight: 800; color: #1E293B; letter-spacing: 0.04em; text-transform: uppercase; font-size: 12px; width: 45%;">
            Finish / appearance
          </th>
  `;

  normalizedPurities.forEach(p => {
    const badgeColor = purityBadges[p] || '#1E293B';
    html += `
      <th style="padding: 12px 14px; font-weight: 800; color: ${badgeColor}; text-align: center; font-size: 13px; letter-spacing: 0.05em;">
        ${p}
      </th>
    `;
  });

  html += `
        </tr>
      </thead>
      <tbody>
  `;

  // 1. Finish rows with interactive checkboxes
  finishesToDisplay.forEach((f, idx) => {
    const bg = idx % 2 === 0 ? '#FFFFFF' : '#FDFDFD';
    html += `
      <tr style="border-bottom: 1px solid #F1F5F9; background: ${bg};">
        <td style="padding: 11px 18px; color: #334155; font-weight: 600; display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${purityBadges[f.key] || '#CBD5E1'}; border: 1px solid rgba(0,0,0,0.1);"></span>
          <span>${escapeHtml(f.name)}</span>
        </td>
    `;
    normalizedPurities.forEach(p => {
      let isCompat = false;
      if (currentMatrixData[p] && Array.isArray(currentMatrixData[p].finishes)) {
        isCompat = currentMatrixData[p].finishes.includes(f.key);
      } else {
        isCompat = Boolean(f.purities && f.purities[p]);
      }

      html += `
        <td style="padding: 9px 14px; text-align: center;">
          <label style="cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin: 0; padding: 2px;">
            <input
              type="checkbox"
              class="matrix-cell-chk"
              data-type="finish"
              data-key="${f.key}"
              data-purity="${p}"
              ${isCompat ? 'checked' : ''}
              onchange="handleMatrixCellChange()"
              style="width: 17px; height: 17px; accent-color: #10B981; cursor: pointer;"
            />
          </label>
        </td>
      `;
    });
    html += `</tr>`;
  });

  // 2. Stone type section header
  html += `
    <tr style="background: #F8FAFC; border-top: 2px solid #E2E8F0; border-bottom: 1px solid #E2E8F0;">
      <td colspan="${normalizedPurities.length + 1}" style="padding: 10px 18px; font-weight: 800; color: #1E293B; letter-spacing: 0.04em; text-transform: uppercase; font-size: 12px;">
        Stone type
      </td>
    </tr>
  `;

  // 3. Stone rows with interactive checkboxes
  activeStones.forEach((s, idx) => {
    const bg = idx % 2 === 0 ? '#FFFFFF' : '#FDFDFD';
    html += `
      <tr style="border-bottom: 1px solid #F1F5F9; background: ${bg};">
        <td style="padding: 11px 18px; color: #334155; font-weight: 500;">
          ${escapeHtml(s.name)}
        </td>
    `;
    normalizedPurities.forEach(p => {
      let isCompat = false;
      if (currentMatrixData[p] && Array.isArray(currentMatrixData[p].stones)) {
        isCompat = currentMatrixData[p].stones.includes(s.code);
      } else {
        isCompat = Boolean(s.purities && s.purities[p]);
      }

      html += `
        <td style="padding: 9px 14px; text-align: center;">
          <label style="cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin: 0; padding: 2px;">
            <input
              type="checkbox"
              class="matrix-cell-chk"
              data-type="stone"
              data-key="${s.code}"
              data-purity="${p}"
              ${isCompat ? 'checked' : ''}
              onchange="handleMatrixCellChange()"
              style="width: 17px; height: 17px; accent-color: #10B981; cursor: pointer;"
            />
          </label>
        </td>
      `;
    });
    html += `</tr>`;
  });

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;
  handleMatrixCellChange();
}'''

    if is_edit:
        # In edit, initialize currentMatrixData with existingCompatMatrix
        new_render_fn = new_render_fn.replace(
            'let currentMatrixData = {};',
            '''const existingCompatMatrix = {!! json_encode(old('compatibility_matrix', $product->compatibility_matrix ?? null)) !!};
let currentMatrixData = existingCompatMatrix && typeof existingCompatMatrix === 'object' ? existingCompatMatrix : {};'''
        )

    match = pattern.search(content)
    if not match:
        print(f"Error: pattern not found in {path}")
        return False

    content = content[:match.start()] + new_render_fn + content[match.end():]

    # Also update getCompatibilityMatrixPayload
    old_payload = re.compile(
        r'function getCompatibilityMatrixPayload\(\)\s*\{.*?\}',
        re.DOTALL
    )
    new_payload = '''function getCompatibilityMatrixPayload() {
  handleMatrixCellChange();
  return currentMatrixData;
}'''
    content = old_payload.sub(new_payload, content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Updated {path} successfully!")
    return True

update_file(r'e:\work\final_pintara\backend\resources\views\admin\products\create.blade.php', is_edit=False)
update_file(r'e:\work\final_pintara\backend\resources\views\admin\products\edit.blade.php', is_edit=True)
