import React, { useRef, useState, useEffect, useCallback } from 'react'

export interface IframeHostProps {
  source: string
  timeout: number
}

export default function IframeHost(props: IframeHostProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(400)
  const [loadTimeout, setLoadTimeout] = useState(false)
  const [showLoading, setShowLoading] = useState(true)

  // Apply iframe height
  useEffect(() => {
    if (!iframeRef.current) {
      return
    }
    iframeRef.current.style.height = Math.max(height, 25) + 'px'
  }, [height])

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      console.log('HOST:', event)
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
      if (messageData.subtype === 'ready') {
        setShowLoading(false)
        clearTimer()
        if (messageData.data && messageData.data.height) {
          setHeight(Number.parseInt(messageData.data.height))
        }
      }
    }
    const iframeLoadTimeout = () => {
      clearTimer()
      setLoadTimeout(true)
    }

    let timer = window.setTimeout(iframeLoadTimeout, props.timeout)
    const clearTimer = () => {
      timer && clearTimeout(timer)
      timer = 0
    }
    window.addEventListener('message', messageHandler)

    return function cleanup() {
      window.removeEventListener('message', messageHandler)
      clearTimer()
    }
  }, [props.source, props.timeout])

  return loadTimeout ? (
    <div className="iframe-load-error">Integration Load Timeout</div>
  ) : (
    <div className="iframe-container">
      {showLoading ? (
        <div className="iframe-loading">
          <span>Loading...</span>
        </div>
      ) : null}
      <iframe
        width={'100%'}
        ref={iframeRef}
        frameBorder="0"
        scrolling="no"
        src={props.source}
      />
    </div>
  )
}
