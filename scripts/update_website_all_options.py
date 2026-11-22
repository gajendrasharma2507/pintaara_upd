import re

path = r'e:\work\final_pintara\src\app\collection\[id]\page.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the isOptionValueCompatible function and hooks
old_logic_pattern = re.compile(
    r'const isStoneCompatible = useCallback\(\(stoneCodeOrName, purity\) => \{.*?'
    r'return COMPATIBILITY_RULES_MASTER\.stones;\s*\}, \[gemGroup\]\);',
    re.DOTALL
)

new_logic = '''const isStoneCompatible = useCallback((stoneCodeOrName, purity) => {
        const rawP = (purity || '').toUpperCase();
        const normP = rawP.includes('22') ? '22KT'
            : rawP.includes('18') ? '18KT'
            : rawP.includes('14') ? '14KT'
            : rawP.includes('925') || rawP.includes('SILVER') ? '925 SILVER'
            : rawP;

        const str = String(stoneCodeOrName || '').toLowerCase();
        const matchedRule = COMPATIBILITY_RULES_MASTER.stones.find(s => {
            const sName = s.name.toLowerCase();
            return sName.includes(str) || str.includes(sName.split(' ')[0]);
        });

        const stoneCode = matchedRule?.code || stoneCodeOrName;

        if (compatMatrix && compatMatrix[normP] && Array.isArray(compatMatrix[normP].stones)) {
            return compatMatrix[normP].stones.includes(stoneCode);
        }

        if (matchedRule && matchedRule.purities) {
            return Boolean(matchedRule.purities[normP]);
        }
        return true;
    }, [compatMatrix]);

    const isOptionValueCompatible = useCallback((group, val, purity) => {
        const rawP = (purity || '').toUpperCase();
        const normP = rawP.includes('22') ? '22KT'
            : rawP.includes('18') ? '18KT'
            : rawP.includes('14') ? '14KT'
            : rawP.includes('925') || rawP.includes('SILVER') ? '925 SILVER'
            : rawP;

        const valId = typeof val === 'object' ? val.id : val;
        const valName = typeof val === 'object' ? (val.value || val.name || '') : String(val);

        if (compatMatrix && compatMatrix[normP]) {
            const pData = compatMatrix[normP];
            if (pData.options && group?.id && pData.options[group.id]) {
                const list = pData.options[group.id];
                return list.includes(String(valId)) || list.includes(Number(valId));
            }
            if (pData.options_by_name && group?.name && pData.options_by_name[group.name]) {
                const list = pData.options_by_name[group.name];
                return list.includes(valName);
            }
            const gLower = (group?.name || '').toLowerCase();
            if ((gLower.includes('gem') || gLower.includes('stone') || gLower.includes('diamond')) && pData.stones) {
                return pData.stones.includes(valName) || pData.stones.includes(String(valId));
            }
        }

        const gLower = (group?.name || '').toLowerCase();
        if ((gLower.includes('gem') || gLower.includes('stone')) && !gLower.includes('clarity')) {
            return isStoneCompatible(valName, purity);
        }

        return true;
    }, [compatMatrix, isStoneCompatible]);

    const compatDisplayPurities = useMemo(() => {
        const raw = availablePurities?.map(p => (p.code || p.value || '').toUpperCase()) || [];
        const norm = (r) => {
            if (r.includes('22')) return '22KT';
            if (r.includes('18')) return '18KT';
            if (r.includes('14')) return '14KT';
            if (r.includes('925') || r.includes('SILVER')) return '925 Silver';
            return r;
        };
        const unique = Array.from(new Set(raw.map(norm).filter(Boolean)));
        return unique.length > 0 ? unique : ['22KT', '18KT', '14KT'];
    }, [availablePurities]);

    const compatDisplayFinishes = useMemo(() => {
        const selectedKeys = availableFinishes?.map(f => normalizeFinishKey(f.code || f.value || '')) || ['YG', 'WG', 'RG', 'BLK'];
        const matched = COMPATIBILITY_RULES_MASTER.finishes.filter(f => selectedKeys.includes(f.key));
        return matched.length > 0 ? matched : COMPATIBILITY_RULES_MASTER.finishes.slice(0, 4);
    }, [availableFinishes]);

    const compatDisplayStones = useMemo(() => {
        if (gemGroup && Array.isArray(gemGroup.values) && gemGroup.values.length > 0) {
            const valNames = gemGroup.values.map(v => (v.value || v.name || '').toLowerCase());
            const matched = COMPATIBILITY_RULES_MASTER.stones.filter(s => {
                const sName = s.name.toLowerCase();
                return valNames.some(vName => sName.includes(vName) || vName.includes(sName.split(' ')[0]));
            });
            if (matched.length > 0) return matched;
        }
        return COMPATIBILITY_RULES_MASTER.stones;
    }, [gemGroup]);'''

match = old_logic_pattern.search(content)
if match:
    content = content[:match.start()] + new_logic + content[match.end():]
else:
    print("Warning: old_logic_pattern not matched directly")

# 2. Update auto-switch for all option groups when purity changes
auto_switch_pattern = re.compile(
    r'// Auto-switch gem/stone if currently selected stone is incompatible with newly selected purity\s*'
    r'useEffect\(\(\) => \{.*?'
    r'\}, \[selectedPurity, gemGroup, selectedOptions, isStoneCompatible\]\);',
    re.DOTALL
)

