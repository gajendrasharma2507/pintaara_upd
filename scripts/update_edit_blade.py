import re

path = r'e:\work\final_pintara\backend\resources\views\admin\products\edit.blade.php'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the block from function getSelectedFinishKeys() to function getCompatibilityMatrixPayload()
pattern = re.compile(
    r'function getSelectedFinishKeys\(\)\s*\{.*?'
    r'function getCompatibilityMatrixPayload\(\)\s*\{.*?return currentMatrixData;\s*\}',
    re.DOTALL
)

replacement_block = '''function getSelectedFinishKeys() {
  const checkboxes = document.querySelectorAll('.finish-checkbox:checked');
  const selected = Array.from(checkboxes).map(cb => cb.getAttribute('data-finish-key'));
  return selected.length > 0 ? selected : ['YG'];
}

function handleFinishToggle(checkbox) {
  const slug = checkbox.getAttribute('data-slug');
  const color = checkbox.getAttribute('data-color') || '#D4AF37';
  const card = document.getElementById('card_finish_' + slug);
  if (card) {
    card.style.borderColor = checkbox.checked ? color : 'var(--admin-border)';
  }

  const selectedKeys = getSelectedFinishKeys();
  if (!selectedKeys.includes(activeFinishKey)) {
    activeFinishKey = selectedKeys[0] || 'YG';
  }

  renderFinishTabs();
  renderActiveGallery();
  renderCompatibilityMasterTable();
}

function handlePurityToggle(checkbox) {
  const key = checkbox.getAttribute('data-purity-key');
  const color = checkbox.getAttribute('data-color') || '#B8860B';
  const card = document.getElementById('card_purity_' + key);
  if (card) {
    card.style.borderColor = checkbox.checked ? color : 'var(--admin-border)';
  }
  renderCompatibilityMasterTable();
}

const COMPATIBILITY_RULES_MASTER = {
  finishes: [
    { key: 'YG', name: 'Yellow Gold', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': false } },
    { key: 'WG', name: 'White Gold', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': false } },
    { key: 'RG', name: 'Rose Gold', purities: { '22KT': false, '18KT': true, '14KT': true, '925 SILVER': false } },
    { key: 'BLK', name: 'Black Gold', purities: { '22KT': false, '18KT': true, '14KT': true, '925 SILVER': false } },
    { key: 'NAT_SILVER', name: 'Natural Silver', purities: { '22KT': false, '18KT': false, '14KT': false, '925 SILVER': true } },
    { key: 'RHOD_SILVER', name: 'Rhodium-Plated Silver', purities: { '22KT': false, '18KT': false, '14KT': false, '925 SILVER': true } },
    { key: 'GOLD_SILVER', name: 'Gold-Plated Silver', purities: { '22KT': false, '18KT': false, '14KT': false, '925 SILVER': true } },
  ],
  stones: [
    { code: 'LGD', name: 'Lab-grown diamond', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': false } },
    { code: 'DIA', name: 'Natural diamond', purities: { '22KT': false, '18KT': true, '14KT': true, '925 SILVER': false } },
    { code: 'CZ', name: 'American diamond (CZ)', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': true } },
    { code: 'MOI', name: 'Moissanite', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': true } },
    { code: 'SAP', name: 'Sapphire', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': false } },
    { code: 'EMR', name: 'Emerald', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': true } },
    { code: 'RUB', name: 'Ruby', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': false } },
    { code: 'NONE', name: 'No stone / Plain metal', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': true } },
  ]
};

function getCheckedPurities() {
  const cbs = document.querySelectorAll('.purity-checkbox:checked');
  const list = Array.from(cbs).map(cb => cb.value.toUpperCase().trim());
  return list.length > 0 ? list : ['22KT', '18KT', '14KT'];
}

function normalizePurityKey(raw) {
  const u = (raw || '').toUpperCase();
  if (u.includes('22')) return '22KT';
  if (u.includes('18')) return '18KT';
  if (u.includes('14')) return '14KT';
  if (u.includes('925') || u.includes('SILVER')) return '925 SILVER';
  return u;
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
      const checkedValNames = Array.from(checkedStoneCbs).map(cb => (cb.getAttribute('data-val-name') || '').toLowerCase());
      activeStones = COMPATIBILITY_RULES_MASTER.stones.filter(s => {
        const sName = s.name.toLowerCase();
        return checkedValNames.some(vName => sName.includes(vName) || vName.includes(sName.split(' ')[0]));
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

  // Compute matrix payload
  const matrix = {};
  normalizedPurities.forEach(p => {
    matrix[p] = {
      finishes: finishesToDisplay.filter(f => f.purities[p]).map(f => f.key),
      stones: activeStones.filter(s => s.purities[p]).map(s => s.code),
    };
  });
  const input = document.getElementById('compatibility_matrix_json');
  if (input) {
    input.value = JSON.stringify(matrix);
  }

  // Build clean normal table
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

  // 1. Finish rows
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
      const isCompat = f.purities[p];
      html += `
        <td style="padding: 11px 14px; text-align: center;">
          ${isCompat 
            ? '<span style="color: #10B981; font-weight: 800; font-size: 15px;">✓</span>' 
            : '<span style="color: #94A3B8; font-weight: 700; font-size: 16px;">—</span>'}
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

  // 3. Stone rows
  activeStones.forEach((s, idx) => {
    const bg = idx % 2 === 0 ? '#FFFFFF' : '#FDFDFD';
    html += `
      <tr style="border-bottom: 1px solid #F1F5F9; background: ${bg};">
        <td style="padding: 11px 18px; color: #334155; font-weight: 500;">
          ${escapeHtml(s.name)}
        </td>
    `;
    normalizedPurities.forEach(p => {
      const isCompat = s.purities[p];
      html += `
        <td style="padding: 11px 14px; text-align: center;">
          ${isCompat 
            ? '<span style="color: #10B981; font-weight: 800; font-size: 15px;">✓</span>' 
            : '<span style="color: #94A3B8; font-weight: 700; font-size: 16px;">—</span>'}
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
}

function getCompatibilityMatrixPayload() {
  renderCompatibilityMasterTable();
  const input = document.getElementById('compatibility_matrix_json');
  return input && input.value ? JSON.parse(input.value) : {};
}'''

