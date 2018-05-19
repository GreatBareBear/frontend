import * as React from 'react'
import { withApi } from '../api/withApi'
import Api from '../api/Api'
import { Theme, TextField, Typography, Button, Dialog, DialogActions, DialogContentText, DialogContent, DialogTitle, GridListTileBar, IconButton, Tooltip, CircularProgress } from 'material-ui'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import { WithStyles, withStyles } from '../ui/withStyles'
import { observer } from 'mobx-react'
import { UploadImage } from '../models/UploadImage'
import BigNumber from 'bignumber.js'
import { getImageData, calculateImagePrice } from '../models/Image'
import Dropzone, { ImageFile } from 'react-dropzone'
import UploadImageCard from '../ui/UploadImageCard'
import { FileUpload, CloudDownload, Link } from '@material-ui/icons'
import Masonry from 'react-masonry-component'
import { pluralize, copyTextToClipboard, downloadImage } from '../utils'
import FileDeleteDialog from '../ui/FileDeleteDialog'
import { red } from '@material-ui/core/colors'
import { SvgIcon, Snackbar, Slide } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { withRouter, RouteComponentProps, Prompt } from 'react-router'

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
  close: {
    width: theme.spacing.unit * 4,
    height: theme.spacing.unit * 4
  }
})

export const DEFAULT_AUTHOR = 'Mr. Anomynous'

const routeChangeMessage = 'You have unsaved changes. Are you sure you want to leave?' 
export const snackBarMessages = {
  noImagesSelected: 'No images selected.',
  linkCopyActionSuccess: 'Image link copied!'
}

type UploadImagePageProps = WithStyles & RouteComponentProps<any> & {
  api: Api
}

