import React, { useEffect } from 'react'
import IframeHost from './IframeHost'

export interface ViewPanelProps {
  setEditMode: (isEditing: boolean) => void
  clearSelected: () => void
  customEmbed: Object
}

export default function ViewPanel(props: ViewPanelProps) {
  const viewApi = localStorage.getItem('arc.custom_embed.viewApi')
  const viewApiTimeout = localStorage.getItem('arc.custom_embed.viewApiTimeout')
  const hostLoadTimeout: string =
    localStorage.getItem('arc.custom_embed.hostLoadTimeout') || '0'

  const customEmbedEncoded = encodeURIComponent(
    JSON.stringify(props.customEmbed)
  )

  return (
    <React.Fragment>
      <div className="jumbotron bg-light" style={{ maxWidth: '60vw' }}>
        <p className="text-muted">
          A View integration window should be loaded below. You should be able
          to see a custom embed representation in a window
        </p>
        <p className="lead">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => props.setEditMode(true)}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-light mx-1"
            onClick={props.clearSelected}
          >
            Clear
          </button>
        </p>
      </div>
      <IframeHost
        source={`${viewApi}?wait=${viewApiTimeout}&p=${customEmbedEncoded}`}
        timeout={Number.parseInt(hostLoadTimeout)}
      />
    </React.Fragment>
  )
}
