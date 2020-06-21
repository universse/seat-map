import { restRequest } from '@seat-map/common'

// TODO overview map
export function fetchOverviewMap(id) {}

export const fetchArea = memoize(
  function (areaId) {
    // await fakeLatency()
    // TODO fetch area
    return restRequest('/test.json').then((seats) => {
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
  (args) => args[0],
  30000
)

export const getAreaHtml = (function () {
  const areaVisibilityCache = new Map()

  return async function ([areaId, isVisible]) {
    try {
      if (isVisible !== areaVisibilityCache.get(areaId)) {
        const html = isVisible ? await fetchArea(areaId) : ''
        areaVisibilityCache.set(areaId, isVisible)
        return html
      }
    } catch (e) {
      // TODO retry
      console.log(e)
    }
  }
})()

export function memoize(func, keyResolver, timeout = Infinity) {
  const cache = new Map()
  const inProgress = new Map()

  if (isNaN(timeout)) throw new Error('Invalid timeout argument!')
  if (timeout < 0) timeout = 0

  return async function () {
    const key = keyResolver.apply(null, arguments)

    if (cache.has(key)) {
      return cache.get(key)
    } else if (inProgress.has(key)) {
      // nothing to do lol
    } else {
      // promisify
      const promise = Promise.resolve(func.apply(null, arguments))
      inProgress.set(key, promise)
      let result

      try {
        result = await promise

        inProgress.delete(key)
        cache.set(key, result)

        // bust cache
        timeout !== Infinity &&
          setTimeout(() => {
            cache.delete(key)
          }, timeout)
      } catch (e) {
        // TODO retry
        inProgress.delete(key)
        throw new Error('')
      }

      return result
    }
  }
}

function fakeLatency() {
  return new Promise((resolve) =>
    setTimeout(
      resolve,
      // Math.random() * 3000 + 500
      5000
    )
  )
}

// [areaid, html]
// only return changes by comparing last visible areas and current visible areas
// export const buildAreaHtmls = (function () {
//   const visibilityCache = new Map()

//   return async function (areaVisibility) {
//     const areaHtmls = []

//     try {
//       // sequential fetches
//       // for (const [areaId, isVisible] of areaVisibility) {
//       //   const html = isVisible ? await fetchArea(areaId) : ''

//       //   if (html !== visibilityCache.get(areaId)) {
//       //     areaHtmls.push([areaId, html])
//       //     visibilityCache.set(areaId, html)
//       //   }
//       // }

//       // parallel fetches
//       await Promise.all(
//         areaVisibility.map(async ([areaId, isVisible]) => {
//           const html = isVisible ? await fetchArea(areaId) : ''

//           if (html !== visibilityCache.get(areaId)) {
//             areaHtmls.push([areaId, html])
//             visibilityCache.set(areaId, html)
//           }
//         })
//       )

//       return areaHtmls
//     } catch (e) {
//       // TODO retry
//       console.log(e)
//     }
//   }
// })()

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
