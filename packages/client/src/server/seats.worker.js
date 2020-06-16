// import Pbf from "pbf";

// import SeatMap from "../schema/SeatMap_proto";

// export function getSeatMap() {
//   return fetch(`/seatMap.pbf`)
//     .then((res) => res.arrayBuffer())
//     .then((buffer) => {
//       const pbf = new Pbf(buffer);
//       return SeatMap.SeatMap.read(pbf);
//     });
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

function fakeLatency () {
  return new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 500))
}

const cache = {}

export function fetchMap (id) {}

// [areaid, html]
export function buildSeats (areaRectsJsonString) {
  const areaRects = JSON.parse(areaRectsJsonString)

  return [
    ['0', '<circle></circle>'],
    ['1', '<circle></circle>'],
    ['2', '<circle></circle>'],
    ['3', '<circle></circle>'],
    ['4', '<circle></circle>'],
    ['5', '<circle></circle>'],
    ['6', '<circle></circle>'],
    ['7', ''],
    ['8', ''],
    ['9', ''],
  ]
}
