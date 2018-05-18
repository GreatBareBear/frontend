import FileUpload from '@material-ui/icons/FileUpload'
import { Button, Theme, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, AppBar, Toolbar, Slide, CircularProgress } from 'material-ui'
import * as React from 'react'
import Dropzone, { ImageFile } from 'react-dropzone'
import Masonry from 'react-masonry-component'
import { CSSProperties } from 'material-ui/styles/withStyles'
import { observer } from 'mobx-react'
import BigNumber from 'bignumber.js'
import UploadImageCard from '../ui/UploadImageCard'
import { WithStyles, withStyles } from '../ui/withStyles'
import { UploadImage } from '../models/UploadImage'
import FileDeleteDialog from '../ui/FileDeleteDialog'
import { withApi } from '../api/withApi'
import Api from '../api/Api'
import { calculateImagePrice, getImageData } from '../models/Image'
import { red } from 'material-ui/colors'
import { pluralize } from '../utils'

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
  } as CSSProperties,
  totalPriceText: {
    float: 'right',
    verticalAlign: 'middle',
    lineHeight: '37px',
    marginRight: theme.spacing.unit * 2
  } as CSSProperties,
  yourImages: {
    height: '37px',
    lineHeight: '37px'
  },
  errorText: {
    color: red[500]
  },
  selectedAppBar: {
    top: 0,
    left: 0,
    zIndex: theme.zIndex.appBar * 4
  }
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
  price: BigNumber,
  usdPrice: BigNumber,
  updated: boolean,
  author: string,
  showUploadDialog: boolean,
  showUploadProgress: boolean,
  showErrorDialog: boolean,
  errorMessages: string[]
  selectedFiles: UploadImage[]
}> {
  state = {
    files: [] as UploadImage[],
    filesToRemove: [] as UploadImage[],
    selectedFiles: [] as UploadImage[],
    price: new BigNumber(0),
    usdPrice: new BigNumber(0),
    updated: false,
    author: DEFAULT_AUTHOR,
    showUploadDialog: false,
    showUploadProgress: false,
    showErrorDialog: false,
    errorMessages: [] as string[]
  }

  async componentDidUpdate() {
    if (this.state.updated === false) {
      return
    }

    if (this.state.selectedFiles.length === 0) {
      this.setState({
        price: new BigNumber(0),
        usdPrice: new BigNumber(0),
        updated: false
      })
    }

    for (const [index, file] of this.state.selectedFiles.entries()) {
      const data = await getImageData(file)

      fetch('https://api.coinmarketcap.com/v2/ticker/1908/').then((response: any) => {
        response.json().then((ticker) => {
          const nasPrice = new BigNumber(calculateImagePrice(data).toString().substring(17, 0))
          const usdPrice = new BigNumber(new BigNumber(ticker.data.quotes.USD.price).multipliedBy(nasPrice).toString().substring(6, 0))

          this.setState((prevState) => ({
            price: prevState.price !== null && index > 0 ? prevState.price.plus(nasPrice) : nasPrice,
            usdPrice: prevState.usdPrice !== null && index > 0 ? prevState.usdPrice.plus(usdPrice) : usdPrice,
            updated: false
          }))
        })
      })
    }
  }

  onDrop = (acceptedFiles: ImageFile[]) => {
    const files = this.state.files
    const newFiles = []

    acceptedFiles.forEach((element: ImageFile) => {
      newFiles.push({
        name: element.name.replace(/\.[^/.]+$/, ''),
        preview: element.preview,
        category: '',
        type: element.type,
        author: this.state.author,
        file: element
      })
    })

    this.setState({ files: files.concat(newFiles), updated: true }, () => {
      this.addToSelectedFilesList(newFiles, true)
    })
  }

  deselectFiles(files: UploadImage[]) {
    let { selectedFiles } = this.state
    selectedFiles = selectedFiles.filter((value: UploadImage) => !files.includes(value))
    this.setState({ selectedFiles })
  }

  removeFiles(shouldRemoveFiles: boolean, filesToRemoveArray: UploadImage[]) {
    let { files, filesToRemove, selectedFiles } = this.state

    if (shouldRemoveFiles) {
      files = files.filter((value: UploadImage) => !filesToRemoveArray.includes(value))
      selectedFiles = selectedFiles.filter((value: UploadImage) => !filesToRemoveArray.includes(value))
    }

    filesToRemove = filesToRemove.filter((value: UploadImage) => !filesToRemoveArray.includes(value))
    this.setState({ files, filesToRemove, selectedFiles, updated: true })
  }

  addToRemoveFilesList(files: UploadImage[]) {
    let filesToRemove = this.state.filesToRemove
    filesToRemove = filesToRemove.concat(files)
    this.setState({ filesToRemove })
  }

  addToSelectedFilesList(files: UploadImage[], isSelected: boolean) {
    let selectedFiles = this.state.selectedFiles

    if (isSelected) {
      selectedFiles = selectedFiles.concat(files)
    } else {
      selectedFiles = selectedFiles.filter((value: UploadImage) => !files.includes(value))
    }

    this.setState({ selectedFiles, updated: true })
  }

  handleUpload = async () => {
    if (this.state.selectedFiles.length === 0) {
      return
    }

    if (!(window as any).webExtensionWallet) {
      this.setState({
        showErrorDialog: true
      })

      return
    }

    const author = this.state.author
    let { errorMessages } = this.state

    errorMessages = []

    if (author.length > 10000) {
      errorMessages.push('Author name ' + author.substring(0, 10000) + '... exceeds the limit of 10000 characters.')
      this.setState({ errorMessages })

      return
    }

    for (const image of this.state.selectedFiles) {
      let error = false

      if (image.name.length > 10000) {
        errorMessages.push('Image name ' + image.name.substring(0, 10000) + '... exceeds the limit of 10000 characters.')
        error = true
      }
    }

    if (errorMessages.length === 0) {
      this.setState({
        showUploadDialog: true
      })
    }
  }

  upload = async () => {
    let price = new BigNumber(0)

    for (const image of this.state.selectedFiles) {
      const imageData = await getImageData(image)

      image.width = imageData.width
      image.height = imageData.height
      image.base64 = imageData.base64

      price = price.plus(new BigNumber(new BigNumber(image.width * image.height).div(18300000).toFixed(18)))
    }

    this.props.api.payUpload(price, true).then(async (response) => {
      if (typeof response.response === 'string' && response.response as string === 'Error: Transaction rejected by user') {
        this.setState({
          showUploadDialog: false,
          showUploadProgress: false
        })

        return
      }

      this.setState({
        showUploadProgress: true
      })

      const serialNumber = (response as any).serialNumber
      const selectedFiles = this.state.selectedFiles

      const imageCount = parseInt((await this.props.api.getImageCount()).result, 10)

      this.props.api.ipfs.files.add(selectedFiles.map((image, index) => ({
        path: `uploads/${image.name}-${imageCount + index}`,
        content: Buffer.from(image.base64, 'utf8')
      }) as any)).then((filesAdded, error) => {
        if (!error) {
          selectedFiles.forEach((file, index) => {
            file.hash = filesAdded[index].hash
          })
        } else {
          console.error(error)

          return
        }

        const timer = setInterval(async () => {
          const result = JSON.parse((await this.props.api.getTransactionInfo(serialNumber)))

          if (result.data.status === 1) {
            clearInterval(timer)

            this.props.api.upload(selectedFiles, true).then((response: any) => {
              if (typeof response.response === 'string' && response.response as string === 'Error: Transaction rejected by user') {
                this.props.api.returnPaidUpload()

                this.setState({
                  showUploadDialog: false,
                  showUploadProgress: false
                })
              } else {
                // TODO: The images have been uploaded successfully, show some UI/UX here so the user can access the uploaded images. The transactions may not be finished yet so that's a small complication.

                const timer = setInterval(async () => {
                  const result = JSON.parse((await this.props.api.getTransactionInfo(serialNumber)))

                  if (result.data.status === 1) {
                    clearInterval(timer)

                    this.setState({
                      showUploadDialog: false,
                      showUploadProgress: false
                    })
                  }
                })

                const files = this.state.files.filter((file) => !selectedFiles.includes(file))

                this.setState({
                  files,
                  selectedFiles,
                  updated: true
                })
              }
            })
          }
        }, 10100)
      })
    })
  }

  updateAuthor(event: React.ChangeEvent<HTMLInputElement>) {
    const { files } = this.state
    const author = event.target.value

    for (const file of files) {
      file.author = author
    }

    this.setState({
      files,
      author
    })
  }

  renderMasonry() {
    const { classes } = this.props

    return (
      <React.Fragment>
        {this.state.files.length > 0 && <TextField label='Author' placeholder={DEFAULT_AUTHOR} className={classes.textField} value={this.state.author} onChange={(event) => this.updateAuthor(event)} margin='normal'/>}
        <Typography variant='subheading' className={classes.yourImages}>
          Your images{this.state.files.length > 0 ? ` (${this.state.files.length}, ${this.state.selectedFiles.length} selected)` : ''}:
          <Button variant='raised' className={classes.uploadButton} color='primary' onClick={this.handleUpload}>
            {this.state.selectedFiles.length > 1 ? 'Upload all' : 'Upload'}
          </Button>
          <Button variant='raised' className={classes.deleteButton} color='secondary' onClick={() => this.addToRemoveFilesList(this.state.selectedFiles)}>
            {this.state.selectedFiles.length > 1 ? 'Delete all' : 'Delete'}
          </Button>
          {!this.state.price.eq(new BigNumber(0)) && !this.state.usdPrice.eq(new BigNumber(0)) && <Typography variant='body1' className={classes.totalPriceText}>Total price: {this.state.price.toString()} NAS (~${this.state.usdPrice.toString()})</Typography>}
        </Typography>
        <Masonry elementType={'div'}>
          {this.state.files.map((file: UploadImage, index: number) => {
            return (
              <UploadImageCard fileData={file} index={index} key={index} isSelected={this.state.selectedFiles.includes(file)} selectFileCallback={(isSelected: boolean) => this.addToSelectedFilesList([file], isSelected)} removeFileCallback={() => this.addToRemoveFilesList([file])}/>
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
        <Dropzone className={classes.dropZone} accept={'image/png,image/jpeg,image/bmp'} onDrop={this.onDrop}>
          <div className={classes.dropZoneContent}>
            <FileUpload className={classes.uploadIcon}/>
            <Typography variant='headline'>
              Drop images you want to upload or click here to open a file dialog.
            </Typography>
          </div>
        </Dropzone>
        {this.state.errorMessages.map((errorMessage: string, index: number) => {
          return (
            <Typography variant='body1' component='p' className={classes.errorText}>
              <strong>Error: </strong>{errorMessage}
            </Typography>
          )
        })}

        <Dialog open={this.state.showUploadDialog} onClose={() => this.setState({
          showUploadDialog: false,
          showUploadProgress: false
        })} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description'>
          {
            this.state.showUploadDialog &&
            (this.state.showUploadProgress) ?
              <React.Fragment>
                <DialogTitle>Uploading...</DialogTitle>
                <DialogContent style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row'
                }}>
                  <CircularProgress/>
                </DialogContent>
              </React.Fragment>
              :
              <React.Fragment>
                <DialogTitle>Upload {pluralize('image', this.state.selectedFiles.length)}</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Are you sure you want to upload {this.state.selectedFiles.length} {pluralize('image', this.state.selectedFiles.length)} for {this.state.price.toString()} NAS (~${this.state.usdPrice.toString()})?<br/><br/>
                    Note: you will be prompted with two transactions and that is intended. The first transaction will send NAS to the contract and the second will upload your image(s). You need to confirm both for the upload to succeed. If you don't actually want to upload the images, just reject the first or the second transaction and all NAS will be returned to your account (excluding the gas fees).
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => this.setState({ showUploadDialog: false })} color='secondary' autoFocus>
                    No
                  </Button>
                  <Button onClick={() => this.upload()} color='primary'>
                    Yes
                  </Button>
                </DialogActions>
              </React.Fragment>
          }
        </Dialog>

        <Dialog open={this.state.showErrorDialog} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description'>
          {
            this.state.showErrorDialog &&
              <React.Fragment>
                <DialogTitle>Nebulas Web Extension Wallet is not installed</DialogTitle>
                <DialogContent>
                  <Typography>
                    Nebulas Web Extension Wallet is not installed and the upload will not continue. To install the wallet extension, follow the instructions <a href='https://github.com/ChengOrangeJu/WebExtensionWallet#webextensionwallet' target='_blank'>here</a>. After you've installed the wallet, try uploading again.
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => this.setState({ showErrorDialog: false })} color='primary' autoFocus>
                    Close
                  </Button>
                </DialogActions>
              </React.Fragment>
          }
        </Dialog>
        <br/>
        {this.renderMasonry()}
        <FileDeleteDialog files={this.state.filesToRemove} deleteFilesCallback={(shouldRemoveFiles, files) => this.removeFiles(shouldRemoveFiles, files)}/>
      </div>
    )
  }
}