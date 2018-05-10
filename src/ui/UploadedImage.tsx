import { Button, Card, CardActions, CardContent, CardMedia, FormControl, InputLabel, MenuItem, Select, TextField, Theme, Typography } from 'material-ui'
import * as React from 'react'
import { categories } from '../App'
import EditableText from './EditableText'
import { WithStyles, withStyles } from './withStyles'
import { UploadImage } from '../models/UploadImage'
import { DEFAULT_AUTHOR } from '../routes/UploadImage'

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
  },
  textField: {
    width: '100%'
  }
})

type UploadedImageProps = WithStyles & {
  fileData: UploadImage,
  index: number,
  removeFileCallback: (index: number) => void
}

@withStyles(styles)
export default class UploadedImage extends React.Component<UploadedImageProps, {
  file: UploadImage
}> {
  state = {
    file: this.props.fileData
  }

  constructor(props: UploadedImageProps & WithStyles) {
    super(props)
  }

  updateCategory(event: React.ChangeEvent<HTMLSelectElement>) {
    const file = this.state.file

    file.category = event.target.value

    this.setState({
      file
    })
  }

  updateName(index: number, newName: string) {
    const { file } = this.state

    file.name = newName

    this.setState({
      file
    })
  }

  updateAuthor(event: React.ChangeEvent<HTMLInputElement>) {
    const { file } = this.state

    file.author = event.target.value

    this.setState({
      file
    })
  }

  shouldComponentUpdate(nextProps: UploadedImageProps & WithStyles) {
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
        <CardMedia className={classes.media} image={file.preview} title={file.name}/>
        <CardContent>
          <EditableText defaultValue={file.name} typographyVariant={'headline'} onValueApplied={(value) => this.updateName(index, value)}/>
          <TextField id='with-placeholder' label='Image author' placeholder={DEFAULT_AUTHOR} className={classes.textField} value={this.state.file.author} onChange={(event) => this.updateAuthor(event)} margin='normal'/>
          {file.type === 'image/gif' && <Typography component='p'>
              <strong>If GIF image is animated, it will get replaced with a static image (only the first frame will be taken).</strong>
            </Typography>
          }
          <FormControl className={this.props.classes.categoryPicker}>
            <InputLabel htmlFor='categoryPicker'>Category</InputLabel>
            <Select name={file.name} value={this.state.file.category} onChange={(event) => this.updateCategory(event)} inputProps={{
              id: 'categoryPicker'
            }}>
              {categories.map((category: string, categoryIndex: number) => (
                <MenuItem value={category} key={categoryIndex}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
        <CardActions>
          <Button size='small' color='primary' onClick={() => this.props.removeFileCallback(index)}>
            Cancel
          </Button>
          <Button size='small' color='primary'>
            Upload image
          </Button>
        </CardActions>
      </Card>
    )
  }
}