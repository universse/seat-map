declare global {
  type MessageType = 'pbf' | 'dummy'

  interface PluginMessage {
    buffer?: Uint8Array
    type: MessageType
  }
}

export {}
