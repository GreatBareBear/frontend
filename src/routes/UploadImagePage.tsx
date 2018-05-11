import FileUpload from '@material-ui/icons/FileUpload'
import { Button, Theme, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from 'material-ui'
import * as React from 'react'
import Dropzone, { ImageFile } from 'react-dropzone'
import Masonry from 'react-masonry-component'
import { CSSProperties } from 'material-ui/styles/withStyles'
import { observer } from 'mobx-react'
import UploadImageCard from '../ui/UploadImageCard'
import { WithStyles, withStyles } from '../ui/withStyles'
import { UploadImage } from '../models/UploadImage'
import FileDeleteDialog from '../ui/FileDeleteDialog'
import { withApi } from '../api/withApi'
import Api from '../api/Api'
import BigNumber from 'bignumber.js'
import Account from '../nebulify/src/Account'

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
  deleteButton: {
    float: 'right'
  } as CSSProperties,
  uploadButton: {
    float: 'right',
    marginLeft: theme.spacing.unit * 2
  } as CSSProperties
})

export const DEFAULT_AUTHOR = 'Mr. Anomynous'

type UploadImagePageProps = WithStyles & {
  api: Api
}

@withStyles(styles)
@withApi()
@observer
export default class UploadImagePage extends React.Component<UploadImagePageProps, {
  files: UploadImage[],
  filesToRemove: UploadImage[]
}> {
  state = {
    files: [] as UploadImage[],
    filesToRemove: [] as UploadImage[]
  }

  onDrop = (acceptedFiles: ImageFile[], rejectedFiles: ImageFile[]) => {
    /*rejectedFiles.forEach((file: an   ky) => {
      console.log('Rejected file: ' + file.name)
    })*/
    const files = this.state.files
    acceptedFiles.forEach((element: ImageFile) => {
      files.push({
        name: element.name,
        preview: element.preview,
        category: '',
        type: element.type,
        author: DEFAULT_AUTHOR,
        file: element
      })
    })
    this.setState({ files })
  }

  removeFiles(shouldRemoveFiles: boolean, filesToRemoveArray: UploadImage[]) {
    let { files, filesToRemove } = this.state
    if (shouldRemoveFiles) {
      files = files.filter((value: UploadImage) => !filesToRemoveArray.includes(value))
    }
    filesToRemove = filesToRemove.filter((value: UploadImage) => !filesToRemoveArray.includes(value))
    this.setState({ files, filesToRemove })
  }

  addToRemoveFilesList(files: UploadImage[]) {
    let filesToRemove = this.state.filesToRemove
    filesToRemove = filesToRemove.concat(files)
    this.setState({ filesToRemove })
  }

  upload = () => {
    for (const image of this.state.files) {
      const reader = new FileReader()

      reader.readAsDataURL(image.file)

      reader.onloadend = async () => {
        const base64 = reader.result

        const tempImage = new Image()

        tempImage.src = image.preview

        // 01614273224043715847
        // 016142732240437158

        const account = Account.fromAddress('n1NmQoV2349d3jp2TJoDDZbdErGFM5X331E')

        account.setPrivateKey('your private key')

        const result = await this.props.api.upload(tempImage.width, tempImage.height, base64, image.name, image.author, image.category, account, new BigNumber(new BigNumber(tempImage.width * tempImage.height).div(18300000).toString().replace('.', '')))
      }
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
          <Button variant='raised' className={classes.uploadButton} color='primary' onClick={this.upload}>
            {this.state.files.length > 1 ? 'Upload all' : 'Upload'}
          </Button>
          <Button variant='raised' className={classes.deleteButton} color='secondary' onClick={() => this.addToRemoveFilesList(this.state.files)}>
            {this.state.files.length > 1 ? 'Delete all' : 'Delete'}
          </Button>
        </Typography>

        <Masonry elementType={'div'}>
          {this.state.files.map((file: UploadImage, index: number) => {
            return (
              <UploadImageCard fileData={file} index={index} key={index} removeFileCallback={() => this.addToRemoveFilesList([file])}/>
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
        <Dropzone className={classes.dropZone} accept={'image/gif,image/png,image/jpeg,image/bmp'} onDrop={this.onDrop}>
          <div className={classes.dropZoneContent}>
            <FileUpload className={classes.uploadIcon}/>
            <Typography variant='headline'>
              Drop images you want to upload here, or click here to open a file dialog.
            </Typography>
          </div>
        </Dropzone>
        <br/>
        {this.renderMasonry()}
        {/*
        {this.state.files.length > 0 && this.renderMasonry()}*/}
        <FileDeleteDialog files={this.state.filesToRemove} deleteFilesCallback={(shouldRemoveFiles, files) => this.removeFiles(shouldRemoveFiles, files)}/>
      </div>
    )
  }
}
/*

export default withApi(UploadImagePage)*/
