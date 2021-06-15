//  Ethans-MacBook-Pro:example1 esherr$ node src/testing.js --expose-gc
import fs from 'fs'
import {writeFile} from './utils/writeFile.js'
import {Geohash, GeoHashCompress} from '@lacuna/geohash-compress'
import { makeRandomPointCenteredOn } from './utils/mapHelpers.js'
import { GeohashCompressTri2 } from './Trie2/index.js'



const furtherCompression = () => {
  const dataStr = fs.readFileSync('./output/GeohashCompress-LA-8.json', 'utf8')
  const data = JSON.parse(dataStr)
  const sorted = data.sort()

  const mBeforeTri = garbageCollectedMeasure()
  const geohashTri = new GeohashCompressTri2()
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

const mbGb = () => {
  return garbageCollectedMeasure().heapUsed / 1024 / 1024
}

const garbageCollectedMeasure = () => {
  if (!global.gc) {
    console.warn('could not force gc')
  } else {
    global.gc()
  }
  return process.memoryUsage()
}

const max = 1000000

const testMb1 = () => {
  const a = []

  const mb1 = mbGb()
  for (let i = 0; i < max; i++) {
    let first = new Map([
      [1, 'one'],
      [2, 'two'],
      [3, 'three'],
    ])
    a.push(first)
  }
  const mb2 = mbGb()
  console.log('a.length', a.length)
  console.log("mb statically assigned", mb2 - mb1)  
}

const testMb2 = () => {
  const b = []
  const mb3 = mbGb()
  for (let i = 0; i < max; i++) {
    const first = new Map()
    first.set(1, 'one')
    first.set(2, 'two')
    first.set(3, 'three')
    b.push(first)
  }
  const mb4 = mbGb()
  console.log('b.length', b.length)
  b.push('hehe')
  console.log("mb statically assigned", mb4 - mb3)
}


testMb1()
testMb2()

// furtherCompression()

// hasing objects takes 230ms hashing ints takes 50ms
