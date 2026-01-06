// Vibrant retro colors for wheel segments
export const RETRO_COLORS = [
    '#FF6B6B', // Coral Red
    '#4ECDC4', // Teal
    '#FFE66D', // Yellow
    '#95E1D3', // Mint
    '#F38181', // Salmon
    '#AA96DA', // Lavender
    '#FCBAD3', // Pink
    '#A8D8EA', // Sky Blue
    '#C9E4DE', // Pale Green
    '#FAAB78', // Peach
    '#DDA0DD', // Plum
    '#98D8C8', // Seafoam
    '#F7DC6F', // Gold
    '#BB8FCE', // Purple
    '#85C1E9', // Light Blue
];

// Shuffle colors using Fisher-Yates algorithm
export function shuffleColors(colors = RETRO_COLORS) {
    const shuffled = [...colors];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Get colors for wheel ensuring adjacent segments have different colors
export function getWheelColors(count, baseColors = RETRO_COLORS) {
    const colors = [];
    let lastColorIndex = -1;

    for (let i = 0; i < count; i++) {
        let colorIndex;
        do {
            colorIndex = i % baseColors.length;
            // If same as last, offset by 1
            if (colorIndex === lastColorIndex) {
                colorIndex = (colorIndex + 1) % baseColors.length;
            }
        } while (colorIndex === lastColorIndex && baseColors.length > 1);

        colors.push(baseColors[colorIndex]);
        lastColorIndex = colorIndex;
    }

    return colors;
}

// Check if two colors are too similar (simplified)
export function areColorsSimilar(color1, color2) {
    // Simple check - if both are same, they're similar
    return color1 === color2;
}
