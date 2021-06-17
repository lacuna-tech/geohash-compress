import {parentPort, workerData} from "worker_threads";
import fs from 'fs'
import { GeoHashCompress } from '@lacuna/geohash-compress'

const { length, hashes } = workerData
console.time("threadTime")

console.time("thread json time")
const dataStr = fs.readFileSync('./output/GeohashCompress-LA-8.json')
const data = JSON.parse(dataStr)
console.log('hashset', data.length)
const ghc = new GeoHashCompress(data)
console.timeEnd("thread json time")

for (let i = 0; i < hashes.length; i++) {
  ghc.containsHash(hashes[i])
}
console.timeEnd("threadTime")

parentPort.close();