import InfoIcon from '@material-ui/icons/Info'
import { GridListTileBar, IconButton } from 'material-ui'
import * as React from 'react'
import { withStyles, WithStyles } from './withStyles'
import { Image } from '../models/Image'

const styles = () => ({
  galleryImagePlaceholder: {
    width: '200px',
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

interface GalleryImageReferences {
  placeholder: HTMLDivElement,
  tileBar: HTMLDivElement
}

type GalleryImageProps = WithStyles & {
  imageReference: Image,
  onLoad?: () => void,
  onError?: () => void
}

@withStyles(styles)
export default class GalleryImage extends React.Component<GalleryImageProps> {
  references: GalleryImageReferences = {} as GalleryImageReferences

  constructor(props: GalleryImageProps) {
    super(props)
  }

  showImage() {
    this.references.placeholder.style.display = 'none'
    this.references.tileBar.style.display = ''

    this.props.onLoad()
  }

  render() {
    const { classes } = this.props

    console.log(this.props.imageReference.src)

    return (
      <div key={this.props.imageReference.index} className='GalleryImage'>
        <img onLoad={() => this.showImage()} src={this.props.imageReference.src} alt={this.props.imageReference.name} title={this.props.imageReference.name}/>
        <div ref={(ref) => this.references.placeholder = ref} className={classes.galleryImagePlaceholder}/>
        <div ref={(ref) => this.references.tileBar = ref} style={{ display: 'none' }}>
          <GridListTileBar title={this.props.imageReference.name} subtitle={<span>By: {this.props.imageReference.author}</span>} actionIcon={
            <IconButton style={{ color: 'rgba(255, 255, 255, 0.54)' }}> <InfoIcon/> </IconButton>
          }/>
        </div>
      </div>
    )
  }
}