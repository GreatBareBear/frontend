import { CircularProgress, LinearProgress, Typography } from 'material-ui'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import Masonry from 'react-masonry-component'
import GalleryImage from './GalleryImage'
import { withStyles, WithStyles } from './withStyles'
import { Image } from '../models/Image'
import { Link } from 'react-router-dom'

const styles = {
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
  }
}

type GalleryPageProps = WithStyles & {
  images: Image[],
  pushMoreCallback: (count?: number, append?: boolean) => void,
  infiniteScrollCooldownLength: number,
  currentCategory: string,
  shouldBeLoading: boolean,
  anyImages: boolean
}

@withStyles(styles)
@observer
export default class GalleryPage extends React.Component<GalleryPageProps, any> {
  infiniteScrollCooldownActive = false
  @observable loadedImagesCount = 0
  @observable imagesLoadedPercent = 0
  galleryReference: any

  constructor(props: GalleryPageProps) {
    super(props)
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll = () => {
    if (document.documentElement.scrollHeight - document.documentElement.scrollTop < 1300 && !this.infiniteScrollCooldownActive && this.isGalleryReady && this.isGalleryLoaded) {
      this.props.pushMoreCallback(10, true)
      this.infiniteScrollCooldownActive = true
      setTimeout(() => {
        this.infiniteScrollCooldownActive = false
      }, this.props.infiniteScrollCooldownLength)
    }
  }

  updateImage = () => {
    this.loadedImagesCount++
    this.imagesLoadedPercent = this.loadedImagesCount / this.props.images.length * 100

    if (this.isGalleryReady) {
      this.imagesLoadedPercent = 0
    }

    this.galleryReference.className = this.generateGalleryClassName()
  }

  get isGalleryLoaded() {
    console.log('any images ', this.props.anyImages)
    return (this.loadedImagesCount === this.props.images.length && (this.loadedImagesCount !== 0)) || this.props.anyImages === false
  }

  get isGalleryScrollable() {
    if (this.isGalleryLoaded) {
      return this.props.images.length >= 20
    }

    return this.props.images.length > 20
  }

  generateGalleryClassName() {
    return 'GalleryPage' + (this.isGalleryReady ? ' GalleryLoaded' : '')
  }

  get isGalleryReady() {
    return (this.isGalleryLoaded || this.isGalleryScrollable)
  }

  componentWillReceiveProps(nextProps: GalleryPageProps) {
    if (nextProps.currentCategory !== this.props.currentCategory) {
      this.loadedImagesCount = 0

      return true
    } else {
      return nextProps.images !== this.props.images || !this.isGalleryLoaded
    }
  }

  // Deprecated by MobX API, shouldComponentUpdate function should only be handled by MobX's observer.
  // Fixes the gallery scrolling issue where scrolling wouldn't update the component (and that is required).
  shouldComponentUpdate(nextProps: GalleryPageProps) {
    if (nextProps.shouldBeLoading !== this.props.shouldBeLoading) {
      this.loadedImagesCount = 0
    }

    return nextProps.images !== this.props.images || !this.isGalleryLoaded || nextProps.shouldBeLoading !== this.props.shouldBeLoading
  }

  render() {
    const { classes, images } = this.props

    const childElements = images.map((image: Image) => {
      return (
        <GalleryImage key={image.index} imageReference={image} onLoad={this.updateImage} onError={this.updateImage}/>
      )
    })

    if (childElements.length === 0 && this.isGalleryLoaded) {
      return (
        <Typography className={classes.noImagesText}>No images have been uploaded yet. Why don't you upload one&nbsp; <Link to='/upload'>here</Link>?</Typography>
      )
    }

    if (this.isGalleryLoaded === false && this.props.shouldBeLoading) {
      return (
        <div className='GalleryLoadingMore'>
          <CircularProgress color='primary'/>
        </div>
      )
    }

    return (
      <React.Fragment>
        <Masonry ref={(ref) => this.galleryReference = ref} elementType='div' className={this.generateGalleryClassName()}>
          {childElements}
        </Masonry>
      </React.Fragment>
    )
  }
}