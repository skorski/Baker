export interface DoughProduct {
  id: string;
  name: string;
  weightGrams: number;
  icon: string;
  description: string;
}

export const doughProducts: DoughProduct[] = [
  {
    id: 'loaf',
    name: 'Loaf',
    weightGrams: 850,
    icon: '🍞',
    description: 'Standard sandwich loaf'
  },
  {
    id: 'roll',
    name: 'Roll',
    weightGrams: 50,
    icon: '🥖',
    description: 'Dinner roll'
  },
  {
    id: 'pizza 16in',
    name: 'Pizza 16in',
    weightGrams: 685,
    icon: '🍕',
    description: 'Individual pizza base'
  }
];
