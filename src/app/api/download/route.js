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

        // Fetch file server-side (bypasses CORS completely)
        const response = await fetch(fileUrl);
        if (!response.ok) {
            return new NextResponse('Failed to fetch file from storage', { status: response.status });
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
