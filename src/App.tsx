import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import IframeHost from './IframeHost'

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <IframeHost source="searchApi.html?wait=0" timeout={3000} />
        </header>
      </div>
    )
  }
}

export default App
