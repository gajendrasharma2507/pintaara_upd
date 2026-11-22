import re

path = r'e:\work\final_pintara\src\app\collection\[id]\page.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update FacetedGemstone to support disabled state
old_faceted_decl = 'function FacetedGemstone({ type = \'diamond\', imageUrl, isSelected, onClick, title }) {'
new_faceted_decl = 'function FacetedGemstone({ type = \'diamond\', imageUrl, isSelected, onClick, title, disabled = false }) {'
if old_faceted_decl in content:
    content = content.replace(old_faceted_decl, new_faceted_decl)

# Update the buttons inside FacetedGemstone
# 1.1 type === 'none'
old_fg_none = '''        return (
            <button
                type="button"
                onClick={onClick}
                title={title || 'No Stone / Solid Gold'}
                aria-label={title || 'No Stone / Solid Gold'}
                className={`atelier-gem-btn ${isSelected ? 'active' : ''}`}
            >'''
new_fg_none = '''        return (
            <button
                type="button"
                onClick={disabled ? undefined : onClick}
                disabled={disabled}
                title={title || 'No Stone / Solid Gold'}
                aria-label={title || 'No Stone / Solid Gold'}
                className={`atelier-gem-btn ${isSelected ? 'active' : ''}`}
                style={{
                    opacity: disabled ? 0.18 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    pointerEvents: disabled ? 'none' : 'auto',
                    filter: disabled ? 'grayscale(80%)' : 'none'
                }}
            >'''
if old_fg_none in content:
    content = content.replace(old_fg_none, new_fg_none)

# 1.2 imageUrl && !imgFailed
old_fg_img = '''        return (
            <button
                type="button"
                onClick={onClick}
                title={title}
                aria-label={title}
                className={`atelier-gem-btn ${isSelected ? 'active' : ''}`}
            >'''
new_fg_img = '''        return (
            <button
                type="button"
                onClick={disabled ? undefined : onClick}
                disabled={disabled}
                title={title}
                aria-label={title}
                className={`atelier-gem-btn ${isSelected ? 'active' : ''}`}
                style={{
                    opacity: disabled ? 0.18 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    pointerEvents: disabled ? 'none' : 'auto',
                    filter: disabled ? 'grayscale(80%)' : 'none'
                }}
            >'''
if old_fg_img in content:
    content = content.replace(old_fg_img, new_fg_img)

# 1.3 standard facet return
old_fg_std = '''    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={title}
            className={`atelier-gem-btn ${isSelected ? 'active' : ''}`}
        >'''
new_fg_std = '''    return (
        <button
            type="button"
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            title={title}
            aria-label={title}
            className={`atelier-gem-btn ${isSelected ? 'active' : ''}`}
            style={{
                opacity: disabled ? 0.18 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                pointerEvents: disabled ? 'none' : 'auto',
                filter: disabled ? 'grayscale(80%)' : 'none'
            }}
        >'''
if old_fg_std in content:
    content = content.replace(old_fg_std, new_fg_std)

# 2. Update isOptionValueCompatible to be ultra-robust and match by value name, value ID, and case-insensitively
compat_logic_pattern = re.compile(
    r'const isOptionValueCompatible = useCallback\(\(group, val, purity\) => \{.*?'
    r'\}, \[selectedPurity, activeOptionGroups, selectedOptions, isOptionValueCompatible\]\);',
    re.DOTALL
)

