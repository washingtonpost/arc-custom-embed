import React, { useState } from 'react'
import './App.css'
import SearchPanel from './SearchPanel'
import Header from './Header'
import ViewPanel from './ViewPanel'
import EditPanel from './EditPanel'

export default function App() {
  const [customEmbed, setCustomEmbed] = useState<Object | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  return (
    <div className="App">
      <Header />
      <main role="main" className="App-body">
        {customEmbed ? (
          isEditing ? (
            <EditPanel
              setEditMode={setIsEditing}
              customEmbed={customEmbed}
              setCustomEmbed={setCustomEmbed}
            />
          ) : (
            <ViewPanel
              customEmbed={customEmbed}
              setEditMode={setIsEditing}
              clearSelected={() => {
                setCustomEmbed(null)
              }}
            />
          )
        ) : (
          <SearchPanel setCustomEmbed={setCustomEmbed} />
        )}
      </main>
    </div>
  )
}