@withStyles(styles)
@withApi()
@observer
class UploadImagePage extends React.Component<UploadImagePageProps, {
  files: UploadImage[],
  filesToRemove: UploadImage[]
  price: BigNumber,
  usdPrice: BigNumber,
  updated: boolean,
  author: string,
  showUploadDialog: boolean,
  showUploadProgress: boolean,
  showErrorDialog: boolean,
  showUploadFinished: boolean,
  errorMessages: string[],
  selectedFiles: UploadImage[],
  defaultSnackbarShown: boolean,
  snackBarMessage: string
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
    showUploadFinished: false,
    errorMessages: [] as string[],
    defaultSnackbarShown: false,
    snackBarMessage: snackBarMessages.noImagesSelected
  }
 
  filesToUpload = [] as UploadImage[]
 
  componentDidMount() {
    window.addEventListener('beforeunload', this.onRouteChange)
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onRouteChange)
  }

  onRouteChange = (event) => {
    if (this.state.files.length > 0) {
      (event || window.event).returnValue = routeChangeMessage
      return routeChangeMessage
    }
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
    this.calculatePrices('selectedFiles')
  }

  async calculatePrices(calculateType: string) {
    const files = calculateType === 'selectedFiles' ? this.state.selectedFiles : this.filesToUpload
    for (const [index, file] of files.entries()) {
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
    if (files.length === 0) {
      this.setState({ defaultSnackbarShown: true, snackBarMessage: snackBarMessages.noImagesSelected })
      return
    }
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

  handleUpload = async (imagesToUpload: UploadImage[] = []) => {
    const images = imagesToUpload.length > 0 ? imagesToUpload : this.state.selectedFiles
    if (images.length === 0) {
      this.setState({ defaultSnackbarShown: true, snackBarMessage: snackBarMessages.noImagesSelected })
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

    for (const image of images) {
      let error = false

      if (image.name.length > 10000) {
        errorMessages.push('Image name ' + image.name.substring(0, 10000) + '... exceeds the limit of 10000 characters.')
        error = true
      }
    }

    if (errorMessages.length === 0) {
      this.filesToUpload = images
      this.calculatePrices('filesToUpload')
      this.setState({
        showUploadDialog: true
      })
    }
  }

  upload = async () => {
    let price = new BigNumber(0)

    for (const image of this.filesToUpload) {
      const imageData = await getImageData(image)

      image.width = imageData.width
      image.height = imageData.height
      image.base64 = imageData.base64

      price = price.plus(new BigNumber(new BigNumber(image.width * image.height).div(18300000).toFixed(18)))
    }

    this.props.api.payUpload(price, true).then(async (response) => {
      if (typeof response.response === 'string' && response.response as string === 'Error: Transaction rejected by user') {
        this.filesToUpload = []
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
          let imageIndex = 0
          selectedFiles.forEach((file, index) => {
            file.hash = filesAdded[index].hash
            file.id = imageCount + imageIndex
            imageIndex++
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
                this.filesToUpload = []
                this.setState({
                  showUploadDialog: false,
                  showUploadProgress: false
                })
              } else {

                const timer = setInterval(async () => {
                  const result = JSON.parse((await this.props.api.getTransactionInfo(serialNumber)))

                  if (result.data.status === 1) {
                    clearInterval(timer)

                    this.setState({
                      showUploadProgress: false,
                      showUploadDialog: true,
                      showUploadFinished: true
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

  closeUploadFinishedDialog() {
    let { files } = this.state

    // Remove
    this.deselectFiles(this.filesToUpload)
    files = files.filter((value: UploadImage) => !this.filesToUpload.includes(value))
    this.filesToUpload = []

    this.setState({ files, showUploadDialog: false })
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
        {this.state.files.length > 0 &&
          <div>
            <TextField label='Author' placeholder={DEFAULT_AUTHOR} className={classes.textField} value={this.state.author} onChange={(event) => this.updateAuthor(event)} margin='normal' />
            <Typography variant='subheading' className={classes.yourImages}>
              Your images{this.state.files.length > 0 ? ` (${this.state.selectedFiles.length} out of ${this.state.files.length} selected)` : ''}:
              <Button variant='raised' className={classes.uploadButton} color='primary' onClick={() => this.handleUpload()}>
                {this.state.selectedFiles.length > 1 ? 'Upload all' : 'Upload'}
              </Button>
              <Button variant='raised' className={classes.deleteButton} color='secondary' onClick={() => this.addToRemoveFilesList(this.state.selectedFiles)}>
                {this.state.selectedFiles.length > 1 ? 'Delete all' : 'Delete'}
              </Button>
              {!this.state.price.eq(new BigNumber(0)) && !this.state.usdPrice.eq(new BigNumber(0)) && <Typography variant='body1' className={classes.totalPriceText}>Total price: {this.state.price.toString()} NAS (~${this.state.usdPrice.toString()})</Typography>}
            </Typography>
            <Masonry elementType={'div'}>
              {this.state.files.map((file: UploadImage, index: number) => {
                return (<UploadImageCard fileData={file} index={index} key={index} isSelected={this.state.selectedFiles.includes(file)} uploadFileCallback={() => this.handleUpload([file])} selectFileCallback={(isSelected: boolean) => this.addToSelectedFilesList([file], isSelected)} removeFileCallback={() => this.addToRemoveFilesList([file])} />)
              })}
            </Masonry>
          </div>
        }
      </React.Fragment>
    )
  }

  render() {
    const { classes } = this.props

    return (
      <div>
        <Prompt when={this.state.files.length > 0} message={routeChangeMessage} /> 
        <Typography variant='title'>
          Upload new image
        </Typography>
        <Dropzone className={classes.dropZone} accept={'image/png,image/jpeg,image/bmp'} onDrop={this.onDrop}>
          <div className={classes.dropZoneContent}>
            <FileUpload className={classes.uploadIcon} />
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

        <Dialog disableBackdropClick={true} disableEscapeKeyDown={true} open={this.state.showUploadDialog}>
          {this.state.showUploadDialog &&
            (this.state.showUploadFinished ?
              <React.Fragment>
                <DialogTitle>Upload completed</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Uploading process has completed successfully. You can see uploaded images below.
                    </DialogContentText>
                  <br />
                  <Masonry elementType='div'>
                    {this.state.selectedFiles.map((value: UploadImage, index: number) => {
                      return (
                        <div key={index} style={{ maxWidth: '260px', minWidth: '220px', boxSizing: 'border-box' }}>
                          <img style={{ width: '100%' }} src={value.base64} />
                          <div>
                            <GridListTileBar style={{ bottom: '5px' }} title={value.name} subtitle={<span>By: {value.author}</span>} actionIcon={
                              <React.Fragment>
                                <IconButton style={{ color: 'rgba(255, 255, 255, 0.54)' }} onClick={() => downloadImage(value.name, value.base64, value.type)}>
                                <Tooltip title='Download'>
                                  <CloudDownload />
                                </Tooltip>
                              </IconButton>
                              <IconButton style={{ color: 'rgba(255, 255, 255, 0.54)' }} onClick={() => { copyTextToClipboard('https://imgcube.github.io/raw/' + value.id); this.setState({ defaultSnackbarShown: true, snackBarMessage: snackBarMessages.linkCopyActionSuccess }) }}>
                                <Tooltip title='Copy link'>
                                  <SvgIcon>
                                    <path fill='none' d='M0 0h24v24H0z' />
                                    <path d='M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm-1 4l6 6v10c0 1.1-.9 2-2 2H7.99C6.89 23 6 22.1 6 21l.01-14c0-1.1.89-2 1.99-2h7zm-1 7h5.5L14 6.5V12z' />
                                  </SvgIcon>
                                </Tooltip>
                              </IconButton>
                            </React.Fragment>
                          } />
                        </div>
                      </div>
                    )
                  })}
                </Masonry>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => this.closeUploadFinishedDialog()} color='primary'>
                  CLOSE
                    </Button>
              </DialogActions>
            </React.Fragment>
            : this.state.showUploadProgress ?
              <React.Fragment>
                <DialogTitle>Uploading...</DialogTitle>
                <DialogContent style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row'
                }}>
                  <CircularProgress />
                </DialogContent>
              </React.Fragment>
              :
              <React.Fragment>
                  <DialogTitle>Upload {pluralize('image', this.filesToUpload.length)}</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Are you sure you want to upload {this.filesToUpload.length} {pluralize('image', this.filesToUpload.length)} for {this.state.price.toString()} NAS (~${this.state.usdPrice.toString()})?<br /><br />
                      Note: you will be prompted with two transactions and that is intended. The first transaction will send NAS to the contract and the second will upload your image(s). You need to confirm both for the upload to succeed. If you don't actually want to upload the images, just reject the first or the second transaction and all NAS will be returned to your account (excluding the gas fees).
                  </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => {this.calculatePrices('selectedFiles'); this.setState({ showUploadDialog: false })}} color='secondary' autoFocus>
                      No
                  </Button>
                    <Button onClick={() => this.upload()} color='primary'>
                      Yes
                  </Button>
                  </DialogActions>
                </React.Fragment>
            )}
        </Dialog>

        <Dialog open={this.state.showErrorDialog} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description'>
          {
            this.state.showErrorDialog &&
            <React.Fragment>
              <DialogTitle>Nebulas Web Extension Wallet is not installed</DialogTitle>
              <DialogContent>
                <Typography>
                  Upload cannot continue because Nebulas Web Extension Wallet is not installed. To install the wallet extension, follow the instructions <a href='https://github.com/ChengOrangeJu/WebExtensionWallet#webextensionwallet' target='_blank'>here</a>. After you've installed the wallet, try uploading again.
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
        <br />
        {this.renderMasonry()}
        <FileDeleteDialog files={this.state.filesToRemove} deleteFilesCallback={(shouldRemoveFiles, files) => this.removeFiles(shouldRemoveFiles, files)} />
        <Snackbar
          open={this.state.defaultSnackbarShown}
          onClose={() => this.setState({ defaultSnackbarShown: false })}
          TransitionComponent={TransitionUp}
          message={<span>{this.state.snackBarMessage}</span>}
          action={
            <IconButton
              key='close'
              aria-label='Close'
              color='inherit'
              className={classes.close}
              onClick={() => this.setState({ defaultSnackbarShown: false })}
            >
              <CloseIcon />
            </IconButton>
          }
        />
      </div>
    )
  }
}

function TransitionUp(props) {
  return <Slide {...props} direction='up' />
}

export default withRouter(UploadImagePage)