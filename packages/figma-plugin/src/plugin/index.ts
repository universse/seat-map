import Pbf from 'pbf'
import SeatMap from '../../schema/SeatMap_proto.js'

figma.showUI(__html__, { width: 400, height: 560 })

const RADIUS = 12
const STROKE_WIDTH = 4

const SIZE = RADIUS * 2 + STROKE_WIDTH
const HALF_SIZE = SIZE / 2

const { width, height } = figma.currentPage.findOne(
  node => node.name === 'layer-seats'
) as GroupNode

const seatGroupNode = figma.currentPage.findOne(
  node => node.name === 'seats'
) as FrameNode

const seatGroups = seatGroupNode.children as [GroupNode]

const seatMap = {
  svgProps: { width: Math.round(width), height: Math.round(height) },
  seatProps: {
    r: RADIUS,
    fill: 'white',
    stroke: '#343A40',
    strokeWidth: STROKE_WIDTH,
  },
  groups: [
    // [[x, y, x + width, y + height], [[id, cx, cy]]]
  ],
  // groups: {
  //   byIds: {
  //     // [cat, [[id, cx, cy]]]
  //   },
  //   allIds: [
  //     // [id, [x, y, width, height]]
  //   ]
  // },

  // categories: {
  //   byId: {
  //     a: {
  //       bounds: [x, y, width, height],
  //       groups: [[id, cx, cy]],
  //     },
  //     b: {
  //       bounds: [x, y, width, height],
  //       groups: [[id, cx, cy]],
  //     },
  //     c: {
  //       bounds: [x, y, width, height],
  //       groups: [[id, cx, cy]],
  //     },
  //   },
  //   allIds: ['a', 'b', 'c'],
  // },
}

// [id, cx, cy]

seatGroups.forEach(seatGroup => {
  const relativeTransform = clone(seatGroup.relativeTransform)
  relativeTransform[0][2] = Math.round(seatGroup.x)
  relativeTransform[1][2] = Math.round(seatGroup.y)
  seatGroup.relativeTransform = relativeTransform
  seatGroup.resize(Math.round(seatGroup.width), Math.round(seatGroup.height))

  const { x, y, width, height, children } = seatGroup

  const group = { bounds: [x, y, x + width, y + height], seats: [] }

  for (const seat of children) {
    const relativeTransform = clone(seat.relativeTransform)

    relativeTransform[0][2] = Math.round(seat.x)
    relativeTransform[1][2] = Math.round(seat.y)
    seat.relativeTransform = relativeTransform

    group.seats.push({
      id: seat.id.replace(':', '-'),
      cx: seat.x + HALF_SIZE,
      cy: seat.y + HALF_SIZE,
    })
  }

  seatMap.groups.push(group)
})

// const pbf = new Pbf()
// SeatMap.SeatMap.write(seatMap, pbf)
// const buffer = pbf.finish()

// postMessage({ type: 'pbf', buffer })

// fbs
// seatGroups.forEach(seatGroup => {
//   const relativeTransform = clone(seatGroup.relativeTransform)
//   relativeTransform[0][2] = Math.round(seatGroup.x)
//   relativeTransform[1][2] = Math.round(seatGroup.y)
//   seatGroup.relativeTransform = relativeTransform
//   seatGroup.resize(Math.round(seatGroup.width), Math.round(seatGroup.height))

//   const { x, y, width, height, children } = seatGroup

//   const group = {
//     bounds: {
//       x1: x,
//       y1: y,
//       x2: x + width,
//       y2: y + height,
//     },
//     seats: [],
//   }

//   for (const seat of children) {
//     const relativeTransform = clone(seat.relativeTransform)

//     relativeTransform[0][2] = Math.round(seat.x)
//     relativeTransform[1][2] = Math.round(seat.y)
//     seat.relativeTransform = relativeTransform

//     group.seats.push({
//       id: seat.id.replace(':', '-'),
//       cx: seat.x + HALF_SIZE,
//       cy: seat.y + HALF_SIZE,
//     })
//   }

//   seatMap.groups.push(group)
// })

console.log(JSON.stringify(seatMap))

// const notify = (function() {
//   let notification: NotificationHandler = null

//   return function(message: string) {
//     notification?.cancel()
//     notification = figma.notify(message)
//   }
// })()

// function postMessage(pluginMessage: PluginMessage) {
//   figma.ui.postMessage(pluginMessage)
// }

function clone(val: any) {
  const type = typeof val
  if (val === null) {
    return null
  } else if (
    type === 'undefined' ||
    type === 'number' ||
    type === 'string' ||
    type === 'boolean'
  ) {
    return val
  } else if (type === 'object') {
    if (val instanceof Array) {
      return val.map(x => clone(x))
    } else if (val instanceof Uint8Array) {
      return new Uint8Array(val)
    } else {
      let o = {}
      for (const key in val) {
        o[key] = clone(val[key])
      }
      return o
    }
  }
  throw 'unknown'
}
