import * as FileSaver from 'file-saver'

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

export function pluralize(word: string, count: number) {
  if (count > 1) {
    return word + 's'
  }

  return word
}
export function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    const successful = document.execCommand('copy')
    const msg = successful ? 'successful' : 'unsuccessful'
  } catch (err) {
  }

  document.body.removeChild(textArea)
}
export function copyTextToClipboard(text) {
  const clipboard = (navigator as any).clipboard
  if (!clipboard) {
    fallbackCopyTextToClipboard(text)
    return
  }

  clipboard.writeText(text)
}

function b64toBlob(b64Data, contentType?, sliceSize?) {
  contentType = contentType || ''
  sliceSize = sliceSize || 512

  const byteCharacters = atob(b64Data)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)

    byteArrays.push(byteArray)
  }

  const blob = new Blob(byteArrays, { type: contentType })
  return blob
}

export function downloadImage(name: string, base64: string, type: string) {
  const blob = b64toBlob(base64.replace('data:'+type+';base64,', ''), type)
  FileSaver.saveAs(blob, name)
}