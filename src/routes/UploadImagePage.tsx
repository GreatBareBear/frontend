import FileUpload from '@material-ui/icons/FileUpload'
import { Button, Theme, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from 'material-ui'
import * as React from 'react'
import Dropzone, { ImageFile } from 'react-dropzone'
import Masonry from 'react-masonry-component'
import { CSSProperties } from 'material-ui/styles/withStyles'
import { observer } from 'mobx-react'
import * as LZString from 'lz-string'
import UploadImageCard from '../ui/UploadImageCard'
import { WithStyles, withStyles } from '../ui/withStyles'
import { UploadImage } from '../models/UploadImage'
import FileDeleteDialog from '../ui/FileDeleteDialog'
import { withApi } from '../api/withApi'
import Api from '../api/Api'
import BigNumber from 'bignumber.js'
import Account from '../nebulify/Account'
import { calculateImagePrice, getImageData } from '../models/Image'

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
  price: BigNumber,
  usdPrice: BigNumber,
  updated: boolean
}> {
  state = {
    files: [] as UploadImage[],
    filesToRemove: [] as UploadImage[],
    price: null,
    usdPrice: null,
    updated: false
  }

  async componentDidUpdate() {
    if (this.state.updated === false) {
      return
    }

    if (this.state.files.length === 0) {
      this.setState({
        price: new BigNumber(0),
        usdPrice: new BigNumber(0),
        updated: false
      })
    }

    for (const [index, file] of this.state.files.entries()) {
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
    this.setState({ files, updated: true })
  }

  removeFiles(shouldRemoveFiles: boolean, filesToRemoveArray: UploadImage[]) {
    let { files, filesToRemove } = this.state
    if (shouldRemoveFiles) {
      files = files.filter((value: UploadImage) => !filesToRemoveArray.includes(value))
    }
    filesToRemove = filesToRemove.filter((value: UploadImage) => !filesToRemoveArray.includes(value))
    this.setState({ files, filesToRemove, updated: true })
  }

  addToRemoveFilesList(files: UploadImage[]) {
    let filesToRemove = this.state.filesToRemove
    filesToRemove = filesToRemove.concat(files)
    this.setState({ filesToRemove })
  }

  upload = async () => {
    for (const image of this.state.files) {
      const imageData = await getImageData(image)
      const compressedBase64 = LZString.compress(imageData.base64)
      const account = Account.fromAddress('n1dKm4RoCwaCipdagufwwkgfbMYxTLu1ZbP')

      account.setPrivateKey('0e3af9beaed8519942b7d8c8481df7f4716b3ff32b15e752501ad9afd70b92cd')

      console.log(imageData.base64)

      const result = await this.props.api.upload(imageData.width, imageData.height, compressedBase64, image.name, image.author, image.category, account, new BigNumber(new BigNumber(imageData.width * imageData.height).div(18300000).toString().replace('.', '')))

      // TODO: Show error
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
          {this.state.price && this.state.usdPrice && <Typography variant='body1' className={classes.totalPriceText}>Total price: {this.state.price.toString()} NAS (~{this.state.usdPrice.toString()} USD)</Typography>}
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
        <Dropzone className={classes.dropZone} accept={'image/png,image/jpeg,image/bmp'} onDrop={this.onDrop}>
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