let gulp = require('gulp')
import { splitFile } from '../src/plugin';


function runSplitFile(callback: any) {
  let result
  result =
    gulp.src('../testdata/*.ndjson', { buffer: false})//, { buffer: false } 
      .pipe(splitFile({index:4 }))
      .on('error', console.error.bind(console))
      .pipe(gulp.dest('../testdata/processed'))
      .on('end', function () {
        console.log('runSplitFile is done.')
        callback()
      })
      .on('error', function (err: any) {
        console.error(err)
        callback(err)
      })

  return result;
}

exports.default = gulp.series(runSplitFile)