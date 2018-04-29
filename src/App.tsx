import InfoIcon from '@material-ui/icons/Info'
import { CssBaseline, Drawer, GridList, GridListTile, GridListTileBar, IconButton, ListItem, ListItemText, ListSubheader } from 'material-ui'
import { Theme } from 'material-ui/styles/'
import { CSSProperties } from 'material-ui/styles/withStyles'
import * as React from 'react'
import { Route, RouteComponentProps, Switch } from 'react-router'
import { Link, withRouter } from 'react-router-dom'
import NewPhoto from './routes/NewPhoto'
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
  card: {
    maxWidth: 345
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
  "Burgers"
]

@withStyles(styles)
class App extends React.Component<WithStyles & RouteComponentProps<any>> {

  category = {
    name: categories[0],
    updated: false
  }

  state = {
    cards: [] as any[]
  }

  constructor(props: any) {
    super(props)
  }

  componentDidMount() {
    if (!this.category.updated) {
      this.generateImages(this.category.name)
    }
  }

  componentDidUpdate() {
    if (!this.category.updated) {
      this.generateImages(this.category.name)
    }
  }

  generateImage(imageData: any) {
    const { classes } = this.props
    const { name, category, author, index } = imageData
    return (
      <GridListTile className={classes.card} key={index}>
        <img
          src={`https://source.unsplash.com/random?${category},${index}`}
          title={ name }
        />
        <GridListTileBar
          title={ name }
          subtitle={<span>by: {author}</span>}
          actionIcon={
            <IconButton className={classes.icon}>
              <InfoIcon />
            </IconButton>
          }
          />
      </GridListTile>
    )
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

  generateImages(category: string, imageCount: number = 20) {
    const cardsInstance = []
    for (let index = 1; index <= imageCount; index++) {
      cardsInstance.push(this.generateImage({ index, category, name: category+" "+index, author: "Nuff Lee" }))
    }
    this.category.updated = true
    this.setState({ cards: cardsInstance })
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
          <ListSubheader component="div">CATEGORIES</ListSubheader>
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
              <GridList cellHeight={180} className={classes.gridList}>
                {this.state.cards}
              </GridList>
            )}} />
          <Route path="/" render={() => (
            <GridList cellHeight={180} className={classes.gridList}>
              {this.state.cards}
            </GridList>
          )} />
          </Switch>
        </div>
      </div>
    )
  }
}

export default withRouter(App)
