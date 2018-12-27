let gulp = require('gulp')
import * as plugins from './module'
const split = require('split')

 function build(callback:any) {

    let result
       result = gulp
        .src('./testdata/*', { buffer: false })
        //.src('./testdata/*') // buffer is true by default
      
        .pipe(plugins.addProperties({propsToAdd:{extraParam:1}}))
        .on('error', function(this:any,err: any) {
          console.error(err)
          err.showStack = true
          callback(err)
          
          // reconnect the pipe
          //this.pipe(plugins.addProperties({propsToAdd:{extraParam:1}}))
        })
        .pipe(gulp.dest('./output/processed'))
        .on('end', function() {
          console.log('end')
          callback()
        })
        .on('error', function(err: any) {
          console.error(err)
          callback(err)
        })

    return result;
  }

  exports.default = gulp.series(build)