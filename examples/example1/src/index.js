import {geoHashCompressFromPoly, GeoHashCompress} from '@lacuna/geohash-compress'
import { laFeature, laWithHoles } from '../la.js'
import { writeFile, writeVariableToJsFile } from './utils/writeFile.js'
import { makeRandomPointCenteredOn, hashesToGeoJson, writeFeatureCollectionForPoints, writePolyFeatureForPoints } from './utils/mapHelpers.js'
import { pointInShape } from '@mds-core/mds-utils'
import fs from 'fs'

const main = async () => {
  console.time('init')
  const lngLats = laWithHoles.features[0].geometry.coordinates

  writePolyFeatureForPoints('polygonMask', lngLats)
  // const polygon = await geoHashCompressFromPoly(lngLats, 7)

  const dataStr = fs.readFileSync('./output/GeohashCompress-LA-8.json', 'utf8')
  const dataArr = JSON.parse(dataStr)
  const polygon = new GeoHashCompress(dataArr)

  const compressedHashArr = [...polygon.set]
  writeFile('./output/compressedHashes.json', JSON.stringify(compressedHashArr))
  writeVariableToJsFile('hashToPoly',  {
    type: 'geojson',
    data: hashesToGeoJson(compressedHashArr)
  })
  console.timeEnd('init')

  const maxIterations = 1000000
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

const accuracy = async () => {
  const lngLats = laWithHoles.features[0].geometry.coordinates

  const la8 = './output/GeohashCompress-LA-8.json' 
  const la7 = './output/GeohashCompress-LA-7.json' // 

  const results = {}

  const maxIterations = 1000000
  Object.entries({la7, la8}).forEach(([compressName, laResFile]) => {
    console.log('starting ', compressName)
    const hashCompress = new GeoHashCompress(JSON.parse(fs.readFileSync(laResFile, 'utf8')), 8, 1)
    let numberIncorrect = 0
    
    const timingLabel = `timing ${compressName}`
    console.time(timingLabel)
    for (let i = 0; i < maxIterations; i++) {
      const { lng, lat } = makeRandomPointCenteredOn(-118.3941650390625, 34.093610452768715, 0.5)
      const hashIn = hashCompress.contains(lng,lat);
      const polyIn = pointInShape({lat, lng}, {
        type: 'Polygon',
        coordinates: lngLats
      })
      if (hashIn != polyIn) {
        numberIncorrect++
      }
  
      if (i % 100000 == 0) {
        console.log('progress: ', (i / maxIterations) * 100)
      }
    }
    console.timeEnd(timingLabel)
    results[compressName] = {
      pCorrect: (maxIterations - numberIncorrect)/maxIterations, 
      pIncorrect: (numberIncorrect)/maxIterations,
      numMoreComp: (numberIncorrect)/maxIterations * maxIterations
    }
  })

  console.log("results", results)
}

// accuracy()