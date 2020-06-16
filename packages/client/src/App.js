import React, { useEffect, useRef } from 'react'
import { useGesture } from 'react-use-gesture'

// eslint-disable-next-line
import SeatsWorker from 'workerize-loader!./server/seats.worker'
import './App.css'

// const NODE_ID = '494:10'

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

export default function App () {
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
        <rect
          id='3'
          x='200'
          y='1555'
          width='942'
          height='1162'
          fill='#343A40'
        />
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

function SVG ({ children, id }) {
  const svgRef = useRef()
  const seatsWorker = useRef()

  const transform = useRef({ x: 0, y: 0, scale: 1 })
  const minScale = useRef(1)
  const maxScale = useRef(2)
  const scaleChange = useRef(0.5)
  const scaleThreshold = useRef(1.5)
  // const isInteracting = useRef(false)

  const seatAreas = useRef({})

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

    if (connectionType.includes('2g') || saveData) {
      return null
    } else {
      seatsWorker.current = new SeatsWorker()

      seatsWorker.current.fetchMap(id).then(console.log)

      return () => {
        seatsWorker.current.terminate()
      }
    }
  }, [id])

  function calculateTransform (
    event,
    { x: currentX, y: currentY, scale: currentScale },
    nextScale
  ) {
    const scaleRatio = nextScale / currentScale

    const focalX = event.clientX - currentX
    const focalY = event.clientY - currentY

    const focalDeltaX = scaleRatio * focalX - focalX
    const focalDeltaY = scaleRatio * focalY - focalY

    return {
      x: currentX - focalDeltaX,
      y: currentY - focalDeltaY,
      scale: nextScale,
    }
  }

  function getScale (scale) {
    return Math.max(minScale.current, Math.min(maxScale.current, scale))
  }

  function measuredRef (node) {
    if (node !== null) {
      svgRef.current = node
      // const seatSize = svgRef.current
      //   .querySelector('circle')
      //   .getBoundingClientRect().width

      const seatSize = 2

      maxScale.current = 48 / seatSize
      scaleChange.current = 0.5 / seatSize
      minScale.current = 1 - scaleChange.current
      scaleThreshold.current = (maxScale.current + minScale.current) / 4

      for (const areaNode of document.getElementById('areas').children) {
        seatAreas.current[areaNode.id] = document
          .getElementById('seats')
          .appendChild(document.createElement('g'))
      }
    }
  }

  function updateSVGTransform () {
    const { x, y, scale } = transform.current

    svgRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
  }

  function buildSeats () {
    if (transform.current.scale < scaleThreshold.current) {
      for (const areaNode of document.getElementById('areas').children) {
        seatAreas.current[areaNode.id].innerHTML = ''
        document.getElementById(areaNode.id).classList.toggle('hidden', false)
      }
    } else {
      const areaRects = []

      for (const areaNode of document.getElementById('areas').children) {
        areaRects.push(areaNode.getBoundingClientRect())
      }

      seatsWorker.current.buildSeats(JSON.stringify(areaRects)).then(areas => {
        for (const [areaId, html] of areas) {
          seatAreas.current[areaId].innerHTML = html
          document.getElementById(areaId).classList.toggle('hidden', !!html)
        }
      })
    }
  }

  useEffect(() => {
    // only render when user interacting
    let id

    // function updateSVGTransform() {
    //   if (svgRef.current && isInteracting.current) {
    //     const { x, y, scale } = transform.current

    //     svgRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
    //   }

    //   id = requestAnimationFrame(updateSVGTransform)
    // }

    // updateSVGTransform()

    // return () => {
    //   cancelAnimationFrame(id)
    // }
  }, [])

  const bind = useGesture(
    {
      onDrag: ({ delta, last }) => {
        // isInteracting.current = !last
        if (last) {
          buildSeats()
          return
        }

        const { x, y, scale } = transform.current
        transform.current = { x: x + delta[0], y: y + delta[1], scale }
        updateSVGTransform()
      },
      onPinch: ({ delta, origin, last }) => {
        // isInteracting.current = !last
        if (last) {
          buildSeats()
          return
        }
      },
      onWheel: ({ event, delta, xy, last }) => {
        // isInteracting.current = !last
        if (last) {
          buildSeats()
          return
        }

        const multiplier = delta[1] > 0 ? 1 : -1

        transform.current = calculateTransform(
          event,
          transform.current,
          getScale(transform.current.scale - multiplier * scaleChange.current)
        )
        updateSVGTransform()
      },
    },
    { wheel: { axis: 'y' } }
  )

  return (
    <div id='seat-wrapper' {...bind()}>
      <svg
        ref={measuredRef}
        onClick={e => {
          if (e.target.id.startsWith('seat')) {
            //
          }
        }}
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
