'use client';

/**
 * Direct client-side PDF download without opening any popup window or print dialog.
 * Uses html2canvas + jsPDF with 2x retina scale for crystal-clear luxury typography.
 */
export async function downloadInvoicePdfFromElement(element, filename = 'Invoice.pdf') {
    if (!element) {
        throw new Error('Target invoice element not found for PDF generation');
    }

    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    // Ensure all images (logo lockup, signature) are fully loaded
    const images = element.querySelectorAll('img');
    await Promise.all(
        Array.from(images).map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        })
    );

    // Render DOM element to high-res canvas
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
}
