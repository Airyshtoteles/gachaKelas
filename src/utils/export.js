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
