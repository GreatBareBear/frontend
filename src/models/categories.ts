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
  const index = categories.indexOf(category)

  return index === 0 ? 0 : index - 1
}

export function isValidCategory(categoryQueryName: string) {
  return categories.includes(categoryQueryName)
}