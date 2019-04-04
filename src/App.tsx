import React, { Component } from 'react'
import './App.css'
import SearchPanel from './SearchPanel'
import Header from './Header'

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        {/**http://customembed.ellipsis.aws.arc.pub.s3-website-us-east-1.amazonaws.com/searchApi.html */}
        <main role="main" className="App-body">
          <SearchPanel />
        </main>
      </div>
    )
  }
}

export default App
