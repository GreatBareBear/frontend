import * as React from 'react'
import { Collection } from 'react-virtualized'
import 'react-virtualized/styles.css' // only needs to be imported once

export interface CollectionImageGridProps {
  images: any[]
}

const CELL_WIDTH = 300  
const GUTTER_SIZE = 20

export default class CollectionImageGrid extends React.Component<CollectionImageGridProps, any> {
  
  state = {
    images: this.props.images,
    columnCount: 2
  }

  _columnYMap: any
  constructor(props: any) {
    super(props)
  }

  cellRenderer({ index, key, style }: any) {
    return (
      <div
        key={key}
        style={style}
      >
      <img
          src={this.state.images[index].src}
        />
        
      </div>
    )
  }

  updateDimensions() {
    this.setState({
      screenWidth: window.innerWidth,
      columnCount: Math.floor(window.innerWidth / (CELL_WIDTH + GUTTER_SIZE)),
      images: [...this.state.images.slice(0, this.state.images.length - 1)]
    })
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions.bind(this))
  }

  cellSizeAndPositionGetter({ index }: any) {
    const list = this.state.images
    const columnCount = this.state.columnCount

    const columnPosition = index % (columnCount || 1)
    const datum = list[index]
    const height = datum.height
    const width = CELL_WIDTH
    const x = columnPosition * (GUTTER_SIZE + width)
    const y = this._columnYMap[columnPosition] || 0
    this._columnYMap[columnPosition] = y + height + GUTTER_SIZE
    return ({
      height,
      width,
      x,
      y
    })
  }

  render() {
    return (
      <Collection
        cellCount={this.state.images.length}
        cellRenderer={this.cellRenderer.bind(this)}
        cellSizeAndPositionGetter={this.cellSizeAndPositionGetter.bind(this)}
        height={600}
        width={1000}
      />
    )
  }
}