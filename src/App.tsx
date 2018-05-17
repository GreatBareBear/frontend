import { createMuiTheme, CssBaseline, Drawer, ListItem, ListItemText, ListSubheader, MuiThemeProvider, Typography } from 'material-ui'
import { Theme } from 'material-ui/styles/'
import { CSSProperties } from 'material-ui/styles/withStyles'
import * as React from 'react'
import { Redirect, Route, RouteComponentProps, Switch, withRouter } from 'react-router'
import { indigo, red } from 'material-ui/colors'
import BigNumber from 'bignumber.js'
import * as _ from 'lodash'
import UploadImagePage from './routes/UploadImagePage'
import GalleryPage from './ui/GalleryPage'
import TopBar from './ui/TopBar'
import { WithStyles, withStyles } from './ui/withStyles'
import { Image } from './models/Image'
import { categories, isValidCategory } from './models/categories'
import { withApi } from './api/withApi'
import Api from './api/Api'

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
          <ListItemText primary={_.startCase(element)}/>
        </ListItem>
      )
    })
    return categoryButtonList
  }

  updateImageList = async (imageCount: number = 40, append: boolean = false) => {
    if (this.state.galleryShouldBeLoading) {
      return
    }
    
    const images = append ? this.state.images : []
    const categoryName = this.category.name

    this.setState({ images, galleryShouldBeLoading: true, anyImages: true })

    const result = await this.props.api.query(imageCount, this.state.images.length || 1, categoryName, new BigNumber(0))
    
    if (result.length === 0) {
      this.setState({ images, galleryShouldBeLoading: false, anyImages: false })
      this.category.updated = true

      return
    }

    const imagesLength = this.state.images.length

    const promises = []

    for (const [index, rawImage] of result.entries()) {
      const promise = this.props.api.ipfs.files.get(`${rawImage.url}`)

      promises.push(promise)

      promise.then((files, error) => {
        if (error) {
          console.error(error)

          return
        }

        images.push({
          index: index + imagesLength,
          name: rawImage.name,
          src: files[0].content.toString('utf8'),
          author: rawImage.author,
          width: rawImage.width,
          height: rawImage.height
        })
      })
    }

    Promise.all(promises).then(() => {
      this.category.updated = true
      this.setState({ images, galleryShouldBeLoading: false, anyImages: true })
    })
  }

  updateEndpoint = () => {
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
                if (this.category.name !== match.params.id) {
                  this.category.name = match.params.id
                  this.category.updated = false                 
                }

                if (isValidCategory(match.params.id)) {
                  if (match.params.id !== match.params.id.toLowerCase()) {
                    return <Redirect to={`/category/${match.params.id.toLowerCase()}`}/>
                  }

                  return <GalleryPage infiniteScrollCooldownLength={3000} pushMoreCallback={this.updateImageList} currentCategory={this.category.name} images={this.state.images} shouldBeLoading={this.state.galleryShouldBeLoading} anyImages={this.state.anyImages} />
                } else {
                  return (
                    <Typography variant={'title'}>
                      Category '{match.params.id}' does not exist.
                    </Typography>
                  )
                }
              }}/>
              <Route path='/' render={() => {
                return <Redirect to='/category/all'/>
              }}/>
            </Switch>
          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default withRouter(App)
