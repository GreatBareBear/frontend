import InfoIcon from '@material-ui/icons/Info'
import { GridListTile, GridListTileBar, IconButton, Typography } from 'material-ui'
import * as React from 'react'
import * as InfiniteScroll from 'react-infinite-scroller'
import Masonry from 'react-masonry-component'

export interface CollectionImageGridProps {
  images: any[],
  pushMoreCallback: (count?: number) => void
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
      this.props.pushMoreCallback()
      this.pushMoreCooldown = true
      setTimeout(() => { this.pushMoreCooldown = false}, 1500)
    }
  }

  componentDidMount() {
    this.handleScrollIntervalId = setInterval(this.handleScroll, 100)
  }

  componentWillUnmount() {
    clearInterval(this.handleScrollIntervalId)
  }

  render() {
    const childElements = this.props.images.map((element) => {
      return (
        <div key={element.index} className="imgCubeGalleryElement">
            <img src={element.src} />
            <GridListTileBar
              title={"An image"}
              subtitle={<span>by: {element.author}</span>}
              actionIcon={
                <IconButton style={{ color: 'rgba(255, 255, 255, 0.54)' }}>
                  <InfoIcon />
                </IconButton>
              }
            />
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