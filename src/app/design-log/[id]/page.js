"use client";

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

// Design-code prefix → piece type (e.g. BG-SG-OR-002 → Bangle)
const TYPE_BY_PREFIX = {
  PD: 'Pendant', RG: 'Ring', BG: 'Bangle', BR: 'Bracelet', ER: 'Earrings',
  CH: 'Chain', NK: 'Necklace', NC: 'Necklace', MS: 'Mangalsutra',
};

// Options every piece is offered in on the product page
const DEFAULT_MATERIALS = '14KT Gold  ·  18KT Gold  ·  22KT Gold  ·  92.5 Silver';
const DEFAULT_FINISHES = 'Yellow Gold  ·  White Gold  ·  Rose Gold  ·  Black Gold';

// "2026-09-20" → "SEPTEMBER 2026" (Website Design.pdf p.22 style)
const formatRelease = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).toUpperCase();
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }).toUpperCase();
};

export default function DesignLogSubPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [bp, setBp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      try {
        const res = await apiFetch(`/design-log/${resolvedParams.id}`);
        if (res && res.status === 'success' && res.data) {
          if (!isMounted) return;
          const item = res.data;
          const specs = item.specs || {};
          const code = item.design_code || item.product?.design_code || item.code || (resolvedParams.id ? String(resolvedParams.id).toUpperCase() : `DL-${item.id}`);
          const prefix = String(code).split('-')[0].toUpperCase();
          const hasLinkedProduct = Boolean(item.product?.design_code || item.product_id);
          const resolvedProductId = hasLinkedProduct ? (item.product?.design_code || item.product_id) : null;
          const isLimited = Boolean(
            item.product && (
              item.product.is_limited_edition === true ||
              item.product.is_limited_edition === 1 ||
              item.product.is_limited_edition === '1' ||
              item.product.is_limited_edition === 'true'
            )
          );
          const editionPrefix = item.product?.edition_prefix || 'LIMITED EDITION';
          const editionCurrent = Math.max(1, Number(item.product?.edition_current || 1));
          const editionLimit = Number(item.product?.edition_limit || 50);
          const editionNumber = `${String(editionCurrent).padStart(2, '0')}/${String(editionLimit).padStart(2, '0')}`;

          setBp({
            id: item.design_code || item.product?.design_code || item.id,
            code,
            image: item.blueprint_image || item.cad_image || item.product?.primary_image || '',
            type: specs.type || item.design_type || TYPE_BY_PREFIX[prefix] || '',
            materials: specs.material_options || DEFAULT_MATERIALS,
            finishes: specs.finish_options || DEFAULT_FINISHES,
            sizeOptions: specs.size_options || '',
            gemOptions: specs.gem_options || (typeof item.gem_details === 'string' ? item.gem_details : '') || '',
            inspiredBy: specs.inspired_by || item.inspired_by || '',
            inspiredByLabel: specs.inspired_by_label || 'INSPIRED BY',
            brandOrigin: specs.brand_origin || 'A PINTAARA™ ORIGINAL',
            designer: specs.designed_by || item.product?.designed_by || '',
            status: specs.status || item.status || 'UNDER DEVELOPMENT',
            collection: (specs.collection || item.product?.collection_name || item.product?.tier || (hasLinkedProduct ? 'ORIGIN' : 'STANDALONE')).toUpperCase(),
            release: specs.release ? String(specs.release).toUpperCase() : (formatRelease(item.release_date || item.product?.release_date) || '2026'),
            productId: resolvedProductId,
            hasLinkedProduct,
            isLimited,
            editionPrefix,
            editionNumber,
            edition: editionNumber,
          });
        } else {
          if (isMounted) setBp(null);
        }
      } catch (e) {
        if (isMounted) setBp(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchDetail();
    return () => { isMounted = false; };
  }, [resolvedParams.id]);

  // No scroll lock: phones and tablets now use a normal, scrolling one-column
  // layout (src/styles/mobile-home.css), and from 1100px the Website
  // Design.pdf layout is a normal 1080px-tall page. (The old small-screen
  // design was position:fixed and locked body scroll below 1100px, which
  // froze the page for touch and mouse-wheel scrolling.)



  if (!isLoading && !bp) {
    return (
      <div className="dl-subpage-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '5rem 1.5rem' }}>
        <Header headerStyle="light" />
        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A7228', fontWeight: 600, marginBottom: '8px' }}>
          Design Archives
        </span>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '28px', color: '#111', margin: '0 0 12px 0' }}>Design Log Not Found</h1>
        <p style={{ color: '#666', marginBottom: '24px', maxWidth: '440px', lineHeight: 1.6, fontSize: '14px' }}>
          The requested design blueprint is not cataloged in the Pintaara archives.
        </p>
        <Link href="/design-log" style={{ display: 'inline-block', padding: '12px 28px', background: '#111', color: '#FFF', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
          RETURN TO DESIGN LOG
        </Link>
      </div>
    );
  }

  return (
    <div className="dl-subpage-root">
      {/* Fixed header — overlays grid row 1 */}
      <Header headerStyle="light" />

      {/* ── Row 2: Three-column hero ── */}
      <section className="dl-hero">

        {/* LEFT: origin / identity */}
        <div className="dl-identity">
          <span className="dl-label-sm">ORIGIN</span>
          {isLoading ? (
            <div className="pintaara-shimmer shimmer-line title" style={{ width: '80%', height: '28px', marginTop: '10px' }} />
          ) : (
            <h1 className="dl-design-code">{bp?.code || resolvedParams.id}</h1>
          )}
          <div className="dl-rule-short"></div>
          <span className="dl-label-sm">DESIGN SPECIFICATION</span>

          {bp?.hasLinkedProduct && bp?.isLimited && (
            <div className="dl-limited-edition">
              <span className="dl-limited-sep" aria-hidden="true">|</span>
              <span className="dl-limited-text">{(bp?.editionPrefix || 'LIMITED EDITION').toUpperCase()}: {bp?.editionNumber || bp?.edition || '01/50'}</span>
            </div>
          )}
        </div>

        {/* CENTER: technical blueprint sheet */}
        <div className="dl-sheet-frame">
          {isLoading ? (
            <div className="pintaara-shimmer" style={{ width: '100%', height: '100%' }} />
          ) : (
            <img
              src={bp?.image || '/images/design-log/PD-SG-OR-001.JPG'}
              alt={`${bp?.code || resolvedParams.id} technical design sheet`}
              className="dl-sheet-img"
            />
          )}
        </div>

        {/* RIGHT: specification panel */}
        <div className="dl-spec-panel">
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', padding: '1rem 0' }}>
              <div className="pintaara-shimmer shimmer-line" style={{ width: '90%', height: '18px' }} />
              <div className="pintaara-shimmer shimmer-line" style={{ width: '70%', height: '18px' }} />
              <div className="pintaara-shimmer shimmer-line" style={{ width: '85%', height: '18px' }} />
              <div className="pintaara-shimmer shimmer-line" style={{ width: '60%', height: '18px' }} />
            </div>
          ) : bp ? (
            <>
              {bp.type && bp.type.trim() !== '' && (
                <div className="dl-spec-row">
                  <span className="dl-spec-label">TYPE</span>
                  <span className="dl-spec-value">{bp.type}</span>
                </div>
              )}

              {bp.materials && bp.materials.trim() !== '' && (
                <div className="dl-spec-row">
                  <span className="dl-spec-label">MATERIAL OPTIONS</span>
                  <span className="dl-spec-value">{bp.materials}</span>
                </div>
              )}

              {bp.finishes && bp.finishes.trim() !== '' && (
                <div className="dl-spec-row">
                  <div className="dl-spec-label-row">
                    <span className="dl-spec-label">FINISH OPTIONS</span>
                    <span className="dl-finish-swatches" aria-hidden="true">
                      <span className="dl-swatch dl-swatch--yellow"></span>
                      <span className="dl-swatch dl-swatch--white"></span>
                      <span className="dl-swatch dl-swatch--rose"></span>
                      <span className="dl-swatch dl-swatch--black"></span>
                    </span>
                  </div>
                  <span className="dl-spec-value">{bp.finishes}</span>
                </div>
              )}

              {bp.sizeOptions && bp.sizeOptions.trim() !== '' && (
                <div className="dl-spec-row">
                  <span className="dl-spec-label">SIZE OPTIONS</span>
                  <span className="dl-spec-value">{bp.sizeOptions}</span>
                </div>
              )}

              {bp.gemOptions && bp.gemOptions.trim() !== '' && (
                <div className="dl-spec-row">
                  <span className="dl-spec-label">GEM / STONE OPTIONS</span>
                  <span className="dl-spec-value">{bp.gemOptions}</span>
                </div>
              )}

              {bp.inspiredBy && bp.inspiredBy.trim() !== '' && (
                <div className="dl-spec-row dl-spec-row--last">
                  <span className="dl-spec-label">{bp.inspiredByLabel || 'INSPIRED BY'}</span>
                  <span className="dl-spec-value">{bp.inspiredBy}</span>
                </div>
              )}

              {((bp.brandOrigin && bp.brandOrigin.trim() !== '') || (bp.designer && bp.designer.trim() !== '')) && (
                <div className="dl-credits">
                  {bp.brandOrigin && bp.brandOrigin.trim() !== '' && (
                    <span className="dl-credit-item">{bp.brandOrigin}</span>
                  )}
                  {bp.designer && bp.designer.trim() !== '' && (
                    <span className="dl-credit-item">
                      {bp.designer.toUpperCase().startsWith('DESIGNED') ? bp.designer : `DESIGNED X ${bp.designer}`}
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ color: '#888', padding: '2rem 0' }}>Specification data unavailable.</div>
          )}
        </div>
      </section>

      {/* ── Row 3: meta divider ── */}
      <div className="dl-meta-rule" role="separator"></div>

      {/* ── Row 4: STATUS / COLLECTION / RELEASE / VIEW COLLECTION PIECE ── */}
      <section className="dl-meta" aria-label="Design status">
        <div className="dl-meta-col">
          <span className="dl-meta-label">STATUS</span>
          <span className="dl-meta-value">{bp?.status || 'UNDER DEVELOPMENT'}</span>
        </div>
        <div className="dl-meta-col">
          <span className="dl-meta-label">COLLECTION</span>
          <span className="dl-meta-value">{bp?.collection || 'ORIGIN'}</span>
        </div>
        <div className="dl-meta-col dl-meta-col--no-border">
          <span className="dl-meta-label">RELEASE</span>
          <span className="dl-meta-value">{bp?.release || '2026'}</span>
        </div>
        <div className="dl-meta-col dl-meta-col--btn">
          {bp?.hasLinkedProduct && bp?.productId ? (
            <Link href={`/collection/${bp.productId}`} className="dl-collection-btn">
              VIEW COLLECTION PIECE&nbsp;&nbsp;&rarr;
            </Link>
          ) : (
            <div
              className="dl-collection-btn"
              style={{ visibility: 'hidden', pointerEvents: 'none' }}
              aria-hidden="true"
            >
              VIEW COLLECTION PIECE&nbsp;&nbsp;&rarr;
            </div>
          )}
        </div>
      </section>

      {/* ── Row 5: footer rule ── */}
      <div className="dl-footer-rule" role="separator"></div>

      {/* ── Row 6: footer ── */}
      <footer className="dl-footer">
        <span className="dl-footer-brand">PINTAARA™</span>
        <span className="dl-footer-copy">© ALL RIGHTS RESERVED.</span>
      </footer>
    </div>
  );
}
