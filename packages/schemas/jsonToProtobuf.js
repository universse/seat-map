const Pbf = require('pbf')
const SeatMap = require('./SeatMap').SeatMap
const seatMapJSON = require('./seatMap.json')
const { writeFileSync } = require('fs')

function toProtobuf(seatMap) {
  const pbf = new Pbf()
  SeatMap.write(seatMap, pbf)
  return pbf.finish()
}

writeFileSync('./seatMapAlt.pbf', toProtobuf(seatMapAltJSON))
