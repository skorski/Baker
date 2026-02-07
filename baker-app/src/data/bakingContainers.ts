export interface BakingContainer {
  id: string;
  label: string;
}

export const bakingContainers: BakingContainer[] = [
  { id: 'loaf-pan', label: 'Loaf Pan (9×5)' },
  { id: 'dutch-oven', label: 'Dutch Oven' },
  { id: 'sheet-pan', label: 'Sheet Pan' },
  { id: 'pizza-stone', label: 'Pizza Stone' },
  { id: 'cast-iron', label: 'Cast Iron Skillet' },
  { id: 'baking-steel', label: 'Baking Steel' },
  { id: 'none', label: 'No Container' },
];
