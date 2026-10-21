"use client";

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { getBlueprintById } from '@/config/designLogs';
import { apiFetch } from '@/lib/api';

export default function DesignLogSubPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const fallbackBp = getBlueprintById(resolvedParams.id);
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
          setBp({
            id: item.product?.design_code || item.id,
            code: item.product?.design_code || item.code || (item.design_code ? item.design_code : `DL-${item.id}`),
            image: item.blueprint_image || item.cad_image || item.product?.primary_image || '/images/design-log/PD-SG-OR-001.JPG',
            type: specs.type || item.design_type || '',
            materials: specs.material_options || '',
            finishes: specs.finish_options || '',
            sizeOptions: specs.size_options || '',
            gemOptions: specs.gem_options || (typeof item.gem_details === 'string' ? item.gem_details : ''),
            inspiredBy: specs.inspired_by || item.inspired_by || '',
            brandOrigin: specs.brand_origin || '',
            designer: specs.designed_by || item.product?.designed_by || '',
            status: item.status || 'UNDER DEVELOPMENT',
            collection: item.product?.collection_name || 'ORIGIN',
            release: item.release_date || '2026',
            productId: item.product?.design_code || item.product_id,
          });
        } else if (fallbackBp) {
          setBp(fallbackBp);
        }
      } catch (e) {
        if (fallbackBp) setBp(fallbackBp);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchDetail();
    return () => { isMounted = false; };
  }, [resolvedParams.id, fallbackBp]);

  // Prevent body scroll — the page itself is position:fixed
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);



  return (
    <div className="dl-subpage-root">
      {/* Fixed header — overlays grid row 1 */}
      <Header headerStyle="light" />

      {/* ── Row 2: Three-column hero ── */}
      <section className="dl-hero">

        {/* LEFT: origin / identity */}
        <div className="dl-identity">
          <Link href="/design-log" className="dl-back-link">
            &larr;&nbsp;&nbsp;BACK TO DESIGN LOG
          </Link>
          <span className="dl-label-sm">ORIGIN</span>
          {isLoading ? (
            <div className="pintaara-shimmer shimmer-line title" style={{ width: '80%', height: '28px', marginTop: '10px' }} />
          ) : (
            <h1 className="dl-design-code">{bp?.code || resolvedParams.id}</h1>
          )}
          <div className="dl-rule-short"></div>
          <span className="dl-label-sm">DESIGN SPECIFICATION</span>
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
                  <span className="dl-spec-label">INSPIRED BY</span>
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
        <div className="dl-meta-col">
          <span className="dl-meta-label">RELEASE</span>
          <span className="dl-meta-value">{bp?.release || '2026'}</span>
        </div>
        <div className="dl-meta-col dl-meta-col--btn">
          <Link href={bp?.productId ? `/collection/${bp.productId}` : "/collection"} className="dl-collection-btn">
            VIEW COLLECTION PIECE&nbsp;&nbsp;&rarr;
          </Link>
        </div>
      </section>

      {/* ── Row 5: footer rule ── */}
      <div className="dl-footer-rule" role="separator"></div>

      {/* ── Row 6: footer ── */}
      <footer className="dl-footer">
        <span className="dl-footer-brand">PINTAARA™</span>
        <span className="dl-footer-copy">© 2026 DARSHIT SONI. ALL RIGHTS RESERVED.</span>
      </footer>
    </div>
  );
}
