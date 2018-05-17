export const categories: string[] = [
  'all',
  'cats',
  'dogs',
  'memes',
  'burgers',
  'cartoons',
  'fun',
  'art',
  'other'
]

export function getCategoryId(category: string) {
  return categories.indexOf(category)
}

export function isValidCategory(categoryQueryName: string) {
  return categories.includes(categoryQueryName.toLowerCase())
}