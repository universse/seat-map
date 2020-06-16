import { useState, useRef } from 'preact/hooks'

interface Dropdown {
  items: any[]
  menuItemCount?: number
  onSelect(any): void
}

export default function useDropdownMenu({
  items,
  menuItemCount,
  onSelect,
}: Dropdown) {
  menuItemCount = menuItemCount || items.length

  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const detailsRef = useRef<HTMLDetailsElement>()
  const menuRef = useRef<HTMLDivElement>()

  // TODO may need pass in index as argument
  const select = () => {
    if (highlightedIndex < 0) return

    onSelect
      ? onSelect(items[highlightedIndex])
      : (menuRef.current.children[
          highlightedIndex
        ] as HTMLButtonElement).click()
  }

  const unhighlight = () => setHighlightedIndex(-1)

  const detailsProps = {
    ref: detailsRef,
  }

  const summaryProps = {
    'aria-haspopup': 'menu',
    onBlur: e => {
      e.preventDefault()
      select()
      detailsRef.current.removeAttribute('open')
    },
    onKeyDown: e => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()

          !detailsRef.current.open &&
            detailsRef.current.setAttribute('open', '')

          setHighlightedIndex(
            highlightedIndex => (highlightedIndex + 1) % menuItemCount
          )
          break

        case 'ArrowUp':
          e.preventDefault()

          setHighlightedIndex(highlightedIndex =>
            highlightedIndex === -1
              ? -1
              : (menuItemCount + highlightedIndex - 1) % menuItemCount
          )
          break

        case 'Enter':
          select()
          unhighlight()
          break

        case 'Escape':
          e.preventDefault()
          unhighlight()
          detailsRef.current.removeAttribute('open')
          break

        case 'Tab':
          select()
          break
      }
    },
  }

  const menuProps = {
    onMouseLeave: unhighlight,
    ref: menuRef,
    role: 'menu',
  }

  function getItemProps(index) {
    return {
      onMouseEnter: () => setHighlightedIndex(index),
      role: 'menuitem',
      tabIndex: -1,
    }
  }

  return {
    detailsProps,
    highlightedIndex,
    summaryProps,
    menuProps,
    getItemProps,
  }
}
