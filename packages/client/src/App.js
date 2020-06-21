import React, { useEffect, useRef } from 'react'
import { useGesture } from 'react-use-gesture'

// eslint-disable-next-line
import SeatsWorker from 'workerize-loader!./server/seats.worker'
import './App.css'

// const NODE_ID = '494:10'

// svg bounding rect
// svg initial size -> minScale, maxScale...
// drag bounds rubberband

const TargetTypes = {
  AREA: 'area',
  SEAT: 'seat',
}

export default function App() {
  return (
    <SVG>
      <g id='areas'>
        <rect
          id='0'
          x='1335'
          y='1345.5'
          width='2684'
          height='1624'
          fill='#858E96'
        />
        <rect
          id='1'
          x='1359'
          y='465.5'
          width='1456'
          height='816'
          fill='#FD5F60'
        />
        <rect
          id='2'
          x='1359'
          y='3054.5'
          width='1456'
          height='816'
          fill='#FD5F60'
        />
        <rect x='200' y='1555' width='942' height='1162' fill='#343A40' />
        <rect
          id='4'
          x='4224'
          y='1407.5'
          width='816'
          height='1456'
          fill='#FFACC6'
        />
        <rect
          id='5'
          x='5136'
          y='1407.5'
          width='1020'
          height='1456'
          fill='#8AEBF6'
        />
        <path
          id='6'
          d='M2857 1281.5V465.5H4462.5L3934 1281.5H2857Z'
          fill='#FFA738'
        />
        <path
          id='7'
          d='M2857 3054.5V3870.5H4462L3933.66 3054.5H2857Z'
          fill='#FFA738'
        />
        <path
          id='8'
          d='M6156 1375.5H4496V1233L6156 83V1375.5Z'
          fill='#39A5F2'
        />
        <path
          id='9'
          d='M6156 2895.5H4496V3038L6156 4188V2895.5Z'
          fill='#39A5F2'
        />
      </g>
      <g id='seats'></g>
    </SVG>
  )
}

