import FileUpload from '@material-ui/icons/FileUpload'
import classNames = require('classnames')
import { AppBar, Button, Toolbar, Typography, Select, MenuItem, MuiThemeProvider, createMuiTheme } from 'material-ui'
import { Theme } from 'material-ui/styles/'
import * as React from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { WithStyles, withStyles } from './withStyles'
import { withApi } from '../api/withApi'
import Api from '../api/Api'
import * as Logo from '../assets/Logo.png'

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

type TopBarProps = WithStyles & RouteComponentProps<any> & {
  api: Api,
  onEndpointChange: (isTestnet: boolean) => void
}

const endpointSelectTheme = createMuiTheme({
  overrides: {
    MuiSelect: {
      root: {
        color: 'white'
      },
      select: {
        color: 'white'
      },
      icon: {
        color: 'white'
      },
      selectMenu: {
        color: 'white'
      }
    },
    MuiInput: {
      underline: {
        '&:hover&:before': {
          backgroundColor: 'rgba(255, 255, 255, 0.87)'
        }
      }
    }
  }
})

@withStyles(styles)
@withApi()
class TopBar extends React.Component<TopBarProps> {
  state = {
    // TODO: This should be Mainnet in prod
    currentEndpoint: 'Testnet'
  }

  constructor(props: any) {
    super(props)
  }

  updateEndpoint = (event: any) => {
    const isTestnet = event.target.value === 'Testnet'

    this.props.api.setApi(isTestnet)
    this.props.onEndpointChange(isTestnet)
    this.setState({ currentEndpoint: event.target.value })
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <AppBar position='absolute' className={classes.appBar}>
          <Toolbar>
            <img src={Logo} style={{
              width: '48px',
              height: '58px',
              margin: '7px'
            }}/>
            <Typography variant='title' color='inherit' className={classNames(classes.flex)}>
              <a className={classes.title} onClick={() => this.props.history.push('/')} style={{
                marginLeft: '15px'
              }}>imgCube</a>
            </Typography>
            <MuiThemeProvider theme={endpointSelectTheme}>
              <Select autoWidth={true} value={this.state.currentEndpoint} color='primary' disableUnderline={true} onChange={this.updateEndpoint}>
                <MenuItem value='Mainnet'>Mainnet</MenuItem>
                <MenuItem value='Testnet'>Testnet</MenuItem>
              </Select>
            </MuiThemeProvider>
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

export default withRouter(TopBar) as React.ComponentClass<{
  onEndpointChange: (isTestnet: boolean) => void
}>