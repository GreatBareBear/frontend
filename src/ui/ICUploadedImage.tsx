import { Button, Card, CardActions, CardContent, CardMedia, FormControl, InputLabel, MenuItem, Select, Theme, Typography } from 'material-ui'
import * as React from 'react'
import { categories } from '../App'
import { ICUploadImage } from '../routes/NewPhoto'
import EditableText from './EditableText'
import { WithStyles, withStyles } from './withStyles'

export interface ICUploadedImageProps {
    fileData: ICUploadImage,
    index: number,
    removeFileCallback: (index: number) => void
}

const styles = (theme: Theme) => ({
    categoryPicker: {
        width: '100%',
        marginTop: theme.spacing.unit
    },
    card: {
        width: 345, // TODO: Make the cards responsive (like a card row), but they cannot rescale by changing their description / name.
        float: 'left' as 'left',
        margin: '20px'
    },
    media: {
        height: 0,
        paddingTop: '56.25%'
    }
})

@withStyles(styles)
export default class ICUploadedImage extends React.Component<ICUploadedImageProps & WithStyles, any> {

    state = {
        file: this.props.fileData
    }

    constructor(props: ICUploadedImageProps & WithStyles) {
        super(props)
    }

    updateCategory(event: React.ChangeEvent<HTMLSelectElement>) {
        const file = this.state.file
        file.category = event.target.value
        this.setState({ file })
    }

    updateName(index: number, newName: string) {
        const { file } = this.state
        file.name = newName
        this.setState({ file })
    }

    updateDescription(index: number, newDescription: string) {
        const { file } = this.state
        file.description = newDescription
        this.setState({ file })
    }

    shouldComponentUpdate(nextProps: ICUploadedImageProps & WithStyles) {
        if (nextProps.fileData !== this.props.fileData) {
            this.state.file = nextProps.fileData
        }
        return true
    }

    render() {
        const file = this.state.file
        const index = this.props.index
        const classes = this.props.classes
        return (
            <Card className={classes.card} key={index}>
                <CardMedia
                    className={classes.media}
                    image={file.preview}
                    title={file.name}
                />
                <CardContent>
                    <EditableText
                        defaultValue={file.name}
                        typographyVariant={'headline'}
                        onValueApplied={(value) => this.updateName(index, value)}
                    />
                    <EditableText
                        defaultValue={"Image description"}
                        typographyComponent={'p'}
                        onValueApplied={(value) => this.updateDescription(index, value)}
                    />
                    <Typography component="p">
                        {file.type === 'image/gif' && <strong>If GIF image is animated, it will get replaced with a static image (first frame will be taken).</strong>}
                    </Typography>
                    <FormControl className={this.props.classes.categoryPicker}>
                        <InputLabel htmlFor="categoryPicker">Category</InputLabel>
                        <Select
                            name={file.name}
                            value={this.state.file.category}
                            onChange={(event) => this.updateCategory(event)}
                            inputProps={{
                                id: 'categoryPicker'
                            }}

                        >
                            {categories.map((category: string, categoryIndex: number) => (
                                <MenuItem value={category} key={categoryIndex}>{category}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </CardContent>
                <CardActions>
                    <Button size="small" color="primary" onClick={() => this.props.removeFileCallback(index)}>
                        Cancel
                        </Button>
                    <Button size="small" color="primary">
                        Upload image
                        </Button>
                </CardActions>
            </Card>
        )
    }
}