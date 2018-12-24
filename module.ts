export function testFunc() {
  console.log('start')
  //return;
  let d = new Date()
  return new Promise(async (resolve, reject) => {
    // await here...
    console.log('Done')
    resolve()
  }).catch(err => {
    console.log(err)
  })
}
