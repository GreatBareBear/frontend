import { ImageFile } from 'react-dropzone'

export interface UploadImage {
  name: string
  preview: string
  category: string
  type: string
  author: string
  width?: number
  height?: number
  file: ImageFile
}