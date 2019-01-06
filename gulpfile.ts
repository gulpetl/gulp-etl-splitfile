let gulp = require('gulp')
import * as plugins from './module'
const split = require('split')

import _ from 'highland'
//import * as plumber from 'gulp-plumber'
const plumber = require('gulp-plumber')
 function build(callback:any) {
    let result
       result = 
        _(gulp.src('./testdata/*', { buffer: false }))
        //.src('./testdata/*') // buffer is true by default
        .through(plugins.addProperties({propsToAdd:{extraParam:1}}))
        .errors((err, push) => {
          // if (err.statusCode === 404) {
          //   // not found, return empty doc
          //   push(null, {});
          // }
          if (err) {
            // swallow error?
            console.log('gotcha!')
          }
          else {
              // otherwise, re-throw the error
              push(err);
          }          
        })         
        // .on('error', function(this:any,err: any) {
        //   console.error(err)
        //   err.showStack = true
        //   callback(err)
          
        //   // reconnect the pipe
        //   //this.pipe(plugins.addProperties({propsToAdd:{extraParam:1}}))
        // })
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

  function build_plumber(callback:any) {
    let result
       result = 
        gulp.src('./testdata/*', { buffer: false })
        //.src('./testdata/*') // buffer is true by default
//        .pipe(plumber({errorHandler:false}))
        .pipe(plugins.addProperties({propsToAdd:{extraParam:1}}))
        .on('error', console.error.bind(console))
        // .on('error', function(this:any,err: any) {
        //   console.error(err)
        //   err.showStack = true
        //   callback(err)
          
        //   // reconnect the pipe
        //   //this.pipe(plugins.addProperties({propsToAdd:{extraParam:1}}))
        // })
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

  exports.default = gulp.series(build_plumber)