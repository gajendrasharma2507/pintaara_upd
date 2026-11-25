const https = require('https');

https.get('https://admin.pintaara.com/api/products/PD-PD-CS-002', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const json = JSON.parse(data);
        const productDetail = json.data;

        const seen = new Set();
        const groups = [];

        productDetail.options.forEach((opt, oIdx) => {
            const optName = (opt.name || `Option ${oIdx + 1}`).trim();
            const lower = optName.toLowerCase();

            if (lower.includes('certificate') || !optName) return;

            const normKey = lower.includes('purity') ? 'purity'
                : lower.includes('finish') ? 'finish'
                    : lower.includes('size') ? 'size'
                        : (lower.includes('gem') || (lower.includes('stone') && !lower.includes('clarity'))) ? 'gem'
                            : lower.includes('chain') ? 'chain'
                                : lower;

            if (seen.has(normKey)) return;
            seen.add(normKey);

            let inputType = opt.input_type || opt.display_type;
            if (inputType === 'image_swatch') inputType = 'swatch_image';
            if (!inputType) {
                if (lower.includes('finish') || lower.includes('gem') || (lower.includes('stone') && !lower.includes('clarity')) || lower.includes('color')) {
                    inputType = 'swatch_image';
                } else if (lower.includes('chain') || lower.includes('size')) {
                    inputType = 'dropdown';
                } else {
                    inputType = 'text_button';
                }
            }

            const rawValues = Array.isArray(opt.values) ? opt.values : [];
            const parsedValues = rawValues
                .map((v, vIdx) => {
                    if (typeof v === 'object' && v !== null) {
                        return {
                            id: v.id || `${optName}_${vIdx}`,
                            value: v.value || '',
                            code: v.code || '',
                            image: v.image || '',
                            hex_color: v.hex_color || null,
                            price_delta: parseFloat(v.price_delta) || 0,
                        };
                    }
                    return {
                        id: `${optName}_${vIdx}`,
                        value: String(v),
                        code: String(v),
                        image: '',
                        hex_color: null,
                        price_delta: 0,
                    };
                })
                .filter((v) => v.value && v.value.trim().length > 0);

            if (parsedValues.length > 0) {
                groups.push({
                    id: opt.id || optName,
                    name: optName,
                    code: opt.code || optName.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
                    input_type: inputType,
                    values: parsedValues,
                });
            }
        });

        const isBaseGroup = (name) => {
            const l = (name || '').toLowerCase();
            if (l.includes('gem') || l.includes('stone')) return false;
            return l.includes('purity') || l.includes('karat') || l.includes('finish') || l === 'tone' || l.includes('hue');
        };

        const dropdownGroups = groups.filter((g) => !isBaseGroup(g.name) && g.input_type === 'dropdown').sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            if (aName.includes('chain') && bName.includes('size')) return -1;
            if (aName.includes('size') && bName.includes('chain')) return 1;
            return 0;
        });

        const swatchGroups = groups.filter((g) => !isBaseGroup(g.name) && (g.input_type === 'swatch_image' || g.input_type === 'image_swatch'));
        const buttonGroups = groups.filter((g) => !isBaseGroup(g.name) && g.input_type === 'text_button');

        console.log("hasDropdowns:", dropdownGroups.length > 0);
        console.log("hasSwatches:", swatchGroups.length > 0);
        console.log("hasButtons:", buttonGroups.length > 0);
        console.log("dropdownGroups:", dropdownGroups.map(g => g.name));
        console.log("swatchGroups:", swatchGroups.map(g => g.name));
        console.log("buttonGroups:", buttonGroups.map(g => g.name));
    });
});
