import FileUpload from '@material-ui/icons/FileUpload'
import { Theme, Typography } from 'material-ui'
import * as React from 'react'
import Dropzone from 'react-dropzone'
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
  }
})

@withStyles(styles)
export default class App extends React.Component<WithStyles> {

  onDrop(acceptedFiles: any, rejectedFiles: any) {
      rejectedFiles.forEach((file: any) => {
          console.log("Rejected file: "+file.name)
      })
      console.log("Upload accepted files", acceptedFiles)
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
      </div>
    )
  }
}
