let gulp = require('gulp')
import { splitStream } from './plugin';


function build_plumber(callback: any) {
  let result
  result =
    gulp.src('../testdata/*', { buffer: false })//, { buffer: false } 
      .pipe(splitStream({}))
      .on('data', function (file: any) {
        console.log(file.contents);
      })
      .on('error', console.error.bind(console))
      .pipe(gulp.dest('../output/processed'))
      .on('end', function () {
        console.log('end')
        callback()
      })
      .on('error', function (err: any) {
        console.error(err)
        callback(err)
      })

  return result;
}

exports.default = gulp.series(build_plumber)