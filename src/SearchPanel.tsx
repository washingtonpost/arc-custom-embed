import React, { useState } from 'react'
import IframeHost from './IframeHost'

export default function SearchPanel() {
  const searchApi = localStorage.getItem('arc.custom_embed.searchApi')
  const searchApiTimeout = localStorage.getItem(
    'arc.custom_embed.searchApiTimeout'
  )
  const hostLoadTimeout: string =
    localStorage.getItem('arc.custom_embed.hostLoadTimeout') || '0'

  return (
    <IframeHost
      source={`${searchApi}?wait=${searchApiTimeout}`}
      timeout={Number.parseInt(hostLoadTimeout) * 1000}
    />
  )
}
