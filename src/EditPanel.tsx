import React, { useEffect } from 'react'
import IframeHost from './IframeHost'

export interface EditPanelProps {
  setEditMode: (isEditing: boolean) => void
  setCustomEmbed: (customEmbed: Object | null) => void
  customEmbed: Object
}

const forbiddenKeys = new Set(['type', 'version', 'referent'])

const configIsValid = (config: any): boolean => {
  const keys = Object.keys(config)
  const hasKey = keys.reduce(
    (result, key) => result || forbiddenKeys.has(key),
    false
  )
  if (hasKey) {
    return false
  }
  return keys
    .filter(
      key => Object.prototype.toString.call(config[key]) === '[object Object]'
    )
    .reduce<boolean>((result, key) => {
      return result && configIsValid(config[key])
    }, true)
}

// Passed object should be a valid `embed` object. see https://github.com/washingtonpost/ans-schema/blob/master/src/main/resources/schema/ans/0.10.0/story_elements/custom_embed.json#L30-L65
const dataIsValid = (embed: any): boolean => {
  // See https://github.com/washingtonpost/ans-schema/blob/master/src/main/resources/schema/ans/0.10.0/story_elements/custom_embed.json#L37-L43
  if (!embed.id || embed.id.length > 128 || embed.id.length === 0) {
    return false
  }
  // See https://github.com/washingtonpost/ans-schema/blob/master/src/main/resources/schema/ans/0.10.0/story_elements/custom_embed.json#L46-L50
  if (!embed.url || embed.url.length > 512 || embed.url.length === 0) {
    return false
  }
  // See https://github.com/washingtonpost/ans-schema/blob/master/src/main/resources/schema/ans/0.10.0/story_elements/custom_embed.json#L54-L61
  if (!embed.config) {
    return false
  }
  return configIsValid(embed.config)
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
      // Data should be an object and source should match custom_embed
      if (!messageData || messageData.source !== 'custom_embed') {
        return
      }
      if (messageData.action === 'data') {
        if (!dataIsValid(messageData.data)) {
          alert(
            'Custom embed config should not contain type, version or referent fields. It should have top level id and url fields.'
          )
        } else {
          props.setCustomEmbed(messageData.data)
          props.setEditMode(false)
        }
      }
      if (messageData.action === 'cancel') {
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
