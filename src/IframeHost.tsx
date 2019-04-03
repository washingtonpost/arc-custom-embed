import React, { useRef, useState, useEffect } from 'react'

export interface IframeHostProps {
  source: string
  timeout: number
}

export default function IframeHost(props: IframeHostProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(0)
  const [loadTimeout, setLoadTimeout] = useState(false)
  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
    if (!iframeRef.current) {
      return
    }
    iframeRef.current.style.height = Math.max(height, 25) + 'px'
  }, [height])

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      console.log('HOST:', event)
      const data = JSON.parse(event.data)
      if (data.type === 'ready') {
        setShowLoading(false)
        clearTimer()
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
        scrolling="yes"
        src={props.source}
        onLoad={(event: React.SyntheticEvent<HTMLIFrameElement>) => {
          setHeight(
            event.currentTarget.contentWindow
              ? event.currentTarget.contentWindow.document.documentElement
                  .scrollHeight
              : 0
          )
        }}
      />
    </div>
  )
}
