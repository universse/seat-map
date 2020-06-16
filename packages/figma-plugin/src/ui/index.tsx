/** @jsx Preact.h */
import * as Preact from 'preact'

// import App from './components/App'
import './styles/ui.scss'

window.addEventListener('message', event => {
  console.log(new Blob([event.data.pluginMessage.buffer]))
})

Preact.render(<div />, document.getElementById('plugin-root'))
