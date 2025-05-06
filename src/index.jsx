import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import App from './App'

// Using MetaMask extension provider. Ensure Goerli network is added in MetaMask settings with your Infura RPC
// URL: https://goerli.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root'),
)
