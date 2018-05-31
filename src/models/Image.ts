import { UploadImage } from './UploadImage'
import BigNumber from 'bignumber.js'

export interface Image {
  id: string
  name: string
  src: string
  author: string
  width: number
  height: number
}

export interface ImageData {
  base64: string
  width: number
  height: number
}

export function calculateImagePrice(image: ImageData): BigNumber {
  return new BigNumber(image.width * image.height).div(18300000)
}

export function getImageData(image: UploadImage): Promise<ImageData> {
  return new Promise<ImageData>((resolve) => {
    const reader = new FileReader()

    reader.readAsDataURL(image.file)

    reader.onloadend = async () => {
      const base64 = reader.result
      const tempImage = new Image()

      tempImage.src = image.preview

      resolve({
        base64,
        width: tempImage.width,
        height: tempImage.height
      } as ImageData)
    }
  })
}