export function fetchOverviewMap (id) {}

// prefetch / prebuild based on mouse position

const buildAreaHtml = memoize(
  function (areaId) {
    return fetch(`/seatMap.pbf` || areaId).then(seats => {
      const areaHtmls = []

      for (let i = 0; i < 10; i++) {
        areaHtmls.push('<circle></circle>')
      }

      // for (const seat of seats) {
      //   // TODO
      //   areaHtmls.push('')
      // }

      return areaHtmls.join('')
    })
  },
  args => args[0]
)

// [areaid, html]
// only return changes
// compare last visible areas and current visible areas
export const buildAreaHtmls = (function () {
  const areaVisibilityMap = new Map()

  return async function (areaVisibility) {
    const areaHtmls = []

    for (const [areaId, isVisible] of areaVisibility) {
      const html = isVisible ? await buildAreaHtml(areaId) : ''

      if (html !== areaVisibilityMap.get(areaId)) {
        areaHtmls.push([areaId, html])
      }

      areaVisibilityMap.set(areaId, html)
    }

    return areaHtmls
  }
})()

export function memoize (func, keyResolver) {
  const cache = new Map()

  return function () {
    const key = keyResolver.apply(null, arguments)

    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = func.apply(null, arguments)
    cache.set(key, result)
    return result
  }
}

// function fakeLatency() {
//   return new Promise((resolve) =>
//     setTimeout(resolve, Math.random() * 3000 + 500)
//   )
// }

// import Pbf from 'pbf'

// import SeatMap from 'schemas'

// export function getSeatMap() {
//   return fetch(`/seatMap.pbf`)
//     .then((res) => res.arrayBuffer())
//     .then((buffer) => {
//       const pbf = new Pbf(buffer)
//       return SeatMap.SeatMap.read(pbf)
//     })
// }

// const flatbuffers = require("flatbuffers").flatbuffers;

// const SeatMapFBS = require("../schema/SeatMap_generated").SeatMap;

// export function getSeatMap() {
//   return fetch(`/seatMap.bin`)
//     .then((res) => res.arrayBuffer())
//     .then((arrayBuffer) => {
//       const bytes = new Uint8Array(arrayBuffer)
//       const buffer = new flatbuffers.ByteBuffer(bytes)
//       const seatMap = SeatMapFBS.SeatMap.getRootAsSeatMap(buffer)
//       console.log(seatMap.groups(0).bounds(0).y2())
//     })
// }
