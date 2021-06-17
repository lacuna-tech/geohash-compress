import {Worker} from 'worker_threads'
import {Geohash, GeoHashCompress} from '@lacuna/geohash-compress'
import { makeRandomPointCenteredOn } from './utils/mapHelpers.js'
import fs from 'fs'
import { GeohashCompressTri2 } from './Trie2/index.js'
import * as geonet from '@geonet/geohash'

const getInputs = () => {
  console.time('pt gen')
  const latLngs = []
  for (let i = 0; i < 1000000; i++) {
    latLngs.push(makeRandomPointCenteredOn(-118.3941650390625, 34.093610452768715, 0.5))
  }
  console.timeEnd('pt gen')

  console.time('geonet geohashing latlng')
  const hashes = []
  for (let i = 0; i < latLngs.length; i++) {
    const { lng, lat } = latLngs[i]
    const hash = geonet.encode(lat, lng, 8)
    hashes.push(hash)
  }
  console.timeEnd('geonet geohashing latlng')
  return {latLngs, hashes}
}

const noThreadingGHC = async () => {
  const {latLngs, hashes} = getInputs()

  console.time('init ghc')
  const hashSet = new Set([...JSON.parse(fs.readFileSync('./output/GeohashCompress-LA-8.json'))])
  const ghc = new GeoHashCompress(hashSet)
  console.timeEnd('init ghc')
  console.time('computation')
  for (let i = 0; i < hashes.length; i++) {
    ghc.containsHash(hashes[i])
  }

  console.timeEnd('computation')

  // for (let length = 5; length <= 8; length++) {
  //   const promise = new Promise((resolve) => {
  //     const worker = new Worker("./src/threadEntry.js", {workerData: {hashes: hashes, length}});
  //     worker.on("exit", () => {
  //       resolve()
  //     });
  //   })
  //   promises.push(promise)
  // }
  // console.time('all')
  // await Promise.all(promises)
  // console.timeEnd('all')
}

const noThreadingGHCTri2 = async () => {
  const {latLngs, hashes} = getInputs()

  console.time('init ghct2')
  const ghcT2 = new GeohashCompressTri2()
  for (let i = 0; i < hashes.length; i++) {
    ghcT2.insert(hashes[i])
  }
  console.timeEnd('init ghct2')

  console.time('computation')
  for (let i = 0; i < hashes.length; i++) {
    ghcT2.contains(hashes[i])
  }

  console.timeEnd('computation')

  // for (let length = 5; length <= 8; length++) {
  //   const promise = new Promise((resolve) => {
  //     const worker = new Worker("./src/threadEntry.js", {workerData: {hashes: hashes, length}});
  //     worker.on("exit", () => {
  //       resolve()
  //     });
  //   })
  //   promises.push(promise)
  // }
  // console.time('all')
  // await Promise.all(promises)
  // console.timeEnd('all')
}

const threadingGHC = async () => {
  const {hashes} = getInputs()
  const maxWorkers = 2

  const countPerWorker = Math.ceil(hashes.length/maxWorkers)
  console.log('initializing...', {maxWorkers, countPerWorker})
  const promises = []

  console.time('thread computation')
  for (let i = 0; i < hashes.length; i += countPerWorker) {
    const promise = new Promise((resolve) => {
      const hashSlice = hashes.slice(i, countPerWorker)
      const worker = new Worker("./src/threadEntry.js", {workerData: {hashes: hashSlice}});
      worker.on("exit", resolve);
    })
    promises.push(promise)
  }

  await Promise.all(promises)
  console.timeEnd('thread computation')
}

noThreadingGHC()

// threadingGHC()
// // noThreadingGHCTri2()