import { CircularProgress, LinearProgress, Theme } from 'material-ui'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import Masonry from 'react-masonry-component'
import GalleryImage from './GalleryImage'
import { withStyles, WithStyles } from './withStyles'
import { Image } from '../models/Image'

const styles = {
  linearProgress: {
    width: '50%',
    height: '8px',
    borderRadius: '10px'
  }
}

type GalleryProps = WithStyles & {
  images: Image[],
  pushMoreCallback: (count?: number, append?: boolean) => void,
  infiniteScrollCooldownLength: number,
  currentCategory: string
}

@withStyles(styles)
@observer
export default class Gallery extends React.Component<GalleryProps, any> {
  infiniteScrollCooldownActive = false
  handleScrollIntervalId: NodeJS.Timer
  @observable loadedImagesCount = 0
  @observable imagesLoadedPercent = 0
  galleryReference: any

  constructor(props: GalleryProps) {
    super(props)
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

  componentDidMount() {
    this.handleScrollIntervalId = setInterval(this.handleScroll, 100)
  }

  componentWillUnmount() {
    clearInterval(this.handleScrollIntervalId)
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
    return this.loadedImagesCount === this.props.images.length
  }

  get isGalleryScrollable() {
    if (this.isGalleryLoaded) {
      return this.props.images.length >= 20
    }

    return this.props.images.length > 20
  }

  generateGalleryClassName() {
    return 'Gallery' + (this.isGalleryReady ? ' GalleryLoaded' : '')
  }

  get isGalleryReady() {
    return (this.isGalleryLoaded || this.isGalleryScrollable) && this.loadedImagesCount !== 0
  }

  componentWillReceiveProps(nextProps: GalleryProps) {
    if (nextProps.currentCategory !== this.props.currentCategory) {
      this.loadedImagesCount = 0

      return true
    } else {
      return nextProps.images !== this.props.images || !this.isGalleryLoaded
    }
  }

  // Deprecated by MobX API, shouldComponentUpdate function should only be handled by MobX's observer.
  // Fixes the gallery scrolling issue where scrolling wouldn't update the component (and that is required).
  shouldComponentUpdate(nextProps: GalleryProps) {
    return nextProps.images !== this.props.images || !this.isGalleryLoaded
  }

  render() {
    const { classes, images } = this.props
    const childElements = images.map((image: Image) => {
      return (
        <GalleryImage key={image.index} imageReference={image} onLoad={this.updateImage} onError={this.updateImage}/>
      )
    })

    return (
      <React.Fragment>
        <Masonry ref={(ref) => this.galleryReference = ref} elementType={'div'} className={this.generateGalleryClassName()}>
          {childElements}
        </Masonry>
        <div className='GalleryLoadingMore'>
          {this.isGalleryScrollable ? <CircularProgress/> : <LinearProgress className={classes.linearProgress} variant='determinate' value={this.imagesLoadedPercent}/>}
        </div>
      </React.Fragment>
    )
  }
}