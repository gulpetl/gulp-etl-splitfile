let gulp = require('gulp')
import * as plugins from './module'
const split = require('split')


gulp.task('default', build)

async function build() {
    // console.log('args: ' + args)
    // let buffer = await fse.readFile('../../' + args[1])
    //let config = JSON.parse(buffer.toString())
  
    return new Promise((resolve, reject) => {
      gulp
        .src('./testdata/*', { buffer: false })
        //.src('./testdata/*') // buffer is true by default
      
        .pipe(plugins.addProperties({propsToAdd:{extraParam:1}}))
        .pipe(gulp.dest('./output/processed'))
        .on('end', function() {
          console.log('end')
          resolve()
        })
        .on('error', function(err: any) {
          console.error(err)
          resolve(err)
        })
    }).catch(err => {
      console.error(err.stack)
    })
  }