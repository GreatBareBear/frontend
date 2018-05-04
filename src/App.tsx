import InfoIcon from '@material-ui/icons/Info'
import { CssBaseline, Drawer, GridList, GridListTile, GridListTileBar, IconButton, ListItem, ListItemText, ListSubheader } from 'material-ui'
import { Theme } from 'material-ui/styles/'
import { CSSProperties } from 'material-ui/styles/withStyles'
import * as React from 'react'
import { Route, RouteComponentProps, Switch } from 'react-router'
import { Link, withRouter } from 'react-router-dom'
import NewPhoto from './routes/NewPhoto'
import CollectionImageGrid from './ui/ImageGrid/CollectionImageGrid'
import TopBar from './ui/TopBar'
import { WithStyles, withStyles } from './ui/withStyles'

const styles = (theme: Theme) => ({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden' as 'hidden',
    position: 'relative' as 'relative',
    display: 'flex' as 'flex'
  },
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
    position: 'relative' as 'relative',
    width: 240
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.54)'
  },
  toolbar: theme.mixins.toolbar as CSSProperties
})

const categories = [
  "Cats",
  "Dogs",
  "Memes",
  "Burgers",
  "Cartoons",
  "Fun",
  "Art"
]

@withStyles(styles)
class App extends React.Component<WithStyles & RouteComponentProps<any>> {

  category = {
    name: categories[0],
    updated: false
  }

  state = {
    images: [] as any[]
  }

  constructor(props: any) {
    super(props)
    this.pushMoreImages = this.pushMoreImages.bind(this)
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

  generateCategoryButtons() {
    const categoryButtonList = [] as any[]
    categories.forEach((element, index) => {
      categoryButtonList.push(
        <ListItem button onClick={() => this.props.history.push("/category/" + element)} key={index}>
            <ListItemText primary={element} />
        </ListItem>
      )
    })
    return categoryButtonList
  }

  pushMoreImages(pushCount: number = 10) {
    const images = this.state.images
    const categoryName = this.category.name
    const min = 100
    const max = 300
    const currentImageCount = this.state.images.length
    for (let index = currentImageCount + 1; index <= currentImageCount+pushCount; index++) {
      images.push({
        index,
        src: `https://source.unsplash.com/random?${categoryName},${index}`,
        author: 'Nuff Lee',
        width: Math.floor(Math.random() * (max - min + 1)) + min,
        height: Math.floor(Math.random() * (max - min + 1)) + min
      })
    }
    this.category.updated = true
    this.setState({ images })
  }

  updateImageList(imageCount: number = 20) {
    const images = []
    const categoryName = this.category.name
    const min = 100
    const max = 300
    for (let index = 1; index <= imageCount; index++) {
      images.push({
        index,
        src: `https://source.unsplash.com/random?${categoryName},${index}`,
        author: 'Nuff Lee',
        width: Math.floor(Math.random() * (max - min + 1)) + min,
        height: Math.floor(Math.random() * (max - min + 1)) + min
       })
    }
    this.category.updated = true
    this.setState({ images })
  }

  public render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <CssBaseline />
        <TopBar />
        <Drawer
          variant="permanent"
          classes={{
            paper: classes.drawerPaper
          }}
        >
          <div className={classes.toolbar} />
          <ListSubheader component="div">Categories</ListSubheader>
          {this.generateCategoryButtons()}
        </Drawer>
        <div className={classes.content}>
          <div className={classes.toolbar} />
          <Switch>
          <Route exact path="/upload" component={NewPhoto} />
          <Route path="/category/:id" render={({ match }) => {
            if (this.category.name !== match.params.id) {
              this.category = { name: match.params.id, updated: false }
            }
            return (
              <CollectionImageGrid pushMoreCallback={this.pushMoreImages} images={this.state.images} />
            )}} />
          <Route path="/" render={() => (
              <CollectionImageGrid pushMoreCallback={this.pushMoreImages} images={this.state.images} />
          )} />
          </Switch>
        </div>
      </div>
    )
  }
}

export default withRouter(App)
