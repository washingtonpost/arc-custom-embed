import React, { useRef, useState, useEffect, useCallback } from 'react'

export interface IframeHostProps {
  source: string
  timeout: number
}

export default function IframeHost(props: IframeHostProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(0)
  const [loadTimeout, setLoadTimeout] = useState(false)
  const [showLoading, setShowLoading] = useState(true)

  // Apply iframe height
  useEffect(() => {
    if (!iframeRef.current) {
      return
    }
    iframeRef.current.style.height = Math.max(height, 25) + 'px'
  }, [height])

  // Sync iframe height with the content height
  // First time called on load to adapt height to the rendered content
  // Second time is called on ready event when iframe content rendered itself properly and add more items
  const syncIframeHeight = useCallback(() => {
    setHeight(
      iframeRef.current && iframeRef.current.contentWindow
        ? iframeRef.current.contentWindow.document.documentElement.scrollHeight
        : height
    )
  }, [height])

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      console.log('HOST:', event)
      let data
      try {
        data = JSON.parse(event.data)
      } catch {
        return
      }
      // Data should be an object and type should match custom_embed
      if (!data || data.type !== 'custom_embed') {
        return
      }
      if (data.subtype === 'ready') {
        setShowLoading(false)
        clearTimer()
        syncIframeHeight()
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
        onLoad={syncIframeHeight}
      />
    </div>
  )
}
