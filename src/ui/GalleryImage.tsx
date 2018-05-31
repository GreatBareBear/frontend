import InfoIcon from '@material-ui/icons/Info'
import { GridListTileBar, IconButton, Tooltip, SvgIcon } from '@material-ui/core'
import * as React from 'react'
import { withStyles, WithStyles } from './withStyles'
import { Image } from '../models/Image'
import { CloudDownload } from '@material-ui/icons'
import { downloadImage, copyTextToClipboard } from '../utils'
import Api from '../api/Api'
import { withApi } from '../api/withApi'

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
  onCardClicked?: () => void,
  onLinkCopied?: () => void,
  api: Api
}

@withStyles(styles)
@withApi()
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

  onTipClicked = () => {
    this.props.api.tip(this.props.imageReference.id)
  }

  onImageClicked(event: React.MouseEvent<HTMLDivElement>) {
    const tagName = (event.target as any).tagName
    if (tagName === 'DIV' || tagName === 'SPAN' || tagName === 'IMG') {
      this.props.onCardClicked()
    }
  }

  render() {
    const { classes } = this.props

    return (
      <div key={this.props.imageReference.id} className='GalleryImage' onClick={(event) => this.onImageClicked(event)}>
        <img onLoad={() => this.showImage()} onError={() => this.showImage()} src={this.props.imageReference.src} alt={this.props.imageReference.name} title={this.props.imageReference.name}/>
        <div ref={(ref) => this.references.placeholder = ref} className={classes.galleryImagePlaceholder}/>
        <div ref={(ref) => this.references.tileBar = ref} style={{ display: 'none' }}>
          <GridListTileBar title={this.props.imageReference.name} subtitle={<span>By: {this.props.imageReference.author}</span>} actionIcon={
            <div style={{ display: 'flex' }}>
              <IconButton onClick={this.onTipClicked}>
                <Tooltip title='Tip'>
                  <SvgIcon style={{
                    width: '29px',
                    height: '29px',
                    marginBottom: '5px'
                  }}>
                    <path fill='rgba(255, 255, 255, 0.54)' d='M5,6H23V18H5V6M14,9A3,3 0 0,1 17,12A3,3 0 0,1 14,15A3,3 0 0,1 11,12A3,3 0 0,1 14,9M9,8A2,2 0 0,1 7,10V14A2,2 0 0,1 9,16H19A2,2 0 0,1 21,14V10A2,2 0 0,1 19,8H9M1,10H3V20H19V22H1V10Z' />
                  </SvgIcon>
                </Tooltip>
              </IconButton>
              <IconButton style={{ color: 'rgba(255, 255, 255, 0.54)' }} onClick={() => {
                copyTextToClipboard(`${window.location.origin}/raw/${this.props.imageReference.id}`)
                this.props.onLinkCopied()
              }}>
                <Tooltip title='Copy link'>
                  <SvgIcon>
                    <path fill='none' d='M0 0h24v24H0z'/>
                    <path d='M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm-1 4l6 6v10c0 1.1-.9 2-2 2H7.99C6.89 23 6 22.1 6 21l.01-14c0-1.1.89-2 1.99-2h7zm-1 7h5.5L14 6.5V12z'/>
                  </SvgIcon>
                </Tooltip>
              </IconButton>
            </div>
          }/>
        </div>
      </div>
    )
  }
}