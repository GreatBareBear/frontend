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