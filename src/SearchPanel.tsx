import React, { useEffect } from 'react'
import IframeHost from './IframeHost'

export interface SearchPanelProps {
  setCustomEmbed: (customEmbed: Object) => void
}

export default function SearchPanel(props: SearchPanelProps) {
  const searchApi = localStorage.getItem('arc.custom_embed.searchApi')
  const searchApiTimeout = localStorage.getItem(
    'arc.custom_embed.searchApiTimeout'
  )
  const hostLoadTimeout: string =
    localStorage.getItem('arc.custom_embed.hostLoadTimeout') || '0'
  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      let messageData
      try {
        messageData = JSON.parse(event.data)
      } catch {
        return
      }
      // Data should be an object and source should match custom_embed
      if (!messageData || messageData.source !== 'custom_embed') {
        return
      }
      if (messageData.action === 'data') {
        props.setCustomEmbed(messageData.data)
      }
      if (messageData.action === 'cancel') {
        // Host application should close modal window.
        // Since search view is the only default view, just log it here
        console.log('Cancel message received')
      }
    }
    window.addEventListener('message', messageHandler)

    return function cleanup() {
      window.removeEventListener('message', messageHandler)
    }
  }, [props.setCustomEmbed])

  return (
    <React.Fragment>
      <div className="jumbotron bg-light" style={{ maxWidth: '60vw' }}>
        <p className="text-muted">
          A Search integration window should be loaded below. Please follow
          search integration instructions to select a media. After media being
          selected you will be forwarded to the view integration screen.
        </p>
        <p className="text-dark">
          If you get integration load timeout, please check settings.
        </p>
      </div>
      <IframeHost
        source={`${searchApi}?wait=${searchApiTimeout}`}
        timeout={Number.parseInt(hostLoadTimeout)}
      />
    </React.Fragment>
  )
}
