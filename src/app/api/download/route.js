import { NextResponse } from 'next/server';

/**
 * Universal Direct File Downloader API Route
 * Bypasses cross-origin restrictions and forces the browser to directly download
 * any certificate, invoice, or document file using Content-Disposition: attachment.
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const fileUrl = searchParams.get('url');
        const customFilename = searchParams.get('filename') || 'Pintaara-Document.pdf';

        if (!fileUrl) {
            return new NextResponse('File URL is required', { status: 400 });
        }

        let targetUrl = fileUrl.trim();

        // 1. Resolve relative URLs to absolute URLs
        if (targetUrl.startsWith('/')) {
            if (targetUrl.startsWith('/images/uploads/') || targetUrl.startsWith('/storage/')) {
                targetUrl = `https://admin.pintaara.com${targetUrl}`;
            } else {
                const origin = new URL(request.url).origin;
                targetUrl = `${origin}${targetUrl}`;
            }
        }

        // 2. Fetch file server-side (bypasses CORS completely)
        let response = null;
        try {
            response = await fetch(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PintaaraDownloadProxy/1.0',
                },
            });
        } catch (fetchErr) {
            console.warn('Initial download fetch failed for:', targetUrl, fetchErr);
        }

        // 3. Fallback: if not found or failed, try switching between www and admin domains
        if (!response || !response.ok) {
            let altUrl = null;
            if (targetUrl.includes('www.pintaara.com')) {
                altUrl = targetUrl.replace('www.pintaara.com', 'admin.pintaara.com');
            } else if (targetUrl.includes('admin.pintaara.com')) {
                altUrl = targetUrl.replace('admin.pintaara.com', 'www.pintaara.com');
            } else if (!targetUrl.startsWith('http')) {
                altUrl = `https://admin.pintaara.com/${targetUrl.replace(/^\/+/, '')}`;
            }

            if (altUrl && altUrl !== targetUrl) {
                try {
                    const altRes = await fetch(altUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PintaaraDownloadProxy/1.0',
                        },
                    });
                    if (altRes.ok) {
                        response = altRes;
                    }
                } catch (altErr) {
                    console.warn('Alt download fetch failed for:', altUrl, altErr);
                }
            }
        }

        if (!response || !response.ok) {
            return new NextResponse('Failed to fetch file from storage', { status: response ? response.status : 404 });
        }

        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const fileBuffer = await response.arrayBuffer();

        // Sanitize download filename
        const safeFilename = customFilename.replace(/[^a-zA-Z0-9._-]/g, '_');

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${safeFilename}"`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Direct download proxy error:', error);
        return new NextResponse('Internal server error downloading file', { status: 500 });
    }
}
