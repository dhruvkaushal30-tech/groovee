export const SIZE_CHARTS = {
  't-shirts': {
    title: 'T-Shirt size chart',
    unit: 'inches',
    columns: ['Size', 'Chest', 'Length', 'Shoulder'],
    rows: [
      ['S', '48', '26', '23'],
      ['M', '49.5', '27', '23.5'],
      ['L', '50.5', '28', '24'],
      ['XL', '52', '29', '24.5'],
    ],
  },
  hoodies: {
    title: 'Hoodie size chart',
    unit: 'inches',
    columns: ['Size', 'Chest', 'Length', 'Shoulder'],
    rows: [
      ['S', '50', '27', '23.5'],
      ['M', '52', '28', '24'],
      ['L', '54', '29', '24.5'],
      ['XL', '56', '30', '25'],
    ],
  },
  bottoms: {
    title: 'Bottom size chart',
    unit: 'inches',
    columns: ['Size', 'Waist', 'Hip', 'Inseam'],
    rows: [
      ['S', '30', '40', '29'],
      ['M', '32', '42', '30'],
      ['L', '34', '44', '30'],
      ['XL', '36', '46', '31'],
    ],
  },
};

export function chartForCategory(slug) {
  if (slug === 'hoodies') return SIZE_CHARTS.hoodies;
  if (slug === 'bottoms') return SIZE_CHARTS.bottoms;
  return SIZE_CHARTS['t-shirts'];
}