match = pattern.search(content)
if not match:
    print("ERROR: could not find match for pattern")
    exit(1)

content = content[:match.start()] + replacement_block + content[match.end():]

# 2. In DOMContentLoaded, replace renderCompatibilityMasterCards() with renderCompatibilityMasterTable()
content = content.replace('renderCompatibilityMasterCards();', 'renderCompatibilityMasterTable();')

# 3. Remove duplicate handlePurityToggle if it appears later
dup_purity_fn = re.compile(
    r'function handlePurityToggle\(checkbox\)\s*\{[^\}]*\}',
    re.DOTALL
)
# We have 1 definition in our replacement_block, let's check how many total
matches = list(dup_purity_fn.finditer(content))
if len(matches) > 1:
    # Remove the second one
    m2 = matches[1]
    content = content[:m2.start()] + content[m2.end():]

# 4. In initOptionsAndVariantsBuilder, add renderCompatibilityMasterTable() triggers
# Replace chkEnable change listener
chk_enable_target = '''    chkEnable.addEventListener('change', () => {
      const checked = chkEnable.checked;
      valsArea.style.display = checked ? 'block' : 'none';
      selDisplay.disabled = !checked;
      chkReq.disabled = !checked;
      card.style.background = checked ? '#F8FAFF' : 'var(--admin-surface)';
      card.style.borderColor = checked ? '#C7D2FE' : 'var(--admin-border)';
    });'''

chk_enable_repl = '''    chkEnable.addEventListener('change', () => {
      const checked = chkEnable.checked;
      valsArea.style.display = checked ? 'block' : 'none';
      selDisplay.disabled = !checked;
      chkReq.disabled = !checked;
      card.style.background = checked ? '#F8FAFF' : 'var(--admin-surface)';
      card.style.borderColor = checked ? '#C7D2FE' : 'var(--admin-border)';
      renderCompatibilityMasterTable();
    });

    card.querySelectorAll(`.group-val-chk-${group.id}`).forEach(c => {
      c.addEventListener('change', () => {
        renderCompatibilityMasterTable();
      });
    });'''

if chk_enable_target in content:
    content = content.replace(chk_enable_target, chk_enable_repl)
else:
    print("Warning: chk_enable_target not found")

# Replace btnSelectAll & btnDeselectAll
sel_all_target = '''    if (btnSelectAll) {
      btnSelectAll.addEventListener('click', () => {
        card.querySelectorAll(`.group-val-chk-${group.id}`).forEach(c => c.checked = true);
      });
    }

    const btnDeselectAll = card.querySelector(`.btn-deselect-all-vals[data-group-id="${group.id}"]`);
    if (btnDeselectAll) {
      btnDeselectAll.addEventListener('click', () => {
        card.querySelectorAll(`.group-val-chk-${group.id}`).forEach(c => c.checked = false);
      });
    }'''

sel_all_repl = '''    if (btnSelectAll) {
      btnSelectAll.addEventListener('click', () => {
        card.querySelectorAll(`.group-val-chk-${group.id}`).forEach(c => c.checked = true);
        renderCompatibilityMasterTable();
      });
    }

    const btnDeselectAll = card.querySelector(`.btn-deselect-all-vals[data-group-id="${group.id}"]`);
    if (btnDeselectAll) {
      btnDeselectAll.addEventListener('click', () => {
        card.querySelectorAll(`.group-val-chk-${group.id}`).forEach(c => c.checked = false);
        renderCompatibilityMasterTable();
      });
    }'''

if sel_all_target in content:
    content = content.replace(sel_all_target, sel_all_repl)
else:
    print("Warning: sel_all_target not found")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: edit.blade.php updated successfully!")
