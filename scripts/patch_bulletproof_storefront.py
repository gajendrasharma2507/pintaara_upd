with open('src/app/collection/[id]/page.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Patch isOptionValueCompatible
old_opt_compat = """    const isOptionValueCompatible = useCallback((group, val, purity) => {
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

            let hasOptIdCheck = false;
            let matchedOptId = false;
            const grpId = String(group?.id || '');
            if (pData.options && grpId && pData.options[grpId] !== undefined) {
                hasOptIdCheck = true;
                const list = pData.options[grpId].map(String);
                if (valId && list.includes(valId)) {
                    matchedOptId = true;
                } else if (Array.isArray(group.values)) {
                    const matchedVal = group.values.find(v => String(v.value || '').trim().toLowerCase() === valNameClean);
                    if (matchedVal && list.includes(String(matchedVal.id))) {
                        matchedOptId = true;
                    }
                }
            }

            let hasOptNameCheck = false;
            let matchedOptName = false;
            if (pData.options_by_name && group?.name) {
                const grpNameLower = group.name.trim().toLowerCase();
                const targetKey = Object.keys(pData.options_by_name).find(
                    k => k.trim().toLowerCase() === grpNameLower
                );
                if (targetKey && Array.isArray(pData.options_by_name[targetKey])) {
                    hasOptNameCheck = true;
                    const list = pData.options_by_name[targetKey].map(s => String(s).trim().toLowerCase());
                    if (list.includes(valNameClean) || list.some(s => s === valNameClean || valNameClean.replace(/^(ring\\s*size|size)\\s*/i, '').trim() === s)) {
                        matchedOptName = true;
                    }
                }
            }

            let hasStonesCheck = false;
            let matchedStones = false;
            const gLower = (group?.name || '').toLowerCase();
            const isGemGrp = (gLower.includes('gem') || gLower.includes('stone') || gLower.includes('diamond')) && !gLower.includes('clarity');
            if (isGemGrp && Array.isArray(pData.stones)) {
                hasStonesCheck = true;
                const list = pData.stones.map(s => String(s).trim().toLowerCase());
                if (list.some(s => s === valNameClean || valNameClean.includes(s) || s.includes(valNameClean))) {
                    matchedStones = true;
                }
            }

            if (hasOptIdCheck || hasOptNameCheck || hasStonesCheck) {
                return Boolean(matchedOptId || matchedOptName || matchedStones);
            }
        }

        // Fallback to Master Rules if gem/stone group and not in matrix
        const gLower = (group?.name || '').toLowerCase();
        if ((gLower.includes('gem') || gLower.includes('stone')) && !gLower.includes('clarity')) {
            return isStoneCompatible(valName, purity);
        }

        return true;
    }, [compatMatrix, isStoneCompatible]);"""

new_opt_compat = """    const isOptionValueCompatible = useCallback((group, val, purity) => {
        if (!group) return true;
        const rawP = (purity || '').toUpperCase();
        const normP = rawP.includes('22') ? '22KT'
            : rawP.includes('18') ? '18KT'
            : rawP.includes('14') ? '14KT'
            : rawP.includes('925') || rawP.includes('SILVER') ? '925 SILVER'
            : rawP;

        const valId = typeof val === 'object' && val !== null ? String(val.id || '') : String(val || '');
        const valName = typeof val === 'object' && val !== null ? String(val.value || val.name || '') : String(val || '');
        const valNameClean = valName.trim().toLowerCase();

        if (compatMatrix && compatMatrix[normP] && typeof compatMatrix[normP] === 'object') {
            const pData = compatMatrix[normP];

            let hasOptIdCheck = false;
            let matchedOptId = false;
            const grpId = String(group?.id || '');
            if (pData.options && typeof pData.options === 'object' && !Array.isArray(pData.options) && grpId && pData.options[grpId] !== undefined) {
                hasOptIdCheck = true;
                const rawList = pData.options[grpId];
                const list = Array.isArray(rawList) ? rawList.map(String) : [];
                if (valId && list.includes(valId)) {
                    matchedOptId = true;
                } else if (Array.isArray(group.values)) {
                    const matchedVal = group.values.find(v => String(v?.value || v || '').trim().toLowerCase() === valNameClean);
                    if (matchedVal && list.includes(String(matchedVal?.id || ''))) {
                        matchedOptId = true;
                    }
                }
            }

            let hasOptNameCheck = false;
            let matchedOptName = false;
            if (pData.options_by_name && typeof pData.options_by_name === 'object' && !Array.isArray(pData.options_by_name) && group?.name) {
                const grpNameLower = group.name.trim().toLowerCase();
                const targetKey = Object.keys(pData.options_by_name).find(
                    k => k.trim().toLowerCase() === grpNameLower
                );
                if (targetKey && Array.isArray(pData.options_by_name[targetKey])) {
                    hasOptNameCheck = true;
                    const list = pData.options_by_name[targetKey].map(s => String(s).trim().toLowerCase());
                    if (list.includes(valNameClean) || list.some(s => s === valNameClean || valNameClean.replace(/^(ring\\s*size|size)\\s*/i, '').trim() === s)) {
                        matchedOptName = true;
                    }
                }
            }

            let hasStonesCheck = false;
            let matchedStones = false;
            const gLower = (group?.name || '').toLowerCase();
            const isGemGrp = (gLower.includes('gem') || gLower.includes('stone') || gLower.includes('diamond')) && !gLower.includes('clarity');
            if (isGemGrp && Array.isArray(pData.stones)) {
                hasStonesCheck = true;
                const list = pData.stones.map(s => String(s).trim().toLowerCase());
                if (list.some(s => s === valNameClean || valNameClean.includes(s) || s.includes(valNameClean))) {
                    matchedStones = true;
                }
            }

            if (hasOptIdCheck || hasOptNameCheck || hasStonesCheck) {
                return Boolean(matchedOptId || matchedOptName || matchedStones);
            }
        }

        // Fallback to Master Rules if gem/stone group and not in matrix
        const gLower = (group?.name || '').toLowerCase();
        if ((gLower.includes('gem') || gLower.includes('stone')) && !gLower.includes('clarity')) {
            return isStoneCompatible(valName, purity);
        }

        return true;
    }, [compatMatrix, isStoneCompatible]);"""

# 2. Patch useEffect auto-switch
old_effects = """    // Auto-switch any option group (dropdown, swatch, or buttons) if current selection is incompatible with purity
    useEffect(() => {
        if (!activeOptionGroups || activeOptionGroups.length === 0) return;

        activeOptionGroups.forEach(grp => {
            const currentSelected = selectedOptions[grp.name];
            const curVal = currentSelected?.value;
            const isChain = grp.name.toLowerCase().includes('chain');
            const isSize = grp.name.toLowerCase().includes('size');
            const isGem = (grp.name.toLowerCase().includes('gem') || grp.name.toLowerCase().includes('stone')) && !grp.name.toLowerCase().includes('clarity');
            const effectiveVal = curVal || (isChain ? selectedChain : isSize ? selectedSize : grp.values[0]?.value);

            const isCompat = effectiveVal ? isOptionValueCompatible(grp, effectiveVal, selectedPurity) : false;

            if (!isCompat && grp.values && grp.values.length > 0) {
                const firstCompat = grp.values.find(v => isOptionValueCompatible(grp, v, selectedPurity));
                if (firstCompat) {
                    const rawVal = firstCompat.value || firstCompat;
                    if (isChain) setSelectedChain(rawVal);
                    if (isSize) setSelectedSize(rawVal);
                    if (isGem) {
                        const valLower = String(rawVal).toLowerCase();
                        setSelectedGem(valLower.includes('emerald') ? 'emerald' : valLower.includes('sapphire') ? 'sapphire' : valLower.includes('ruby') ? 'ruby' : valLower.includes('diamond') ? 'diamond' : 'none');
                    }
                    handleSelectOption(grp.name, {
                        value: rawVal,
                        code: firstCompat.code || '',
                        price_delta: parseFloat(firstCompat.price_delta) || 0,
                        image: firstCompat.image || null
                    });
                }
            }
        });
    }, [selectedPurity, activeOptionGroups, selectedOptions, isOptionValueCompatible]);


    // Ensure selected finish is always valid when availableFinishes changes
    useEffect(() => {
        if (availableFinishes && availableFinishes.length > 0) {
            const isCurrentAvailable = availableFinishes.some((fVal) => {
                const valStr = typeof fVal === 'string' ? fVal : fVal.value;
                const code = fVal.code || normalizeFinishKey(valStr);
                return normalizeFinishKey(selectedFinishCode) === normalizeFinishKey(code);
            });
            if (!isCurrentAvailable) {
                const first = availableFinishes.find(f => {
                    const code = normalizeFinishKey(f.code || f.value || '');
                    return isFinishCompatible(code, selectedPurity);
                }) || availableFinishes[0];
                const valStr = typeof first === 'string' ? first : first.value;
                const code = first.code || normalizeFinishKey(valStr);
                const cleanCode = normalizeFinishKey(code);
                setSelectedFinishCode(cleanCode);
                setActiveImgIndex(0);
                const grpName = finishGroup?.name || 'Finish Options';
                handleSelectOption(grpName, { value: valStr, code: cleanCode, price_delta: 0, image: first.image });
            }
        }
    }, [availableFinishes, selectedFinishCode, finishGroup, selectedPurity, isFinishCompatible]);

    // Synchronize default selections: ALWAYS default select the first COMPATIBLE option for every group
    useEffect(() => {
        if (activeOptionGroups && activeOptionGroups.length > 0) {
            setSelectedOptions((prev) => {
                const next = { ...prev };
                activeOptionGroups.forEach((group) => {
                    const gName = group.name;
                    const currentSelected = next[gName];
                    const exists = currentSelected && group.values.some((v) => {
                        if (v.value === currentSelected.value) return true;
                        if (v.code && currentSelected.code && normalizeFinishKey(v.code) === normalizeFinishKey(currentSelected.code)) return true;
                        return false;
                    });
                    const isCompat = currentSelected ? isOptionValueCompatible(group, currentSelected, selectedPurity) : false;

                    if ((!exists || !isCompat) && group.values.length > 0) {
                        const firstVal = group.values.find(v => isOptionValueCompatible(group, v, selectedPurity)) || group.values[0];
                        next[gName] = firstVal;
                        const l = gName.toLowerCase();
                        if (l.includes('purity') || l.includes('metal') || l.includes('karat')) {
                            const match = firstVal.value.match(/(\\d+KT|\\d+\\s*SILVER|PT\\d+)/i);
                            setSelectedPurity(match ? match[0].toUpperCase() : firstVal.value);
                        } else if (l.includes('finish')) {
                            const cleanCode = normalizeFinishKey(firstVal.code || firstVal.value || 'YG');
                            setSelectedFinishCode(cleanCode);
                            setActiveImgIndex(0);
                        } else if (l.includes('size')) {
                            setSelectedSize(firstVal.value.replace(/^(Ring\\s*Size|Size)\\s*/i, ''));
                        } else if (l.includes('chain')) {
                            setSelectedChain(firstVal.value.replace(/\\s*Chain\\s*/i, ' ').trim());
                        } else if (l.includes('gem') || l.includes('stone')) {
                            const valLower = firstVal.value.toLowerCase();
                            setSelectedGem(valLower.includes('emerald') ? 'emerald' : valLower.includes('sapphire') ? 'sapphire' : valLower.includes('ruby') ? 'ruby' : valLower.includes('diamond') ? 'diamond' : 'none');
                        }
                    }
                });
                return next;
            });
        }
    }, [activeOptionGroups, selectedPurity, isOptionValueCompatible]);"""

new_effects = """    // Auto-switch any option group (dropdown, swatch, or buttons) if current selection is incompatible with purity
    useEffect(() => {
        if (!activeOptionGroups || activeOptionGroups.length === 0) return;

        activeOptionGroups.forEach(grp => {
            const currentSelected = selectedOptions[grp.name];
            const curVal = currentSelected?.value;
            const isChain = grp.name.toLowerCase().includes('chain');
            const isSize = grp.name.toLowerCase().includes('size');
            const isGem = (grp.name.toLowerCase().includes('gem') || grp.name.toLowerCase().includes('stone')) && !grp.name.toLowerCase().includes('clarity');
            const vals = Array.isArray(grp.values) ? grp.values : [];
            const effectiveVal = curVal || (isChain ? selectedChain : isSize ? selectedSize : (vals[0]?.value || vals[0] || ''));

            const isCompat = effectiveVal ? isOptionValueCompatible(grp, effectiveVal, selectedPurity) : false;

            if (!isCompat && vals.length > 0) {
                const firstCompat = vals.find(v => isOptionValueCompatible(grp, v, selectedPurity));
                if (firstCompat) {
                    const rawVal = typeof firstCompat === 'object' ? (firstCompat?.value || '') : String(firstCompat || '');
                    if (isChain) setSelectedChain(rawVal);
                    if (isSize) setSelectedSize(rawVal);
                    if (isGem) {
                        const valLower = String(rawVal).toLowerCase();
                        setSelectedGem(valLower.includes('emerald') ? 'emerald' : valLower.includes('sapphire') ? 'sapphire' : valLower.includes('ruby') ? 'ruby' : valLower.includes('diamond') ? 'diamond' : 'none');
                    }
                    handleSelectOption(grp.name, {
                        value: rawVal,
                        code: (typeof firstCompat === 'object' && firstCompat?.code) ? firstCompat.code : '',
                        price_delta: parseFloat(firstCompat?.price_delta) || 0,
                        image: (typeof firstCompat === 'object' && firstCompat?.image) ? firstCompat.image : null
                    });
                }
            }
        });
    }, [selectedPurity, activeOptionGroups, selectedOptions, isOptionValueCompatible]);


    // Ensure selected finish is always valid when availableFinishes changes
    useEffect(() => {
        if (availableFinishes && availableFinishes.length > 0) {
            const isCurrentAvailable = availableFinishes.some((fVal) => {
                const valStr = typeof fVal === 'string' ? fVal : (fVal?.value || '');
                const code = (typeof fVal === 'object' && fVal?.code) ? fVal.code : normalizeFinishKey(valStr);
                return normalizeFinishKey(selectedFinishCode) === normalizeFinishKey(code);
            });
            if (!isCurrentAvailable) {
                const first = availableFinishes.find(f => {
                    const code = normalizeFinishKey((typeof f === 'object' && f?.code) ? f.code : (f?.value || f || ''));
                    return isFinishCompatible(code, selectedPurity);
                }) || availableFinishes[0];
                const valStr = typeof first === 'string' ? first : (first?.value || '');
                const code = (typeof first === 'object' && first?.code) ? first.code : normalizeFinishKey(valStr);
                const cleanCode = normalizeFinishKey(code);
                setSelectedFinishCode(cleanCode);
                setActiveImgIndex(0);
                const grpName = finishGroup?.name || 'Finish Options';
                handleSelectOption(grpName, { value: valStr, code: cleanCode, price_delta: 0, image: (typeof first === 'object' ? first?.image : null) });
            }
        }
    }, [availableFinishes, selectedFinishCode, finishGroup, selectedPurity, isFinishCompatible]);

    // Synchronize default selections: ALWAYS default select the first COMPATIBLE option for every group
    useEffect(() => {
        if (activeOptionGroups && activeOptionGroups.length > 0) {
            setSelectedOptions((prev) => {
                const next = { ...prev };
                activeOptionGroups.forEach((group) => {
                    const gName = group.name;
                    const currentSelected = next[gName];
                    const vals = Array.isArray(group.values) ? group.values : [];
                    const exists = currentSelected && vals.some((v) => {
                        const vVal = typeof v === 'object' ? v?.value : v;
                        if (vVal === currentSelected?.value) return true;
                        if (typeof v === 'object' && v?.code && currentSelected?.code && normalizeFinishKey(v.code) === normalizeFinishKey(currentSelected.code)) return true;
                        return false;
                    });
                    const isCompat = currentSelected ? isOptionValueCompatible(group, currentSelected, selectedPurity) : false;

                    if ((!exists || !isCompat) && vals.length > 0) {
                        const firstVal = vals.find(v => isOptionValueCompatible(group, v, selectedPurity)) || vals[0];
                        if (firstVal) {
                            next[gName] = firstVal;
                            const firstValStr = typeof firstVal === 'string' ? firstVal : (firstVal?.value || '');
                            const l = gName.toLowerCase();
                            if (l.includes('purity') || l.includes('metal') || l.includes('karat')) {
                                const match = firstValStr.match(/(\\d+KT|\\d+\\s*SILVER|PT\\d+)/i);
                                setSelectedPurity(match ? match[0].toUpperCase() : firstValStr);
                            } else if (l.includes('finish')) {
                                const cleanCode = normalizeFinishKey((typeof firstVal === 'object' && firstVal?.code) ? firstVal.code : (firstValStr || 'YG'));
                                setSelectedFinishCode(cleanCode);
                                setActiveImgIndex(0);
                            } else if (l.includes('size')) {
                                setSelectedSize(firstValStr.replace(/^(Ring\\s*Size|Size)\\s*/i, ''));
                            } else if (l.includes('chain')) {
                                setSelectedChain(firstValStr.replace(/\\s*Chain\\s*/i, ' ').trim());
                            } else if (l.includes('gem') || l.includes('stone')) {
                                const valLower = firstValStr.toLowerCase();
                                setSelectedGem(valLower.includes('emerald') ? 'emerald' : valLower.includes('sapphire') ? 'sapphire' : valLower.includes('ruby') ? 'ruby' : valLower.includes('diamond') ? 'diamond' : 'none');
                            }
                        }
                    }
                });
                return next;
            });
        }
    }, [activeOptionGroups, selectedPurity, isOptionValueCompatible]);"""

# 3. Patch handleSelectOption
old_hso = """    const handleSelectOption = (groupName, valueObj) => {
        setHasCustomized(true);
        setSelectedOptions((prev) => ({
            ...prev,
            [groupName]: valueObj,
        }));
        const valStr = typeof valueObj === 'object' ? (valueObj?.value || '') : String(valueObj || '');
        const l = (groupName || '').toLowerCase();
        if (l.includes('size')) {
            setSelectedSize(valStr.replace(/^(Ring\\s*Size|Size)\\s*/i, ''));
        } else if (l.includes('chain')) {
            setSelectedChain(valStr.replace(/\\s*Chain\\s*/i, ' ').trim());
        } else if (l.includes('gem') || l.includes('stone')) {
            const valLower = valStr.toLowerCase();
            setSelectedGem(valLower.includes('emerald') ? 'emerald' : valLower.includes('sapphire') ? 'sapphire' : valLower.includes('ruby') ? 'ruby' : valLower.includes('diamond') ? 'diamond' : 'none');
        }
    };"""

new_hso = """    const handleSelectOption = (groupName, valueObj) => {
        setHasCustomized(true);
        setSelectedOptions((prev) => ({
            ...prev,
            [groupName]: valueObj,
        }));
        const valStr = typeof valueObj === 'object' && valueObj !== null ? (valueObj?.value || '') : String(valueObj || '');
        const l = (groupName || '').toLowerCase();
        if (l.includes('size')) {
            setSelectedSize(valStr.replace(/^(Ring\\s*Size|Size)\\s*/i, ''));
        } else if (l.includes('chain')) {
            setSelectedChain(valStr.replace(/\\s*Chain\\s*/i, ' ').trim());
        } else if (l.includes('gem') || l.includes('stone')) {
            const valLower = valStr.toLowerCase();
            setSelectedGem(valLower.includes('emerald') ? 'emerald' : valLower.includes('sapphire') ? 'sapphire' : valLower.includes('ruby') ? 'ruby' : valLower.includes('diamond') ? 'diamond' : 'none');
        }
    };"""

assert old_opt_compat in code, "old_opt_compat not found"
code = code.replace(old_opt_compat, new_opt_compat, 1)

assert old_effects in code, "old_effects not found"
code = code.replace(old_effects, new_effects, 1)

assert old_hso in code, "old_hso not found"
code = code.replace(old_hso, new_hso, 1)

with open('src/app/collection/[id]/page.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("SAFEST BULLETPROOF STOREFRONT APPLIED SUCCESSFULLY!")
