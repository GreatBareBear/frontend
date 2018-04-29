import { AppBar, Toolbar, Typography } from 'material-ui'
import { Theme } from 'material-ui/styles/'
import * as React from 'react'
import { WithStyles, withStyles } from './withStyles'

const styles = (theme: Theme) => ({
  flex: {
    flex: 1
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
export default class TopBar extends React.Component<WithStyles> {
  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <AppBar position="absolute" className={classes.appBar}>
          <Toolbar>
            <Typography variant="title" color="inherit" className={classes.flex}>
              Title
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}
