with open('src/app/collection/[id]/page.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Finish Option block
idx_start = content.find('{/* FINISH OPTION — only render if configured for this product */}\n                    {availableFinishes && availableFinishes.length > 0 && (() => {')
idx_end = content.find('{/* TWO-COLUMN LAYOUT: LEFT = DROPDOWNS | RIGHT = IMAGE SWATCHES */}\n                    {(hasDropdowns || hasSwatches) && (')

if idx_start != -1 and idx_end != -1:
    new_finish_block = """{/* FINISH OPTION — only render if configured for this product */}
                    {availableFinishes && availableFinishes.length > 0 && (() => {
                        const compatibleFinishes = availableFinishes.filter((fVal, idx) => {
                            if (!fVal) return false;
                            const valStr = typeof fVal === 'string' ? fVal : (fVal?.value || '');
                            const valLower = String(valStr || '').toLowerCase();
                            const code = (typeof fVal === 'object' && fVal?.code) ? fVal.code : (valLower.includes('yellow') ? 'YG' : valLower.includes('white') ? 'WG' : valLower.includes('rose') ? 'RG' : valLower.includes('black') ? 'BLK' : `F${idx}`);
                            const cleanCode = normalizeFinishKey(code);
                            return isFinishCompatible(cleanCode, selectedPurity);
                        });
                        const displayFinishes = compatibleFinishes.length > 0 ? compatibleFinishes : availableFinishes;

                        const activeFinishObj = displayFinishes.find((fVal, idx) => {
                            if (!fVal) return false;
                            const valStr = typeof fVal === 'string' ? fVal : (fVal?.value || '');
                            const valLower = String(valStr || '').toLowerCase();
                            const code = (typeof fVal === 'object' && fVal?.code) ? fVal.code : (valLower.includes('yellow') ? 'YG' : valLower.includes('white') ? 'WG' : valLower.includes('rose') ? 'RG' : valLower.includes('black') ? 'BLK' : `F${idx}`);
                            return normalizeFinishKey(selectedFinishCode) === normalizeFinishKey(code);
                        }) || displayFinishes[0];

                        const activeValStr = activeFinishObj ? (typeof activeFinishObj === 'string' ? activeFinishObj : (activeFinishObj?.value || '')) : '';
                        const matchedActiveBar = finishBarsData.find(b => b.code === normalizeFinishKey(selectedFinishCode) || (activeValStr && b.name.toLowerCase() === activeValStr.toLowerCase()));
                        const selectedFinishDisplayName = matchedActiveBar?.name || activeValStr || (normalizeFinishKey(selectedFinishCode) === 'YG' ? 'Yellow Gold' : normalizeFinishKey(selectedFinishCode) === 'WG' ? 'White Gold' : normalizeFinishKey(selectedFinishCode) === 'RG' ? 'Rose Gold' : normalizeFinishKey(selectedFinishCode) === 'BLK' ? 'Black Gold' : '');

                        return (
                            <div className="atelier-control-group">
                                <div className="atelier-spec-label">
                                    FINISH OPTIONS
                                </div>
                                <div
                                    className="atelier-finish-row"
                                    style={{
                                        gridTemplateColumns: `repeat(${Math.max(displayFinishes.length, 1)}, minmax(0, 1fr))`
                                    }}
                                >
                                    {displayFinishes.map((fVal, idx) => {
                                        if (!fVal) return null;
                                        const valStr = typeof fVal === 'string' ? fVal : (fVal?.value || '');
                                        const valLower = String(valStr || '').toLowerCase();
                                        const code = (typeof fVal === 'object' && fVal?.code) ? fVal.code : (valLower.includes('yellow') ? 'YG' : valLower.includes('white') ? 'WG' : valLower.includes('rose') ? 'RG' : valLower.includes('black') ? 'BLK' : `F${idx}`);
                                        const cleanCode = normalizeFinishKey(code);
                                        const hexColor = (typeof fVal === 'object' && fVal?.hex_color) ? fVal.hex_color : null;
                                        const matchedBar = finishBarsData.find((b) => b.code === cleanCode || b.name.toLowerCase() === valLower) || {
                                            name: valStr,
                                            code: cleanCode,
                                            label: String(valStr || '').toUpperCase(),
                                            style: hexColor ? { background: hexColor } : { background: '#D4AF37' }
                                        };
                                        const isSelected = normalizeFinishKey(selectedFinishCode) === cleanCode;
                                        return (
                                            <button
                                                key={(typeof fVal === 'object' && fVal?.id) ? fVal.id : (cleanCode || idx)}
                                                type="button"
                                                title={matchedBar.name || valStr}
                                                aria-label={matchedBar.name || valStr}
                                                className={`atelier-finish-bar ${isSelected ? 'active' : ''}`}
                                                style={{
                                                    ...matchedBar.style,
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => {
                                                    setSelectedFinishCode(cleanCode);
                                                    setActiveImgIndex(0);
                                                    setMediaViewMode('photo');
                                                    const grpName = finishGroup?.name || 'Finish Options';
                                                    handleSelectOption(grpName, { value: valStr, code: cleanCode, price_delta: 0, image: (typeof fVal === 'object' ? fVal?.image : null) });
                                                }}
                                            >
                                                <span
                                                    className="atelier-finish-bar-label"
                                                    style={{ display: isSelected ? 'block' : 'none', color: matchedBar.labelLight ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.75)' }}
                                                >{matchedBar.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}
                    """
    content = content[:idx_start] + new_finish_block + content[idx_end:]
    print("Replaced finish block successfully")

# 2. Update Dropdowns
idx_dd_start = content.find('{dropdownGroups.map((grp) => {')
idx_dd_end = content.find('                                </div>\n                            )}\n\n                            {/* RIGHT COLUMN')
if idx_dd_start != -1 and idx_dd_end != -1:
    new_dd_block = """{dropdownGroups.map((grp) => {
                                        const isChain = grp.name.toLowerCase().includes('chain');
                                        const isSize = grp.name.toLowerCase().includes('size');
                                        const vals = Array.isArray(grp.values) ? grp.values : [];
                                        const compatibleVals = vals.filter(v => isOptionValueCompatible(grp, v, selectedPurity));
                                        const renderVals = compatibleVals.length > 0 ? compatibleVals : vals;

                                        const currentRaw = selectedOptions[grp.name]?.value || (isChain ? selectedChain : isSize ? selectedSize : (renderVals[0]?.value || renderVals[0] || ''));
                                        const hasCurrent = renderVals.some(v => (typeof v === 'object' ? v?.value : v) === currentRaw);
                                        const currentVal = hasCurrent ? currentRaw : (typeof renderVals[0] === 'object' ? renderVals[0]?.value : (renderVals[0] || ''));

                                        return (
                                            <div key={grp.id || grp.name} className="atelier-control-group" style={{ marginBottom: 0 }}>
                                                <div className="atelier-spec-label" style={{ marginBottom: '6px' }}>{grp.name.toUpperCase()}</div>
                                                <div className="atelier-box-select-wrapper">
                                                    <select
                                                        className="atelier-box-select"
                                                        value={currentVal}
                                                        onChange={(e) => {
                                                            const chosenVal = e.target.value;
                                                            const foundObj = renderVals.find((v) => (typeof v === 'object' ? v?.value : v) === chosenVal || (typeof v === 'object' ? v?.code : '') === chosenVal || (isSize && (typeof v === 'object' ? (v?.value || '') : String(v)).replace(/^(Ring\\s*Size|Size)\\s*/i, '').trim() === chosenVal));
                                                            if (isChain) setSelectedChain(chosenVal);
                                                            if (isSize) setSelectedSize(chosenVal);
                                                            handleSelectOption(grp.name, {
                                                                value: (typeof foundObj === 'object' && foundObj?.value) ? foundObj.value : chosenVal,
                                                                code: (typeof foundObj === 'object' && foundObj?.code) ? foundObj.code : '',
                                                                price_delta: Number((typeof foundObj === 'object' && foundObj?.price_delta) ? foundObj.price_delta : (isChain && chosenVal === 'None' ? -8000 : isChain && chosenVal === 'Rope' ? 3000 : 0))
                                                            });
                                                        }}
                                                    >
                                                        {renderVals.map((vObj, vIdx) => {
                                                            const rawVal = typeof vObj === 'string' ? vObj : (vObj?.value || '');
                                                            const displayVal = isSize ? rawVal.replace(/^(Ring\\s*Size|Size)\\s*/i, '').trim() : rawVal;
                                                            return (
                                                                <option key={(typeof vObj === 'object' && vObj?.id) ? vObj.id : (rawVal || vIdx)} value={rawVal}>
                                                                    {displayVal}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>
                                            </div>
                                        );
                                    })}
"""
    content = content[:idx_dd_start] + new_dd_block + content[idx_dd_end:]
    print("Replaced dropdown block successfully")

# 3. Update Swatches
idx_sw_start = content.find('{swatchGroups.map((grp) => {')
idx_sw_end = content.find('                                </div>\n                            )}\n                        </div>\n                    )}\n\n                    {/* TEXT BUTTON GROUPS')
if idx_sw_start != -1 and idx_sw_end != -1:
    new_sw_block = """{swatchGroups.map((grp) => {
                                        const isGem = (grp.name.toLowerCase().includes('gem') || grp.name.toLowerCase().includes('stone')) && !grp.name.toLowerCase().includes('clarity');
                                        const vals = Array.isArray(grp.values) ? grp.values : [];
                                        const compatibleVals = vals.filter(sVal => isOptionValueCompatible(grp, sVal, selectedPurity));
                                        const renderVals = compatibleVals.length > 0 ? compatibleVals : vals;

                                        return (
                                            <div key={grp.id || grp.name} className="atelier-control-group" style={{ marginBottom: 0 }}>
                                                <div className="atelier-spec-label" style={{ marginBottom: '6px' }}>{grp.name.toUpperCase()}</div>
                                                <div className="atelier-gems-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                    {renderVals.map((sVal, idx) => {
                                                        const valStr = typeof sVal === 'object' ? (sVal?.value || '') : String(sVal || '');
                                                        const valLower = valStr.toLowerCase();
                                                        const codeStr = typeof sVal === 'object' ? (sVal?.code || '') : '';
                                                        const codeLower = codeStr.toLowerCase();
                                                        const isNoStone = valLower.includes('no stone') || valLower.includes('solid gold') || valLower.includes('none');

                                                        const currentVal = selectedOptions[grp.name]?.value;
                                                        const isSelected = currentVal ? currentVal === valStr : (idx === 0);

                                                        const rawDelta = typeof sVal === 'object' ? (parseFloat(sVal?.price_delta) || 0) : 0;
                                                        const delta = Math.abs(rawDelta);
                                                        const titleStr = delta > 0 ? `${valStr} (+₹${delta.toLocaleString('en-IN')})` : valStr;

                                                        if (isGem) {
                                                             const typeStr = isNoStone ? 'none'
                                                                 : codeLower.includes('dia') || valLower.includes('dia') ? 'diamond'
                                                                     : codeLower.includes('emr') || valLower.includes('eme') ? 'emerald'
                                                                         : codeLower.includes('sap') || valLower.includes('sap') ? 'sapphire'
                                                                             : codeLower.includes('rub') || valLower.includes('rub') ? 'ruby'
                                                                                 : 'diamond';

                                                             return (
                                                                 <FacetedGemstone
                                                                     key={(typeof sVal === 'object' && sVal?.id) ? sVal.id : (codeStr || valStr || idx)}
                                                                     type={typeStr}
                                                                     imageUrl={isNoStone ? null : ((typeof sVal === 'object' && sVal?.image) ? sVal.image : `/images/gems/${typeStr}.png`)}
                                                                     title={titleStr}
                                                                     isSelected={isSelected}
                                                                     disabled={false}
                                                                     onClick={() => {
                                                                         setSelectedGem(typeStr);
                                                                         handleSelectOption(grp.name, { value: valStr, code: codeStr, price_delta: delta, image: (typeof sVal === 'object' ? sVal?.image : null) });
                                                                     }}
                                                                 />
                                                             );
                                                         }

                                                         // Non-gem image/color swatches (e.g. Chain image swatches)
                                                         return (
                                                             <button
                                                                 key={(typeof sVal === 'object' && sVal?.id) ? sVal.id : (valStr || idx)}
                                                                 type="button"
                                                                 title={titleStr}
                                                                 onClick={() => {
                                                                     handleSelectOption(grp.name, { value: valStr, code: codeStr, price_delta: delta, image: (typeof sVal === 'object' ? sVal?.image : null) });
                                                                 }}
                                                                 style={{
                                                                     width: '32px',
                                                                     height: '32px',
                                                                     borderRadius: '50%',
                                                                     border: isSelected ? '2px solid #C9A961' : '1px solid #CBD5E1',
                                                                     padding: 0,
                                                                     background: (typeof sVal === 'object' && sVal?.hex_color) ? sVal.hex_color : '#fff',
                                                                     cursor: 'pointer',
                                                                     display: 'flex',
                                                                     alignItems: 'center',
                                                                     justifyContent: 'center',
                                                                     overflow: 'hidden',
                                                                     outline: 'none',
                                                                     boxShadow: isSelected ? '0 0 0 2px rgba(201,169,97,0.3)' : 'none',
                                                                 }}
                                                             >
                                                                 {(typeof sVal === 'object' && sVal?.image) ? (
                                                                     <img src={sVal.image} alt={valStr} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                 ) : (
                                                                     <span style={{ fontSize: '10px', fontWeight: 600 }}>{codeStr || valStr.slice(0, 2)}</span>
                                                                 )}
                                                             </button>
                                                         );
                                                     })}
                                                 </div>
                                             </div>
                                         );
                                     })}
"""
    content = content[:idx_sw_start] + new_sw_block + content[idx_sw_end:]
    print("Replaced swatch block successfully")

# 4. Update Buttons
idx_btn_start = content.find('{hasButtons && buttonGroups.map((grp) => {')
idx_btn_end = content.find('{/* BOTTOM ACTION ROW: full-width line, then price left / buttons right */}')
if idx_btn_start != -1 and idx_btn_end != -1:
    new_btn_block = """{hasButtons && buttonGroups.map((grp) => {
                        const isSize = grp.name.toLowerCase().includes('size');
                        const vals = Array.isArray(grp.values) ? grp.values : [];
                        const compatibleVals = vals.filter(v => isOptionValueCompatible(grp, v, selectedPurity));
                        const renderVals = compatibleVals.length > 0 ? compatibleVals : vals;
                        const currentVal = selectedOptions[grp.name]?.value;

                        return (
                            <div key={grp.id || grp.name} className="atelier-control-group">
                                <div className="atelier-spec-label">{grp.name.toUpperCase()}</div>
                                <div className="atelier-purity-row">
                                    {renderVals.map((v, vIdx) => {
                                        const vStr = typeof v === 'object' ? (v?.value || '') : String(v || '');
                                        const isSel = currentVal ? currentVal === vStr : (vIdx === 0);
                                        const label = isSize ? vStr.replace(/^(Ring\\s*Size|Size)\\s*/i, '').trim() : vStr;
                                        const delta = Number((typeof v === 'object' && v?.price_delta) ? v.price_delta : 0);

                                        return (
                                            <button
                                                key={(typeof v === 'object' && v?.id) ? v.id : (vStr || vIdx)}
                                                type="button"
                                                className={`atelier-purity-btn ${isSel ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (isSize) setSelectedSize(label);
                                                    handleSelectOption(grp.name, {
                                                        value: vStr,
                                                        code: (typeof v === 'object' && v?.code) ? v.code : '',
                                                        price_delta: delta
                                                    });
                                                }}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                    """
    content = content[:idx_btn_start] + new_btn_block + content[idx_btn_end:]
    print("Replaced button block successfully")

with open('src/app/collection/[id]/page.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("PATCHED ENTIRE FILE CLEANLY!")
