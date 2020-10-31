let gulp = require('gulp')
import { splitFile } from '../src/plugin';


function runSplitFile(callback: any) {
  let result
  result =
    gulp.src('../testdata/*.ndjson', { buffer: true})//, { buffer: false } 
      // .pipe(splitFile({index:2 })) 
      // .pipe(splitFile({index:2, separator:'-' })) 
      // .pipe(splitFile({index:2, timeStamp:true })) 
      // .pipe(splitFile({groupBy:'.type', index:2 })) // cause error by using groupBy and index together
      // .pipe(splitFile({groupBy:['.type', '.stream']})) // group by `type` and then `stream`
      .pipe(splitFile({groupBy:'.record ."Leaf Grade", .type:val("STATE")' })) // group by record.Leaf Grade, and also type (if it is "STATE")

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