import re

path = r'e:\work\final_pintara\src\app\collection\[id]\page.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add COMPATIBILITY_RULES_MASTER after finishBarsData
compat_rules_code = '''
const COMPATIBILITY_RULES_MASTER = {
    finishes: [
        { key: 'YG', name: 'Yellow Gold', color: '#D4AF37', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': false } },
        { key: 'WG', name: 'White Gold', color: '#94A3B8', purities: { '22KT': true, '18KT': true, '14KT': true, '925 SILVER': false } },
        { key: 'RG', name: 'Rose Gold', color: '#B76E79', purities: { '22KT': false, '18KT': true, '14KT': true, '925 SILVER': false } },
        { key: 'BLK', name: 'Black Gold', color: '#1E293B', purities: { '22KT': false, '18KT': true, '14KT': true, '925 SILVER': false } },
        { key: 'NAT_SILVER', name: 'Natural Silver', color: '#94A3B8', purities: { '22KT': false, '18KT': false, '14KT': false, '925 SILVER': true } },
        { key: 'RHOD_SILVER', name: 'Rhodium-Plated Silver', color: '#CBD5E1', purities: { '22KT': false, '18KT': false, '14KT': false, '925 SILVER': true } },
        { key: 'GOLD_SILVER', name: 'Gold-Plated Silver', color: '#EAB308', purities: { '22KT': false, '18KT': false, '14KT': false, '925 SILVER': true } },
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
'''

target_finish_bars = '];\r\n\r\nexport default function DynamicCollectionPage'
target_finish_bars_unix = '];\n\nexport default function DynamicCollectionPage'

if target_finish_bars in content:
    content = content.replace(target_finish_bars, '];\r\n' + compat_rules_code + '\r\nexport default function DynamicCollectionPage')
elif target_finish_bars_unix in content:
    content = content.replace(target_finish_bars_unix, '];\n' + compat_rules_code + '\nexport default function DynamicCollectionPage')
else:
    print("Error: target_finish_bars not found")
    exit(1)

# 2. Add useMemo hooks for compatDisplayPurities, compatDisplayFinishes, compatDisplayStones
hooks_code = '''
    // Compatibility Master Table data
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
'''

target_hook_place = '    }, [availablePurities, selectedPurity]);'
if target_hook_place in content:
    content = content.replace(target_hook_place, target_hook_place + '\n' + hooks_code)
else:
    print("Error: target_hook_place not found")
    exit(1)

# 3. Add table JSX inside atelier-info-sections
jsx_table = '''
                        {/* COMPATIBILITY MASTER LUXURY TABLE (AT THE END OF PRODUCT PAGE) */}
                        <div className="atelier-info-divider" />
                        <div className="atelier-info-section atelier-compat-section">
                            <h3 className="atelier-info-heading">
                                COMPATIBILITY MASTER
                            </h3>
                            <div className="atelier-compat-table-wrapper">
                                <table className="atelier-compat-table">
                                    <thead>
                                        <tr>
                                            <th className="atelier-compat-th-main">Finish / appearance</th>
                                            {compatDisplayPurities.map((p) => (
                                                <th key={p} className="atelier-compat-th-purity">{p}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {compatDisplayFinishes.map((f, fIdx) => (
                                            <tr key={f.key || fIdx}>
                                                <td className="atelier-compat-td-label">
                                                    <span className="atelier-compat-finish-dot" style={{ background: f.color || '#D4AF37' }} />
                                                    <span>{f.name}</span>
                                                </td>
                                                {compatDisplayPurities.map((p) => {
                                                    const normP = p === '925 Silver' ? '925 SILVER' : p;
                                                    const isCompat = f.purities?.[normP] ?? f.purities?.[p];
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
                                                    const normP = p === '925 Silver' ? '925 SILVER' : p;
                                                    const isCompat = s.purities?.[normP] ?? s.purities?.[p];
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
                                    </tbody>
                                </table>
                            </div>
                        </div>
'''

