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
    weightGrams: 800,
    icon: '🍞',
    description: 'Standard sandwich loaf'
  },
  {
    id: 'roll',
    name: 'Roll',
    weightGrams: 80,
    icon: '🥖',
    description: 'Dinner roll'
  },
  {
    id: 'baguette',
    name: 'Baguette',
    weightGrams: 350,
    icon: '🥖',
    description: 'French baguette'
  },
  {
    id: 'boule',
    name: 'Boule',
    weightGrams: 700,
    icon: '⚫',
    description: 'Round artisan loaf'
  },
  {
    id: 'focaccia',
    name: 'Focaccia',
    weightGrams: 500,
    icon: '🫓',
    description: 'Flatbread sheet'
  },
  {
    id: 'pizza',
    name: 'Pizza',
    weightGrams: 250,
    icon: '🍕',
    description: 'Individual pizza base'
  }
];
