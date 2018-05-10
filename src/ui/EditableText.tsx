import CloseIcon from '@material-ui/icons/Close'
import DoneIcon from '@material-ui/icons/Done'
import EditIcon from '@material-ui/icons/Edit'
import classNames = require('classnames')
import { IconButton, TextField, Theme, Typography } from 'material-ui'
import createPalette from 'material-ui/styles/createPalette'
import createTypography, { Style, TypographyStyle } from 'material-ui/styles/createTypography'
import { TypographyProps } from 'material-ui/Typography'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { WithStyles, withStyles } from './withStyles'

export interface EditableTextProps {
    defaultValue: string,
    typographyVariant?: Style,
    typographyComponent?: React.ReactType<TypographyProps>,
    onValueApplied: (value: string) => void
}

const styles = (theme: Theme) => ({
    typography: {
        wordWrap: 'break-word' as 'break-word',
        width: '90%',
        display: 'inline'
    },
    root: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    button: {
        width: '36px',
        height: '36px'
    },
    editableTextField: {
        'flex': 1,
        '& div input': {
            wordWrap: 'break-word' as 'break-word',
            wordBreak: 'break-all' as 'break-all'
        }
    }
})

@withStyles(styles)
@observer
export default class EditableText extends React.Component<EditableTextProps & WithStyles, any> {
    
    @observable editState = false
    @observable currentValue = this.props.defaultValue
    valueUpdated = false

    constructor(props: EditableTextProps & WithStyles) {
        super(props)
    }

    updateValue(event: React.ChangeEvent<HTMLInputElement>) {
        this.currentValue = event.target.value
        this.valueUpdated = true
    }

    renderTextField() {
        const { classes } = this.props
        const typography: TypographyStyle = createTypography(createPalette({}), {})[this.props.typographyVariant]
        const nativeInputProps = { style: typography }
        return (
            <div className={classes.root}>
                <TextField
                    className={classes.editableTextField}
                    value={this.currentValue}
                    onChange={(e) => this.updateValue(e)}
                    multiline={true}
                    InputProps={nativeInputProps}
                />
                <IconButton color="primary" className={classes.button} aria-label="Stop editing" onClick={() => this.updateEditState()}>
                    <TransitionGroup component={null}>
                        <CSSTransition
                            key={this.valueUpdated ? "done": "close"}
                            timeout={500}
                            classNames="fade"
                            unmountOnExit={true}
                            exit={false}
                        >
                            {this.valueUpdated ? <DoneIcon /> : <CloseIcon />}
                        </CSSTransition>
                    </TransitionGroup>
                </IconButton>
            </div>
        )
    }

    updateEditState() {
        this.editState = !this.editState
        if (!this.editState && this.valueUpdated) {
            this.valueUpdated = false
            this.props.onValueApplied(this.currentValue)
        }
    }

    renderTextWithEditButton() {
        const { classes } = this.props
        return (
            <div className={classes.root}>
                <Typography variant={this.props.typographyVariant} component={this.props.typographyComponent} className={classes.typography}>
                    {this.currentValue}
                </Typography>
                <IconButton color="primary" className={classes.button} aria-label="Edit value" onClick={() => this.updateEditState()}>
                  <EditIcon />
                </IconButton>
            </div>
        )
    }

    componentWillUpdate(nextProps: EditableTextProps & WithStyles, nextState: any) {
        if (nextProps.defaultValue !== this.props.defaultValue) {
            this.currentValue = nextProps.defaultValue
        }
        return true
    }

    render() {
        if (this.editState) {
            return this.renderTextField()
        }
        return this.renderTextWithEditButton()
    }
}