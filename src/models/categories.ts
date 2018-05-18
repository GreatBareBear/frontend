export const categories: string[] = [
  'all',
  'crypto',
  'dogs',
  'cute',
  'memes',
  'programming',
  'games',
  'cars',
  'art',
  'fun',
  'other'
]

export function getCategoryId(category: string) {
  return categories.indexOf(category)
}

export function isValidCategory(categoryQueryName: string) {
  return categories.includes(categoryQueryName.toLowerCase())
}