target_jsx = '                            );\r\n                        })}\r\n                    </div>'
target_jsx_unix = '                            );\n                        })}\n                    </div>'

if target_jsx in content:
    content = content.replace(target_jsx, '                            );\r\n                        })}\r\n' + jsx_table + '\r\n                    </div>')
elif target_jsx_unix in content:
    content = content.replace(target_jsx_unix, '                            );\n                        })}\n' + jsx_table + '\n                    </div>')
else:
    print("Error: target_jsx not found")
    exit(1)

# 4. Add CSS styles
css_code = '''
                /* ── COMPATIBILITY MASTER LUXURY TABLE ── */
                .atelier-compat-section {
                    padding-top: 20px;
                    padding-bottom: 24px;
                }
                .atelier-compat-table-wrapper {
                    width: 100%;
                    overflow-x: auto;
                    border: 1px solid #E5E7EB;
                    border-radius: 6px;
                    background: #FFFFFF;
                    margin-top: 10px;
                    -webkit-overflow-scrolling: touch;
                }
                .atelier-compat-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 12px;
                    letter-spacing: 0.02em;
                    min-width: 320px;
                }
                .atelier-compat-table thead tr {
                    background: #FAFAFA;
                    border-bottom: 1px solid #E5E7EB;
                }
                .atelier-compat-th-main {
                    text-align: left;
                    padding: 10px 14px;
                    font-weight: 600;
                    color: #111111;
                    font-size: 11.5px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    width: 44%;
                }
                .atelier-compat-th-purity {
                    text-align: center;
                    padding: 10px 10px;
                    font-weight: 700;
                    font-size: 12px;
                    color: #111111;
                    letter-spacing: 0.04em;
                    white-space: nowrap;
                }
                .atelier-compat-table tbody tr {
                    border-bottom: 1px solid #F3F4F6;
                }
                .atelier-compat-table tbody tr:last-child {
                    border-bottom: none;
                }
                .atelier-compat-td-label {
                    padding: 9px 14px;
                    color: #333333;
                    font-size: 12px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .atelier-compat-finish-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    display: inline-block;
                    flex-shrink: 0;
                    box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
                }
                .atelier-compat-td-val {
                    text-align: center;
                    padding: 9px 10px;
                    vertical-align: middle;
                }
                .atelier-compat-check {
                    color: #059669;
                    font-weight: 700;
                    font-size: 14px;
                }
                .atelier-compat-dash {
                    color: #9CA3AF;
                    font-size: 14px;
                    font-weight: 400;
                }
                .atelier-compat-subhead-row {
                    background: #F9FAFB;
                    border-top: 1px solid #E5E7EB;
                    border-bottom: 1px solid #E5E7EB;
                }
                .atelier-compat-subhead-td {
                    padding: 8px 14px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #111111;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
'''

target_css = '                .atelier-info-line {\r\n                    font-size: 13px;\r\n                    font-weight: 400;\r\n                    line-height: 17px;\r\n                    color: #333333;\r\n                    letter-spacing: normal;\r\n                    font-family: inherit;\r\n                    margin: 0;\r\n                }'
target_css_unix = '                .atelier-info-line {\n                    font-size: 13px;\n                    font-weight: 400;\n                    line-height: 17px;\n                    color: #333333;\n                    letter-spacing: normal;\n                    font-family: inherit;\n                    margin: 0;\n                }'

if target_css in content:
    content = content.replace(target_css, target_css + '\n' + css_code)
elif target_css_unix in content:
    content = content.replace(target_css_unix, target_css_unix + '\n' + css_code)
else:
    print("Warning: target_css not found, trying append before .atelier-footer")
    target_footer = '                /* ── FOOTER ── */'
    if target_footer in content:
        content = content.replace(target_footer, css_code + '\n' + target_footer)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: page.js updated with Compatibility Master table!")
