'use client';

import React, { useState, useEffect } from 'react';
import api, { getApiHost } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import OfficialInvoice from '@/components/OfficialInvoice';

const resolveCertFileUrl = (url) => {
    if (!url) return '';
    const cleanUrl = String(url).replace(/[\uFEFF\u200B-\u200D\u00A0]/g, '').trim();
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('blob:')) {
        return cleanUrl;
    }
    if (cleanUrl.startsWith('/storage/')) {
        const apiHost = getApiHost().replace(/[\uFEFF\u200B-\u200D\u00A0]/g, '').trim();
        return `${apiHost}${cleanUrl}`;
    }
    return cleanUrl;
};

const getValidCertificates = (piece) => {
    if (!piece) return [];
    const valid = [];
    const isValidDoc = (url) => {
        if (!url || typeof url !== 'string') return false;
        const clean = url.trim();
        return clean.length > 0 && clean !== '#' && !clean.includes('sample-certificate.pdf');
    };

    if (Array.isArray(piece.certificates)) {
        piece.certificates.forEach((cert) => {
            if (cert && isValidDoc(cert.certificate_url || cert.cert_url || cert.url)) {
                valid.push(cert);
            }
        });
    }

    if (valid.length === 0 && isValidDoc(piece.certificate_url)) {
        valid.push({
            id: 'cert_uploaded',
            name: 'Certificate of Authenticity',
            certificate_url: piece.certificate_url,
            certificate_number: piece.certificate_number,
        });
    }

    return valid;
};

const PRODUCT_IMAGE_MAP = {
    'BR-SG-OR-001': 'https://api.pintaara.com/storage/products/images/media_1792447747_cULJbwzt.png',
    'PD-SG-OR-001': 'https://api.pintaara.com/storage/products/images/media_1792625622_draVowIy.png',
    'RG-SG-OR-001': 'https://api.pintaara.com/storage/products/images/media_1792625844_2sf2LgGA.png',
    'RG-SG-OR-002': 'https://api.pintaara.com/storage/products/images/media_1792625527_MuJnEFUp.png',
    'RG-SG-AR-004': 'https://api.pintaara.com/storage/products/images/media_1792625939_vlRePACq.png',
    'ER-SG-OR-001A': 'https://api.pintaara.com/storage/products/images/media_1792620061_mjjOIrbB.jpg',
    'ER-SG-OR-001B': 'https://api.pintaara.com/storage/products/images/media_1792620132_CxF1ZjMv.jpg',
    'ER-SG-OR-001C': 'https://api.pintaara.com/storage/products/images/media_1792620199_eAYwagpk.jpg',
    'ER-SG-OR-002A': 'https://api.pintaara.com/storage/products/images/media_1792620290_iTrtvIeW.jpg',
    'ER-SG-OR-002B': 'https://api.pintaara.com/storage/products/images/media_1792620311_D8Hg6HxL.jpg',
    'ER-SG-OR-002C': 'https://api.pintaara.com/storage/products/images/media_1792620356_FuyExqwB.jpg',
};

const resolvePieceImage = (piece, catalogMap = {}) => {
    const raw = piece?.image;
    if (raw && typeof raw === 'string' && !raw.includes('piece-dummy.png') && !raw.includes('piece-01-exact.jpg')) {
        return resolveCertFileUrl(raw);
    }

    const code = String(piece?.piece_code || piece?.design_code || piece?.name || '').toUpperCase().trim();
    if (catalogMap && catalogMap[code]) {
        return catalogMap[code];
    }
    if (PRODUCT_IMAGE_MAP[code]) {
        return PRODUCT_IMAGE_MAP[code];
    }

    if (raw && typeof raw === 'string') {
        return resolveCertFileUrl(raw);
    }

    return PRODUCT_IMAGE_MAP['BR-SG-OR-001'];
};

const DEFAULT_PIECES = [
    {
        id: 'piece-dummy-1',
        piece_code: 'BR-SG-OR-001',
        name: 'Origin Link Bracelet',
        image: 'https://api.pintaara.com/storage/products/images/media_1792447747_cULJbwzt.png',
        metal_purity: '22KT (91.6% Royal Gold)',
        finish: 'Yellow Gold',
        gem: 'Natural Diamond (VVS-VS)',
        size: 'Standard',
        acquired_at: '21 Oct 2026',
        order_number: 'PT-2026-TKWEJG',
        certificate_number: 'BIS-CERT-772910',
        certificate_url: '',
    }
];

