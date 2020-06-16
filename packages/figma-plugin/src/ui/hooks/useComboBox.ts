import { useRef, useState, useEffect } from 'preact/hooks'

import useId from './useId'

export default function useComboBox({ onSelect }) {
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)
  const items = useRef([])
  const menuRef = useRef()
  const shouldScroll = useRef(false)

  const activeDescendant =
    (items.current[highlightedIndex] && items.current[highlightedIndex].id) ||
    ''

  items.current = []

  const id = useId()
  const labelId = `combobox-${id}`
  const inputId = `combobox-input-${id}`
  const menuId = `combobox-menu-${id}`

  const openMenu = () => setIsOpen(true)

  const unhighlight = () => setHighlightedIndex(-1)

  const closeMenu = () => {
    unhighlight()
    setIsOpen(false)
  }

  // TODO may need pass in index as argument
  const select = () => {
    if (highlightedIndex < 0) return

    onSelect(items.current[highlightedIndex])
    closeMenu()
  }

  const rootProps = {
    'aria-expanded': isOpen ? 'true' : 'false',
    'aria-haspopup': 'listbox',
    'aria-labelledby': labelId,
    'aria-owns': menuId,
    role: 'combobox',
  }

  const labelProps = {
    id: labelId,
    htmlFor: inputId,
  }

  function getInputProps({ onInput }) {
    return {
      id: inputId,
      'aria-activedescendant': activeDescendant,
      'aria-autocomplete': 'list',
      'aria-controls': menuId,
      'aria-labelledby': labelId,
      onBlur: () => {
        highlightedIndex === -1 && closeMenu()
      },
      onInput: e => {
        openMenu()
        unhighlight()
        onInput && onInput(e)
      },
      onClick: openMenu,
      onFocus: openMenu,
      onKeyDown: e => {
        if (!e.target.value) return
        shouldScroll.current = true
        const itemCount = items.current.length

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault()

            openMenu()
            setHighlightedIndex(
              highlightedIndex => (highlightedIndex + 1) % itemCount
            )
            break

          case 'ArrowUp':
            e.preventDefault()

            setHighlightedIndex(highlightedIndex =>
              highlightedIndex === -1
                ? -1
                : (itemCount + highlightedIndex - 1) % itemCount
            )
            break

          case 'Enter':
            select()
            break

          case 'Escape':
          case 'Tab':
            closeMenu()
            break
        }
      },
    }
  }

  const menuProps: any = {
    'aria-labelledby': labelId,
    id: menuId,
    onMouseLeave: unhighlight,
    ref: menuRef,
    role: 'listbox',
  }

  useEffect(() => {
    if (highlightedIndex > -1 && shouldScroll.current) {
      ;(menuRef.current as HTMLDivElement).children[
        highlightedIndex
      ].scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      })
    }
  }, [highlightedIndex])

  function getItemProps({ index, item }) {
    items.current.push(item)
    const { meta, ...props } = item

    return {
      'aria-selected': index === highlightedIndex,
      onClick: select,
      onMouseMove: () => {
        shouldScroll.current = false
        setHighlightedIndex(index)
      },
      role: 'option',
      tabIndex: -1,
      ...props,
    }
  }

  return {
    highlightedIndex,
    isOpen,
    rootProps,
    labelProps,
    getInputProps,
    menuProps,
    getItemProps,
  }
}
