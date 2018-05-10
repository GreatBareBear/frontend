import { CssBaseline, Drawer, ListItem, ListItemText, ListSubheader, Typography } from 'material-ui'
import { Theme } from 'material-ui/styles/'
import { CSSProperties } from 'material-ui/styles/withStyles'
import * as React from 'react'
import { Route, RouteComponentProps, Switch } from 'react-router'
import { withRouter } from 'react-router-dom'
import UploadImage from './routes/UploadImage'
import Gallery from './ui/Gallery'
import TopBar from './ui/TopBar'
import { WithStyles, withStyles } from './ui/withStyles'
import { Image } from './models/Image'

const styles = (theme: Theme) => ({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden' as 'hidden',
    position: 'relative' as 'relative',
    display: 'flex' as 'flex',
    minHeight: '100vh'
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
    width: 240,
    height: '100%'
  },
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

export const categories: string[] = [
  'Cats',
  'Dogs',
  'Memes',
  'Burgers',
  'Cartoons',
  'Fun',
  'Art',
  'Nufflee',
  'TheChoconut',
  'Other'
]

const isValidCategory = (categoryQueryName: string) => {
  return categories.includes(categoryQueryName)
}

@withStyles(styles)
class App extends React.Component<WithStyles & RouteComponentProps<{}>, {
  images: Image[]
}> {

  category = {
    name: categories[0],
    updated: false
  }

  state = {
    images: [] as Image[]
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

  updateImageList = (imageCount: number = 20, append: boolean = false) => {
    const images = append ? this.state.images : []
    const categoryName = this.category.name
    const min = 100
    const max = 300
    const currentIndex = append ? this.state.images.length + 1 : 1
    const forLength = append ? this.state.images.length + imageCount : imageCount

    for (let index = currentIndex; index <= forLength; index++) {
      const category = categoryName === 'Random' ? categories[Math.floor(Math.random() * categories.length)] : categoryName
      images.push({
        index,
        name: `${category}-${index}`,
        src: `https://source.unsplash.com/random?${category},${index}`,
        author: 'Nuff Lee',
        width: Math.floor(Math.random() * (max - min + 1)) + min,
        height: Math.floor(Math.random() * (max - min + 1)) + min
      })
    }

    this.category.updated = true
    this.setState({ images })
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <CssBaseline/>
        <TopBar/>
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
            <Route exact path='/upload' component={UploadImage}/>
            <Route path='/category/:id' render={({ match }) => {
              if (!isValidCategory(match.params.id)) {
                return (
                  <Typography variant='title'>
                    Category '<strong>{match.params.id}</strong>' does not exist!
                  </Typography>
                )
              }
              if (this.category.name !== match.params.id) {
                this.category = { name: match.params.id, updated: false }
              }
              return (
                <Gallery infiniteScrollCooldownLength={3000} pushMoreCallback={this.updateImageList} currentCategory={this.category.name} images={this.state.images}/>
              )
            }}/>
            <Route path='/' render={() => {
              if (this.category.name !== 'Random') {
                this.category = { name: 'Random', updated: false }
              }
              return (
                <Gallery infiniteScrollCooldownLength={3000} pushMoreCallback={this.updateImageList} currentCategory={this.category.name} images={this.state.images}/>
              )
            }}/>
          </Switch>
        </div>
      </div>
    )
  }
}

export default withRouter(App)
