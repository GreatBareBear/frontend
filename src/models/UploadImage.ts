import { ImageFile } from 'react-dropzone'
import BigNumber from 'bignumber.js'

export interface UploadImage {
  name: string
  preview: string
  category: string
  type: string
  author: string
  file: ImageFile
}