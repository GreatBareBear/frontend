import InfoIcon from '@material-ui/icons/Info'
import { Card, CardContent, CardMedia, CssBaseline, Drawer, GridList, GridListTile, GridListTileBar, IconButton, ListItem, ListItemIcon, ListItemText, Typography } from 'material-ui'
import { Theme } from 'material-ui/styles/'
import { CSSProperties } from 'material-ui/styles/withStyles'
import * as React from 'react'
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
    minWidth: 0 // So the Typography noWrap works
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

@withStyles(styles)
class App extends React.Component<WithStyles> {
  state = {
    cards: [] as any[]
  }

  constructor(props: WithStyles) {
    super(props)

    this.randomImageCards()
  }

  randomImageCard(key: number) {
    const { classes } = this.props
    return (
      <GridListTile className={classes.card} key={key}>
        <img
          src={`https://source.unsplash.com/random?${key}`}
          title="Contemplative Reptile"
        />
        <GridListTileBar
          title={"Image"}
          subtitle={<span>by: Nuff Lee</span>}
          actionIcon={
            <IconButton className={classes.icon}>
              <InfoIcon />
            </IconButton>
          }
          />
      </GridListTile>
    )
  }

  randomImageCards() {
    for (let index = 0; index < 15; index++) {
      setTimeout(() => { 
        const cardsInstance = this.state.cards
        cardsInstance.push(this.randomImageCard(index))
        this.setState({ cards: cardsInstance })
      }, 100)
    }
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
          <ListItem button>
            <ListItemText primary="Memes" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Cats" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Birds" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Dogs" />
          </ListItem>
        </Drawer>
        <div className={classes.content}>
          <div className={classes.toolbar} />
          <GridList cellHeight={180} className={classes.gridList}>
            {this.state.cards}
          </GridList>
        </div>
      </div>
    )
  }
}

export default App
