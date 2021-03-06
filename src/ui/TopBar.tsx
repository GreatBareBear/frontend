import FileUpload from '@material-ui/icons/FileUpload'
import classNames = require('classnames')
import { AppBar, Button, Toolbar, Typography, Select, MenuItem, MuiThemeProvider, createMuiTheme } from '@material-ui/core'
import { Theme } from '@material-ui/core/styles/'
import * as React from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { WithStyles, withStyles } from './withStyles'
import { withApi } from '../api/withApi'
import Api from '../api/Api'
import * as Logo from '../assets/Logo.svg'

const styles = (theme: Theme) => ({
  flex: {
    flex: 1
  },
  title: {
    cursor: 'pointer',
    paddingLeft: '10px'
  },
  titleIcon: {
    width: '40px',
    height: '50px',
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
  api: Api
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

  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <AppBar position='absolute' className={classes.appBar}>
          <Toolbar>
            <img src={Logo} className={classes.titleIcon} onClick={() => this.props.history.push('/')}/>
            <Typography variant='title' color='inherit' className={classNames(classes.flex)}>
              <a className={classes.title} onClick={() => this.props.history.push('/')}>imgCube</a>
            </Typography>
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