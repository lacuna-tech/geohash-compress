const hashsetTest = () => {

  const max = 1000000
  const s1 = new Set()
  for (let i = 0; i < max; i++) {
    s1.add(i)
  }

  console.time('timing integer hash')
  for (let i = 0; i < max; i++) {
    s1.has(i)
  }
  console.timeEnd('timing integer hash')

  garbageCollectedMeasure()

  console.time('timing object hash')
  const objs = []
  const s2 = new Set()
  for (let i = 0; i < max; i++) {
    const obj = {i}  
    objs.push(obj)
    s2.add(obj)
  }

  for (let i = 0; i < max; i++) {
    s2.has(objs[i])
  }
  console.timeEnd('timing object hash')
}