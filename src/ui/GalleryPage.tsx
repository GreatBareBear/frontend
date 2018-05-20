import { CircularProgress, LinearProgress, Typography, Modal, Theme, IconButton, Snackbar, Button, SvgIcon } from '@material-ui/core'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import Masonry from 'react-masonry-component'
import GalleryImage from './GalleryImage'
import { withStyles, WithStyles } from './withStyles'
import { Image } from '../models/Image'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import CloseIcon from '@material-ui/icons/Close'
import { Fade } from '@material-ui/core'
import _ = require('lodash')
import { TransitionUp } from '../routes/UploadImagePage'
import { FileUpload, CloudDownload } from '@material-ui/icons'
import { downloadImage, copyTextToClipboard, getImageBrightness } from '../utils'
import Api from '../api/Api'

const styles = (theme: Theme) => ({
  linearProgress: {
    width: '50%',
    height: '8px',
    borderRadius: '10px'
  },
  noImagesText: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '17px'
  },
  imageLightBox: {
    position: 'absolute',
    outline: 0,
    padding: theme.spacing.unit,
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
    borderRadius: '20px',
    minWidth: '600px'
  } as CSSProperties,
  imageLightBoxDesc: {
    position: 'absolute',
    width: 'calc(100% - ' + theme.spacing.unit * 2 + 'px)',
    color: 'white',
    padding: theme.spacing.unit * 2,
    display: 'flex',
    transform: 'translateY(-100%)',
    justifyContent: 'space-between'
  } as CSSProperties,
  imageLightBoxCloseBtn: {
    color: 'white',
    position: 'absolute',
    right: theme.spacing.unit * 2 + 'px',
    top: theme.spacing.unit * 2 + 'px',
    width: theme.spacing.unit * 4 + 'px',
    height: theme.spacing.unit * 4 + 'px'
  } as CSSProperties
})

type GalleryPageProps = WithStyles & {
  images: Image[],
  pushMoreCallback: (count?: number, append?: boolean) => void,
  infiniteScrollCooldownLength: number,
  currentCategory: string,
  shouldBeLoading: boolean,
  anyImages: boolean,
  api: Api
}

type LightBoxObject = {
  reference: any,
  image: Image,
  isShown: boolean,
  isDark: boolean,
  isCloseDark: boolean
}

@withStyles(styles)
@observer
export default class GalleryPage extends React.Component<GalleryPageProps, any> {
  infiniteScrollCooldownActive = false
  @observable loadedImagesCount = 0
  @observable imagesLoadedPercent = 0
  galleryReference: any
  @observable lightBox: LightBoxObject = {
    image: undefined,
    reference: undefined,
    isShown: false,
    isDark: false,
    isCloseDark: false
  } as LightBoxObject

  @observable linkCopiedSnackbarShown = false

  showLightbox(image: Image) {
    this.hideLightbox()
    getImageBrightness(image.src, (brightness: number) => {
      getImageBrightness(image.src, (brightness2) => {
        this.lightBox.image = image
        this.lightBox.isShown = true
        this.lightBox.isDark = brightness < 127.5
        this.lightBox.isCloseDark = brightness2 < 127.5
      }, image.width - 48, 48)
      
    })
    
  }

  hideLightbox() {
    this.lightBox.image = undefined
    this.lightBox.isShown = false
  }

  constructor(props: GalleryPageProps) {
    super(props)
  }

