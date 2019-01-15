"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PluginError = require("plugin-error");
const Vinyl = require("vinyl");
// import {handler} from 'gulp-datatube-handlelines';
const through2 = require('through2');
const split = require('split');
// consts
const PLUGIN_NAME = 'gulp-datatube-splitstream';
/* This is a model data.tube plugin. It is compliant with best practices for Gulp plugins (see
https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md#what-does-a-good-plugin-look-like ),
but with an additional feature: it accepts a configObj as its first parameter */
function streamSplitter(configObj) {
    let index = configObj.index ? configObj.index : 1;
    let includeState = configObj.includeState ? configObj.includeState : false;
    let state = null;
    let count = 0;
    let result = '';
    let fileCount = 0;
    const handleLine = (lineObj) => {
        const dateStamp = getDateStamp();
        try {
            if (lineObj && lineObj.type === 'STATE') {
                state = lineObj;
                return null;
            }
            if (lineObj && lineObj.type === 'RECORD') {
                result += JSON.stringify(lineObj) + '\n';
                count++;
            }
            if (count >= index || (!lineObj)) {
                let newFile = new Vinyl({
                    path: 'lines.txt',
                    contents: Buffer.from(result)
                });
                newFile.stem = newFile.stem + ' ' + dateStamp + fileCount; // add a timestamp and then a digit to end of file name, e.g. foo.txt becomes foo 0j14_e1259_9q1.txt
                count = 0;
                result = '';
                fileCount++;
                return newFile;
            }
            else {
                return null;
            }
        }
        catch (err) {
            throw new PluginError(PLUGIN_NAME, err);
        }
    };
    let transformer = through2.obj(); // new transform stream, in object mode
    // since we're in object mode, dataLine comes as a string. Since we're counting on split
    // to have already been called upstream, dataLine will be a single line at a time
    transformer._transform = function (dataLine, encoding, callback) {
        let returnErr = null;
        try {
            let dataObj;
            if (dataLine.trim() != "")
                dataObj = JSON.parse(dataLine);
            let handledObj = handleLine(dataObj);
            if (handledObj) {
                let handledLine = JSON.stringify(handledObj);
                //console.log(handledLine)
                //this.push(handledLine + '\n');
                this.push(handledObj);
            }
        }
        catch (err) {
            returnErr = new PluginError(PLUGIN_NAME, err);
        }
        callback(returnErr);
    };
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
            // strArray will hold file.contents, split into lines
            const strArray = file.contents.toString().split(/\r?\n/);
            let tempLine;
            let resultArray = [];
            // we'll call handleLine on each line
            for (let dataIdx in strArray) {
                try {
                    let lineObj;
                    if (strArray[dataIdx].trim() != "")
                        lineObj = JSON.parse(strArray[dataIdx]);
                    tempLine = handleLine(lineObj);
                    if (tempLine)
                        strArray[dataIdx] = JSON.stringify(tempLine);
                    if (tempLine) {
                        resultArray.push(JSON.stringify(tempLine));
                        console.log("Data: " + tempLine._contents.toString());
                        self.push(tempLine);
                    }
                    //else strArray.splice(Number(dataIdx), 1) // remove the array item if handleLine returned null
                }
                catch (err) {
                    returnErr = new PluginError(PLUGIN_NAME, err);
                }
            }
            cb(returnErr);
        }
        else if (file.isStream()) {
            file.contents = file.contents
                // split plugin will split the file into lines
                .pipe(split())
                // our transformer stream, created above, will deal with each line using handleLine
                .pipe(transformer)
                .on('data', function (chunk) {
                console.log("\non data: " + chunk._contents.toString());
                self.push(chunk);
            })
                .on('end', () => {
                console.log("There will be no more data.");
            })
                .on('finish', function () {
                // using finish event here instead of end since this is a Transform stream   https://nodejs.org/api/stream.html#stream_events_finish_and_end
                console.log('finished');
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
exports.streamSplitter = streamSplitter;
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