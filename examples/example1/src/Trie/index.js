export class TrieNode {
  constructor() {}

  getChild(key) {
    return this.children && this.children.get(key)
  }

  addChild(key) {
    if (!this.children) {
      this.children = new Map()
    }
    let child = this.children.get(key)
    if (!child) {
      child = new TrieNode()
      this.children.set(key, child)
    }
    return child
  }
}

export class GeohashCompressTri {
  constructor() {
    this.head = new TrieNode()
  }

  insert(hash, node = this.head, index = 0) {
    if (index >= hash.length) return
    // console.log('inserting', hash[index])
    return this.insert(hash, node.addChild(hash[index]), index + 1)
  }
  
  contains(hash, node = this.head, index = 0) {
    if (hash.length === index) {
      return node && node.children
    }
    if (!node || !node.children) return false
    return this.contains(hash, node.getChild(hash[index]), index + 1)
  }
}