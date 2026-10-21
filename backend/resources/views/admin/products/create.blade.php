@extends('layouts.admin')

@section('title', 'New Master Design Spec')
@section('page-title', 'Create Master Design Spec')
@section('page-subtitle', 'Shopify-style variant matrix builder, 1:1 design log, and live pricing ledger')

@section('content')
<form action="{{ route('admin.products.store') }}" method="POST" id="productForm" 
      x-data="productMatrixBuilder({
          baseGoldRate22kt: {{ $currentGold22 }},
          defaultWeight: 8.500,
          defaultMakingFlat: 3000,
          defaultMakingPercent: 0,
          defaultWastage: 0,
          gstPercent: 3.0,
      })">
    @csrf

    <!-- Hidden serialized state for options & variants -->
    <input type="hidden" name="options_json" :value="JSON.stringify(options)">
    <input type="hidden" name="variants_json" :value="JSON.stringify(variants)">

    <div class="space-y-6">

        <!-- Top Navigation Bar & Action Buttons -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pintaara-line/60">
            <!-- Tabs -->
            <div class="flex items-center space-x-2 border-b border-transparent">
                <button type="button" @click="tab = 'details'" 
                        :class="tab === 'details' ? 'bg-pintaara-charcoal text-pintaara-gold border-pintaara-gold/40' : 'bg-white text-pintaara-charcoal border-pintaara-line hover:bg-pintaara-sand'"
                        class="px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider border transition-colors">
                    1. Design Details
                </button>
                <button type="button" @click="tab = 'matrix'" 
                        :class="tab === 'matrix' ? 'bg-pintaara-charcoal text-pintaara-gold border-pintaara-gold/40' : 'bg-white text-pintaara-charcoal border-pintaara-line hover:bg-pintaara-sand'"
                        class="px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider border transition-colors">
                    2. Option Matrix & Ledger
                </button>
                <button type="button" @click="tab = 'design_log'" 
                        :class="tab === 'design_log' ? 'bg-pintaara-charcoal text-pintaara-gold border-pintaara-gold/40' : 'bg-white text-pintaara-charcoal border-pintaara-line hover:bg-pintaara-sand'"
                        class="px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider border transition-colors">
                    3. 1:1 Design Log
                </button>
                <button type="button" @click="tab = 'gallery'" 
                        :class="tab === 'gallery' ? 'bg-pintaara-charcoal text-pintaara-gold border-pintaara-gold/40' : 'bg-white text-pintaara-charcoal border-pintaara-line hover:bg-pintaara-sand'"
                        class="px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider border transition-colors">
                    4. Imagery
                </button>
            </div>

            <!-- Submit Button -->
            <div class="flex items-center space-x-3">
                <a href="{{ route('admin.products.index') }}" class="px-4 py-2 bg-white hover:bg-pintaara-sand border border-pintaara-line text-xs font-semibold text-pintaara-charcoal rounded">
                    Cancel
                </a>
                <button type="submit" class="px-6 py-2 bg-pintaara-charcoal hover:bg-black text-pintaara-gold text-xs font-semibold uppercase tracking-wider rounded border border-pintaara-gold/40 shadow-sm">
                    Publish Master Piece
                </button>
            </div>
        </div>

        <!-- 2-COLUMN LAYOUT: MAIN TAB CONTENT (8 COLS) + JEWELER'S LEDGER (4 COLS) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <!-- MAIN TAB CONTENT (8 Cols) -->
            <div class="lg:col-span-8 space-y-6">

                <!-- TAB 1: DESIGN DETAILS -->
                <div x-show="tab === 'details'" class="bg-[#FAF6F0] rounded-xl p-6 border border-pintaara-line/80 shadow-xs space-y-5">
                    <h3 class="font-serif font-semibold text-lg text-pintaara-charcoal border-b border-pintaara-line/60 pb-2">
                        Core Identity & Live Gold Parameters
                    </h3>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Design Code *</label>
                            <input type="text" name="design_code" required value="{{ old('design_code', 'PD-SG-OR-002') }}" 
                                   class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm font-mono font-bold uppercase focus:border-pintaara-gold">
                            <p class="text-[11px] text-pintaara-charcoal-muted mt-1">Format: PD-[COL]-[NAME]-[NUM]</p>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Creation Name *</label>
                            <input type="text" name="name" required value="{{ old('name', 'Solstice Signet Ring') }}" 
                                   class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm font-serif font-semibold focus:border-pintaara-gold">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Collection Master</label>
                            <select name="collection_master_id" class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-xs font-semibold focus:border-pintaara-gold">
                                <option value="">Select Collection</option>
                                @foreach($collections as $col)
                                    <option value="{{ $col->id }}">{{ $col->name }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Tier *</label>
                            <select name="tier" class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-xs font-semibold focus:border-pintaara-gold">
                                <option value="Signature">Signature</option>
                                <option value="Curated">Curated</option>
                                <option value="Heritage">Heritage</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Status *</label>
                            <select name="status" class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-xs font-semibold focus:border-pintaara-gold">
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    <!-- Live Gold Parameters (Weight, Making Charge, Wastage) -->
                    <div class="p-4 rounded-lg bg-pintaara-sand/50 border border-pintaara-line space-y-4">
                        <div class="flex items-center space-x-2">
                            <span class="w-2 h-2 rounded-full bg-pintaara-gold"></span>
                            <h4 class="font-serif font-semibold text-sm text-pintaara-charcoal uppercase tracking-wide">Live Gold Engine Inputs</h4>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Base Weight (Grams) *</label>
                                <input type="number" step="0.001" name="base_weight_grams" x-model="weight" required 
                                       class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm font-serif font-bold text-pintaara-charcoal focus:border-pintaara-gold">
                                <p class="text-[10px] text-pintaara-charcoal-muted mt-1">E.g. 8.500g</p>
                            </div>

                            <div>
                                <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Making Charge Flat (₹)</label>
                                <input type="number" step="100" name="making_charge" x-model="makingChargeFlat" 
                                       class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm font-mono focus:border-pintaara-gold">
                                <p class="text-[10px] text-pintaara-charcoal-muted mt-1">E.g. ₹3,000</p>
                            </div>

                            <div>
                                <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Wastage (%)</label>
                                <input type="number" step="0.5" name="wastage_percent" x-model="wastagePercent" 
                                       class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm font-mono focus:border-pintaara-gold">
                                <p class="text-[10px] text-pintaara-charcoal-muted mt-1">0% - 8% atelier buffer</p>
                            </div>
                        </div>
                    </div>

                    <!-- Description & Designer -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Master Jeweler / Designer</label>
                            <input type="text" name="designed_by" value="Darshit Soni" class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-xs focus:border-pintaara-gold">
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Atelier Release Date</label>
                            <input type="date" name="release_date" value="{{ date('Y-m-d') }}" class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-xs focus:border-pintaara-gold">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Atelier Description</label>
                        <textarea name="description" rows="3" placeholder="Describe the design inspiration, proportions, and craftsmanship..." 
                                  class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm focus:border-pintaara-gold"></textarea>
                    </div>
                </div>

                <!-- TAB 2: SHOPIFY-STYLE OPTION MATRIX & VARIANTS BUILDER -->
                <div x-show="tab === 'matrix'" class="bg-[#FAF6F0] rounded-xl p-6 border border-pintaara-line/80 shadow-xs space-y-6">
                    <div class="flex items-center justify-between border-b border-pintaara-line/60 pb-3">
                        <div>
                            <h3 class="font-serif font-semibold text-lg text-pintaara-charcoal">Shopify-Style Option Dimensions</h3>
                            <p class="text-xs text-pintaara-charcoal-muted">Define options (Purity, Finish, Size, Gem, Chain) and generate combinations</p>
                        </div>
                        <button type="button" @click="addOption()" class="px-3 py-1.5 bg-white hover:bg-pintaara-sand border border-pintaara-line rounded text-xs font-semibold text-pintaara-charcoal">
                            + Add Option Group
                        </button>
                    </div>

                    <!-- Dynamic Options Chip Inputs -->
                    <div class="space-y-4">
                        <template x-for="(opt, oIdx) in options" :key="oIdx">
                            <div class="p-4 rounded-lg bg-white border border-pintaara-line space-y-3">
                                <div class="flex items-center justify-between">
                                    <div class="w-1/3">
                                        <label class="block text-[10px] font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Option Name</label>
                                        <input type="text" x-model="opt.name" placeholder="e.g. Metal Purity, Finish, Size" 
                                               class="w-full px-2.5 py-1.5 bg-pintaara-cream/40 border border-pintaara-line rounded text-xs font-bold focus:border-pintaara-gold">
                                    </div>
                                    <button type="button" @click="removeOption(oIdx)" class="text-xs text-rose-600 hover:text-rose-800">
                                        Remove Group
                                    </button>
                                </div>

                                <!-- Chips / Values -->
                                <div>
                                    <label class="block text-[10px] font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Option Values (Comma separated)</label>
                                    <input type="text" x-model="opt.values" @input="debouncedRegenerate()" placeholder="e.g. 22KT, 18KT, 14KT"
                                           class="w-full px-2.5 py-1.5 bg-white border border-pintaara-line rounded text-xs focus:border-pintaara-gold">
                                </div>
                            </div>
                        </template>
                    </div>

                    <!-- Generate Variants Button -->
                    <div class="pt-2 flex items-center justify-between">
                        <p class="text-xs text-pintaara-charcoal-muted">
                            <span x-text="variants.length"></span> combinations generated
                        </p>
                        <button type="button" @click="generateVariantsMatrix()" 
                                class="px-4 py-2 bg-pintaara-gold hover:bg-pintaara-gold-dark text-pintaara-charcoal font-semibold text-xs uppercase tracking-wider rounded border border-pintaara-gold shadow-sm">
                            ⚡ Regenerate Variants Matrix
                        </button>
                    </div>

                    <!-- Generated Variants Matrix Table -->
                    <div class="border border-pintaara-line rounded-lg overflow-hidden">
                        <table class="min-w-full divide-y divide-pintaara-line text-left text-xs">
                            <thead class="bg-pintaara-sand/60 text-pintaara-charcoal uppercase font-bold tracking-wider">
                                <tr>
                                    <th class="px-3 py-2.5">Variant Combination</th>
                                    <th class="px-3 py-2.5">SKU</th>
                                    <th class="px-3 py-2.5">Weight (g)</th>
                                    <th class="px-3 py-2.5">Stock</th>
                                    <th class="px-3 py-2.5 text-right">Preview Price</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-pintaara-line/40 bg-white">
                                <template x-for="(v, vIdx) in variants" :key="vIdx">
                                    <tr class="hover:bg-pintaara-cream/20">
                                        <td class="px-3 py-2 font-medium text-pintaara-charcoal">
                                            <span x-text="getVariantLabel(v)"></span>
                                        </td>
                                        <td class="px-3 py-2 font-mono">
                                            <input type="text" x-model="v.sku" class="w-full px-2 py-1 bg-pintaara-cream/30 border border-pintaara-line rounded text-xs">
                                        </td>
                                        <td class="px-3 py-2">
                                            <input type="number" step="0.001" x-model="v.weight" placeholder="Base" class="w-20 px-2 py-1 bg-pintaara-cream/30 border border-pintaara-line rounded text-xs">
                                        </td>
                                        <td class="px-3 py-2">
                                            <input type="number" x-model="v.stock" class="w-16 px-2 py-1 bg-pintaara-cream/30 border border-pintaara-line rounded text-xs">
                                        </td>
                                        <td class="px-3 py-2 text-right font-serif font-bold text-pintaara-charcoal">
                                            ₹<span x-text="formatCurrency(computeVariantPrice(v))"></span>
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- TAB 3: 1:1 DESIGN LOG SPEC SHEET BUILDER -->
                <div x-show="tab === 'design_log'" class="bg-[#FAF6F0] rounded-xl p-6 border border-pintaara-line/80 shadow-xs space-y-6" x-data="{ previewSpecModal: false }">
                    <div class="flex items-center justify-between border-b border-pintaara-line/60 pb-3">
                        <div>
                            <h3 class="font-serif font-semibold text-lg text-pintaara-charcoal">1:1 Atelier Design Log</h3>
                            <p class="text-xs text-pintaara-charcoal-muted">Document the 4-stage journey from pencil sketch to BIS master hallmark</p>
                        </div>
                        <button type="button" @click="previewSpecModal = true" class="px-3 py-1.5 bg-pintaara-charcoal text-pintaara-gold border border-pintaara-gold/40 rounded text-xs font-semibold uppercase tracking-wider">
                            👁 Preview Spec Sheet
                        </button>
                    </div>

                    <!-- 4 STAGES -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <!-- Stage 1: Idea Draft -->
                        <div class="p-4 rounded-lg bg-white border border-pintaara-line space-y-3">
                            <div class="flex items-center space-x-2">
                                <span class="w-5 h-5 rounded-full bg-pintaara-charcoal text-pintaara-gold text-[10px] flex items-center justify-center font-bold">1</span>
                                <h4 class="font-serif font-semibold text-sm text-pintaara-charcoal uppercase">Stage 1: Idea / Draft</h4>
                            </div>
                            <input type="url" name="idea_image" x-model="designLog.idea_image" placeholder="Image URL (Sketch / Moodboard)" class="w-full px-2.5 py-1.5 border border-pintaara-line rounded text-xs">
                            <textarea name="idea_note" x-model="designLog.idea_note" rows="2" placeholder="Notes on initial geometry, balance and proportions..." class="w-full px-2.5 py-1.5 border border-pintaara-line rounded text-xs"></textarea>
                        </div>

                        <!-- Stage 2: CAD Model -->
                        <div class="p-4 rounded-lg bg-white border border-pintaara-line space-y-3">
                            <div class="flex items-center space-x-2">
                                <span class="w-5 h-5 rounded-full bg-pintaara-charcoal text-pintaara-gold text-[10px] flex items-center justify-center font-bold">2</span>
                                <h4 class="font-serif font-semibold text-sm text-pintaara-charcoal uppercase">Stage 2: CAD / 3D Render</h4>
                            </div>
                            <input type="url" name="cad_image" x-model="designLog.cad_image" placeholder="Image URL (CAD render)" class="w-full px-2.5 py-1.5 border border-pintaara-line rounded text-xs">
                            <textarea name="cad_note" x-model="designLog.cad_note" rows="2" placeholder="Parametric tolerances, chamfers, and shank thickness..." class="w-full px-2.5 py-1.5 border border-pintaara-line rounded text-xs"></textarea>
                        </div>

                        <!-- Stage 3: Crafting -->
                        <div class="p-4 rounded-lg bg-white border border-pintaara-line space-y-3">
                            <div class="flex items-center space-x-2">
                                <span class="w-5 h-5 rounded-full bg-pintaara-charcoal text-pintaara-gold text-[10px] flex items-center justify-center font-bold">3</span>
                                <h4 class="font-serif font-semibold text-sm text-pintaara-charcoal uppercase">Stage 3: Hand Crafting</h4>
                            </div>
                            <input type="url" name="craft_image" x-model="designLog.craft_image" placeholder="Image URL (Atelier workbench)" class="w-full px-2.5 py-1.5 border border-pintaara-line rounded text-xs">
                            <textarea name="craft_note" x-model="designLog.craft_note" rows="2" placeholder="Lost wax casting, file work, and bezel setting..." class="w-full px-2.5 py-1.5 border border-pintaara-line rounded text-xs"></textarea>
                        </div>

                        <!-- Stage 4: Master Creation -->
                        <div class="p-4 rounded-lg bg-white border border-pintaara-line space-y-3">
                            <div class="flex items-center space-x-2">
                                <span class="w-5 h-5 rounded-full bg-pintaara-charcoal text-pintaara-gold text-[10px] flex items-center justify-center font-bold">4</span>
                                <h4 class="font-serif font-semibold text-sm text-pintaara-charcoal uppercase">Stage 4: Master Creation</h4>
                            </div>
                            <input type="url" name="creation_image" x-model="designLog.creation_image" placeholder="Image URL (Final hallmarked piece)" class="w-full px-2.5 py-1.5 border border-pintaara-line rounded text-xs">
                            <textarea name="creation_note" x-model="designLog.creation_note" rows="2" placeholder="High mirror polish, BIS stamping, and lab certification..." class="w-full px-2.5 py-1.5 border border-pintaara-line rounded text-xs"></textarea>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Inspiration Source</label>
                        <input type="text" name="inspired_by" x-model="designLog.inspired_by" placeholder="e.g. Brutalist geometry, astronomical coordinates" class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-xs">
                    </div>

                    <!-- SPEC SHEET MODAL PREVIEW -->
                    <div x-show="previewSpecModal" x-cloak class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                        <div @click.away="previewSpecModal = false" class="bg-[#FAF6F0] rounded-2xl border border-pintaara-gold/60 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 text-pintaara-charcoal space-y-6">
                            <div class="flex items-center justify-between border-b border-pintaara-line pb-4">
                                <div>
                                    <span class="text-[10px] uppercase font-bold tracking-[0.25em] text-pintaara-gold">PINTAARA ATELIER ARCHIVE</span>
                                    <h2 class="font-serif font-bold text-2xl text-pintaara-charcoal mt-0.5">1:1 Design Log Spec Sheet</h2>
                                </div>
                                <button type="button" @click="previewSpecModal = false" class="text-xl font-bold">&times;</button>
                            </div>

                            <div class="grid grid-cols-2 gap-4 text-xs bg-white p-4 rounded-xl border border-pintaara-line">
                                <div><strong class="text-pintaara-charcoal-muted uppercase text-[10px]">Creation:</strong> <span class="font-serif font-bold text-sm block">Solstice Signet Ring</span></div>
                                <div><strong class="text-pintaara-charcoal-muted uppercase text-[10px]">Design Code:</strong> <span class="font-mono font-bold text-sm block">PD-SG-OR-002</span></div>
                                <div><strong class="text-pintaara-charcoal-muted uppercase text-[10px]">Inspiration:</strong> <span x-text="designLog.inspired_by || 'Monolithic architecture'"></span></div>
                                <div><strong class="text-pintaara-charcoal-muted uppercase text-[10px]">Master Jeweler:</strong> <span>Darshit Soni</span></div>
                            </div>

                            <!-- 4 Stage Timeline in Spec Sheet -->
                            <div class="space-y-4">
                                <div class="p-3 bg-white rounded-lg border border-pintaara-line flex items-start space-x-3">
                                    <span class="w-6 h-6 rounded-full bg-pintaara-gold text-pintaara-charcoal font-bold text-xs flex items-center justify-center shrink-0">1</span>
                                    <div>
                                        <h5 class="font-serif font-bold text-xs">Stage 1: Idea Draft</h5>
                                        <p class="text-xs text-pintaara-charcoal-muted" x-text="designLog.idea_note || 'Geometric exploration on paper'"></p>
                                    </div>
                                </div>
                                <div class="p-3 bg-white rounded-lg border border-pintaara-line flex items-start space-x-3">
                                    <span class="w-6 h-6 rounded-full bg-pintaara-gold text-pintaara-charcoal font-bold text-xs flex items-center justify-center shrink-0">2</span>
                                    <div>
                                        <h5 class="font-serif font-bold text-xs">Stage 2: CAD / 3D Parametric</h5>
                                        <p class="text-xs text-pintaara-charcoal-muted" x-text="designLog.cad_note || '3D precision modeling'"></p>
                                    </div>
                                </div>
                                <div class="p-3 bg-white rounded-lg border border-pintaara-line flex items-start space-x-3">
                                    <span class="w-6 h-6 rounded-full bg-pintaara-gold text-pintaara-charcoal font-bold text-xs flex items-center justify-center shrink-0">3</span>
                                    <div>
                                        <h5 class="font-serif font-bold text-xs">Stage 3: Atelier Handcraft</h5>
                                        <p class="text-xs text-pintaara-charcoal-muted" x-text="designLog.craft_note || 'Lost wax casting and hand filing'"></p>
                                    </div>
                                </div>
                                <div class="p-3 bg-white rounded-lg border border-pintaara-gold bg-pintaara-sand/30 flex items-start space-x-3">
                                    <span class="w-6 h-6 rounded-full bg-pintaara-charcoal text-pintaara-gold font-bold text-xs flex items-center justify-center shrink-0">4</span>
                                    <div>
                                        <h5 class="font-serif font-bold text-xs text-pintaara-charcoal">Stage 4: Hallmarked Creation</h5>
                                        <p class="text-xs text-pintaara-charcoal-muted" x-text="designLog.creation_note || 'Mirror polished & BIS stamped'"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TAB 4: IMAGERY -->
                <div x-show="tab === 'gallery'" class="bg-[#FAF6F0] rounded-xl p-6 border border-pintaara-line/80 shadow-xs space-y-5">
                    <h3 class="font-serif font-semibold text-lg text-pintaara-charcoal border-b border-pintaara-line/60 pb-2">
                        Product Gallery Images
                    </h3>
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Image URLs (One per line, top one is Primary)</label>
                        <textarea name="image_urls" rows="6" placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
                                  class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-xs font-mono focus:border-pintaara-gold">https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop&#10;https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=1000&auto=format&fit=crop</textarea>
                    </div>
                </div>

            </div>

            <!-- STICKY JEWELER'S LEDGER LIVE PANEL (4 Cols) -->
            <div class="lg:col-span-4 space-y-4">
                <div class="sticky top-24">
                    <x-admin.ledger-panel 
                        :baseGoldRate22kt="$currentGold22"
                        :defaultWeight="8.500"
                        :defaultMakingCharge="3000.00"
                        :defaultWastage="0.00"
                        :gstPercent="3.0"
                    />
                </div>
            </div>

        </div>

    </div>
</form>

@push('scripts')
<script>
function productMatrixBuilder(config) {
    return {
        tab: 'details',
        goldRate22kt: config.baseGoldRate22kt,
        weight: config.defaultWeight,
        makingChargeFlat: config.defaultMakingFlat,
        makingChargePercent: config.defaultMakingPercent,
        wastagePercent: config.defaultWastage,
        gstPercent: config.gstPercent,
        selectedPurityName: '22KT',
        selectedPurityFraction: 0.916,
        stoneChargeValue: 0,

        // Options default setup
        options: [
            { name: 'Metal Purity', values: '22KT, 18KT, 14KT' },
            { name: 'Finish', values: 'Yellow Gold, Rose Gold' },
            { name: 'Size', values: '14, 16' },
        ],
        variants: [],

        designLog: {
            idea_image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop',
            idea_note: 'Initial pencil sketches on monolithic proportions.',
            cad_image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
            cad_note: 'Precision 3D chamfering along table facet.',
            craft_image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
            craft_note: 'Hand cast & filed in atelier.',
            creation_image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
            creation_note: 'Certified BIS hallmark stamping.',
            inspired_by: 'Solstice alignment & monolithic geometry',
        },

        init() {
            this.generateVariantsMatrix();
        },

        // Formulas
        get pureGoldRatePerGram() {
            return (this.goldRate22kt / 10) / 0.916;
        },
        get effectiveRatePerGram() {
            return this.pureGoldRatePerGram * this.selectedPurityFraction;
        },
        get metalValue() {
            return (Number(this.weight) || 0) * this.effectiveRatePerGram;
        },
        get wastageValue() {
            return this.metalValue * ((Number(this.wastagePercent) || 0) / 100);
        },
        get makingChargeValue() {
            if (this.makingChargeFlat && Number(this.makingChargeFlat) > 0) {
                return Number(this.makingChargeFlat);
            }
            if (this.makingChargePercent && Number(this.makingChargePercent) > 0) {
                return this.metalValue * (Number(this.makingChargePercent) / 100);
            }
            return 0;
        },
        get subtotalValue() {
            return this.metalValue + this.wastageValue + this.makingChargeValue + Number(this.stoneChargeValue);
        },
        get gstValue() {
            return this.subtotalValue * (Number(this.gstPercent) / 100);
        },
        get finalPrice() {
            return this.subtotalValue + this.gstValue;
        },

        formatCurrency(val) {
            return Math.round(val || 0).toLocaleString('en-IN');
        },

        addOption() {
            this.options.push({ name: '', values: '' });
        },
        removeOption(idx) {
            this.options.splice(idx, 1);
            this.generateVariantsMatrix();
        },
        debouncedRegenerate() {
            this.generateVariantsMatrix();
        },

        // Shopify Cartesian Matrix Generator
        generateVariantsMatrix() {
            const validOptions = this.options
                .filter(o => o.name.trim() !== '' && o.values.trim() !== '')
                .map(o => ({
                    name: o.name.trim(),
                    values: o.values.split(',').map(v => v.trim()).filter(v => v !== '')
                }));

            if (validOptions.length === 0) {
                this.variants = [];
                return;
            }

            // Cartesian Product
            const cartesian = (arrays) => {
                return arrays.reduce((acc, curr) => {
                    const res = [];
                    acc.forEach(a => {
                        curr.forEach(c => {
                            res.push([...a, c]);
                        });
                    });
                    return res;
                }, [[]]);
            };

            const optionValueArrays = validOptions.map(o => o.values);
            const combinations = cartesian(optionValueArrays);

            this.variants = combinations.map(combo => {
                const optMap = {};
                combo.forEach((val, i) => {
                    optMap[validOptions[i].name] = val;
                });

                const skuParts = ['PD', 'SG', 'OR'];
                combo.forEach(val => skuParts.push(val.substring(0, 3).toUpperCase().replace(/\s+/g, '')));

                return {
                    option_values: optMap,
                    sku: skuParts.join('-'),
                    weight: null, // inherits base
                    stock: 10,
                    enabled: true,
                };
            });
        },

        getVariantLabel(v) {
            return Object.entries(v.option_values).map(([k, val]) => `${val}`).join(' / ');
        },

        computeVariantPrice(v) {
            let purityFraction = 0.916;
            let stoneCharge = 0;

            Object.entries(v.option_values).forEach(([k, val]) => {
                const lowerK = k.toLowerCase();
                if (lowerK.includes('purity') || lowerK.includes('karat')) {
                    if (val.includes('18')) purityFraction = 0.750;
                    else if (val.includes('14')) purityFraction = 0.585;
                    else if (val.includes('925') || val.includes('Silver')) purityFraction = 0.087; // approx silver
                } else if (lowerK.includes('gem') || lowerK.includes('stone')) {
                    if (val.toLowerCase().includes('diamond')) stoneCharge = 45000;
                    else if (val.toLowerCase().includes('ruby')) stoneCharge = 28000;
                    else if (val.toLowerCase().includes('emerald')) stoneCharge = 32000;
                }
            });

            const w = v.weight ? Number(v.weight) : Number(this.weight);
            const ratePerG = this.pureGoldRatePerGram * purityFraction;
            const metal = w * ratePerG;
            const wastage = metal * ((Number(this.wastagePercent) || 0) / 100);
            const making = this.makingChargeFlat ? Number(this.makingChargeFlat) : (metal * (Number(this.makingChargePercent) / 100));
            const sub = metal + wastage + making + stoneCharge;
            return sub + (sub * (Number(this.gstPercent) / 100));
        }
    };
}
</script>
@endpush
@endsection
