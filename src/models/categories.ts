export const categories: string[] = [
  'All',
  'Cats',
  'Dogs',
  'Memes',
  'Burgers',
  'Cartoons',
  'Fun',
  'Art',
  'Other'
]

export function getCategoryId(category: string) {
  return categories.indexOf(category)
}

export function isValidCategory(categoryQueryName: string) {
  return categories.includes(categoryQueryName)
}