function SVG({ children, id }) {
  ////////// network condition
  const isFastConnection = useRef(false)

  useEffect(() => {
    let connectionType = ''
    let saveData = false

    if (
      !global.navigator ||
      !global.navigator ||
      !global.navigator.connection
    ) {
      connectionType = '3g'
    } else {
      connectionType = global.navigator.connection.effectiveType || '3g'
      saveData = global.navigator.connection.saveData
    }

    if (!connectionType.includes('2g') && !saveData) {
      isFastConnection.current = true
    }
  }, [])

  ////////// transform
  const svgRef = useRef()
  const seatAreaNodes = useRef({})

  const transform = useRef({ x: 0, y: 0, scale: 1 })
  const minScale = useRef(1)
  const maxScale = useRef(2)
  const defaultScaleChange = useRef(0.5)
  const scaleThreshold = useRef(1.5)

  ////////// web worker
  const seatsWorker = useRef()

  useEffect(() => {
    seatsWorker.current = new SeatsWorker()

    seatsWorker.current.fetchOverviewMap(id).then(console.log)

    return () => {
      seatsWorker.current.terminate()
    }
  }, [id])

  function measuredRef(node) {
    if (!node) return

    svgRef.current = node
    // const seatSize = svgRef.current
    //   .querySelector('circle')
    //   .getBoundingClientRect().width

    const seatSize = 2

    maxScale.current = 48 / seatSize
    defaultScaleChange.current = 0.5 / seatSize
    minScale.current = 1 - defaultScaleChange.current
    scaleThreshold.current = (maxScale.current + minScale.current) / 4

    for (const areaNode of document.getElementById('areas').children) {
      if (!areaNode.id) continue

      seatAreaNodes.current[areaNode.id] = document
        .getElementById('seats')
        .appendChild(document.createElement('g'))
    }
  }

  ////////// gesture handler
  // const isInteracting = useRef(false)
  const zoomOrigin = useRef([0, 0])

  function calculateTransform([clientX, clientY], scaleChange) {
    const { x: currentX, y: currentY, scale: currentScale } = transform.current

    const nextScale = clamp(
      currentScale + scaleChange,
      minScale.current,
      maxScale.current
    )

    const scaleRatio = nextScale / currentScale

    const focalX = clientX - currentX
    const focalY = clientY - currentY

    const focalDeltaX = scaleRatio * focalX - focalX
    const focalDeltaY = scaleRatio * focalY - focalY

    return {
      x: currentX - focalDeltaX,
      y: currentY - focalDeltaY,
      scale: nextScale,
    }
  }

  function updateSVGTransform() {
    const { x, y, scale } = transform.current

    svgRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
  }

  function prebuildAreaSeatsOnZoomingIn() {
    // TODO
    // if (isFastConnection.current) {
    // } else {
    // }
    const [x, y] = zoomOrigin.current

    for (const areaNode of document.getElementById('areas').children) {
      if (!areaNode.id) continue

      const { top, left, bottom, right } = areaNode.getBoundingClientRect()

      // prefetch mouseover area
      if (top < y && left < x && bottom > y && right > x) {
        seatsWorker.current
          .fetchArea(areaNode.id)
          // TODO handle error
          .catch(() => console.log('OOPS 1'))
        break
      }
    }
  }

  function handleGestureEnd() {
    const isPastThreshold = transform.current.scale >= scaleThreshold.current

    for (const areaNode of document.getElementById('areas').children) {
      const areaId = areaNode.id
      if (!areaId) continue

      let isVisible = false

      if (isPastThreshold) {
        const { top, left, bottom, right } = areaNode.getBoundingClientRect()

        isVisible =
          top < (window.innerHeight || document.documentElement.clientHeight) &&
          left < (window.innerWidth || document.documentElement.clientWidth) &&
          bottom > 0 &&
          right > 0
      }

      seatsWorker.current
        .getAreaHtml([areaId, isVisible])
        .then((areaHtml) => {
          if (areaHtml === undefined) return

          seatAreaNodes.current[areaId].innerHTML = areaHtml
          document.getElementById(areaId).classList.toggle('hidden', isVisible)
        })
        // TODO handle error
        .catch(() => console.log('OOPS 2'))
    }
  }

  const bind = useGesture(
    {
      onDrag: ({ delta, last }) => {
        // isInteracting.current = !last
        if (last) return handleGestureEnd()

        const { x, y, scale } = transform.current
        transform.current = { x: x + delta[0], y: y + delta[1], scale }
        updateSVGTransform()
      },
      onPinch: ({ direction, first, last, origin }) => {
        // TODO should not need direction here
        // isInteracting.current = !last
        const isZoomingIn = direction[0] > 0

        if (first) {
          zoomOrigin.current = origin
          isZoomingIn && prebuildAreaSeatsOnZoomingIn()
        }

        if (last) return handleGestureEnd()

        // TODO pinch offset
        // needs interpolate
        // [minScale.current, 100, maxScale.current]
        // [offset * speed,0,offset*speed]
        // use options distance bounds below

        transform.current = calculateTransform(
          zoomOrigin.current,
          isZoomingIn ? 0.4 : -0.4
        )
        updateSVGTransform()
      },
      onWheel: ({ delta, event, first, last }) => {
        // isInteracting.current = !last
        const isZoomingIn = delta[1] < 0

        if (first) {
          zoomOrigin.current = [event.clientX, event.clientY]
          isZoomingIn && prebuildAreaSeatsOnZoomingIn()
        }

        if (last) return handleGestureEnd()

        const multiplier = isZoomingIn ? 1 : -1

        transform.current = calculateTransform(
          zoomOrigin.current,
          multiplier * defaultScaleChange.current
        )
        updateSVGTransform()
      },
    },
    {
      // TODO probably need states
      // drag: { bounds: {}, rubberband: true },
      // pinch: { distanceBounds: { max: 1, min: 1 } },
      wheel: { axis: 'y' },
    }
  )

  // useEffect(() => {
  //   // only render when user interacting
  //   let id

  //   function updateSVGTransform() {
  //     if (svgRef.current && isInteracting.current) {
  //       const { x, y, scale } = transform.current

  //       svgRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
  //     }

  //     id = requestAnimationFrame(updateSVGTransform)
  //   }

  //   updateSVGTransform()

  //   return () => {
  //     cancelAnimationFrame(id)
  //   }
  // }, [])

  function handleClick(e) {
    const targetType = ''
    const id = e.target.id

    switch (targetType) {
      case TargetTypes.AREA:
        if (isFastConnection.current) {
        } else {
        }
        break
      case TargetTypes.SEAT:
        break
      default:
      // throw new Error('Unsupported target type.')
    }
  }

  return (
    <div id='seat-wrapper' {...bind()}>
      <div className='Spinner'></div>
      <svg
        ref={measuredRef}
        onClick={handleClick}
        width='6356'
        height='4271'
        viewBox='0 0 6356 4271'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        {children}
      </svg>
    </div>
  )
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

// const query = `{
//   Movie(title: "Inception") {
//     releaseDate
//     actors {
//       name
//     }
//   }
// }`

// function queryResolver(query, variables) {
//   return graphqlRequest('https://graphql.fauna.com/graphql', query, variables)
// }

// function prebuildAreaSeatsOnZoomingIn() {
//   // TODO
//   // if (isFastConnection.current) {
//   // } else {
//   // }
//   const [x, y] = zoomOrigin.current

//   for (const areaNode of document.getElementById('areas').children) {
//     if (!areaNode.id) continue

//     const { top, left, bottom, right } = areaNode.getBoundingClientRect()

//     // prefetch mouseover area
//     if (top < y && left < x && bottom > y && right > x) {
//       seatsWorker.current
//         .buildAreaHtml(areaNode.id)
//         // TODO handle error
//         .catch(() => console.log('OOPS 1'))
//       break
//     }
//   }
// }

// function handleGestureEnd() {
//   const isPastThreshold = transform.current.scale >= scaleThreshold.current
//   const areaVisibility = []

//   for (const areaNode of document.getElementById('areas').children) {
//     if (!areaNode.id) continue

//     let isVisible = false

//     if (isPastThreshold) {
//       const { top, left, bottom, right } = areaNode.getBoundingClientRect()

//       isVisible =
//         top < (window.innerHeight || document.documentElement.clientHeight) &&
//         left < (window.innerWidth || document.documentElement.clientWidth) &&
//         bottom > 0 &&
//         right > 0
//     }

//     areaVisibility.push([areaNode.id, isVisible])
//   }

//   seatsWorker.current
//     .buildAreaHtmls(areaVisibility)
//     .then((areaHtmls) => {
//       for (const [areaId, html] of areaHtmls) {
//         seatAreaNodes.current[areaId].innerHTML = html
//         document.getElementById(areaId).classList.toggle('hidden', !!html)
//       }
//     })
//     // TODO handle error
//     .catch(() => console.log('OOPS'))
// }
