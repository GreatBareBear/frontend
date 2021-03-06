import { Button, Card, CardActions, CardContent, CardMedia, FormControl, InputLabel, MenuItem, Select, TextField, Theme, Typography, Checkbox } from '@material-ui/core'
import * as React from 'react'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import { categories } from '../models/categories'
import EditableText from './EditableText'
import { WithStyles, withStyles } from './withStyles'
import { UploadImage } from '../models/UploadImage'
import { calculateImagePrice, getImageData } from '../models/Image'
import BigNumber from 'bignumber.js'
import * as _ from 'lodash'

const styles = (theme: Theme) => ({
  categoryPicker: {
    width: '100%',
    marginTop: theme.spacing.unit
  },
  card: {
    width: 345,
    float: 'left',
    margin: '20px 20px 20px 0px'
  } as CSSProperties,
  media: {
    height: 0,
    paddingTop: '56.25%'
  },
  textField: {
    width: '100%'
  },
  priceText: {
    marginLeft: 'auto',
    textAlign: 'start',
    paddingRight: '12px'
  } as CSSProperties,
  checkboxContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    width: '50px',
    borderBottomRightRadius: '100%',
    height: '50px',
    display: 'flex'
  } as CSSProperties,
  checkboxRoot: {
    marginLeft: '-3px',
    marginTop: '-3px'
  }
})

type UploadedImageCardProps = WithStyles & {
  fileData: UploadImage,
  index: number,
  isSelected: boolean,
  removeFileCallback: (index: number) => void,
  selectFileCallback: (isSelected: boolean) => void,
  uploadFileCallback: () => void
}

@withStyles(styles)
export default class UploadImageCard extends React.Component<UploadedImageCardProps, {
  file: UploadImage,
  price: BigNumber,
  usdPrice: BigNumber
}> {
  state = {
    file: this.props.fileData,
    price: null,
    usdPrice: null
  }

  constructor(props: UploadedImageCardProps) {
    super(props)
  }

  async componentWillMount() {
    this.state.file.category = 'other'
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

  shouldComponentUpdate(nextProps: UploadedImageCardProps) {
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
        <div className={classes.checkboxContainer}>
          <Checkbox className={classes.checkboxRoot} checked={this.props.isSelected} onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.props.selectFileCallback(e.target.checked) } color='primary'/>
        </div>
        <CardMedia className={classes.media} image={file.preview} title={file.name}/>
        <CardContent>
          <EditableText defaultValue={file.name} typographyVariant={'headline'} onValueApplied={(value) => this.updateName(index, value)}/>
          <FormControl className={this.props.classes.categoryPicker}>
            <InputLabel htmlFor='categoryPicker'>Category</InputLabel>
            <Select name={file.name} value={this.state.file.category} onChange={(event) => this.updateCategory(event)} inputProps={{
              id: 'categoryPicker'
            }}>
              {categories.slice(1).map((category: string, categoryIndex: number) => (
                <MenuItem value={category} key={categoryIndex}>{_.startCase(category)}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
        <CardActions style={{
          flexFlow: 'row-reverse'
        }}>
          <Button size='small' color='primary' onClick={() => this.props.uploadFileCallback()}>
            Upload
          </Button>
          <Button size='small' color='secondary' onClick={() => this.props.removeFileCallback(index)}>
            Delete
          </Button>
        </CardActions>
      </Card>
    )
  }
}