new_compat_logic = '''const isOptionValueCompatible = useCallback((group, val, purity) => {
        const rawP = (purity || '').toUpperCase();
        const normP = rawP.includes('22') ? '22KT'
            : rawP.includes('18') ? '18KT'
            : rawP.includes('14') ? '14KT'
            : rawP.includes('925') || rawP.includes('SILVER') ? '925 SILVER'
            : rawP;

        const valId = typeof val === 'object' && val !== null ? String(val.id || '') : String(val || '');
        const valName = typeof val === 'object' && val !== null ? String(val.value || val.name || '') : String(val || '');
        const valNameClean = valName.trim().toLowerCase();

        if (compatMatrix && compatMatrix[normP]) {
            const pData = compatMatrix[normP];

            // 1. Check in pData.options by groupId
            if (pData.options && group?.id && pData.options[group.id]) {
                const list = pData.options[group.id].map(String);
                if (valId && list.includes(valId)) return true;
                // If val was passed as name string, match against group.values
                if (Array.isArray(group.values)) {
                    const matchedVal = group.values.find(v => String(v.value || '').trim().toLowerCase() === valNameClean);
                    if (matchedVal && list.includes(String(matchedVal.id))) return true;
                }
            }

            // 2. Check in pData.options_by_name by groupName (case-insensitive)
            if (pData.options_by_name && group?.name) {
                const grpNameLower = group.name.trim().toLowerCase();
                const targetKey = Object.keys(pData.options_by_name).find(
                    k => k.trim().toLowerCase() === grpNameLower
                );
                if (targetKey && Array.isArray(pData.options_by_name[targetKey])) {
                    const list = pData.options_by_name[targetKey].map(s => String(s).trim().toLowerCase());
                    if (list.includes(valNameClean)) return true;
                    // Also partial match for sizes like "10" vs "Ring Size 10"
                    if (list.some(s => s === valNameClean || valNameClean.replace(/^(ring\s*size|size)\s*/i, '').trim() === s)) {
                        return true;
                    }
                    return false;
                }
            }

            // 3. Check in pData.stones if gem/stone group
            const gLower = (group?.name || '').toLowerCase();
            if ((gLower.includes('gem') || gLower.includes('stone') || gLower.includes('diamond')) && pData.stones) {
                const list = pData.stones.map(s => String(s).trim().toLowerCase());
                return list.some(s => s === valNameClean || valNameClean.includes(s) || s.includes(valNameClean));
            }
        }

        // Fallback to Master Rules if gem/stone group and not in matrix
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
    }, [gemGroup]);

    // Auto-switch finish if currently selected finish is incompatible with newly selected purity
    useEffect(() => {
        if (!availableFinishes || availableFinishes.length === 0) return;
        const currentCode = normalizeFinishKey(selectedFinishCode);
        const isCurrentCompat = isFinishCompatible(currentCode, selectedPurity);

        if (!isCurrentCompat) {
            const firstCompat = availableFinishes.find(f => {
                const code = normalizeFinishKey(f.code || f.value || '');
                return isFinishCompatible(code, selectedPurity);
            });
            if (firstCompat) {
                const cleanCode = normalizeFinishKey(firstCompat.code || firstCompat.value || '');
                setSelectedFinishCode(cleanCode);
                const grpName = finishGroup?.name || 'Finish Options';
                handleSelectOption(grpName, { value: firstCompat.value || firstCompat.code, code: cleanCode, price_delta: 0, image: firstCompat.image });
            }
        }
    }, [selectedPurity, selectedFinishCode, availableFinishes, isFinishCompatible]);

    // Auto-switch any option group (dropdown, swatch, or buttons) if current selection is incompatible with purity
    useEffect(() => {
        if (!activeOptionGroups || activeOptionGroups.length === 0) return;

        activeOptionGroups.forEach(grp => {
            const currentSelected = selectedOptions[grp.name];
            const curVal = currentSelected?.value;
            const isChain = grp.name.toLowerCase().includes('chain');
            const isSize = grp.name.toLowerCase().includes('size');
            const effectiveVal = curVal || (isChain ? selectedChain : isSize ? selectedSize : grp.values[0]?.value);

            const isCompat = effectiveVal ? isOptionValueCompatible(grp, effectiveVal, selectedPurity) : false;

            if (!isCompat && grp.values && grp.values.length > 0) {
                const firstCompat = grp.values.find(v => isOptionValueCompatible(grp, v, selectedPurity));
                if (firstCompat) {
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

match = compat_logic_pattern.search(content)
if match:
    content = content[:match.start()] + new_compat_logic + content[match.end():]
else:
    print("Warning: compat_logic_pattern not matched")

# 3. Update Dropdown rendering to ONLY render compatible options for the selected purity
dropdown_render_pattern = re.compile(
    r'<select\s+className="atelier-box-select"\s+value=\{currentVal\}\s+onChange=\{.*?\{grp\.values\.map\(\(vObj\) => \{.*?</select>',
    re.DOTALL
)

new_dropdown_render = '''<select
                                                        className="atelier-box-select"
                                                        value={currentVal}
                                                        onChange={(e) => {
                                                            const chosenVal = e.target.value;
                                                            const foundObj = grp.values.find((v) => (v.value || v) === chosenVal || (v.code || '') === chosenVal || (isSize && (v.value || v).replace(/^(Ring\s*Size|Size)\s*/i, '').trim() === chosenVal));
                                                            if (isChain) setSelectedChain(chosenVal);
                                                            if (isSize) setSelectedSize(chosenVal);
                                                            handleSelectOption(grp.name, {
                                                                value: foundObj ? foundObj.value : chosenVal,
                                                                code: foundObj?.code || '',
                                                                price_delta: Number(foundObj?.price_delta || (isChain && chosenVal === 'None' ? -8000 : isChain && chosenVal === 'Rope' ? 3000 : 0))
                                                            });
                                                        }}
                                                    >
                                                        {(() => {
                                                            const compatibleVals = grp.values.filter(v => isOptionValueCompatible(grp, v, selectedPurity));
                                                            const renderVals = compatibleVals.length > 0 ? compatibleVals : grp.values;

                                                            return renderVals.map((vObj) => {
                                                                const rawVal = typeof vObj === 'string' ? vObj : vObj.value;
                                                                const displayVal = isSize ? rawVal.replace(/^(Ring\s*Size|Size)\s*/i, '').trim() : rawVal;
                                                                return (
                                                                    <option key={vObj.id || rawVal} value={rawVal}>
                                                                        {displayVal}
                                                                    </option>
                                                                );
                                                            });
                                                        })()}
                                                    </select>'''

match_dd = dropdown_render_pattern.search(content)
if match_dd:
    content = content[:match_dd.start()] + new_dropdown_render + content[match_dd.end():]
else:
    print("Warning: dropdown_render_pattern not matched")

# 4. Update Swatches FacetedGemstone invocation to pass disabled={!isValCompat}
old_fg_invoke = '''                                                            return (
                                                                <FacetedGemstone
                                                                    key={sVal.id || sVal.code || sVal.value || idx}
                                                                    type={typeStr}
                                                                    imageUrl={isNoStone ? null : (sVal.image || `/images/gems/${typeStr}.png`)}
                                                                    title={titleStr}
                                                                    isSelected={isSelected}
                                                                    onClick={() => {
                                                                        setSelectedGem(typeStr);
                                                                        handleSelectOption(grp.name, { value: sVal.value, code: sVal.code, price_delta: delta, image: sVal.image });
                                                                    }}
                                                                />
                                                            );'''

new_fg_invoke = '''                                                            return (
                                                                <FacetedGemstone
                                                                    key={sVal.id || sVal.code || sVal.value || idx}
                                                                    type={typeStr}
                                                                    imageUrl={isNoStone ? null : (sVal.image || `/images/gems/${typeStr}.png`)}
                                                                    title={isValCompat ? titleStr : `${sVal.value} (Not offered in ${selectedPurity})`}
                                                                    isSelected={isSelected && isValCompat}
                                                                    disabled={!isValCompat}
                                                                    onClick={() => {
                                                                        if (!isValCompat) return;
                                                                        setSelectedGem(typeStr);
                                                                        handleSelectOption(grp.name, { value: sVal.value, code: sVal.code, price_delta: delta, image: sVal.image });
                                                                    }}
                                                                />
                                                            );'''

if old_fg_invoke in content:
    content = content.replace(old_fg_invoke, new_fg_invoke)
else:
    print("Warning: old_fg_invoke not found")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Dynamic compatibility enforcement updated on storefront page.js!")
