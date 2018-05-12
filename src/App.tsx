import { createMuiTheme, CssBaseline, Drawer, ListItem, ListItemText, ListSubheader, MuiThemeProvider, Typography } from 'material-ui'
import { Theme } from 'material-ui/styles/'
import { CSSProperties } from 'material-ui/styles/withStyles'
import * as React from 'react'
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router'
import { indigo, red } from 'material-ui/colors'
import UploadImagePage from './routes/UploadImagePage'
import GalleryPage from './ui/GalleryPage'
import TopBar from './ui/TopBar'
import { WithStyles, withStyles } from './ui/withStyles'
import { Image } from './models/Image'
import { categories, isValidCategory } from './models/categories'
import { withApi } from './api/withApi'
import Api from './api/Api'
import BigNumber from 'bignumber.js'
import Account from './nebulify/src/Account'
import { observer } from 'mobx-react'

const styles = (theme: Theme) => ({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    minHeight: '100vh'
  } as CSSProperties,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    minWidth: 0
  },
  media: {
    height: 0,
    paddingTop: '56.25%' // 16:9
  },
  drawerPaper: {
    position: 'relative',
    width: 240,
    height: '100%'
  } as CSSProperties,
  icon: {
    color: 'rgba(255, 255, 255, 0.54)'
  },
  toolbar: theme.mixins.toolbar as CSSProperties,
  versionText: {
    position: 'fixed',
    left: 0,
    bottom: 0
  } as CSSProperties
})

const theme = createMuiTheme({
  palette: {
    primary: indigo,
    secondary: red
  }
})

type AppProps = WithStyles & RouteComponentProps<{}> & {
  api: Api
}

@withStyles(styles)
@withApi()
class App extends React.Component<AppProps, {
  images: Image[],
  galleryShouldBeLoading: boolean,
  anyImages: boolean
}> {
  category = {
    name: categories[0],
    updated: false
  }

  state = {
    images: [] as Image[],
    galleryShouldBeLoading: false,
    anyImages: true
  }

  constructor(props: any) {
    super(props)
  }

  componentDidMount() {
    if (!this.category.updated) {
      this.updateImageList()
    }
  }

  componentDidUpdate() {
    if (!this.category.updated) {
      this.updateImageList()
    }
  }

  renderCategoryButtons() {
    const categoryButtonList = [] as any[]
    categories.forEach((element, index) => {
      categoryButtonList.push(
        <ListItem button onClick={() => this.props.history.push('/category/' + element)} key={index}>
          <ListItemText primary={element}/>
        </ListItem>
      )
    })
    return categoryButtonList
  }

  updateImageList = async (imageCount: number = 20, append: boolean = false) => {
    if (this.state.galleryShouldBeLoading) {
      return
    }

    const images = append ? this.state.images : []
    const categoryName = this.category.name
    const min = 100
    const max = 300
    const currentIndex = append ? this.state.images.length + 1 : 1
    const forLength = append ? this.state.images.length + imageCount : imageCount

    const account = Account.fromAddress('n1NmQoV2349d3jp2TJoDDZbdErGFM5X331E')

    account.setPrivateKey('your private key')

    this.setState({ galleryShouldBeLoading: true, anyImages: true })

    const result = await this.props.api.query(imageCount, this.state.images.length || 1, categoryName, account, new BigNumber(0), true)

    if (result.result === '') {
      this.setState({ images: [], galleryShouldBeLoading: false, anyImages: false })

      return
    }

    const rawImages = JSON.parse(result.result) as any

    if (rawImages.length === this.state.images.length) {
      return
    }

    for (const [index, rawImage] of rawImages.entries()) {
      images.push({
        index,
        name: rawImage.name,
        src: rawImage.base64,
        author: rawImage.author,
        width: rawImage.width,
        height: rawImage.height
      })
    }

    console.log('done')

    this.category.updated = true
    this.setState({ images, galleryShouldBeLoading: false, anyImages: true })
  }

  updateEndpoint = (isTestnet: boolean) => {
    this.updateImageList()
  }

  render() {
    const { classes } = this.props

    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.root}>
          <CssBaseline/>
          <TopBar onEndpointChange={this.updateEndpoint}/>
          <Drawer variant='permanent' classes={{
            paper: classes.drawerPaper
          }}>
            <div className={classes.toolbar}/>
            <ListSubheader component='div'>Categories</ListSubheader>
            {this.renderCategoryButtons()}
            <ListSubheader component='div' disableSticky={true} className={classes.versionText}>imgCube Web v1.0</ListSubheader>
          </Drawer>
          <div className={classes.content}>
            <div className={classes.toolbar}/>
            <Switch>
              <Route exact path='/upload' component={UploadImagePage}/>
              <Route path='/category/:id' render={({ match }) => {
                if (!isValidCategory(match.params.id)) {
                  return (
                    <GalleryPage infiniteScrollCooldownLength={3000} pushMoreCallback={this.updateImageList} currentCategory={this.category.name} images={this.state.images} shouldBeLoading={this.state.galleryShouldBeLoading} anyImages={this.state.anyImages}/>
                  )
                }
              }}/>
              <Route path='/' render={() => {
                if (this.category.name !== 'Random') {
                  this.category = { name: 'Random', updated: false }
                }

                console.log('galleryShouldBeLoading', this.state.galleryShouldBeLoading)

                return (
                  <GalleryPage infiniteScrollCooldownLength={3000} pushMoreCallback={this.updateImageList} currentCategory={this.category.name} images={this.state.images} shouldBeLoading={this.state.galleryShouldBeLoading} anyImages={this.state.anyImages}/>
                )
              }}/>
            </Switch>
          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default withRouter(App)
