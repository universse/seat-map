import restRequest from '../utils/restRequest'

export function fetchOverviewMap (id = '567:45185') {
  return restRequest(
    `/figma/files/MVuVGa6uvlRX1j6TdN0catmn/nodes?ids=${id}&geometry=paths`
  ).then(res => {
    const {
      size: { x: width, y: height },
      children,
    } = res.nodes[id].document
    const overviewHtmlArray = []

    for (const {
      name,
      relativeTransform: [[, , x], [, , y]],
      size: { x: width, y: height },
    } of children) {
      overviewHtmlArray.push(
        `<rect id='${name}' x='${x}' y='${y}' width='${width}' height='${height}' fill='#39A5F2'></rect>`
      )
    }

    return {
      svgProps: { width, height },
      overviewHtml: overviewHtmlArray.join(''),
    }
  })
}

const RADIUS = 12
const STROKE_WIDTH = 4

const SIZE = RADIUS * 2 + STROKE_WIDTH
const HALF_SIZE = SIZE / 2

export const fetchArea = memoize(
  function (areaId) {
    return restRequest(
      `/figma/files/MVuVGa6uvlRX1j6TdN0catmn/nodes?ids=${areaId}&geometry=paths`
    ).then(res => {
      const {
        relativeTransform: [[, , originX], [, , originY]],
        children,
      } = res.nodes[areaId].document

      const areaHtmls = []

      for (const {
        relativeTransform: [[, , x], [, , y]],
      } of children) {
        areaHtmls.push(
          `<circle cx='${originX + x + HALF_SIZE}' cy='${originY +
            y +
            HALF_SIZE}' r='${RADIUS}'></circle>`
        )
      }

      return areaHtmls.join('')
    })
  },
  (...args) => args[0]
  // 30000
)

export const getAreaHtml = (function () {
  const areaVisibilityCache = new Map()
  const renderedAreaCache = new Map()

  return async function ([areaId, isVisible]) {
    areaVisibilityCache.set(areaId, isVisible)

    if (!isVisible && renderedAreaCache.get(areaId) !== false) {
      renderedAreaCache.set(areaId, false)
      return [false, '']
    }

    try {
      const html = await fetchArea(areaId)

      if (areaVisibilityCache.get(areaId) && !renderedAreaCache.get(areaId)) {
        renderedAreaCache.set(areaId, true)
        return [true, html]
      }
    } catch (e) {
      // TODO retry
      console.log(e)
    }
  }
})()

export function memoize (func, keyResolver, timeout = Infinity) {
  const cache = new Map()
  const inProgress = new Map()

  if (isNaN(timeout)) throw new Error('Invalid timeout argument!')
  if (timeout < 0) timeout = 0

  return async function () {
    const key = keyResolver.apply(null, arguments)

    if (cache.has(key)) {
      return cache.get(key)
    }
    // promisify
    const promise = Promise.resolve(func.apply(null, arguments))

    let result

    try {
      if (inProgress.has(key)) {
        result = await inProgress.get(key)
      } else {
        inProgress.set(key, promise)
        result = await promise
      }

      inProgress.delete(key)
      cache.set(key, result)

      timeout !== Infinity &&
        setTimeout(() => {
          cache.delete(key)
        }, timeout)

      return result
    } catch (e) {
      inProgress.delete(key)
      throw new Error('')
    }
  }
}

function fakeLatency () {
  return new Promise(resolve =>
    setTimeout(
      resolve,
      // Math.random() * 3000 + 500
      5000
    )
  )
}
