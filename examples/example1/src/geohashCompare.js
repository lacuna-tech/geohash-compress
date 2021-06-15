import {Geohash} from '@lacuna/geohash-compress'
import { makeRandomPointCenteredOn } from './utils/mapHelpers.js'
import * as geonet from '@geonet/geohash'
import ngeohash from 'ngeohash'
import ltlngGeohash from 'latlon-geohash'
import {TriangleGeohash} from 'triangle-geohash'

const getLatLngs = () => {
  const latLngs = []
  for (let i = 0; i < 1000000; i++) {
    latLngs.push(makeRandomPointCenteredOn(-118.3941650390625, 34.093610452768715, 0.5))
  }
  return latLngs
}

// 400
const internalMethod = () => {
  const latLngs = getLatLngs()

  console.time('geohashing latlng')
  const hashes = []
  for (let i = 0; i < latLngs.length; i++) {
    const { lng, lat } = latLngs[i]
    const hash = Geohash.encode(lat, lng, 8)
    hashes.push(hash)
  }
  console.timeEnd('geohashing latlng')
}

// 350
const geonetMethod = () => {
  const latLngs = getLatLngs()
  console.time('geonet geohashing latlng')
  const hashes2 = []
  for (let i = 0; i < latLngs.length; i++) {
    const { lng, lat } = latLngs[i]
    const hash = geonet.encode(lat, lng, 8)
    hashes2.push(hash)
  }
  console.timeEnd('geonet geohashing latlng')
}

// 550
const ngeohashMethod = () => {
  const latLngs = getLatLngs()
  console.time('ngeohash geohashing latlng')
  const hashes2 = []
  for (let i = 0; i < latLngs.length; i++) {
    const { lng, lat } = latLngs[i]
    const hash = ngeohash.encode(lat, lng, 8)
    hashes2.push(hash)
  }
  console.timeEnd('ngeohash geohashing latlng')
}

// 400
const latlngGeoMethod = () => {
  const latLngs = getLatLngs()
  console.time('latlngGeo geohashing latlng')
  const hashes2 = []
  for (let i = 0; i < latLngs.length; i++) {
    const { lng, lat } = latLngs[i]
    const hash = ltlngGeohash.encode(lat, lng, 8)
    hashes2.push(hash)
  }
  console.timeEnd('latlngGeo geohashing latlng')
}

// X!
const triangleGeoMethod = () => {
  const latLngs = getLatLngs()
  const depth = TriangleGeohash.Depths.km0_22
  console.time('triangleGeo geohashing latlng')
  const hashes2 = []
  for (let i = 0; i < latLngs.length; i++) {
    const { lng, lat } = latLngs[i]
    const hash = TriangleGeohash.generateGeohashes(lat, lng, depth);

    hashes2.push(hash)
  }
  console.timeEnd('triangleGeo geohashing latlng')
}

geonetMethod()