import FileUpload from '@material-ui/icons/FileUpload'
import { Button, Card, CardActions, CardContent, CardMedia, Theme, Typography } from 'material-ui'
import { computed, observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import Dropzone from 'react-dropzone'
import Masonry from 'react-masonry-component'
import { WithStyles, withStyles } from '../ui/withStyles'

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
    flexWrap: 'wrap' as 'wrap',
    flexDirection: 'column' as 'column'
  },
  uploadIcon: {
    width: '128px',
    height: '128px'
  },
  card: {
    maxWidth: 345,
    float: 'left' as 'left',
    margin: '20px'
  },
  media: {
    height: 0,
    paddingTop: '56.25%' 
  },
  clearAllButton: {
    float: 'right' as 'right'
  }
})

@withStyles(styles)
@observer
export default class App extends React.Component<WithStyles> {

  state = {
    files: [] as any[]
  }

  onDrop(acceptedFiles: any, rejectedFiles: any) {
      rejectedFiles.forEach((file: any) => {
          console.log("Rejected file: "+file.name)
      })
      const files = this.state.files
      files.push(...acceptedFiles)
      this.setState({ files })
  }

  removeFile(index: number) {
    const files = this.state.files
    if (confirm("Are you sure you want to delete \"" + files[index].name + "\"?")) {
      files.splice(index, 1)
      this.setState({ files })
    }
  }

  clearList() {
    if (confirm("Are you sure you want to clear the whole list?")) {
      this.setState({ files: [] })
    }
  }

  renderMasonry() {
    const { classes } = this.props
    return (
      <React.Fragment>
        <br />
        <br />
        <Typography variant='subheading'>
          Your images ({this.state.files.length}):
          <Button variant="raised" className={classes.clearAllButton} color="primary" onClick={() => this.clearList()}>
            Delete all
          </Button>
        </Typography>
        
        <Masonry
          elementType={'div'}
          options={{}}
        >
          {this.state.files.map((file: any, index: number) => {
            return (
              <Card className={classes.card} key={index}>
                <CardMedia
                  className={classes.media}
                  image={file.preview}
                  title={file.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="headline" component="h2">
                    {file.name}
                  </Typography>
                  <Typography component="p">
                    Description of your photo<br />
                    {file.type === 'image/gif' && <strong>If GIF image is animated, it will get replaced with a static image (first frame will be taken).</strong>}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary" onClick={() => this.removeFile(index)}>
                    Cancel
                    </Button>
                  <Button size="small" color="primary">
                    Upload image
                    </Button>
                </CardActions>
              </Card>
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
            Upload a new photo
        </Typography>
        <Dropzone className={classes.dropZone} accept={"image/gif,image/png,image/jpeg,image/bmp"} onDrop={this.onDrop.bind(this)}>
          <div className={classes.dropZoneContent}>
            <FileUpload className={classes.uploadIcon} />
            <Typography variant='headline'>
              Drop images you want to upload here, or click here to open a file dialog.
            </Typography>
          </div>
        </Dropzone>
        <br />
        {this.state.files.length > 0 && this.renderMasonry()}
      </div>
    )
  }
}
