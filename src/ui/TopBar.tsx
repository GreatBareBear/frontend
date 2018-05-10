import FileUpload from '@material-ui/icons/FileUpload'
import classNames = require('classnames')
import { AppBar, Button, Toolbar, Typography, Select, MenuItem } from 'material-ui'
import { Theme } from 'material-ui/styles/'
import * as React from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { WithStyles, withStyles } from './withStyles'

const styles = (theme: Theme) => ({
  flex: {
    flex: 1
  },
  title: {
    cursor: 'pointer'
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  }
})

@withStyles(styles)
class TopBar extends React.Component<WithStyles & RouteComponentProps<any>> {

  state = {
    currentEndpoint: "Mainnet"
  }

  constructor(props: any) {
    super(props)
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <AppBar position='absolute' className={classes.appBar}>
          <Toolbar>
            <Typography variant='title' color='inherit' className={classNames(classes.flex)}>
              <a className={classes.title} onClick={() => this.props.history.push('/')}>ImageCube</a>
            </Typography>
            <Typography variant='subheading' color='inherit' style={{ marginRight: '8px' }}>
              Current endpoint:
            </Typography>
            <Select autoWidth={true} value={this.state.currentEndpoint} onChange={(event) => this.setState({ currentEndpoint: event.target.value })}>
              <MenuItem value={"Mainnet"}>Mainnet</MenuItem>
              <MenuItem value={"Testnet"}>Testnet</MenuItem>
            </Select>
            <Button color='inherit' onClick={() => this.props.history.push('/upload')}>
              <FileUpload/>
              Upload new image
            </Button>
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}

export default withRouter(TopBar)