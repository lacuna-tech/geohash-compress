import {geoHashCompressFromPoly, GeoHashCompress} from '@lacuna/geohash-compress'
import { laFeature, laWithHoles } from '../la.js'
import { writeFile, writeVariableToJsFile } from './utils/writeFile.js'
import { makeRandomPointCenteredOn, hashesToGeoJson, writeFeatureCollectionForPoints, writePolyFeatureForPoints } from './utils/mapHelpers.js'

const main = async () => {
  console.time('init')
  const lngLats = laWithHoles.features[0].geometry.coordinates

  writePolyFeatureForPoints('polygonMask', lngLats)
  const polygon = await geoHashCompressFromPoly(lngLats, 8)

  // const dataStr = fs.readFileSync('./output/compressedHashes.json', 'utf8')
  // const dataArr = JSON.parse(dataStr)
  // const polygon = new GeoHashCompress(dataArr, 7)

  const compressedHashArr = [...polygon.set]
  writeFile('./output/compressedHashes.json', JSON.stringify(compressedHashArr))
  writeVariableToJsFile('hashToPoly', hashesToGeoJson(compressedHashArr))
  console.timeEnd('init')

  const maxIterations = 400000
  const timingTag = `compute ${maxIterations} pts`
  console.time(timingTag)
  const a = []
  for (let i = 0; i < maxIterations; i++) {
    const { lng, lat } = makeRandomPointCenteredOn(-118.3941650390625, 34.093610452768715, 0.5)
    a.push({
      coordinates: [lng, lat], 
      inside: polygon.contains(lng, lat)
    })
  }
  console.timeEnd(timingTag)

  writeFeatureCollectionForPoints('inside', a.filter( a => a.inside).map(a => a.coordinates))
  writeFeatureCollectionForPoints('outside', a.filter( a => !a.inside).map(a => a.coordinates))
}

main()