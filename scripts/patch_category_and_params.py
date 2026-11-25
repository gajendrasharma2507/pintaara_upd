with open('src/app/collection/[id]/page.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Patch resolvedParams
old_params = 'const resolvedParams = use(params);'
new_params = 'const resolvedParams = (params && typeof params.then === "function") ? use(params) : (params || {});'
if old_params in code:
    code = code.replace(old_params, new_params)
    print("Patched resolvedParams")
else:
    print("resolvedParams already patched or not found")

# 2. Add guard to the 4 PDP effects
old_e1 = '''    // Auto-switch finish if currently selected finish is incompatible with newly selected purity
    useEffect(() => {
        if (!availableFinishes || availableFinishes.length === 0) return;'''
new_e1 = '''    // Auto-switch finish if currently selected finish is incompatible with newly selected purity
    useEffect(() => {
        if (categoryInfo || !productDetail) return;
        if (!availableFinishes || availableFinishes.length === 0) return;'''
if old_e1 in code:
    code = code.replace(old_e1, new_e1)
    print("Patched e1")

old_e2 = '''    // Auto-switch any option group (dropdown, swatch, or buttons) if current selection is incompatible with purity
    useEffect(() => {
        if (!activeOptionGroups || activeOptionGroups.length === 0) return;'''
new_e2 = '''    // Auto-switch any option group (dropdown, swatch, or buttons) if current selection is incompatible with purity
    useEffect(() => {
        if (categoryInfo || !productDetail) return;
        if (!activeOptionGroups || activeOptionGroups.length === 0) return;'''
if old_e2 in code:
    code = code.replace(old_e2, new_e2)
    print("Patched e2")

old_e3 = '''    // Ensure selected finish is always valid when availableFinishes changes
    useEffect(() => {
        if (availableFinishes && availableFinishes.length > 0) {'''
new_e3 = '''    // Ensure selected finish is always valid when availableFinishes changes
    useEffect(() => {
        if (categoryInfo || !productDetail) return;
        if (availableFinishes && availableFinishes.length > 0) {'''
if old_e3 in code:
    code = code.replace(old_e3, new_e3)
    print("Patched e3")

old_e4 = '''    // Synchronize default selections: ALWAYS default select the first COMPATIBLE option for every group
    useEffect(() => {
        if (activeOptionGroups && activeOptionGroups.length > 0) {'''
new_e4 = '''    // Synchronize default selections: ALWAYS default select the first COMPATIBLE option for every group
    useEffect(() => {
        if (categoryInfo || !productDetail) return;
        if (activeOptionGroups && activeOptionGroups.length > 0) {'''
if old_e4 in code:
    code = code.replace(old_e4, new_e4)
    print("Patched e4")

# 3. Patch categoryProducts.map
idx_start = code.find('categoryProducts.map((item, pIdx) => {')
if idx_start != -1:
    idx_end = code.find('                                        </Link>\n                                );\n                            })', idx_start)
    if idx_end == -1:
        # Try alternate line endings
        idx_end = code.find('                                        </Link>', idx_start)
        if idx_end != -1:
            idx_close = code.find('})', idx_end)
            if idx_close != -1:
                idx_end = idx_close + 2
    else:
        idx_end = idx_end + len('                                        </Link>\n                                );\n                            })')

    if idx_end != -1:
        new_map_body = """categoryProducts.map((item, pIdx) => {
                                // Calculate live price for each item in grid
                                const rate22kt_g = (rates?.gold_22kt_per_10g || 100000) / 10;
                                const weight = Number(item?.defaultWeight) || 8.5;
                                const metalVal = rate22kt_g * weight;
                                const sub = metalVal + Number(item?.makingCharge || 0);
                                const calculatedTotal = Math.round(sub * 1.03);
                                const total = Number(item?.livePrice || calculatedTotal || 0);
                                const formattedPrice = Math.round(total).toLocaleString('en-IN');

                                const itemCode = String(item?.code || item?.id || '');
                                const codeUpper = itemCode.toUpperCase();
                                const colStr = typeof item?.collection === 'object' ? String(item?.collection?.name || '') : String(item?.collection || '');
                                const colUpper = colStr.toUpperCase();
                                const nameStr = String(item?.name || '');

                                let collectionTag = 'ORIGIN';
                                if (codeUpper.includes('-OR-') || codeUpper.includes('ORIGIN')) {
                                    collectionTag = 'ORIGIN';
                                } else if (colStr && !['BRACELETS', 'BRACELET', 'PENDANTS', 'PENDANT', 'NECKLACES', 'NECKLACE', 'RINGS', 'RING', 'EARRINGS', 'EARRING', 'CHAINS', 'CHAIN', 'BANGLES', 'BANGLE'].includes(colUpper)) {
                                    collectionTag = colUpper;
                                } else if (nameStr && !nameStr.toLowerCase().startsWith('piece') && nameStr.toUpperCase() !== codeUpper) {
                                    collectionTag = nameStr.toUpperCase();
                                }

                                return (
                                    <Link
                                        href={`/collection/${itemCode}`}
                                        key={`${item?.id || itemCode || pIdx}-${pIdx}`}
                                        className="category-product-card"
                                    >
                                        <div className="card-media-frame">
                                            <img
                                                src={item?.image || '/images/products/ring.png'}
                                                alt={itemCode || 'Product'}
                                                className="card-media-img"
                                                style={{ filter: item?.filterStyle || 'none' }}
                                            />
                                        </div>
                                        <div className="category-product-info">
                                            <span className="cat-prod-collection">{collectionTag}</span>
                                            <h3 className="cat-prod-code">{itemCode || nameStr}</h3>
                                            <span className="cat-prod-price">₹ {formattedPrice}</span>
                                        </div>
                                    </Link>
                                );
                            })"""
        code = code[:idx_start] + new_map_body + code[idx_end:]
        print("Patched categoryProducts.map")

with open('src/app/collection/[id]/page.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("FILE SUCCESSFULLY WRITTEN!")
