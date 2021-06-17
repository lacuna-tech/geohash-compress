export module '@lacuna/geohash-compress' {

  // array of array of array of numbers,... lng, lat
  declare type CoordinatesArray = Array<Array<Array<number>>>

  declare class GeoHashCompress {
    constructor(compressedHashes: string[], maxPrecision: number = 7, minPrecision: number = 1);
    contains(long: number, lat: number): boolean;
    containsHash(hash: string): boolean;
    set: Set<string>;
    maxPrecision: number;
    minPrecision: number;
    toGeoJson(): any;
  }

  declare const geoHashCompressFromPoly = async (polygon: CoordinatesArray, precision: number, minPrecision: number) => GeoHashCompress
  declare const buildCompressedHashSet = async (polygon: CoordinatesArray, precision: number, minPrecision: number) => GeoHashCompress
  declare const encode = (lng: number, lat: number, hashLength: number) => string
}