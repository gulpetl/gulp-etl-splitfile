"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let gulp = require('gulp');
// import {splitStream} from './plugin'
// export {splitStream} from './plugin';
const plugin_1 = require("./plugin");
function build_plumber(callback) {
    let result;
    result =
        gulp.src('./testdata/*') //,{ buffer: false }
            //.src('./testdata/*') // buffer is true by default
            //        .pipe(plumber({errorHandler:false}))
            //.pipe(lineH.splitStream({fileName:'state.json', removeState:true}))
            .pipe(plugin_1.streamSplitter({ index: 2 }))
            .on('error', console.error.bind(console))
            // .on('error', function(this:any,err: any) {
            //   console.error(err)
            //   err.showStack = true
            //   callback(err)
            //   // reconnect the pipe
            //   //this.pipe(plugins.addProperties({propsToAdd:{extraParam:1}}))
            // })
            .pipe(gulp.dest('./output/processed'))
            .on('end', function () {
            console.log('end');
            callback();
        })
            .on('error', function (err) {
            console.error(err);
            callback(err);
        });
    return result;
}
exports.default = gulp.series(build_plumber);
//# sourceMappingURL=gulpfile.js.map