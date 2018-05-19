import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@material-ui/core'
import * as React from 'react'
import { withStyles, WithStyles } from './withStyles'
import { UploadImage } from '../models/UploadImage'
import { pluralize } from '../utils'

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
    return (
      <Dialog open={this.props.files.length > 0} onClose={() => this.handleFileDeletion(false)} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description'>
        {this.props.files.length > 0 &&
        <React.Fragment>
          <DialogTitle id='alert-dialog-title'>Delete selected {pluralize('image', this.props.files.length)}</DialogTitle>
          <DialogContent>
            <DialogContentText id='alert-dialog-description'>
              This <strong>will delete {this.props.files.length === 1 ? 'selected image \'' + this.props.files[0].name + '\'' : this.props.files.length + ' selected images'}</strong> from the website and <strong>cannot be undone</strong>.
              Are you sure you want to proceed?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.handleFileDeletion(false)} color='primary'>
              No
            </Button>
            <Button onClick={() => this.handleFileDeletion(true)} color='secondary' autoFocus>
              Yes
            </Button>
          </DialogActions>
        </React.Fragment>
        }
      </Dialog>
    )
  }
}