new_auto_switch = '''// Auto-switch any option group (dropdown, swatch, or buttons) if current selection is incompatible with purity
    useEffect(() => {
        if (!activeOptionGroups || activeOptionGroups.length === 0) return;

        activeOptionGroups.forEach(grp => {
            const curVal = selectedOptions[grp.name]?.value;
            if (curVal && !isOptionValueCompatible(grp, curVal, selectedPurity)) {
                const firstCompat = grp.values?.find(v => isOptionValueCompatible(grp, v, selectedPurity));
                if (firstCompat) {
                    const isChain = grp.name.toLowerCase().includes('chain');
                    const isSize = grp.name.toLowerCase().includes('size');
                    const rawVal = firstCompat.value || firstCompat;
                    if (isChain) setSelectedChain(rawVal);
                    if (isSize) setSelectedSize(rawVal);
                    handleSelectOption(grp.name, {
                        value: rawVal,
                        code: firstCompat.code || '',
                        price_delta: parseFloat(firstCompat.price_delta) || 0,
                        image: firstCompat.image || null
                    });
                }
            }
        });
    }, [selectedPurity, activeOptionGroups, selectedOptions, isOptionValueCompatible]);'''

match2 = auto_switch_pattern.search(content)
if match2:
    content = content[:match2.start()] + new_auto_switch + content[match2.end():]
else:
    print("Warning: auto_switch_pattern not matched directly")

# 3. Update table JSX in website piece page
table_jsx_pattern = re.compile(
    r'<tr className="atelier-compat-subhead-row">\s*'
    r'<td colSpan=\{compatDisplayPurities\.length \+ 1\} className="atelier-compat-subhead-td">\s*'
    r'Stone type\s*'
    r'</td>\s*</tr>.*?'
    r'\{compatDisplayStones\.map\(\(s, sIdx\) => \(.*?\)\)\}',
    re.DOTALL
)

new_table_jsx = '''{activeOptionGroups && activeOptionGroups.length > 0 ? (
    activeOptionGroups.map((grp) => (
        <React.Fragment key={grp.id || grp.name}>
            <tr className="atelier-compat-subhead-row">
                <td colSpan={compatDisplayPurities.length + 1} className="atelier-compat-subhead-td">
                    {grp.name}
                </td>
            </tr>
            {grp.values?.map((val, vIdx) => {
                const valId = typeof val === 'object' ? val.id : val;
                const valName = typeof val === 'object' ? (val.value || val.name || '') : String(val);
                return (
                    <tr key={valId || vIdx}>
                        <td className="atelier-compat-td-label">
                            <span>{valName}</span>
                        </td>
                        {compatDisplayPurities.map((p) => {
                            const isCompat = isOptionValueCompatible(grp, val, p);
                            return (
                                <td key={p} className="atelier-compat-td-val">
                                    {isCompat ? (
                                        <span className="atelier-compat-check">✓</span>
                                    ) : (
                                        <span className="atelier-compat-dash">—</span>
                                    )}
                                </td>
                            );
                        })}
                    </tr>
                );
            })}
        </React.Fragment>
    ))
) : (
    <>
        <tr className="atelier-compat-subhead-row">
            <td colSpan={compatDisplayPurities.length + 1} className="atelier-compat-subhead-td">
                Stone type
            </td>
        </tr>
        {compatDisplayStones.map((s, sIdx) => (
            <tr key={s.code || sIdx}>
                <td className="atelier-compat-td-label">
                    <span>{s.name}</span>
                </td>
                {compatDisplayPurities.map((p) => {
                    const isCompat = isStoneCompatible(s.code || s.name, p);
                    return (
                        <td key={p} className="atelier-compat-td-val">
                            {isCompat ? (
                                <span className="atelier-compat-check">✓</span>
                            ) : (
                                <span className="atelier-compat-dash">—</span>
                            )}
                        </td>
                    );
                })}
            </tr>
        ))}
    </>
)}'''

match3 = table_jsx_pattern.search(content)
if match3:
    content = content[:match3.start()] + new_table_jsx + content[match3.end():]
else:
    print("Warning: table_jsx_pattern not matched directly")

# 4. Update dropdown <option> compatibility
old_dropdown_opt = '''                                                            const rawVal = typeof vObj === 'string' ? vObj : vObj.value;
                                                            const displayVal = isSize ? rawVal.replace(/^(Ring\s*Size|Size)\s*/i, '').trim() : rawVal;
                                                            return (
                                                                <option key={vObj.id || rawVal} value={rawVal}>
                                                                    {displayVal}
                                                                </option>
                                                            );'''

new_dropdown_opt = '''                                                            const rawVal = typeof vObj === 'string' ? vObj : vObj.value;
                                                            const displayVal = isSize ? rawVal.replace(/^(Ring\s*Size|Size)\s*/i, '').trim() : rawVal;
                                                            const isCompat = isOptionValueCompatible(grp, vObj, selectedPurity);
                                                            return (
                                                                <option key={vObj.id || rawVal} value={rawVal} disabled={!isCompat}>
                                                                    {displayVal} {!isCompat ? `(${selectedPurity} N/A)` : ''}
                                                                </option>
                                                            );'''

if old_dropdown_opt in content:
    content = content.replace(old_dropdown_opt, new_dropdown_opt)
else:
    print("Warning: old_dropdown_opt not found directly")

# 5. Update image swatches compatibility
old_swatch_elem = '''                                                        const currentVal = selectedOptions[grp.name]?.value;
                                                        const isSelected = currentVal ? currentVal === sVal.value : (idx === 0);'''

new_swatch_elem = '''                                                        const currentVal = selectedOptions[grp.name]?.value;
                                                        const isSelected = currentVal ? currentVal === sVal.value : (idx === 0);
                                                        const isValCompat = isOptionValueCompatible(grp, sVal, selectedPurity);'''

if old_swatch_elem in content:
    content = content.replace(old_swatch_elem, new_swatch_elem)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: page.js updated with all product option groups compatibility!")
