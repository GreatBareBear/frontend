export const categories: string[] = [
  'Random',
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