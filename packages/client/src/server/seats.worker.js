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

export function fetchArea (areaId) {
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
