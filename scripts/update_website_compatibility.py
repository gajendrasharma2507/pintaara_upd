import re

path = r'e:\work\final_pintara\src\app\collection\[id]\page.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the compat helper definitions inside DynamicCollectionPage
old_hooks_pattern = re.compile(
    r'// Compatibility Master Table data\s*'
    r'const compatDisplayPurities = useMemo\(\(\) => \{.*?'
    r'return COMPATIBILITY_RULES_MASTER\.stones;\s*\}, \[gemGroup\]\);',
    re.DOTALL
)

new_hooks = '''// Compatibility Master Table data & logic
    const compatMatrix = useMemo(() => {
        const raw = productDetail?.compatibility_matrix;
        if (!raw) return null;
        if (typeof raw === 'object') return raw;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }, [productDetail?.compatibility_matrix]);

    const isFinishCompatible = useCallback((finishKey, purity) => {
        const rawP = (purity || '').toUpperCase();
        const normP = rawP.includes('22') ? '22KT'
            : rawP.includes('18') ? '18KT'
            : rawP.includes('14') ? '14KT'
            : rawP.includes('925') || rawP.includes('SILVER') ? '925 SILVER'
            : rawP;

        const cleanKey = normalizeFinishKey(finishKey);

        if (compatMatrix && compatMatrix[normP] && Array.isArray(compatMatrix[normP].finishes)) {
            return compatMatrix[normP].finishes.map(normalizeFinishKey).includes(cleanKey);
        }

        const rule = COMPATIBILITY_RULES_MASTER.finishes.find(f => f.key === cleanKey);
        if (rule && rule.purities) {
            return Boolean(rule.purities[normP]);
        }
        return true;
    }, [compatMatrix]);

    const isStoneCompatible = useCallback((stoneCodeOrName, purity) => {
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
        if (!isFinishCompatible(selectedFinishCode, selectedPurity) && availableFinishes && availableFinishes.length > 0) {
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

    // Auto-switch gem/stone if currently selected stone is incompatible with newly selected purity
    useEffect(() => {
        if (gemGroup && Array.isArray(gemGroup.values) && gemGroup.values.length > 0) {
            const currentStone = selectedOptions[gemGroup.name]?.value;
            if (currentStone && !isStoneCompatible(currentStone, selectedPurity)) {
                const firstCompat = gemGroup.values.find(v => isStoneCompatible(v.value || v.code, selectedPurity));
                if (firstCompat) {
                    handleSelectOption(gemGroup.name, {
                        value: firstCompat.value,
                        code: firstCompat.code || '',
                        price_delta: parseFloat(firstCompat.price_delta) || 0
                    });
                }
            }
        }
    }, [selectedPurity, gemGroup, selectedOptions, isStoneCompatible]);'''

match = old_hooks_pattern.search(content)
if match:
    content = content[:match.start()] + new_hooks + content[match.end():]
else:
    print("Warning: old_hooks_pattern not matched")

# 2. Update the table rendering in JSX
old_table_cells = re.compile(
    r'\{compatDisplayPurities\.map\(\(p\) => \{\s*'
    r'const normP = p === \'925 Silver\' \? \'925 SILVER\' : p;\s*'
    r'const isCompat = f\.purities\?\.\[normP\] \?\? f\.purities\?\.\[p\];\s*'
    r'return \(\s*<td key=\{p\} className="atelier-compat-td-val">\s*'
    r'\{isCompat \?\s*<span className="atelier-compat-check">✓</span> :\s*'
    r'<span className="atelier-compat-dash">—</span>\}\s*</td>\s*\);\s*\}\)\}',
    re.DOTALL
)

new_finish_cells = '''{compatDisplayPurities.map((p) => {
    const isCompat = isFinishCompatible(f.key, p);
    return (
        <td key={p} className="atelier-compat-td-val">
            {isCompat ? (
                <span className="atelier-compat-check">✓</span>
            ) : (
                <span className="atelier-compat-dash">—</span>
            )}
        </td>
    );
})}'''

content = old_table_cells.sub(new_finish_cells, content)

old_stone_cells = re.compile(
    r'\{compatDisplayPurities\.map\(\(p\) => \{\s*'
    r'const normP = p === \'925 Silver\' \? \'925 SILVER\' : p;\s*'
    r'const isCompat = s\.purities\?\.\[normP\] \?\? s\.purities\?\.\[p\];\s*'
    r'return \(\s*<td key=\{p\} className="atelier-compat-td-val">\s*'
    r'\{isCompat \?\s*<span className="atelier-compat-check">✓</span> :\s*'
    r'<span className="atelier-compat-dash">—</span>\}\s*</td>\s*\);\s*\}\)\}',
    re.DOTALL
)

new_stone_cells = '''{compatDisplayPurities.map((p) => {
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
})}'''

content = old_stone_cells.sub(new_stone_cells, content)

# 3. Update the Finish Bar button to show disabled state when incompatible
old_finish_btn = '''                                        const isSelected = normalizeFinishKey(selectedFinishCode) === cleanCode;
                                        return (
                                            <button
                                                key={fVal.id || code}
                                                type="button"
                                                title={matchedBar.name || valStr}
                                                aria-label={matchedBar.name || valStr}
                                                className={`atelier-finish-bar ${isSelected ? 'active' : ''}`}
                                                style={matchedBar.style}
                                                onClick={() => {
                                                    setSelectedFinishCode(cleanCode);
                                                    setActiveImgIndex(0);
                                                    setMediaViewMode('photo');
                                                    const grpName = finishGroup?.name || 'Finish Options';
                                                    handleSelectOption(grpName, { value: valStr, code: cleanCode, price_delta: 0, image: fVal.image });
                                                }}
                                            >'''

new_finish_btn = '''                                        const isSelected = normalizeFinishKey(selectedFinishCode) === cleanCode;
                                        const isCompat = isFinishCompatible(cleanCode, selectedPurity);
                                        return (
                                            <button
                                                key={fVal.id || code}
                                                type="button"
                                                title={isCompat ? (matchedBar.name || valStr) : `${matchedBar.name || valStr} (Not offered in ${selectedPurity})`}
                                                aria-label={matchedBar.name || valStr}
                                                disabled={!isCompat}
                                                className={`atelier-finish-bar ${isSelected ? 'active' : ''}`}
                                                style={{
                                                    ...matchedBar.style,
                                                    opacity: isCompat ? 1 : 0.22,
                                                    cursor: isCompat ? 'pointer' : 'not-allowed',
                                                    filter: isCompat ? 'none' : 'grayscale(60%)',
                                                }}
                                                onClick={() => {
                                                    if (!isCompat) return;
                                                    setSelectedFinishCode(cleanCode);
                                                    setActiveImgIndex(0);
                                                    setMediaViewMode('photo');
                                                    const grpName = finishGroup?.name || 'Finish Options';
                                                    handleSelectOption(grpName, { value: valStr, code: cleanCode, price_delta: 0, image: fVal.image });
                                                }}
                                            >'''

if old_finish_btn in content:
    content = content.replace(old_finish_btn, new_finish_btn)
else:
    print("Warning: old_finish_btn not found directly, checking normalized")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: page.js updated with dynamic compatibility matrix logic!")
