//  Ethans-MacBook-Pro:example1 esherr$ node src/testing.js --expose-gc
import fs from 'fs'
import {writeFile} from './utils/writeFile.js'
import {Geohash, GeoHashCompress} from '@lacuna/geohash-compress'
import { makeRandomPointCenteredOn } from './utils/mapHelpers.js'
import { GeohashCompressTri } from './Trie/index.js'



const furtherCompression = () => {
  const dataStr = fs.readFileSync('./output/GeohashCompress-LA-8.json', 'utf8')
  const data = JSON.parse(dataStr)
  // console.log('data', data)
  const sorted = data.sort()



  const mBeforeTri = garbageCollectedMeasure()
  const geohashTri = new GeohashCompressTri()
  for (const hash of sorted) {
    geohashTri.insert(hash)
  }
  const mAfterTri = garbageCollectedMeasure()
  console.log('musage', {deltaTri: (mAfterTri.heapUsed - mBeforeTri.heapUsed)/1024/1024})

  writeFile('./output/GeohashCompress-LA-8-sorted.json', JSON.stringify(sorted, null, 4))

  const maxIterations = 1000000
  let timingTag = `compute ${maxIterations} pts : trie`
  console.time(timingTag)
  const a = []
  for (let i = 0; i < maxIterations; i++) {
    const { lng, lat } = makeRandomPointCenteredOn(-118.3941650390625, 34.093610452768715, 0.5)
    
    const hash = Geohash.encode(lat, lng, 8)
    
    a.push({
      coordinates: [lng, lat], 
      inside: geohashTri.contains(hash)
    })
  }
  console.timeEnd(timingTag)

  const mBeforeHash = garbageCollectedMeasure()

  const geoHashCompress = new GeoHashCompress(data)

  console.time('gc')
  const mAfterHash = garbageCollectedMeasure()
  console.timeEnd('gc')

  console.log('musage', {deltaHash: (mAfterHash.heapUsed - mBeforeHash.heapUsed)/1024/1024})

  
  timingTag = `compute ${maxIterations} pts : compress`
  console.time(timingTag)
  // a.clear()
  for (let i = 0; i < maxIterations; i++) {
    const { lng, lat } = makeRandomPointCenteredOn(-118.3941650390625, 34.093610452768715, 0.5)
    a.push({
      coordinates: [lng, lat], 
      inside: geoHashCompress.contains(lng, lat)
    })
  }
  console.timeEnd(timingTag)
}

const garbageCollectedMeasure = () => {
  if (!global.gc) {
    console.warn('could not force gc')
  } else {
    global.gc()
  }
  return process.memoryUsage()
}


furtherCompression()

// hasing objects takes 230ms hashing ints takes 50ms
