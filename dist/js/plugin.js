"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PluginError = require("plugin-error");
const Vinyl = require("vinyl");
const through2 = require('through2');
const split = require('split2');
// consts
const PLUGIN_NAME = 'gulp-datatube-splitfile';
/* This is a model data.tube plugin. It is compliant with best practices for Gulp plugins (see
https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md#what-does-a-good-plugin-look-like ),
but with an additional feature: it accepts a configObj as its first parameter */
function splitFile(configObj) {
    let index = configObj.index ? configObj.index : 1;
    // creating a stream through which each file will pass
    // see https://stackoverflow.com/a/52432089/5578474 for a note on the "this" param
    const strm = through2.obj(function (file, encoding, cb) {
        const self = this;
        let returnErr = null;
        if (file.isNull()) {
            // return empty file
            return cb(returnErr, file);
        }
        else if (file.isBuffer()) {
            let filecount = 0;
            // strArray will hold file.contents, split into lines
            try {
                const strArray = file.contents.toString().split(/\r?\n/);
                let i = 0;
                while (strArray.length > 0) {
                    if ((index) < strArray.length) {
                        i = index;
                    }
                    else {
                        i = strArray.length;
                    }
                    let contents = '';
                    let subArr = strArray.slice(0, i);
                    strArray.splice(0, i);
                    subArr.forEach((item, index, array) => {
                        if (item.trim() != "")
                            contents = contents + item + '\n';
                        //Buffer.concat([(contents as Buffer), Buffer.from(item + '\n')])
                    });
                    if (contents.length > 0) {
                        self.push(new Vinyl({
                            path: 'lines' + '-' + getDateStamp() + '-' + (filecount++) + '.txt',
                            contents: Buffer.from(contents)
                        }));
                    }
                }
            }
            catch (err) {
                returnErr = new PluginError(PLUGIN_NAME, err);
            }
            if (filecount != 0) {
                cb(returnErr);
            }
            else {
                cb(returnErr, file);
            }
        }
        else if (file.isStream()) {
            let count = 0;
            let filecount = 0;
            let currentfile;
            file.contents
                // split plugin will split the file into lines
                .pipe(split())
                .on('data', function (chunk) {
                // console.log("\non data: " + (chunk));
                if (count == 0) {
                    currentfile = new Vinyl({
                        path: 'lines' + '-' + getDateStamp() + '-' + (filecount++) + '.txt',
                        contents: through2.obj()
                    });
                    self.push(currentfile);
                    console.log('writing ' + currentfile.basename);
                }
                if (chunk.trim() != "") {
                    currentfile.contents.push(chunk + '\n');
                    count++;
                }
                //if the number of lines in the current file is equal to the target index param, push file through
                if (count == index) {
                    //https://nodejs.org/api/stream.html#stream_writable_end_chunk_encoding_callback
                    //need to end writable streams, 'end' signals no more data will be written to the stream
                    currentfile.contents.end();
                    count = 0;
                }
            })
                .on('end', function () {
                currentfile.contents.end();
                console.log('end');
                cb(returnErr);
            })
                .on('error', function (err) {
                //console.error(err)
                cb(new PluginError(PLUGIN_NAME, err));
            });
        }
    });
    return strm;
}
exports.splitFile = splitFile;
function getDateStamp() {
    const dt = new Date();
    const dateStamp = Number(String(dt.getFullYear()).substr(2, 2))
        .toString(32)
        .padStart(2, '0') + // 2-digit year converted to base32
        (dt.getMonth() + 1).toString(32) + // month (1-12) converted to base32
        dt.getDate().toString(32) + // day (1-31) converted to base 32
        '_' +
        // hmmss, where h is in base32, but mmss is in normal base10 (base 10 for readability; we can't save any digits by using base32)
        dt.getHours().toString(32) +
        String(dt.getMinutes()).padStart(2, '0') +
        String(dt.getSeconds()).padStart(2, '0') +
        '_' +
        // milliseconds, in base32
        dt
            .getMilliseconds()
            .toString(32)
            .padStart(2, '0');
    return dateStamp;
}
//# sourceMappingURL=plugin.js.map