  handleResize = _.debounce(() => {
    this.forceUpdate()
  }, 250)

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll)
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
    window.removeEventListener('resize', this.handleResize)
  }

  handleScroll = () => {
    if (document.documentElement.scrollHeight - document.documentElement.scrollTop < 1000 && !this.infiniteScrollCooldownActive && this.isGalleryReady && this.isGalleryLoaded) {
      this.props.pushMoreCallback(10, true)
      this.infiniteScrollCooldownActive = true
      setTimeout(() => {
        this.infiniteScrollCooldownActive = false
      }, this.props.infiniteScrollCooldownLength)
    }
  }

  forcePushCooldownActive = false

  updateImage = () => {
    this.loadedImagesCount++
    this.imagesLoadedPercent = this.loadedImagesCount / this.props.images.length * 100

    if (this.isGalleryLoaded) {
      this.imagesLoadedPercent = 0
      // Checks if we can scroll or not.
      // If we can, and we still don't know is there any more images to load, load more images.
      if (this.isGalleryScrollable && this.props.anyImages) {
        if (!this.forcePushCooldownActive) {
          setTimeout(() => this.props.pushMoreCallback(10, true), this.props.infiniteScrollCooldownLength)
          this.forcePushCooldownActive = true
          setTimeout(() => this.forcePushCooldownActive = false, this.props.infiniteScrollCooldownLength / 2)
        }
      }
    }

    this.galleryReference.className = this.generateGalleryClassName()
  }

  get isGalleryLoaded() {
    return (this.loadedImagesCount === this.props.images.length) && this.props.images.length > 0
  }

  get isGalleryScrollable() {
    return document.documentElement.clientHeight < document.documentElement.scrollHeight
  }

  generateGalleryClassName() {
    return 'GalleryPage' + (this.isGalleryReady ? ' GalleryLoaded' : '')
  }

  get isGalleryReady() {
    return (this.isGalleryLoaded || this.isGalleryScrollable)
  }

  componentWillReceiveProps(nextProps: GalleryPageProps) {
    if (nextProps.currentCategory !== this.props.currentCategory || nextProps.images.length === 0) {
      this.loadedImagesCount = 0

      return true
    } else {
      return nextProps.images !== this.props.images || !this.isGalleryLoaded
    }
  }

  // Deprecated by MobX API, shouldComponentUpdate function should only be handled by MobX's observer.
  // Fixes the gallery scrolling issue where scrolling wouldn't update the component (and that is required).
  shouldComponentUpdate(nextProps: GalleryPageProps) {
    return nextProps.images !== this.props.images || !this.isGalleryLoaded || nextProps.shouldBeLoading !== this.props.shouldBeLoading
  }

  render() {
    const { classes, images } = this.props

    const childElements = images.map((image: Image) => {
      return (
        <GalleryImage key={image.index} api={this.props.api} onLinkCopied={() => this.linkCopiedSnackbarShown = true} onCardClicked={() => this.showLightbox(image)} imageReference={image} onLoad={this.updateImage} onError={this.updateImage}/>
      )
    })

    if (childElements.length === 0 && (this.loadedImagesCount === this.props.images.length) && !this.props.shouldBeLoading) {
      return (
        <Typography className={classes.noImagesText}>No images have been uploaded in this category yet. Why don't you upload one&nbsp; <a href='/upload'>here</a>?</Typography>
      )
    }

    let lightboxColor = 'white'
    let lightBoxDescColor = 'rgba(0, 0, 0, 0.4)'
    let lightBoxCloseColor = 'white'
    if (this.lightBox.isShown) {
      lightboxColor = this.lightBox.isDark ? 'black' : 'white'
      lightBoxDescColor = this.lightBox.isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'
      lightBoxCloseColor = this.lightBox.isCloseDark ? 'white' : 'black'
    } 
    
    return (
      <React.Fragment>
        {(!this.props.shouldBeLoading || this.isGalleryScrollable) &&
        <Masonry ref={(ref) => this.galleryReference = ref} elementType='div' className={this.generateGalleryClassName()}>
          {childElements}
        </Masonry>}
        <Snackbar
          open={this.linkCopiedSnackbarShown}
          onClose={() => this.linkCopiedSnackbarShown = false}
          TransitionComponent={TransitionUp}
          message={<span>Link copied!</span>}
          action={
            <IconButton
              key='close'
              aria-label='Close'
              color='inherit'
              className={classes.close}
              onClick={() => this.linkCopiedSnackbarShown = false}
            >
              <CloseIcon />
            </IconButton>
          }
        />
        {((this.isGalleryLoaded === false || this.props.shouldBeLoading || this.isGalleryScrollable) && this.props.anyImages) &&
        <div className='GalleryLoadingMore'>
          {this.isGalleryScrollable ? <CircularProgress color='primary'/> : <LinearProgress variant='indeterminate' className={classes.linearProgress}/>}
        </div>}
        <Fade in={this.lightBox.isShown}>
          <div>
            {this.lightBox.isShown &&
            <Modal open={this.lightBox.isShown} onClose={() => this.hideLightbox()}>
              <div className={classes.imageLightBox} ref={(ref) => this.lightBox.reference = ref}>
                <IconButton className={classes.imageLightBoxCloseBtn} style={{ color: lightBoxCloseColor }} onClick={() => this.hideLightbox()}>
                  <CloseIcon/>
                </IconButton>
                {
                  this.lightBox.image !== undefined && 
                  <React.Fragment>
                    <div style={{ minWidth: '715px', minHeight: '200px', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                      <img src={this.lightBox.image.src} style={{ minWidth: '250px', maxWidth: '1000px' }}/>
                    </div>
                    <div className={classes.imageLightBoxDesc} style={{ backgroundColor: lightBoxDescColor }}>
                      <div style={{ flex: 1, maxWidth: '50%' }}>
                        <Typography variant='headline' component='strong' style={{
                          marginBottom: '15px',
                          color: lightboxColor,
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap'
                        }}>
                          {this.lightBox.image.name}
                        </Typography>
                        <Typography variant='subheading' style={{
                          marginTop: '15px',
                          color: lightboxColor
                        }}>
                          <strong>Created by:</strong> {this.lightBox.image.author}
                        </Typography>
                      </div>
                      <div style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex'
                      }}>
                        <Button color='inherit' style={{ color: lightboxColor }} onClick={() => {
                          const mimeType = this.lightBox.image.src.substring(0, this.lightBox.image.src.indexOf(';')).split(':')[1]
                          downloadImage(this.lightBox.image.name, this.lightBox.image.src, mimeType)
                        }}>
                          <CloudDownload style={{ marginRight: '4px', color: lightboxColor }} />
                          Download image
                        </Button>
                        <Button color='inherit' style={{ color: lightboxColor }} onClick={() => {
                          const endpoint = this.props.api.isTestnet ? 't' : 'm'
                          copyTextToClipboard(`${window.location.origin}/raw/${endpoint}/${this.lightBox.image.index}`)
                          this.linkCopiedSnackbarShown = true
                        }}>
                          <SvgIcon style={{ marginRight: '4px', color: lightboxColor }}>
                            <path fill='none' d='M0 0h24v24H0z' />
                            <path d='M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm-1 4l6 6v10c0 1.1-.9 2-2 2H7.99C6.89 23 6 22.1 6 21l.01-14c0-1.1.89-2 1.99-2h7zm-1 7h5.5L14 6.5V12z' />
                          </SvgIcon>
                          Copy raw url
                        </Button>
                      </div>
                    </div>
                  </React.Fragment>
                }
              </div>
            </Modal>
            }
          </div>
        </Fade>
      </React.Fragment>
    )
  }
}