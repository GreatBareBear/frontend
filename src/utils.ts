export function chunkString(text: string, chunkSize: number): string[] {
  const result = []

  for (let index = 0; index < text.length; index += chunkSize) {
    result.push(text.slice(index, index + chunkSize))
  }

  return result
}

export function removeUndefined(object: {}) {
  const result = {}

  for (const key in object) {
    const value = object[key]

    if (value !== undefined && value !== null && value !== 'undefined' && value !== 'null') {
      result[key] = value
    }
  }

  return result
}