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
    document.execCommand('copy')
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
  const blob = b64toBlob(base64.replace('data:' + type + ';base64,', ''), type)
  FileSaver.saveAs(blob, name)
}

export function getImageBrightness(imageSrc,callback,left = 0,top = 0) {

    const img = document.createElement('img')
    img.src = imageSrc

    img.style.display = 'none'
    document.body.appendChild(img)

    let colorSum = 0

    img.onload = () => {
        // create canvas
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img,0,0)
        
        if (left === 0 && top === 0) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data
          let r = 0
          let g = 0
          let b = 0
          let avg = 0

          for (let x = 0, len = data.length; x < len; x += 4) {
            r = data[x]
            g = data[x + 1]
            b = data[x + 2]

            avg = Math.floor((r + g + b) / 3)
            colorSum += avg
          }
        } else {
          const imageData = ctx.getImageData(left, top, left, top)
          const data = imageData.data
          let r = 0
          let g = 0
          let b = 0
          let avg = 0

          for (let x = 0, len = data.length; x < len; x += 4) {
            r = data[x]
            g = data[x + 1]
            b = data[x + 2]

            avg = Math.floor((r + g + b) / 3)
            colorSum += avg
          }
        }
        
        const brightness = Math.floor(colorSum / (img.width*img.height))
        img.parentNode.removeChild(img)
        callback(brightness)
    }
}
