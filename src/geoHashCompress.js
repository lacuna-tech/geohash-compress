import { Geohash } from './Geohash.js'
// import nodeGeohash from 'ngeohash'
// import turf from '@turf/turf'
export class GeoHashCompress {
	/**
     * @param   {Set} compressedHashes - compressed hash set of the polygon
     * @param   {number} maxPrecision - Maximum precision of hashes generated.
     * @param   {number} minPrecision - Minimum precision of hash generated.
     */
	constructor(compressedHashes, maxPrecision = 7, minPrecision = 1) {
		this.maxPrecision = maxPrecision;
		this.minPrecision = minPrecision;
		this.set = compressedHashes;
	}

	/**
   * @param   {number} long - longitude of point
	 * @param   {number} lat - 	latitude of point.
	 * @returns {bool} true/false - true if point is inside the polygon or vice versa.
     */
	contains(long, lat) {
		if (isNaN(lat) || isNaN(long)) {
			throw Error('Latitude and Longitude should be Numbers!');
		}
		const hash = Geohash.encode(lat, long, this.maxPrecision);
		for (let i = 1; i <= hash.length; i++) {
			if (this.set.has(hash.slice(0, i))) {
				return true;
			}
		}
		return false;
	}

  toGeoJson() {
    return {}
  }

	// toGeoJson() {
	// 	const hashes = [...this.set];
	// 	const hashes_bbox = [];
	// 	hashes.forEach((hash) => {
	// 		const [minLat,minLong,maxLat,maxLong] = nodeGeohash.decode_bbox(hash)
	// 		hashes_bbox.push([
	// 			[minLong,minLat],
	// 			[maxLong,minLat,],
	// 			[maxLong,maxLat,],
	// 			[minLong,maxLat],
	// 			[minLong,minLat]
	// 		])
	// 	})
	// 	return {
  //     type: 'geojson',
  //     data: {
  //       "type": "Feature",
  //       "geometry": turf.getGeom(turf.polygon(hashes_bbox))
  //     }
  //   }
	// }
}
