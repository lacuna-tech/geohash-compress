import fs from 'fs'
import { buildCompressedHashSet } from '@lacuna/geohash-compress'
import { writeFile, writeVariableToJsFile } from './utils/writeFile.js'
import { hashesToGeoJson } from './utils/mapHelpers.js'

console.log("buildCompressedHashSet", buildCompressedHashSet)

const laGeos = {
  // '95c0b35d-dcae-4207-989b-5ff617ff1a3b': 'Los Angeles City boundaries',
  // 'B1a89ba2-379e-400b-8028-a8d6e15e04df': 'Hollywood Special Operation Zone',
  '0c444869-1674-4234-b4f3-ab5685bcf0d9': 'Non-San Fernando Valley DACs',
  '1f943d59-ccc9-4d91-b6e2-0c5e771cbc49': 'Los Angeles City boundaries', // added later : Same as LA?
  '5834b884-a547-47c0-8836-366756d9b648': 'Venice Beach Walk Streets 5 mph locations', // problematically small (venice beach, "pacific ave & rose ct"
  '8e2c6043-8b9a-431b-95ba-9c5f37152e3d': 'Venice Beach Walk Streets', // problematically small, "Ozone ave & pacific ave"
  'b1a89ba2-379e-400b-8028-a8d6e15e04df': 'Hollywood Special Operation Zone',
  'c0591267-bb6a-4f28-a612-ff7f4a8f8b2a': 'Prohibited dockless zones', // vbeach
  'e0e4a085-7a50-43e0-afa4-6792ca897c5a': 'Venice Special Operation Zone',
  'e3ed0a0e-61d3-4887-8b6a-4af4f3769c14': 'San Fernando Valley DACs',
}

const colors = [
  '#bcbed9',
  '#c88b55',
  '#034105',
  '#f58772',
  '#611bfe',
  '#e89dbc',
  '#91e9b7',
  '#d7655d',
  '#4450e3', 
  '#39e00b',
  '#a91268',
  '#87c7e0'

]

const main = async () => {  // fs.readFileSync('./output/GeohashCompress-LA-8.json')
  const data = JSON.parse(fs.readFileSync('./input/ladot-geographies.json', 'utf8'))
  const allGeographies = data.data.geographies
  console.log('|allGeographies|', allGeographies.length)
  const geographies = allGeographies
    .filter((geo) => laGeos[geo.geography_id] )
    .reduce((acc, cur) => {
      acc[cur.geography_id] = cur
      return acc
    }, {})

  console.log('geographies', geographies)

  const maxGeoLength = 8

  const geoJsonOfGHC = []
  const polyFeatures = []

  const entries = Object.entries(laGeos)
  for (let i = 0; i < entries.length; i++) {
    const [uuid, name] = entries[i]

    const geography = geographies[uuid]
    if (!geography) {
      console.error('MISSING', {uuid, name})
      continue
    }

    const { geography_json: {features} } = geography
    const { geometry: {coordinates} } = features[0]
    
    polyFeatures.push({
      ...features[0], 
      id: i,
      properties: {
        uuid,
        name,
        'line-color': colors[i],
        'fill-color': colors[i]
      }
    })

    // console.log("coordinates", coordinates)

    const ghc = await buildCompressedHashSet(coordinates, maxGeoLength, 1)
    const geo = hashesToGeoJson(ghc)
    geoJsonOfGHC.push(hashesToGeoJson(ghc))
    writeFile(`./output/ladout-build/ghc_${uuid}-${maxGeoLength}.json`, JSON.stringify(ghc))
    writeFile(`./output/ladout-maps/ghc_${uuid}-${maxGeoLength}.js`, `var data = ${JSON.stringify({
      type: 'geojson',
      data: geo
    }, null, 4)}`)

    console.log("progres...", (i/entries.length))
  }

  writeVariableToJsFile('ladotHashToPoly', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: geoJsonOfGHC
    }
  })

  writeVariableToJsFile('ladotPolygonMask', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: polyFeatures
    }
  })
  
}

main()

