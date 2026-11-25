const isBaseGroup = (name) => {
    const l = (name || '').toLowerCase();
    if (l.includes('gem') || l.includes('stone')) return false;
    return l.includes('purity') || l.includes('karat') || l.includes('finish') || l === 'tone' || l.includes('hue');
};

const groups = [
    { name: 'SIZE', input_type: 'dropdown' },
    { name: 'GEM / STONE OPTIONS', input_type: 'swatch_image' },
    { name: 'CHAIN TYPE', input_type: 'dropdown' },
    { name: 'Diamond Clarity', input_type: 'dropdown' },
    { name: 'Metal Purity (KT)', input_type: 'text_button' },
    { name: 'Finish Options', input_type: 'swatch_image' }
];

const dropdownGroups = groups.filter((g) => !isBaseGroup(g.name) && g.input_type === 'dropdown');
const swatchGroups = groups.filter((g) => !isBaseGroup(g.name) && (g.input_type === 'swatch_image' || g.input_type === 'image_swatch'));
const buttonGroups = groups.filter((g) => !isBaseGroup(g.name) && g.input_type === 'text_button');

console.log("dropdownGroups:", dropdownGroups.map(g => g.name));
console.log("swatchGroups:", swatchGroups.map(g => g.name));
console.log("buttonGroups:", buttonGroups.map(g => g.name));
