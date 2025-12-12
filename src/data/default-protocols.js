/**
 * Default exercise timer protocols
 */
export const defaultProtocols = [
  {
    id: 'iwt',
    name: 'Japanese Walking',
    description: '5 sets alternating slow and fast pace',
    sets: 5,
    prepTime: 10,
    restBetweenSets: 10,
    intervals: [
      { label: 'Slow pace', duration: 180 },
      { label: 'Fast pace', duration: 180 }
    ]
  },
  {
    id: 'tabata',
    name: 'Tabata Protocol',
    description: '8 sets of 20s high intensity work',
    sets: 8,
    prepTime: 10,
    restBetweenSets: 10,
    intervals: [
      { label: 'Work hard!', duration: 20 }
    ]
  },
  {
    id: 'hiit',
    name: 'Basic HIIT',
    description: '6 sets of 45s high intensity work',
    sets: 6,
    prepTime: 15,
    restBetweenSets: 60,
    intervals: [
      { label: 'High intensity', duration: 45 }
    ]
  }
]

