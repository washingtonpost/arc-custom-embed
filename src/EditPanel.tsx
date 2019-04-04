import React, { useEffect } from 'react'
import IframeHost from './IframeHost'

export interface EditPanelProps {
  setEditMode: (isEditing: boolean) => void
  setCustomEmbed: (customEmbed: Object) => void
  customEmbed: Object
}

export default function EditPanel(props: EditPanelProps) {
  const editApi = localStorage.getItem('arc.custom_embed.editApi')
  const editApiTimeout = localStorage.getItem('arc.custom_embed.editApiTimeout')
  const hostLoadTimeout: string =
    localStorage.getItem('arc.custom_embed.hostLoadTimeout') || '0'

  const customEmbedEncoded = encodeURIComponent(
    JSON.stringify(props.customEmbed)
  )

  return (
    <React.Fragment>
      <div className="jumbotron bg-light" style={{ maxWidth: '60vw' }}>
        <p className="text-muted">
          An Edit integration window should be loaded below. Edit integration is
          intended to edit Custom Embed content and send update information back
          to the host application.
        </p>
        <p className="text-dark">
          Edit integration has it's own controls to either apply changes or
          cancel.
        </p>
      </div>
      <IframeHost
        source={`${editApi}?wait=${editApiTimeout}&p=${customEmbedEncoded}`}
        timeout={Number.parseInt(hostLoadTimeout) * 1000}
      />
    </React.Fragment>
  )
}
