import { jsPDF } from 'jspdf';

// Export groups to PDF
export function exportGroupsToPdf(groups, totalMembers, groupCount) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Hasil Pembagian Kelompok', pageWidth / 2, 22, { align: 'center' });

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, 27, pageWidth - 20, 27);

    // Info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Total: ${totalMembers} anggota - ${groupCount} kelompok`, pageWidth / 2, 34, { align: 'center' });
    doc.text(`Waktu: ${new Date().toLocaleString()}`, pageWidth / 2, 40, { align: 'center' });

    let y = 52;

    groups.forEach((group) => {
        // Check if we need a new page
        const estimatedHeight = 12 + group.members.length * 8;
        if (y + estimatedHeight > 275) {
            doc.addPage();
            y = 20;
        }

        // Group header
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text(`${group.name} (${group.members.length} orang)`, 20, y);
        y += 3;

        // Underline
        doc.setDrawColor(233, 69, 96);
        doc.setLineWidth(0.8);
        doc.line(20, y, 80, y);
        y += 7;

        // Members
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        group.members.forEach((member, i) => {
            doc.text(`${i + 1}. ${member.name}`, 25, y);
            y += 7;
        });

        y += 8;
    });

    doc.save(`kelompok-${Date.now()}.pdf`);
}

// Export history to TXT file
export function exportToTxt(history) {
    const lines = [
        '🎰 GACHA WHEEL - SPIN HISTORY',
        '═'.repeat(40),
        '',
        ...history.map((item, index) => {
            const date = new Date(item.timestamp);
            const timeStr = date.toLocaleString();
            return `${index + 1}. ${item.name} - ${timeStr} (Seed: ${item.seed})`;
        }),
        '',
        '═'.repeat(40),
        `Total Spins: ${history.length}`,
    ];

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `gacha-history-${Date.now()}.txt`;
    a.click();

    URL.revokeObjectURL(url);
}

// Export wheel as PNG using canvas
export function exportWheelToPng(wheelElement) {
    return new Promise((resolve, reject) => {
        try {
            // Use html2canvas if available, otherwise fallback to SVG serialization
            const svgElement = wheelElement.querySelector('svg');
            if (!svgElement) {
                reject(new Error('No SVG element found'));
                return;
            }

            const svgData = new XMLSerializer().serializeToString(svgElement);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
                canvas.width = img.width || 500;
                canvas.height = img.height || 500;
                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    const pngUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = pngUrl;
                    a.download = `gacha-wheel-${Date.now()}.png`;
                    a.click();
                    URL.revokeObjectURL(pngUrl);
                    URL.revokeObjectURL(url);
                    resolve();
                });
            };

            img.onerror = reject;
            img.src = url;
        } catch (error) {
            reject(error);
        }
    });
}
