const CELL = 10; // each cell = 10×10 SVG units → 240×240 viewport

export function svgFromPixels(grid: boolean[][]): string {
  const rects: string[] = [];
  for (let row = 0; row < 24; row++) {
    for (let col = 0; col < 24; col++) {
      if (grid[row]?.[col]) {
        rects.push(
          `<rect x="${col * CELL}" y="${row * CELL}" width="${CELL}" height="${CELL}" fill="black"/>`
        );
      }
    }
  }
  if (rects.length === 0) return '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">${rects.join('')}</svg>`;
}

export function createEmptyGrid(): boolean[][] {
  return Array.from({ length: 24 }, () => Array(24).fill(false));
}

export function createHeartGrid(): boolean[][] {
  const grid = createEmptyGrid();
  // Heart pattern (24x24), centered
  const pattern = [
    '000000000000000000000000',
    '000000000000000000000000',
    '000000000000000000000000',
    '000000000000000000000000',
    '000001111000001111000000',
    '000111111110011111100000',
    '001111111111111111110000',
    '001111111111111111110000',
    '001111111111111111110000',
    '000111111111111111100000',
    '000011111111111111000000',
    '000001111111111110000000',
    '000000111111111100000000',
    '000000011111111000000000',
    '000000001111110000000000',
    '000000000111100000000000',
    '000000000011000000000000',
    '000000000000000000000000',
    '000000000000000000000000',
    '000000000000000000000000',
    '000000000000000000000000',
    '000000000000000000000000',
    '000000000000000000000000',
    '000000000000000000000000',
  ];
  pattern.forEach((row, r) => {
    row.split('').forEach((cell, c) => {
      if (grid[r]) grid[r][c] = cell === '1';
    });
  });
  return grid;
}
