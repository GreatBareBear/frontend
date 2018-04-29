import { Typography } from 'material-ui'
import * as React from 'react'
import Dropzone from 'react-dropzone'

export default class App extends React.Component<any> {

  onDrop(acceptedFiles: any, rejectedFiles: any) {
      rejectedFiles.forEach((file: any) => {
          console.log("Rejected file: "+file.name)
      })
      console.log("Upload accepted files", acceptedFiles)
  }

  render() {
    return (
      <div>
        <Typography variant='title'>
            Upload a new photo
        </Typography>
        <Dropzone accept={"image/gif,image/png,image/jpeg,image/bmp"} onDrop={this.onDrop.bind(this)}>
            <p>Drop images you want to upload here, or click here to open a file dialog.</p>
        </Dropzone>
      </div>
    )
  }
}
