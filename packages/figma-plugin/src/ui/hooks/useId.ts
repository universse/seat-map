import { useState, useEffect } from 'preact/hooks'

let id = 0
const genId = () => ++id

export default function useId() {
  const [id, setId] = useState(null)
  useEffect(() => {
    setId(genId())
  }, [])

  return id
}
