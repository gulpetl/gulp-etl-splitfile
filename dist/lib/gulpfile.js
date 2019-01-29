"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let gulp = require('gulp');
const plugin_1 = require("./plugin");
function build_plumber(callback) {
    let result;
    result =
        gulp.src('../testdata/*', { buffer: false }) //, { buffer: false } 
            .pipe(plugin_1.splitStream({}))
            .on('error', console.error.bind(console))
            .pipe(gulp.dest('../output/processed'))
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