import InfoIcon from '@material-ui/icons/Info'
import { GridListTileBar, IconButton, Tooltip } from 'material-ui'
import * as React from 'react'
import { withStyles, WithStyles } from './withStyles'
import { Image } from '../models/Image'
import { CloudDownload } from '@material-ui/icons'

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
  onError?: () => void,
  onCardClicked: () => void
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

  onDownloadClicked = () => {
    const src = this.props.imageReference.src
    // TODO: Download
  }

  render() {
    const { classes } = this.props

    return (
      <div key={this.props.imageReference.index} className='GalleryImage' onClick={this.props.onCardClicked}>
        <img onLoad={() => this.showImage()} onError={() => this.showImage()} src={this.props.imageReference.src} alt={this.props.imageReference.name} title={this.props.imageReference.name}/>
        <div ref={(ref) => this.references.placeholder = ref} className={classes.galleryImagePlaceholder}/>
        <div ref={(ref) => this.references.tileBar = ref} style={{ display: 'none' }}>
          <GridListTileBar title={this.props.imageReference.name} subtitle={<span>By: {this.props.imageReference.author}</span>} actionIcon={
            <React.Fragment>
              <IconButton onClick={this.onDownloadClicked} style={{ color: 'rgba(255, 255, 255, 0.54)' }}>
                <Tooltip title='Download'>
                  <CloudDownload/>
                </Tooltip>
              </IconButton>
            </React.Fragment>
          }/>
        </div>
      </div>
    )
  }
}