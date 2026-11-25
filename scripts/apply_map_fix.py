with open('src/app/collection/[id]/page.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx1 = text.find('categoryProducts.map((item, pIdx) => {')
idx2 = text.find('</Link>', idx1)
idx3 = text.find('})', idx2)

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

text = text[:idx1] + new_map_body + text[idx3+2:]

with open('src/app/collection/[id]/page.js', 'w', encoding='utf-8') as f:
    f.write(text)

print('SUCCESSFULLY REPLACED CATEGORY PRODUCTS MAP!')
