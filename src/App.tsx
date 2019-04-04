import React, { Component } from 'react'
import './App.css'
import IframeHost from './IframeHost'
import Header from './Header'

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <main role="main" className="App-body">
          <IframeHost source="searchApi.html?wait=1" timeout={3000} />
        </main>
      </div>
    )
  }
}

export default App
