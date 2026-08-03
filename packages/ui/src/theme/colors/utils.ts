/**
 * Generates a single color from string
 */
export const generateColorFromString = (str: string): string => {
    if (!str) return '#e2e8f0';

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate cleaner, subdued HSL color
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 35%, 65%)`;
};

/**
 * Generates pair of colors from string
 */
export function generatePairOfColorsFromString(string?: string): [string, string] {
    if (!string) return ['#7A8490', '#5D6673']; // Clean, subdued default colors

    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate more muted, elegant base hue
    const hue1 = Math.abs(hash % 360);
    // Create a complementary hue with lesser contrast
    const hue2 = (hue1 + 25 + (hash % 60)) % 360;

    // Clean but subdued colors: moderate saturation with higher lightness
    const color1 = `hsl(${hue1}, 35%, 65%)`;
    const color2 = `hsl(${hue2}, 30%, 55%)`;

    return [color1, color2];
}

