import { createMuiTheme, CssBaseline, Drawer, ListItem, ListItemText, ListSubheader, MuiThemeProvider, Typography, Dialog, DialogTitle, DialogContent, Button, DialogActions } from 'material-ui'
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
  anyImages: boolean,
  tosDialogOpened: boolean
}> {
  category = {
    name: categories[0],
    updated: false
  }

  state = {
    images: [] as Image[],
    galleryShouldBeLoading: false,
    anyImages: true,
    tosDialogOpened: false
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

  renderToSDialog() {
    const firstTimeUsage = localStorage.getItem('firstSiteUsage')
    if (firstTimeUsage === null) {
      this.state.tosDialogOpened = true
      return (
        <Dialog open={this.state.tosDialogOpened} onClose={() => {localStorage.setItem('firstSiteUsage', 'true'); this.setState({ tosDialogOpened: false })}}>
          <React.Fragment>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogContent>
              <Typography>
                <h2>imgCube Terms of Service</h2>
                <h3>1. Terms</h3>
                <p>By accessing the website at <a href='https://imgcube.github.io'>https://imgcube.github.io</a>, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.</p>
                <h3>2. Use License</h3>
                <ol>
                  <li>Permission is granted to temporarily download one copy of the materials (information or software) on imgCube's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                <ol>
                      <li>modify or copy the materials;</li>
                      <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                      <li>attempt to decompile or reverse engineer any software contained on imgCube's website;</li>
                      <li>remove any copyright or other proprietary notations from the materials; or</li>
                      <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                    </ol>
                  </li>
                  <li>This license shall automatically terminate if you violate any of these restrictions and may be terminated by imgCube at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.</li>
                </ol>
                <h3>3. Disclaimer</h3>
                <ol>
                  <li>The materials on imgCube's website are provided on an 'as is' basis. imgCube makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</li>
                  <li>Further, imgCube does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.</li>
                </ol>
                <h3>4. Limitations</h3>
                <p>In no event shall imgCube or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on imgCube's website, even if imgCube or a imgCube authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.</p>
                <h3>5. Accuracy of materials</h3>
                <p>The materials appearing on imgCube's website could include technical, typographical, or photographic errors. imgCube does not warrant that any of the materials on its website are accurate, complete or current. imgCube may make changes to the materials contained on its website at any time without notice. However imgCube does not make any commitment to update the materials.</p>
                <h3>6. Links</h3>
                <p>imgCube has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by imgCube of the site. Use of any such linked website is at the user's own risk.</p>
                <h3>7. Modifications</h3>
                <p>imgCube may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.</p>
                <h3>8. Governing Law</h3>
                <p>These terms and conditions are governed by and construed in accordance with the laws of Croatia and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
                <h2>Privacy Policy</h2>
                <p>Your privacy is important to us. It is imgCube's policy to respect your privacy regarding any information we may collect from you across our website, <a href='https://imgcube.github.io'>https://imgcube.github.io</a>, and other sites we own and operate.</p>
                <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
                <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorised access, disclosure, copying, use or modification.</p>
                <p>We don’t share any personally identifying information publicly or with third-parties, except when required to by law.</p>
                <p>Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.</p>
                <p>You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services.</p>
                <p>Your continued use of our website will be regarded as acceptance of our practices around privacy and personal information. If you have any questions about how we handle user data and personal information, feel free to contact us.</p>
                <p>This policy is effective as of 20 May 2018.</p>
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {localStorage.setItem('firstSiteUsage', 'true'); this.setState({ tosDialogOpened: false })}} color='primary' autoFocus>
                I agree to the Terms of Service
              </Button>
            </DialogActions>
          </React.Fragment>
        </Dialog>
      )
    }
    return null
  }
  
  rawStatus = -2

  render() {
    const { classes } = this.props

    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.root}>
          <CssBaseline/>
          <TopBar onEndpointChange={this.updateEndpoint}/>
          <Drawer variant='permanent' classes={{ paper: classes.drawerPaper }}>
            <div className={classes.toolbar}/>
            <ListSubheader component='div'>Categories</ListSubheader>
            {this.renderCategoryButtons()}
            <ListSubheader component='div' disableSticky={true} className={classes.versionText}>imgCube Web v1.0</ListSubheader>
          </Drawer>
          {this.renderToSDialog()}
          <div className={classes.content}>
            <div className={classes.toolbar}/>
            <Switch>
              <Route path='/raw/:id' render={({ match }) => {
                if (!isNaN(match.params.id) && this.rawStatus === -2) {
                    const imageId = Number(match.params.id)
                    this.rawStatus = -1
                    this.props.api.query(imageId + 2, imageId + 1, 'all', new BigNumber(0)).then((result) => {
                      if (result.length > 0) {
                        this.props.api.ipfs.get(result[0].url).then((files, error) => {
                          if (error) {
                            console.error(error)
                            this.rawStatus = 1
                            return
                          }
                          this.rawStatus = 0
                          document.getElementsByTagName('head')[0].innerHTML = ''
                          document.body.innerHTML = ''
                          document.body.style.margin = '0px'
                          document.body.style.background = '#0e0e0e'
                          document.body.style.display = 'flex'
                          document.body.style.justifyContent = 'center'
                          const image: HTMLImageElement = document.createElement('img')
                          image.src = files[0].content.toString('utf8')
                          image.style.height = '100vh'
                          document.body.appendChild(image)
                        })
                      } else {
                        if (this.rawStatus !== 1) {
                          alert('Image with id "'+imageId+'" doesn\'t exist.')
                          this.rawStatus = 1
                        }
                      }
                    })
                    return (<Typography variant='headline'>Generating image {match.params.id}... </Typography>)
                }
                if (this.rawStatus === 1) {
                  return (<Typography variant='headline'>Image with id '{match.params.id}' doesn't exist. </Typography>)
                } else if (this.rawStatus === -2) {
                  return (<Typography variant='headline'>Invalid image id '{match.params.id}'. </Typography>)
                } else if (this.rawStatus === -1) {
                  return (<Typography variant='headline'>Fetching Nebulas data for image {match.params.id}... </Typography>)
                } else {
                  return null
                }
                
              }} />
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