export default function AccountCollectionPage() {
    const { user } = useAuth();
    const [pieces, setPieces] = useState(DEFAULT_PIECES);
    const [catalogMap, setCatalogMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [downloadingPieceId, setDownloadingPieceId] = useState(null);
    const [pdfTargetPiece, setPdfTargetPiece] = useState(null);

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                api.getProducts().then((prodRes) => {
                    if (prodRes && prodRes.status === 'success' && Array.isArray(prodRes.data)) {
                        const map = {};
                        prodRes.data.forEach((p) => {
                            const c = String(p.design_code || p.code || p.id || '').toUpperCase().trim();
                            let imgUrl = '';
                            if (Array.isArray(p.images) && p.images.length > 0) {
                                imgUrl = typeof p.images[0] === 'string' ? p.images[0] : (p.images[0]?.url || '');
                            }
                            if (!imgUrl && p.primary_image) {
                                imgUrl = typeof p.primary_image === 'string' ? p.primary_image : (p.primary_image?.url || '');
                            }
                            if (c && imgUrl) {
                                map[c] = resolveCertFileUrl(imgUrl);
                            }
                        });
                        setCatalogMap(map);
                    }
                }).catch(() => {});

                const res = await api.getUserCollection();
                if (res && (res.status === 'success' || res.success) && Array.isArray(res.data) && res.data.length > 0) {
                    setPieces(res.data);
                } else if (Array.isArray(res) && res.length > 0) {
                    setPieces(res);
                } else {
                    setPieces(DEFAULT_PIECES);
                }
            } catch (err) {
                console.warn('Failed to load user collection:', err);
                setPieces(DEFAULT_PIECES);
            } finally {
                setLoading(false);
            }
        };
        fetchCollection();
    }, []);

    const handleDownloadCertificate = (piece) => {
        setSelectedCertificate({
            ...piece,
            cert_title: 'Certificate of Authenticity',
            cert_number: piece.certificate_number || 'BIS-CERT-772910',
            cert_url: piece.certificate_url,
            verification_url: piece.gov_portal_url || 'https://www.manakonline.in/MANAK/hallmarkHuidVerification',
        });
    };

    const handleDownloadSpecificCertificate = async (piece, cert) => {
        const fileUrl = cert?.certificate_url || piece?.certificate_url;
        if (!fileUrl || typeof fileUrl !== 'string' || fileUrl.includes('sample-certificate.pdf')) {
            return;
        }

        const resolved = resolveCertFileUrl(fileUrl);
        const cleanName = cert?.name ? cert.name.replace(/^Download\s+/i, '').replace(/\s+/g, '-') : 'Certificate';
        const ext = resolved.split('.').pop()?.split(/[?#]/)[0] || 'pdf';
        const downloadFilename = `${cleanName}-${piece.order_number || piece.id || 'PNT'}.${ext}`;

        const downloadUrl = `/api/download?url=${encodeURIComponent(resolved)}&filename=${encodeURIComponent(downloadFilename)}`;
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = downloadFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleDownloadInvoice = async (piece) => {
        if (!piece || downloadingPieceId) return;
        const pieceKey = piece.order_number || piece.id || 'INV-001';
        try {
            setDownloadingPieceId(pieceKey);
            setPdfTargetPiece(piece);

            // Wait briefly for offscreen DOM element to render and settle
            await new Promise((resolve) => setTimeout(resolve, 350));

            const container = document.getElementById('hidden-invoice-pdf-capture');
            const sheet = container?.querySelector('#official-invoice-print-area') || container;
            if (!sheet) {
                throw new Error('Invoice template container not found');
            }

            const { downloadInvoicePdfFromElement } = await import('@/lib/downloadInvoicePdf');
            const filename = `Invoice-${piece.order_number || 'PNT001'}.pdf`;
            await downloadInvoicePdfFromElement(sheet, filename);
        } catch (err) {
            console.error('Direct PDF download error:', err);
        } finally {
            setDownloadingPieceId(null);
            setPdfTargetPiece(null);
        }
    };

    return (
        <div className="acct-collection-page">
            {/* Header */}
            <div className="acct-collection-header">
                <h1 className="acct-col-title">MY COLLECTION</h1>
                <div className="acct-col-divider" />
            </div>

            {/* Pieces */}
            <div className="acct-pieces-container">
                {loading ? (
                    <div style={{ padding: '3rem 0', color: '#6C645C', fontSize: '0.85rem', letterSpacing: '0.08em' }}>
                        LOADING YOUR COLLECTION...
                    </div>
                ) : pieces.length === 0 ? (
                    <div style={{ padding: '3.5rem 0', color: '#6C645C', fontSize: '0.85rem', letterSpacing: '0.08em', display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'flex-start' }}>
                        <p style={{ margin: 0, textTransform: 'uppercase' }}>NO ACQUIRED PIECES IN YOUR COLLECTION YET.</p>
                        <a 
                            href="/collection" 
                            style={{
                                display: 'inline-block',
                                border: '1px solid #1A1A1A',
                                padding: '10px 24px',
                                color: '#1A1A1A',
                                textDecoration: 'none',
                                fontSize: '0.78rem',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                            }}
                        >
                            Explore Atelier Collection
                        </a>
                    </div>
                ) : (
                    pieces.map((piece, index) => {
                        const validCerts = getValidCertificates(piece);
                        const displayImage = resolvePieceImage(piece, catalogMap);

                        return (
                            <div key={piece.id || index} className="acct-piece-row">
                                <div className="acct-piece-thumb">
                                    <img
                                        src={displayImage}
                                        alt={piece.piece_code || piece.name}
                                        className="acct-thumb-img"
                                        onError={(e) => {
                                            const code = String(piece.piece_code || '').toUpperCase();
                                            const fallback = PRODUCT_IMAGE_MAP[code] || PRODUCT_IMAGE_MAP['BR-SG-OR-001'];
                                            if (e.target.src !== fallback) {
                                                e.target.onerror = null;
                                                e.target.src = fallback;
                                            }
                                        }}
                                    />
                                </div>

                                <div className="acct-piece-center">
                                    <h2 className="acct-piece-title">{piece.piece_code || piece.name}</h2>
                                    
                                    {piece.gem || piece.size ? (
                                        <div className="acct-spec-table">
                                            <div className="acct-spec-row">
                                                <span className="acct-spec-label">Metal:</span>
                                                <span className="acct-spec-val">{piece.metal_purity || '18KT'}</span>
                                            </div>
                                            {piece.finish && (
                                                <div className="acct-spec-row">
                                                    <span className="acct-spec-label">Finish:</span>
                                                    <span className="acct-spec-val">{piece.finish}</span>
                                                </div>
                                            )}
                                            {piece.gem && (
                                                <div className="acct-spec-row">
                                                    <span className="acct-spec-label">Gem:</span>
                                                    <span className="acct-spec-val">{piece.gem}</span>
                                                </div>
                                            )}
                                            {piece.size && (
                                                <div className="acct-spec-row">
                                                    <span className="acct-spec-label">Size:</span>
                                                    <span className="acct-spec-val">{piece.size}</span>
                                                </div>
                                            )}
                                            <div className="acct-spec-row">
                                                <span className="acct-spec-label">Acquired:</span>
                                                <span className="acct-spec-val">{piece.acquired_at || 'Recent'}</span>
                                            </div>
                                            <div className="acct-spec-row" style={{ marginTop: '0.4rem' }}>
                                                <span className="acct-spec-label">Order Ref:</span>
                                                <span className="acct-spec-val">{piece.order_number || '—'}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="acct-piece-meta-block">
                                                <p className="acct-piece-text">{piece.metal_purity || '18KT'}</p>
                                                <p className="acct-piece-text">Acquired on {piece.acquired_at || 'Recent'}</p>
                                            </div>

                                            <div className="acct-piece-meta-block">
                                                <p className="acct-piece-text">Order Ref: {piece.order_number || '—'}</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                            <div className="acct-piece-actions">
                                <button
                                    type="button"
                                    className="acct-download-link"
                                    onClick={() => handleDownloadInvoice(piece)}
                                    disabled={downloadingPieceId === (piece.order_number || piece.id || 'INV-001')}
                                    title="Download Official Tax Invoice PDF directly"
                                >
                                    <DocumentOutlineIcon />
                                    <span>
                                        {downloadingPieceId === (piece.order_number || piece.id || 'INV-001')
                                            ? 'Downloading PDF...'
                                            : 'Download Invoice'}
                                    </span>
                                </button>

                                {validCerts.map((cert, certIdx) => {
                                    const cleanName = cert.name ? cert.name.replace(/^Download\s+/i, '') : 'Certificate';
                                    return (
                                        <button
                                            key={cert.id || certIdx}
                                            type="button"
                                            className="acct-download-link"
                                            onClick={() => handleDownloadSpecificCertificate(piece, cert)}
                                        >
                                            <DocumentOutlineIcon />
                                            <span>Download {cleanName}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                }))}
            </div>

            {/* Official BIS Hallmark & Authenticity Certificate Modal */}
            {selectedCertificate && (
                <div className="cert-modal-overlay" onClick={() => setSelectedCertificate(null)}>
                    <div className="cert-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="cert-modal-header">
                            <div className="cert-badge-row">
                                <span className="cert-gold-seal">★ BIS HALLMARK VERIFIED</span>
                                <span className="cert-date-tag">{selectedCertificate.acquired_at || 'August 2026'}</span>
                            </div>
                            <h2 className="cert-modal-title">
                                {selectedCertificate.cert_title ? selectedCertificate.cert_title.toUpperCase() : 'CERTIFICATE OF AUTHENTICITY'}
                            </h2>
                            <p className="cert-modal-subtitle">BUREAU OF INDIAN STANDARDS &middot; ATELIER ARCHIVE</p>
                        </div>

                        <div className="cert-body-content">
                            <div className="cert-spec-grid">
                                <div className="cert-spec-item">
                                    <span className="cert-label">Piece Design Code</span>
                                    <span className="cert-val">{selectedCertificate.piece_code || selectedCertificate.name}</span>
                                </div>
                                <div className="cert-spec-item">
                                    <span className="cert-label">Precious Metal Purity</span>
                                    <span className="cert-val">{selectedCertificate.metal_purity || '18KT Gold (750 Fine)'}</span>
                                </div>
                                <div className="cert-spec-item">
                                    <span className="cert-label">Hallmark Unique ID (HUID)</span>
                                    <span className="cert-val cert-huid-highlight">
                                        {selectedCertificate.huid || 'HUID-984210'}
                                    </span>
                                </div>
                                <div className="cert-spec-item">
                                    <span className="cert-label">Certificate Ref No.</span>
                                    <span className="cert-val">
                                        {selectedCertificate.cert_number || selectedCertificate.certificate_number || 'BIS-CERT-772910'}
                                    </span>
                                </div>
                                <div className="cert-spec-item">
                                    <span className="cert-label">Order Reference</span>
                                    <span className="cert-val">{selectedCertificate.order_number || 'PNT001'}</span>
                                </div>
                                <div className="cert-spec-item">
                                    <span className="cert-label">Assay Stamping</span>
                                    <span className="cert-val">Laser Stamped Hallmark (BIS Standard)</span>
                                </div>
                                <div className="cert-spec-item" style={{ gridColumn: 'span 2' }}>
                                    <span className="cert-label">Government / Lab Verification</span>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                                        <span className="cert-val" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#047857' }}>
                                            ✓ Official Bureau of Indian Standards (BIS) / Lab Verifiable
                                        </span>
                                        <a
                                            href={selectedCertificate.verification_url || "https://www.manakonline.in/MANAK/hallmarkHuidVerification"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="cert-ext-link"
                                        >
                                            🏛️ Verify on Govt. Portal ↗
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="cert-authenticity-declaration">
                                This certificate guarantees that the above bespoke jewellery piece has undergone rigorous assay auditing, hallmark verification, and meets all mandated standards of purity as prescribed under the Bureau of Indian Standards (BIS) Act.
                            </div>
                        </div>

                        <div className="cert-actions-bar">
                            <button
                                type="button"
                                className="cert-btn-secondary"
                                onClick={() => setSelectedCertificate(null)}
                            >
                                Close
                            </button>
                            <a
                                href={selectedCertificate.verification_url || "https://www.manakonline.in/MANAK/hallmarkHuidVerification"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cert-btn-gov"
                                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                            >
                                🏛️ Verify on Govt. Portal ↗
                            </a>
                            {(selectedCertificate.cert_url || selectedCertificate.certificate_url) && (
                                <a
                                    href={resolveCertFileUrl(selectedCertificate.cert_url || selectedCertificate.certificate_url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cert-btn-secondary"
                                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    📄 Open Attached File
                                </a>
                            )}
                            <button
                                type="button"
                                className="cert-btn-primary"
                                onClick={() => window.print()}
                            >
                                🖨 Print / Save PDF Certificate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Offscreen Invisible Render Container for Direct Zero-Popup PDF Export */}
            {pdfTargetPiece && (
                <div
                    id="hidden-invoice-pdf-capture"
                    style={{
                        position: 'fixed',
                        left: '-9999px',
                        top: 0,
                        width: '210mm',
                        backgroundColor: '#ffffff',
                        opacity: 1,
                        zIndex: -9999,
                        pointerEvents: 'none',
                    }}
                >
                    <OfficialInvoice
                        invoice={pdfTargetPiece}
                        user={user}
                        isStandalone={true}
                    />
                </div>
            )}

            {/* Official Tax Invoice Modal */}
            {selectedInvoice && (
                <OfficialInvoice
                    invoice={selectedInvoice}
                    user={user}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}

            <style jsx>{`
                .acct-collection-page {
                    width: 100%;
                    max-width: 950px;
                }
                .acct-collection-header {
                    margin-bottom: 2rem;
                }
                .acct-col-title {
                    font-size: 1.4rem;
                    font-weight: 500;
                    letter-spacing: 0.04em;
                    color: #1A1A1A;
                    margin: 0 0 1.25rem 0;
                }
                .acct-col-divider {
                    width: 100%;
                    height: 1px;
                    background-color: #D6D2C8;
                }

                .acct-pieces-container {
                    display: flex;
                    flex-direction: column;
                    gap: 3.5rem;
                }

                .acct-piece-row {
                    display: grid;
                    grid-template-columns: 200px 1fr 280px;
                    gap: 3rem;
                    align-items: start;
                }

                .acct-piece-thumb {
                    width: 200px;
                    height: 200px;
                    overflow: hidden;
                    flex-shrink: 0;
                    background: #FFFFFF;
                    border: 1px solid #EBE7DF;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .acct-thumb-img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    padding: 12px;
                    display: block;
                    transition: transform 0.3s ease;
                }
                .acct-piece-thumb:hover .acct-thumb-img {
                    transform: scale(1.04);
                }

                .acct-piece-center {
                    display: flex;
                    flex-direction: column;
                }
                .acct-piece-title {
                    font-size: 1.15rem;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                    color: #1A1A1A;
                    margin: 0 0 1.2rem 0;
                }
                .acct-piece-meta-block {
                    margin-bottom: 1.2rem;
                }
                .acct-piece-text {
                    font-size: 0.95rem;
                    color: #1A1A1A;
                    margin: 0 0 0.35rem 0;
                    line-height: 1.4;
                }

                .acct-spec-table {
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                }
                .acct-spec-row {
                    display: grid;
                    grid-template-columns: 85px 1fr;
                    font-size: 0.95rem;
                    color: #1A1A1A;
                    line-height: 1.4;
                }
                .acct-spec-label {
                    color: #1A1A1A;
                }
                .acct-spec-val {
                    color: #1A1A1A;
                }

                .acct-piece-actions {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 1.25rem;
                    padding-top: 0.2rem;
                }
                .acct-download-link {
                    background: none;
                    border: none;
                    padding: 0;
                    margin: 0;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.9rem;
                    font-size: 0.95rem;
                    color: #1A1A1A;
                    cursor: pointer;
                    text-align: left;
                    font-family: inherit;
                    transition: opacity 0.2s ease;
                }
                .acct-download-link:hover {
                    opacity: 0.7;
                }

                /* Modals Styling */
                .cert-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(28, 25, 23, 0.72);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 20px;
                }
                .cert-modal-card {
                    background: #FAF8F5;
                    border: 2px solid #D4AF37;
                    border-radius: 4px;
                    width: 100%;
                    max-width: 600px;
                    padding: 2.2rem;
                    box-shadow: 0 24px 48px rgba(0,0,0,0.25);
                }
                .cert-badge-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.8rem;
                }
                .cert-gold-seal {
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    color: #927218;
                    background: rgba(212, 175, 55, 0.15);
                    padding: 3px 8px;
                    border-radius: 2px;
                    border: 1px solid rgba(212, 175, 55, 0.4);
                }
                .cert-date-tag {
                    font-size: 0.75rem;
                    color: #78716C;
                }
                .cert-modal-title {
                    font-size: 1.35rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    color: #1C1917;
                    margin: 0;
                    text-transform: uppercase;
                }
                .cert-modal-subtitle {
                    font-size: 0.76rem;
                    letter-spacing: 0.14em;
                    color: #78716C;
                    margin: 0.35rem 0 1.5rem 0;
                }
                .cert-spec-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    padding: 1.25rem 0;
                    border-top: 1px solid #E7E3DC;
                    border-bottom: 1px solid #E7E3DC;
                }
                .cert-spec-item {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .cert-label {
                    font-size: 0.72rem;
                    letter-spacing: 0.08em;
                    color: #78716C;
                    text-transform: uppercase;
                }
                .cert-val {
                    font-size: 0.88rem;
                    font-weight: 600;
                    color: #1C1917;
                }
                .cert-huid-highlight {
                    color: #B45309;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                }
                .cert-authenticity-declaration {
                    margin-top: 1.2rem;
                    font-size: 0.78rem;
                    line-height: 1.5;
                    color: #57534E;
                    font-style: italic;
                }
                .cert-actions-bar {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 1.8rem;
                }
                .cert-btn-secondary {
                    background: transparent;
                    border: 1px solid #A8A29E;
                    color: #292524;
                    padding: 8px 16px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    letter-spacing: 0.06em;
                    cursor: pointer;
                    border-radius: 2px;
                }
                .cert-btn-primary {
                    background: #1C1917;
                    border: 1px solid #1C1917;
                    color: #FAF8F5;
                    padding: 8px 18px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    letter-spacing: 0.06em;
                    cursor: pointer;
                    border-radius: 2px;
                }
                .cert-btn-gov {
                    background: rgba(212, 175, 55, 0.12);
                    border: 1px solid #D4AF37;
                    color: #785A14;
                    padding: 8px 16px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                    cursor: pointer;
                    border-radius: 2px;
                    transition: all 0.2s;
                }
                .cert-btn-gov:hover {
                    background: rgba(212, 175, 55, 0.22);
                    color: #533e0d;
                }
                .cert-ext-link {
                    font-size: 0.76rem;
                    font-weight: 600;
                    color: #1d4ed8;
                    text-decoration: underline;
                    letter-spacing: 0.02em;
                }
                .acct-gov-verify-link {
                    font-size: 0.68rem;
                    font-weight: 600;
                    color: #927218;
                    background: rgba(212, 175, 55, 0.12);
                    border: 1px solid rgba(212, 175, 55, 0.4);
                    padding: 2px 7px;
                    border-radius: 3px;
                    text-decoration: none;
                    letter-spacing: 0.03em;
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    transition: all 0.2s;
                }
                .acct-gov-verify-link:hover {
                    background: rgba(212, 175, 55, 0.25);
                    color: #69500c;
                }

                @media (max-width: 900px) {
                    .acct-piece-row {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                    .acct-piece-thumb {
                        width: 160px;
                        height: 160px;
                    }
                }
            `}</style>
        </div>
    );
}

function DocumentOutlineIcon() {
    return (
        <svg
            width="17"
            height="21"
            viewBox="0 0 16 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
        >
            <path
                d="M1 1H11L15 5V19H1V1Z"
                stroke="#1A1A1A"
                strokeWidth="1.2"
                strokeLinejoin="round"
            />
            <path
                d="M11 1V5H15"
                stroke="#1A1A1A"
                strokeWidth="1.2"
                strokeLinejoin="round"
            />
        </svg>
    );
}
