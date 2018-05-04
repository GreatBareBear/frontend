import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import * as WebFontLoader from 'webfontloader'
import App from './App'
import './application.css'
import registerServiceWorker from './registerServiceWorker'

// Load global assets before starting the application
// (This reduces visual flickering on first page load)
WebFontLoader.load({
  active: initApp, // Run app with fonts
  classes: false,
  google: { families: ["Roboto"] },
  inactive: initApp // Run app without fonts (edge case, fonts are expected to load)
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
