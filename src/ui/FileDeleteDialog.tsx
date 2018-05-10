import InfoIcon from '@material-ui/icons/Info'
import { GridListTileBar, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from 'material-ui'
import * as React from 'react'
import { withStyles, WithStyles } from './withStyles'
import { Image } from '../models/Image'
import { UploadImage } from '../models/UploadImage'

const styles = () => ({
  galleryImagePlaceholder: {
    width: '200px',
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

type DeleteDialogProps = WithStyles & {
  files?: UploadImage[],
  deleteFilesCallback: (shouldDeleteFiles: boolean, files: UploadImage[]) => void
}

@withStyles(styles)
export default class FileDeleteDialog extends React.Component<DeleteDialogProps> {
  
  constructor(props: any) {
      super(props)
  }

  handleFileDeletion(deleteFiles: boolean) {
    this.props.deleteFilesCallback(deleteFiles, this.props.files)
  }

  render() {
      const { classes } = this.props

      return (
          <Dialog
            open={this.props.files.length > 0}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
          {this.props.files.length > 0 &&
            <React.Fragment>
              <DialogTitle id="alert-dialog-title">Cancel upload</DialogTitle>
              <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    This action <strong>will cancel the upload for {this.props.files.length === 1 ? "selected image '"+this.props.files[0].name+"'" : this.props.files.length + " selected images"}</strong> and <strong>cannot be undone</strong>.
                    <br />
                    Are you sure you want to cancel the upload?
                  </DialogContentText>
              </DialogContent>
              <DialogActions>
              <Button onClick={() => this.handleFileDeletion(false)} color="primary">
                    No
                </Button>
              <Button onClick={() => this.handleFileDeletion(true)} color="secondary" autoFocus>
                    Yes
                </Button>
              </DialogActions>
            </React.Fragment>
            }
          </Dialog>
      )
  }
}