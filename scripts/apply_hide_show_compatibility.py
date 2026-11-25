with open('src/app/collection/[id]/page.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

content = "".join(lines)

# 1. Dropdowns
old_select = """                                                    <select
                                                        className="atelier-box-select"
                                                        value={currentVal}"""

# find where dropdownGroups.map begins
idx_dd = content.find('{dropdownGroups.map((grp) => {')
if idx_dd != -1:
    idx_end_dd = content.find('                                </div>\n                            )}', idx_dd)
    # let's replace the whole dropdownGroups.map block
    dd_block_old = content[idx_dd:idx_end_dd]
    dd_block_new = """{dropdownGroups.map((grp) => {
                                        const isChain = grp.name.toLowerCase().includes('chain');
                                        const isSize = grp.name.toLowerCase().includes('size');
                                        const compatibleVals = grp.values.filter(v => isOptionValueCompatible(grp, v, selectedPurity));
                                        const renderVals = compatibleVals.length > 0 ? compatibleVals : grp.values;

                                        const currentRaw = selectedOptions[grp.name]?.value || (isChain ? selectedChain : isSize ? selectedSize : (renderVals[0]?.value || ''));
                                        const hasCurrent = renderVals.some(v => (v.value || v) === currentRaw);
                                        const currentVal = hasCurrent ? currentRaw : (renderVals[0]?.value || renderVals[0] || '');

                                        return (
                                            <div key={grp.id || grp.name} className="atelier-control-group" style={{ marginBottom: 0 }}>
                                                <div className="atelier-spec-label" style={{ marginBottom: '6px' }}>{grp.name.toUpperCase()}</div>
                                                <div className="atelier-box-select-wrapper">
                                                    <select
                                                        className="atelier-box-select"
                                                        value={currentVal}
                                                        onChange={(e) => {
                                                            const chosenVal = e.target.value;
                                                            const foundObj = renderVals.find((v) => (v.value || v) === chosenVal || (v.code || '') === chosenVal || (isSize && (v.value || v).replace(/^(Ring\\s*Size|Size)\\s*/i, '').trim() === chosenVal));
                                                            if (isChain) setSelectedChain(chosenVal);
                                                            if (isSize) setSelectedSize(chosenVal);
                                                            handleSelectOption(grp.name, {
                                                                value: foundObj ? foundObj.value : chosenVal,
                                                                code: foundObj?.code || '',
                                                                price_delta: Number(foundObj?.price_delta || (isChain && chosenVal === 'None' ? -8000 : isChain && chosenVal === 'Rope' ? 3000 : 0))
                                                            });
                                                        }}
                                                    >
                                                        {renderVals.map((vObj) => {
                                                            const rawVal = typeof vObj === 'string' ? vObj : vObj.value;
                                                            const displayVal = isSize ? rawVal.replace(/^(Ring\\s*Size|Size)\\s*/i, '').trim() : rawVal;
                                                            return (
                                                                <option key={vObj.id || rawVal} value={rawVal}>
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
    content = content[:idx_dd] + dd_block_new + content[idx_end_dd:]

# 2. Swatches
idx_sw = content.find('{swatchGroups.map((grp) => {')
if idx_sw != -1:
    idx_end_sw = content.find('                                </div>\n                            )}\n                        </div>\n                    )}', idx_sw)
    sw_block_new = """{swatchGroups.map((grp) => {
                                        const isGem = (grp.name.toLowerCase().includes('gem') || grp.name.toLowerCase().includes('stone')) && !grp.name.toLowerCase().includes('clarity');
                                        const compatibleVals = grp.values.filter(sVal => isOptionValueCompatible(grp, sVal, selectedPurity));
                                        const renderVals = compatibleVals.length > 0 ? compatibleVals : grp.values;

                                        return (
                                            <div key={grp.id || grp.name} className="atelier-control-group" style={{ marginBottom: 0 }}>
                                                <div className="atelier-spec-label" style={{ marginBottom: '6px' }}>{grp.name.toUpperCase()}</div>
                                                <div className="atelier-gems-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                    {renderVals.map((sVal, idx) => {
                                                        const valLower = (sVal.value || '').toLowerCase();
                                                        const codeLower = (sVal.code || '').toLowerCase();
                                                        const isNoStone = valLower.includes('no stone') || valLower.includes('solid gold') || valLower.includes('none');

                                                        const currentVal = selectedOptions[grp.name]?.value;
                                                        const isSelected = currentVal ? currentVal === sVal.value : (idx === 0);

                                                        const rawDelta = parseFloat(sVal.price_delta) || 0;
                                                        const delta = Math.abs(rawDelta);
                                                        const titleStr = delta > 0 ? `${sVal.value} (+₹${delta.toLocaleString('en-IN')})` : sVal.value;

                                                        if (isGem) {
                                                            const typeStr = isNoStone ? 'none'
                                                                : codeLower.includes('dia') || valLower.includes('dia') ? 'diamond'
                                                                    : codeLower.includes('emr') || valLower.includes('eme') ? 'emerald'
                                                                        : codeLower.includes('sap') || valLower.includes('sap') ? 'sapphire'
                                                                            : codeLower.includes('rub') || valLower.includes('rub') ? 'ruby'
                                                                                : 'diamond';

                                                            return (
                                                                 <FacetedGemstone
                                                                     key={sVal.id || sVal.code || sVal.value || idx}
                                                                     type={typeStr}
                                                                     imageUrl={isNoStone ? null : (sVal.image || `/images/gems/${typeStr}.png`)}
                                                                     title={titleStr}
                                                                     isSelected={isSelected}
                                                                     disabled={false}
                                                                     onClick={() => {
                                                                         setSelectedGem(typeStr);
                                                                         handleSelectOption(grp.name, { value: sVal.value, code: sVal.code, price_delta: delta, image: sVal.image });
                                                                     }}
                                                                 />
                                                            );
                                                        }

                                                        // Non-gem image/color swatches (e.g. Chain image swatches)
                                                        return (
                                                            <button
                                                                key={sVal.id || sVal.value || idx}
                                                                type="button"
                                                                title={titleStr}
                                                                onClick={() => {
                                                                    handleSelectOption(grp.name, { value: sVal.value, code: sVal.code, price_delta: delta, image: sVal.image });
                                                                }}
                                                                style={{
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    borderRadius: '50%',
                                                                    border: isSelected ? '2px solid #C9A961' : '1px solid #CBD5E1',
                                                                    padding: 0,
                                                                    background: sVal.hex_color || '#fff',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    overflow: 'hidden',
                                                                    outline: 'none',
                                                                    boxShadow: isSelected ? '0 0 0 2px rgba(201,169,97,0.3)' : 'none',
                                                                }}
                                                            >
                                                                {sVal.image ? (
                                                                    <img src={sVal.image} alt={sVal.value} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <span style={{ fontSize: '10px', fontWeight: 600 }}>{sVal.code || sVal.value.slice(0, 2)}</span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
"""
    content = content[:idx_sw] + sw_block_new + content[idx_end_sw:]

# 3. Text Buttons
idx_tb = content.find('{hasButtons && buttonGroups.map((grp) => {')
if idx_tb != -1:
    idx_end_tb = content.find('                    {/* BOTTOM ACTION ROW', idx_tb)
    tb_block_new = """{hasButtons && buttonGroups.map((grp) => {
                        const isSize = grp.name.toLowerCase().includes('size');
                        const compatibleVals = grp.values.filter(v => isOptionValueCompatible(grp, v, selectedPurity));
                        const renderVals = compatibleVals.length > 0 ? compatibleVals : grp.values;
                        const currentVal = selectedOptions[grp.name]?.value;

                        return (
                            <div key={grp.id || grp.name} className="atelier-control-group">
                                <div className="atelier-spec-label">{grp.name.toUpperCase()}</div>
                                <div className="atelier-purity-row">
                                    {renderVals.map((v, vIdx) => {
                                        const isSel = currentVal ? currentVal === v.value : (vIdx === 0);
                                        const label = isSize ? v.value.replace(/^(Ring\\s*Size|Size)\\s*/i, '').trim() : v.value;
                                        const delta = Number(v.price_delta || 0);

                                        return (
                                            <button
                                                key={v.id || v.value || vIdx}
                                                type="button"
                                                className={`atelier-purity-btn ${isSel ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (isSize) setSelectedSize(label);
                                                    handleSelectOption(grp.name, {
                                                        value: v.value,
                                                        code: v.code || '',
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
    content = content[:idx_tb] + tb_block_new + content[idx_end_tb:]

with open('src/app/collection/[id]/page.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ALL THREE GROUPS REPLACED SUCCESSFULLY!")
