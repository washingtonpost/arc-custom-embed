import React, { useState } from 'react'
import './App.css'
import SearchPanel from './SearchPanel'
import Header from './Header'

export default function App() {
  const [customEmbed, setCustomEmbed] = useState<Object | null>(null)
  return (
    <div className="App">
      <Header />
      <main role="main" className="App-body">
        {customEmbed ? (
          <span>set</span>
        ) : (
          <SearchPanel setCustomEmbed={setCustomEmbed} />
        )}
      </main>
    </div>
  )
}
