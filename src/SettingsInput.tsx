import React, { useState, useEffect } from 'react'

export interface SettingsInputProps {
  storageKey: string
  defaultValue: string
}
export default function SettingsInput(props: SettingsInputProps) {
  useEffect(() => {
    if (!localStorage.getItem(props.storageKey)) {
      localStorage.setItem(props.storageKey, props.defaultValue)
    }
  }, [props.storageKey, props.defaultValue])
  const [value, setValue] = useState(
    localStorage.getItem(props.storageKey) || props.defaultValue
  )
  return (
    <input
      type="text"
      className="form-control"
      id="lastName"
      placeholder=""
      value={value}
      onChange={event => {
        setValue(event.target.value)
        localStorage.setItem(props.storageKey, event.target.value)
      }}
    />
  )
}
