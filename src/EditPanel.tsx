import React, { useEffect } from 'react'
import IframeHost from './IframeHost'

export interface EditPanelProps {
  setEditMode: (isEditing: boolean) => void
  setCustomEmbed: (customEmbed: Object | null) => void
  customEmbed: Object
}

const forbiddenKeys = new Set(['type', 'version', 'referent'])
const dataIsValid = (object: any): boolean => {
  const keys = Object.keys(object)
  const hasKey = keys.reduce(
    (result, key) => result || forbiddenKeys.has(key),
    false
  )
  if (hasKey) {
    return false
  }
  return keys
    .filter(
      key => Object.prototype.toString.call(object[key]) === '[object Object]'
    )
    .reduce<boolean>((result, key) => {
      return result && dataIsValid(object[key])
    }, true)
}

export default function EditPanel(props: EditPanelProps) {
  const editApi = localStorage.getItem('arc.custom_embed.editApi')
  const editApiTimeout = localStorage.getItem('arc.custom_embed.editApiTimeout')
  const hostLoadTimeout: string =
    localStorage.getItem('arc.custom_embed.hostLoadTimeout') || '0'

  const customEmbedEncoded = encodeURIComponent(
    JSON.stringify(props.customEmbed)
  )

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      let messageData
      try {
        messageData = JSON.parse(event.data)
      } catch {
        return
      }
      // Data should be an object and type should match custom_embed
      if (!messageData || messageData.type !== 'custom_embed') {
        return
      }
      if (messageData.subtype === 'data') {
        if (!dataIsValid(messageData.data)) {
          alert(
            'Custom embed should not contain type, version or referent fields'
          )
        } else {
          props.setCustomEmbed(messageData.data)
          props.setEditMode(false)
        }
      }
      if (messageData.subtype === 'cancel') {
        props.setEditMode(false)
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
        timeout={Number.parseInt(hostLoadTimeout)}
      />
    </React.Fragment>
  )
}
