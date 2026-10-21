"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { blueprintSheets } from '@/config/designLogs';
import { apiFetch } from '@/lib/api';

export default function DesignLogPage() {
  const router = useRouter();
  const [sheets, setSheets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchSheets = async () => {
      try {
        const res = await apiFetch('/design-log');
        if (res && res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
          if (!isMounted) return;
          const mapped = res.data.map((item) => ({
            id: item.product?.design_code || item.id,
            code: item.product?.design_code || `DL-${item.id}`,
            image: item.blueprint_image || item.cad_image || item.product?.primary_image || item.creation_image || '/images/design-log/PD-SG-OR-001.JPG',
          }));
          setSheets(mapped);
        } else {
          setSheets([]);
        }
      } catch (e) {
        console.warn('Failed to load design logs:', e);
        setSheets([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchSheets();
    return () => { isMounted = false; };
  }, []);

  const handleNavigate = (index) => {
    const slideIds = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7'];
    if (slideIds[index]) {
      router.push(`/#${slideIds[index]}`);
    }
  };


  return (
    <div className="design-log-page-root">
      {/* Header configured with light style theme */}
      <Header headerStyle="light" onNavigate={handleNavigate} />

      {/* Design Log Main Container */}
      <div className="design-process-content">

        {/* Section 1: Design Process Intro */}
        <div className="design-process-intro">
          <div className="design-process-intro-left">
            <span className="design-process-label">DESIGN PROCESS</span>
            <div className="design-process-divider"></div>
            <h1 className="design-process-title">From Exploration to Form.</h1>
          </div>
          <div className="design-process-intro-right">
            <p className="design-process-intro-text">
              Not every idea becomes a piece. Some are explored and left behind. Others reveal something worth keeping. The Design Log records the search for forms that deserve to exist.
            </p>
          </div>
        </div>

        {/* Process Grid: 4 columns matching exact specification */}
        <div className="design-process-grid">

          {/* Step 01 */}
          <div className="process-card-col">
            <div className="process-media-box single-media">
              <img src="/images/design/step1.jpg" alt="Idea / Design" className="process-img" />
            </div>
            <div className="process-card-number">01</div>
            <h2 className="process-card-title">IDEA / DESIGN</h2>
            <div className="process-card-divider"></div>
            <p className="process-card-description">
              Initial ideas, references, and forms are studied to discover a direction worth pursuing.
            </p>
          </div>

          {/* Step 02 */}
          <div className="process-card-col">
            <div className="process-media-box single-media">
              <img src="/images/design/step2.jpg" alt="CAD Development" className="process-img" />
            </div>
            <div className="process-card-number">02</div>
            <h2 className="process-card-title">CAD DEVELOPMENT</h2>
            <div className="process-card-divider"></div>
            <p className="process-card-description">
              Proportions, geometry, and structure are refined as the concept begins to take shape.
            </p>
          </div>

          {/* Step 03: Stacked 2 Images */}
          <div className="process-card-col">
            <div className="process-media-box stacked-media">
              <div className="stacked-img-row">
                <img src="/images/design/step3_1.jpg" alt="Crafting" className="process-img" />
              </div>
              <div className="stacked-img-row">
                <img src="/images/design/step3_2.jpg" alt="Prototype" className="process-img" />
              </div>
            </div>
            <div className="process-card-number">03</div>
            <h2 className="process-card-title">CRAFT / PROTOTYPE</h2>
            <div className="process-card-divider"></div>
            <p className="process-card-description">
              The design moves beyond the page, allowing the form to exist in three dimensions.
            </p>
          </div>

          {/* Step 04 */}
          <div className="process-card-col">
            <div className="process-media-box single-media">
              <img src="/images/design/step4.jpg" alt="Creation" className="process-img creation-hero-img" />
            </div>
            <div className="process-card-number">04</div>
            <h2 className="process-card-title">CREATION</h2>
            <div className="process-card-divider"></div>
            <p className="process-card-description">
              The completed piece. A form created through intention, exploration, and refinement.
            </p>
          </div>

        </div>

        {/* Section 2: Design Log Blueprint Grid */}
        <div className="blueprint-section" style={{ marginTop: '4.5rem', paddingTop: '3.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
          <div className="design-process-intro">
            <div className="design-process-intro-left">
              <span className="design-process-label">DESIGN LOG</span>
              <div className="design-process-divider"></div>
              <h2 className="design-process-title">Every design begins with a question.</h2>
            </div>
            <div className="design-process-intro-right">
              <p className="design-process-intro-text">
                A process of exploration, refinement and form-making before creation begins.
              </p>
            </div>
          </div>

          {/* Blueprint Grid */}
          <div className="blueprint-grid-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2.5rem', marginTop: '2.5rem' }}>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, sIdx) => (
                <div key={`dl-shimmer-${sIdx}`} className="blueprint-card-item" style={{ pointerEvents: 'none' }}>
                  <div className="blueprint-img-frame pintaara-shimmer" style={{ width: '100%', aspectRatio: '3/4', border: 'none' }} />
                  <div className="pintaara-shimmer shimmer-line title" style={{ marginTop: '0.85rem', width: '45%', height: '14px' }} />
                </div>
              ))
            ) : sheets.length > 0 ? (
              sheets.map((sheet) => (
                <Link
                  key={sheet.id}
                  href={`/design-log/${sheet.id}`}
                  className="blueprint-card-item"
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div className="blueprint-img-frame">
                    <img
                      src={sheet.image}
                      alt={sheet.code}
                      className="blueprint-img"
                    />
                  </div>
                  <span className="blueprint-code-tag">{sheet.code}</span>
                </Link>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '4rem 1rem', textAlign: 'center', color: '#AAA' }}>
                <p style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>No design logs currently published.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Footer bar */}
      <Footer theme="dark" />
    </div>
  );
}
