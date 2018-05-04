import InfoIcon from '@material-ui/icons/Info'
import { CircularProgress, GridListTile, GridListTileBar, IconButton, Typography } from 'material-ui'
import * as React from 'react'
import * as InfiniteScroll from 'react-infinite-scroller'
import Masonry from 'react-masonry-component'

export interface CollectionImageGridProps {
  images: any[],
  pushMoreCallback: (count?: number, append?: boolean) => void,
  pushMoreCooldownLength: number
}

export default class CollectionImageGrid extends React.Component<CollectionImageGridProps, any> {
  
  pushMoreCooldown = false
  handleScrollIntervalId: NodeJS.Timer

  constructor(props: CollectionImageGridProps) {
    super(props)
    this.handleScroll = this.handleScroll.bind(this)
  }

  handleScroll() {
    if (document.documentElement.scrollHeight - document.documentElement.scrollTop < 1500 && !this.pushMoreCooldown) {
      this.props.pushMoreCallback(10, true)
      this.pushMoreCooldown = true
      setTimeout(() => { this.pushMoreCooldown = false }, this.props.pushMoreCooldownLength)
    }
  }

  componentDidMount() {
    this.handleScrollIntervalId = setInterval(this.handleScroll, 100)
  }

  componentWillUnmount() {
    clearInterval(this.handleScrollIntervalId)
  }

  updateImage(elementId: string) {
    document.getElementById(elementId + "Placeholder").style.display = "none"
    document.getElementById(elementId + "TileBar").style.display = ""
  }

  render() {
    const childElements = this.props.images.map((element) => {
      return (
        <div key={element.index} className="imgCubeGalleryElement">
            <img onLoad={() => this.updateImage(element.name+element.index)} src={element.src} alt={element.name} title={element.name} />
            <div 
              id={element.name + element.index+"Placeholder"}
              style={{
                width:  '200px',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CircularProgress />
            </div>
            <div id={element.name + element.index + "TileBar"} style={{ display: 'none' }}>
              <GridListTileBar
                title={element.name}
                subtitle={<span>By: {element.author}</span>}
                actionIcon={
                  <IconButton style={{ color: 'rgba(255, 255, 255, 0.54)' }}>
                    <InfoIcon />
                  </IconButton>
                }
              />
            </div>
        </div>
      )
    })

    return (
      <Masonry
        elementType={'div'}
        options={{}}
      >
        { childElements }
      </Masonry>
    )
  }
}