import { CircularProgress, LinearProgress, Typography, Modal, Theme } from 'material-ui'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import Masonry from 'react-masonry-component'
import GalleryImage from './GalleryImage'
import { withStyles, WithStyles } from './withStyles'
import { Image } from '../models/Image'
import { Link } from 'react-router-dom'
import { CSSProperties } from 'material-ui/styles/withStyles'
import _ = require('lodash')

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
    padding: theme.spacing.unit * 4,
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    color: 'white'
  } as CSSProperties
})

type GalleryPageProps = WithStyles & {
  images: Image[],
  pushMoreCallback: (count?: number, append?: boolean) => void,
  infiniteScrollCooldownLength: number,
  currentCategory: string,
  shouldBeLoading: boolean,
  anyImages: boolean
}

type LightBoxObject = {
  reference: any,
  image: Image,
  isShown: boolean
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
    isShown: false
  } as LightBoxObject

  showLightbox(image: Image) {
    this.hideLightbox()
    this.lightBox.image = image
    this.lightBox.isShown = true
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
    if (this.isGalleryLoaded) {
      return document.documentElement.clientHeight < document.documentElement.scrollHeight
    }

    return this.props.images.length > 50
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
        <GalleryImage key={image.index} onCardClicked={() => this.showLightbox(image)} imageReference={image} onLoad={this.updateImage} onError={this.updateImage}/>
      )
    })

    if (childElements.length === 0 && (this.loadedImagesCount === this.props.images.length) && !this.props.shouldBeLoading) {
      return (
        <Typography className={classes.noImagesText}>No images have been uploaded in this category yet. Why don't you upload one&nbsp; <Link to='/upload'>here</Link>?</Typography>
      )
    }

    return (
      <React.Fragment>
        {(!this.props.shouldBeLoading || this.isGalleryScrollable) &&
          <Masonry ref={(ref) => this.galleryReference = ref} elementType='div' className={this.generateGalleryClassName()}>
            {childElements}
          </Masonry>}
        
        {((this.isGalleryLoaded === false || this.props.shouldBeLoading || this.isGalleryScrollable) && this.props.anyImages) && 
          <div className='GalleryLoadingMore'>
          {this.isGalleryScrollable ? <CircularProgress color='primary' /> : this.loadedImagesCount > 0 ? <LinearProgress variant='determinate' value={this.imagesLoadedPercent} className={classes.linearProgress} /> : <LinearProgress variant='indeterminate' className={classes.linearProgress} />}
          </div>}
        {this.lightBox.isShown &&
          <Modal
            open={this.lightBox.isShown}
            onClose={() => this.hideLightbox()}
          >
            <div className={classes.imageLightBox} ref={(ref) => this.lightBox.reference = ref}>
              <Typography variant='headline' style={{
                marginBottom: '15px'
              }}>
                {this.lightBox.image.name}
              </Typography>
              <img src={this.lightBox.image.src} style={{ maxWidth: '700px' }} />
              <Typography variant='subheading' style={{
                marginTop: '15px'
              }}>
                Created by: {this.lightBox.image.author}
              </Typography>
            </div>
          </Modal>
        }
      </React.Fragment>
    )
  }
}