import ngeohash from 'ngeohash'
import turf from '@turf/turf'
import { writeVariableToJsFile } from './writeFile.js'

export const makeRandomPointCenteredOn = (lng, lat, delta) => {
  return {
    lat: lat + (Math.random() - 0.5) * delta,
    lng: lng + (Math.random() - 0.5) * delta
  }
}

export const hashesToGeoJson = (hashes) => {
	const hashes_bbox = [];
  let maxDeltaLat = Number.NEGATIVE_INFINITY
  let minDeltaLat = Number.POSITIVE_INFINITY
	hashes.forEach((hash) => {
		const [minLat,minLong,maxLat,maxLong] = ngeohash.decode_bbox(hash)
    maxDeltaLat = Math.max(maxLat - minLat, maxDeltaLat)
    minDeltaLat = Math.min(maxLat - minLat, minDeltaLat)
		hashes_bbox.push([
			[minLong, minLat],
			[maxLong, minLat],
			[maxLong, maxLat],
			[minLong, maxLat],
			[minLong, minLat]
		])
	})
	return {
    type: 'geojson',
    data: {
      "type": "Feature",
      "geometry": turf.getGeom(turf.polygon(hashes_bbox))
    }
  }
}

export const writeFeatureCollectionForPoints = (varName, lngLats) => {
  writeVariableToJsFile(varName, {
    type: 'geojson',
    data: {
      type: "FeatureCollection",
      features: lngLats.map((lngLat) => ({
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": lngLat
        }
      }))
    }
  })
}

export const writePolyFeatureForPoints = (varName, lngLats) => {
  writeVariableToJsFile(varName, {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: lngLats
      }
    }
  })
}