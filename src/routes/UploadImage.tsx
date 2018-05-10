import FileUpload from '@material-ui/icons/FileUpload'
import { Button, Theme, Typography } from 'material-ui'
import { observer } from 'mobx-react'
import * as React from 'react'
import Dropzone, { ImageFile } from 'react-dropzone'
import Masonry from 'react-masonry-component'
import { CSSProperties } from 'material-ui/styles/withStyles'
import UploadedImage from '../ui/UploadedImage'
import { WithStyles, withStyles } from '../ui/withStyles'
import { UploadImage } from '../models/UploadImage'

const styles = (theme: Theme) => ({
  dropZone: {
    width: '100%',
    marginTop: theme.spacing.unit * 2,
    border: '2px dashed #0087F7',
    borderRadius: '5px',
    background: 'white'
  },
  dropZoneContent: {
    padding: '2rem 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    flexWrap: 'wrap',
    flexDirection: 'column'
  } as CSSProperties,
  uploadIcon: {
    width: '128px',
    height: '128px'
  },
  clearAllButton: {
    float: 'right' as 'right'
  }
})

export const DEFAULT_AUTHOR = 'Mr. Anomynous'

@withStyles(styles)
@observer
export default class App extends React.Component<WithStyles> {
  state = {
    files: [] as UploadImage[]
  }

  onDrop(acceptedFiles: ImageFile[], rejectedFiles: ImageFile[]) {
    /*rejectedFiles.forEach((file: any) => {
      console.log('Rejected file: ' + file.name)
    })*/
    const files = this.state.files
    acceptedFiles.forEach((element: ImageFile) => {
      files.push({
        name: element.name,
        preview: element.preview,
        category: '',
        type: element.type,
        author: DEFAULT_AUTHOR
      })
    })
    this.setState({ files })
  }

  removeFile(index: number) {
    const files = this.state.files
    if (confirm('Are you sure you want to delete \'' + files[index].name + '\'?')) {
      files.splice(index, 1)
      this.setState({ files })
    }
  }

  clearList() {
    if (confirm('Are you sure you want to clear the whole list?')) {
      this.setState({ files: [] })
    }
  }

  renderMasonry() {
    const { classes } = this.props
    return (
      <React.Fragment>
        <br/>
        <br/>
        <Typography variant='subheading'>
          Your images ({this.state.files.length}):
          <Button variant='raised' className={classes.clearAllButton} color='primary' onClick={() => this.clearList()}>
            Delete all
          </Button>
        </Typography>

        <Masonry
          elementType={'div'}
          options={{}}
        >
          {this.state.files.map((file: UploadImage, index: number) => {
            return (
              <UploadedImage
                fileData={file}
                index={index}
                key={index}
                removeFileCallback={() => this.removeFile(index)}
              />
            )
          })}
        </Masonry>
      </React.Fragment>
    )
  }

  render() {
    const { classes } = this.props
    return (
      <div>
        <Typography variant='title'>
          Upload new image
        </Typography>
        <Dropzone className={classes.dropZone} accept={'image/gif,image/png,image/jpeg,image/bmp'} onDrop={this.onDrop.bind(this)}>
          <div className={classes.dropZoneContent}>
            <FileUpload className={classes.uploadIcon}/>
            <Typography variant='headline'>
              Drop images you want to upload here, or click here to open a file dialog.
            </Typography>
          </div>
        </Dropzone>
        <br/>
        {this.state.files.length > 0 && this.renderMasonry()}
      </div>
    )
  }
}
