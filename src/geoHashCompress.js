import Geohash from '@geonet/geohash'
export class GeoHashCompress {
	/**
     * @param   {Set} compressedHashes - compressed hash set of the polygon
     * @param   {number} maxPrecision - Maximum precision of hashes generated.
     * @param   {number} minPrecision - Minimum precision of hash generated.
     */
	constructor(compressedHashes) {
		this.maxPrecision = Number.NEGATIVE_INFINITY;
		this.minPrecision = Number.POSITIVE_INFINITY;
    
    for (const hash of compressedHashes) {
      this.maxPrecision = Math.max(this.maxPrecision, hash.length)
      this.minPrecision = Math.min(this.minPrecision, hash.length)
    }
		this.set = new Set(compressedHashes);
	}

	/**
   * @param   {number} long - longitude of point
	 * @param   {number} lat - 	latitude of point.
	 * @returns {bool} true/false - true if point is inside the polygon or vice versa.
     */
	contains(long, lat) {
		return this.containsHash(Geohash.encode(long, lat, this.maxPrecision));
	}
  containsHash(hash) {
    for (let i = this.minPrecision; i <= this.maxPrecision; i++) {
			if (this.set.has(hash.slice(0, i))) {
				return true;
			}
		}
		return false;
  }
}
