import InfoIcon from '@material-ui/icons/Info'
import { CircularProgress, GridListTile, GridListTileBar, IconButton, LinearProgress, Theme, Typography } from 'material-ui'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import * as InfiniteScroll from 'react-infinite-scroller'
import Masonry from 'react-masonry-component'
import { ICImage } from '../App'
import ICGalleryImage, { ICGalleryReferences } from './ICGalleryImage'
import { withStyles, WithStyles } from './withStyles'

export interface ICGalleryProps {
  images: ICImage[],
  pushMoreCallback: (count?: number, append?: boolean) => void,
  infiniteScrollCooldownLength: number,
  currentCategory: string
}

const styles = (theme: Theme) => ({
  linearProgress: {
    width: '50%',
    height: '8px',
    borderRadius: '10px'
  }
})

@withStyles(styles)
@observer
export default class ICGallery extends React.Component<ICGalleryProps & WithStyles, any> {
  
  infiniteScrollCooldownActive = false
  handleScrollIntervalId: NodeJS.Timer
  loadedImagesCount = 0
  @observable imagesLoadedPercent = 0
  galleryReference: any

  constructor(props: ICGalleryProps & WithStyles) {
    super(props)
    this.handleScroll = this.handleScroll.bind(this)
  }

  handleScroll() {
    if (
      document.documentElement.scrollHeight - document.documentElement.scrollTop < 1300 // Fix: No DOM.
      && !this.infiniteScrollCooldownActive // Cooldown for scroll
      && this.isGalleryReady
      && this.isGalleryLoaded) {
      this.props.pushMoreCallback(10, true)
      this.infiniteScrollCooldownActive = true
      setTimeout(() => { this.infiniteScrollCooldownActive = false }, this.props.infiniteScrollCooldownLength)
    }
  }

  componentDidMount() {
    this.handleScrollIntervalId = setInterval(this.handleScroll, 100)
  }

  componentWillUnmount() {
    clearInterval(this.handleScrollIntervalId)
  }

  updateImage(imgRefs: ICGalleryReferences) {
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
    return "ICGallery" + (this.isGalleryReady ? ' ICGalleryLoaded' : '') 
  }

  get isGalleryReady() {
    return (this.isGalleryLoaded || this.isGalleryScrollable) && this.loadedImagesCount !== 0
  }

  componentWillReceiveProps(nextProps: ICGalleryProps & WithStyles) {
    if (nextProps.currentCategory !== this.props.currentCategory) {
//    console.log("Category changed to",nextProps.currentCategory,"from",this.props.currentCategory) /* DEBUGGING LINE */
      this.loadedImagesCount = 0
      return true
    } else {
      return nextProps.images !== this.props.images || !this.isGalleryLoaded
    }
  }

  render() {
    const { classes, images } = this.props
    const childElements = images.map((image: ICImage) => {
      return (
        <ICGalleryImage
          key={image.index}
          imageReference={image}
          onLoad={(references: ICGalleryReferences) => this.updateImage(references)}
          onError={(references: ICGalleryReferences) => this.updateImage(references)}
        />
      )
    })
    // console.log("Category",this.category,"loaded images:",this.loadedImagesCount,"/",this.props.images.length,"- galleryReady is:",this.isGalleryReady) /* DEBUGGING LINE */
    return (
      <React.Fragment>
        <Masonry
          ref={(ref) => { this.galleryReference = ref }}
          elementType={'div'}
          options={{}}
          className={this.generateGalleryClassName()}
        >
          {childElements}
        </Masonry>
        <div className="galleryLoadingMore">
          {this.isGalleryScrollable ? <CircularProgress /> : <LinearProgress className={classes.linearProgress} variant="determinate" value={this.imagesLoadedPercent} />}
          
        </div>
      </React.Fragment>
    )
    
  }
}