import InfoIcon from '@material-ui/icons/Info'
import { GridListTileBar, IconButton } from 'material-ui'
import * as React from 'react'
import { ICImage } from '../App'
import { withStyles, WithStyles } from './withStyles'

export interface ICGalleryImageProps {
    imageReference: ICImage,
    onLoad?: (references: any) => void,
    onError?: (references: any) => void
}

export interface ICGalleryReferences {
    placeholder: HTMLDivElement,
    tileBar: HTMLDivElement
}
const styles = () => ({
    galleryImagePlaceholder: {
        width: '200px',
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
})

@withStyles(styles)
export default class ICGalleryImage extends React.Component<ICGalleryImageProps & WithStyles, any> {

    references: ICGalleryReferences = {
        placeholder: null,
        tileBar: null
    }

    constructor(props: ICGalleryImageProps & WithStyles) {
        super(props)
    }

    showImage() {
        // Hide the image's placeholder.
        this.references.placeholder.style.display = "none"
        // Show the image's tile bar.
        this.references.tileBar.style.display = ""
    }

    render() {
        const { classes } = this.props
        return (
            <div key={this.props.imageReference.index} className="ICGalleryImage">
                <img 
                  //  onError={() => { this.showImage(); this.props.onError(this.references)}}  // Image did not load; what should we do?
                    onLoad={() => { this.showImage(); this.props.onLoad(this.references)}}
                    src={this.props.imageReference.src} 
                    alt={this.props.imageReference.name} 
                    title={this.props.imageReference.name} />
                <div
                    ref={(ref) => this.references.placeholder = ref}
                    className={classes.galleryImagePlaceholder}
                />
                <div ref={(ref) => this.references.tileBar = ref} style={{ display: 'none' }}>
                    <GridListTileBar
                        title={this.props.imageReference.name}
                        subtitle={<span>By: {this.props.imageReference.author}</span>}
                        actionIcon={
                            <IconButton style={{ color: 'rgba(255, 255, 255, 0.54)' }}>
                                <InfoIcon />
                            </IconButton>
                        }
                    />
                </div>
            </div>
        )
    }
}