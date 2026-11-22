import re

def update_admin_blade(path, is_edit=False):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the function handleMatrixCellChange and renderCompatibilityMasterTable block
    pattern = re.compile(
        r'function handleMatrixCellChange\(\)\s*\{.*?'
        r'function renderCompatibilityMasterTable\(\)\s*\{.*?'
        r'container\.innerHTML = html;\s*handleMatrixCellChange\(\);\s*\}',
        re.DOTALL
    )

    new_code = '''function handleMatrixCellChange() {
  const matrix = {};
  const normalizedPurities = Array.from(new Set(getCheckedPurities().map(normalizePurityKey)));

  normalizedPurities.forEach(p => {
    matrix[p] = { finishes: [], options: {}, options_by_name: {}, stones: [] };
  });

  document.querySelectorAll('.matrix-cell-chk').forEach(cb => {
    const p = cb.getAttribute('data-purity');
    const type = cb.getAttribute('data-type');
    const key = cb.getAttribute('data-key');
    const groupId = cb.getAttribute('data-group-id');
    const groupName = cb.getAttribute('data-group-name');
    const valName = cb.getAttribute('data-val-name');

    if (!matrix[p]) matrix[p] = { finishes: [], options: {}, options_by_name: {}, stones: [] };

    if (cb.checked) {
      if (type === 'finish') {
        if (!matrix[p].finishes.includes(key)) matrix[p].finishes.push(key);
      } else if (type === 'option') {
        if (!matrix[p].options[groupId]) matrix[p].options[groupId] = [];
        if (!matrix[p].options[groupId].includes(key)) matrix[p].options[groupId].push(key);

        if (!matrix[p].options_by_name[groupName]) matrix[p].options_by_name[groupName] = [];
        if (!matrix[p].options_by_name[groupName].includes(valName)) matrix[p].options_by_name[groupName].push(valName);

        const gLower = (groupName || '').toLowerCase();
        if (gLower.includes('gem') || gLower.includes('stone') || gLower.includes('diamond')) {
          if (!matrix[p].stones) matrix[p].stones = [];
          if (!matrix[p].stones.includes(key) && !matrix[p].stones.includes(valName)) {
            matrix[p].stones.push(valName);
          }
        }
      } else if (type === 'stone') {
        if (!matrix[p].stones) matrix[p].stones = [];
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

  // Active finishes from selectedFinishKeys
  const activeFinishes = COMPATIBILITY_RULES_MASTER.finishes.filter(f => selectedFinishKeys.includes(f.key));
  const finishesToDisplay = activeFinishes.length > 0 ? activeFinishes : COMPATIBILITY_RULES_MASTER.finishes.slice(0, 4);

  // Active option groups selected by admin in Product Options
  const activeGroups = [];
  if (typeof optionGroupsData !== 'undefined' && Array.isArray(optionGroupsData)) {
    optionGroupsData.forEach(group => {
      const chkEnable = document.getElementById(`chk_group_enable_${group.id}`);
      if (chkEnable && chkEnable.checked) {
        const checkedValCbs = document.querySelectorAll(`.group-val-chk-${group.id}:checked`);
        if (checkedValCbs.length > 0) {
          const values = Array.from(checkedValCbs).map(cb => ({
            id: cb.value,
            name: cb.getAttribute('data-val-name') || cb.value,
          }));
          activeGroups.push({
            id: group.id,
            name: group.name,
            code: group.code,
            values: values
          });
        }
      }
    });
  }

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

  // 2. Loop through each active option group (e.g. SIZE, GEM / STONE OPTIONS, etc.)
  activeGroups.forEach(grp => {
    html += `
      <tr style="background: #F8FAFC; border-top: 2px solid #E2E8F0; border-bottom: 1px solid #E2E8F0;">
        <td colspan="${normalizedPurities.length + 1}" style="padding: 10px 18px; font-weight: 800; color: #1E293B; letter-spacing: 0.04em; text-transform: uppercase; font-size: 12px;">
          ${escapeHtml(grp.name)}
        </td>
      </tr>
    `;

    const isGemGroup = (grp.name.toLowerCase().includes('gem') || grp.name.toLowerCase().includes('stone')) && !grp.name.toLowerCase().includes('clarity');

    grp.values.forEach((val, vIdx) => {
      const bg = vIdx % 2 === 0 ? '#FFFFFF' : '#FDFDFD';
      html += `
        <tr style="border-bottom: 1px solid #F1F5F9; background: ${bg};">
          <td style="padding: 11px 18px; color: #334155; font-weight: 500;">
            ${escapeHtml(val.name)}
          </td>
      `;

      normalizedPurities.forEach(p => {
        let isCompat = false;
        const savedOptions = currentMatrixData[p]?.options;
        const savedOptionsByName = currentMatrixData[p]?.options_by_name;
        const savedStones = currentMatrixData[p]?.stones;

        if (savedOptions && savedOptions[grp.id]) {
          isCompat = savedOptions[grp.id].includes(String(val.id)) || savedOptions[grp.id].includes(Number(val.id));
        } else if (savedOptionsByName && savedOptionsByName[grp.name]) {
          isCompat = savedOptionsByName[grp.name].includes(val.name);
        } else if (isGemGroup && savedStones) {
          isCompat = savedStones.includes(val.name) || savedStones.includes(String(val.id));
        } else if (isGemGroup) {
          // Fallback to Master Rules for stones
          const vLower = val.name.toLowerCase();
          const matched = COMPATIBILITY_RULES_MASTER.stones.find(s => {
            const sName = s.name.toLowerCase();
            return sName.includes(vLower) || vLower.includes(sName.split(' ')[0]);
          });
          if (matched) {
            isCompat = Boolean(matched.purities && matched.purities[p]);
          } else {
            isCompat = true;
          }
        } else {
          // Default for sizes or other groups: true
          isCompat = true;
        }

        html += `
          <td style="padding: 9px 14px; text-align: center;">
            <label style="cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin: 0; padding: 2px;">
              <input
                type="checkbox"
                class="matrix-cell-chk"
                data-type="option"
                data-group-id="${grp.id}"
                data-group-name="${escapeHtml(grp.name)}"
                data-key="${val.id}"
                data-val-name="${escapeHtml(val.name)}"
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
  });

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;
  handleMatrixCellChange();
}'''

    match = pattern.search(content)
    if not match:
        print(f"Error: pattern not found in {path}")
        return False

    content = content[:match.start()] + new_code + content[match.end():]

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Updated {path} successfully!")
    return True

update_admin_blade(r'e:\work\final_pintara\backend\resources\views\admin\products\create.blade.php', is_edit=False)
update_admin_blade(r'e:\work\final_pintara\backend\resources\views\admin\products\edit.blade.php', is_edit=True)
