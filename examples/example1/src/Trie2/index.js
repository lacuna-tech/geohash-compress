export class GeohashCompressTri2 {
  constructor() {
    this.head = new Map()
  }

  insert(hash, node = this.head, index = 0) {
    if (index >= hash.length) return
    const childName = hash[index]
    let child = node.get(childName)
    if (!child) {
      child = (index < hash.length - 1) ? new Map() : undefined
      // child = new Map()
      node.set(childName, child)
    }
    return this.insert(hash, child, index + 1)
  }
  
  contains(hash, node = this.head, index = 0) {
    if (hash.length === index) {
      return node === undefined
      // return node && node.size > 0
    }
    if (node === undefined) return false
    // if (!node || node.size === 0) return false
    return this.contains(hash, node.get(hash[index]), index + 1)
  }
}