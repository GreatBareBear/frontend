import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import * as WebFontLoader from 'webfontloader'
import App from './App'
import './application.css'
import registerServiceWorker from './registerServiceWorker'

WebFontLoader.load({
  active: initApp,
  classes: false,
  google: { families: ['Roboto'] },
  inactive: initApp
})

function initApp() {
  ReactDOM.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    document.getElementById('root') as HTMLElement
  )
}

registerServiceWorker()
