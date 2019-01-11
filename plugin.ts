import PluginError = require('plugin-error');
import Vinyl = require('vinyl')
import { writeFileSync } from 'fs-extra';
// import {handler} from 'gulp-datatube-handlelines';
const through2 = require('through2')
const split = require('split')
// consts
const PLUGIN_NAME = 'gulp-datatube-splitstream';

// export function splitStream(configObj:any){
//   let state:object|null = null;
//   const handleLine = (lineObj: object): object | null => {
//     try {
//       if(lineObj && (lineObj as any).type === 'STATE'){
//         state = lineObj;
//         return null;
//       }
//       if(state != null && lineObj && (lineObj as any).type === 'RECORD'){
//         let newFile = new Vinyl({
//           contents: Buffer.from(JSON.stringify(state) + '\n' + JSON.stringify(lineObj))
//         })

//         return newFile;
//       }else if(lineObj){
//         let newFile = new Vinyl({
//           contents: Buffer.from(JSON.stringify(lineObj))
//         })

//         return newFile;
//       }else{
//         return null;
//       }
//     } catch (err) {
//       throw new PluginError(PLUGIN_NAME, err);
//     }
//   }

//   return handler(configObj, handleLine);
// }


export type TransformCallback = (lineObj: Object) => Object | null

/* This is a model data.tube plugin. It is compliant with best practices for Gulp plugins (see
https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md#what-does-a-good-plugin-look-like ),
but with an additional feature: it accepts a configObj as its first parameter */
export function handler(configObj: any, newHandleLine?: TransformCallback) {
  let state: object | null = null;

  const handleLine = (lineObj: object): object | null => {
    let count: number = 0
    const dt: Date = new Date()
    const dateStamp =
      Number(String(dt.getFullYear()).substr(2, 2))
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
        .padStart(2, '0')

    try {
      if (lineObj && (lineObj as any).type === 'STATE') {
        state = lineObj;
        return null;
      }
      if (state != null && lineObj && (lineObj as any).type === 'RECORD') {
        let newFile = new Vinyl({
          path: 'lines.txt',
          contents: Buffer.from(JSON.stringify(state) + '\n' + JSON.stringify(lineObj))
        })
        newFile.stem = newFile.stem + ' ' + dateStamp + count // add a timestamp and then a digit to end of file name, e.g. foo.txt becomes foo 0j14_e1259_9q1.txt
        return newFile;
      } else if (lineObj) {
        let newFile = new Vinyl({
          path: 'lines.txt',
          contents: Buffer.from(JSON.stringify(lineObj))
        })
        newFile.stem = newFile.stem + ' ' + dateStamp + count // add a timestamp and then a digit to end of file name, e.g. foo.txt becomes foo 0j14_e1259_9q1.txt
        return newFile;
      } else {
        return null;
      }
      
    } catch (err) {
      throw new PluginError(PLUGIN_NAME, err);
    }
  }

  let transformer = through2.obj(); // new transform stream, in object mode
  // since we're in object mode, dataLine comes as a string. Since we're counting on split
  // to have already been called upstream, dataLine will be a single line at a time
  transformer._transform = function (dataLine: string, encoding: string, callback: Function) {
    let returnErr: any = null
    try {
      let dataObj
      if (dataLine.trim() != "") dataObj = JSON.parse(dataLine)
      let handledObj = handleLine(dataObj)
      if (handledObj) {
        let handledLine = JSON.stringify(handledObj)
        //console.log(handledLine)
        //this.push(handledLine + '\n');
        this.push(handledObj);
      }
    } catch (err) {
      returnErr = new PluginError(PLUGIN_NAME, err);
    }

    callback(returnErr)
  }

  // creating a stream through which each file will pass
  // see https://stackoverflow.com/a/52432089/5578474 for a note on the "this" param
  const strm = through2.obj(function (this: any, file: Vinyl, encoding: string, cb: Function) {
    const self = this
    let returnErr: any = null

    if (file.isNull()) {
      // return empty file
      return cb(returnErr, file)
    }
    else if (file.isBuffer()) {
      // strArray will hold file.contents, split into lines
      const strArray = (file.contents as Buffer).toString().split(/\r?\n/)
      let tempLine: any
      let resultArray = [];

      // we'll call handleLine on each line
      for (let dataIdx in strArray) {
        try {
          let lineObj;
          if (strArray[dataIdx].trim() != "") lineObj = JSON.parse(strArray[dataIdx]);
          tempLine = handleLine(lineObj)
          if (tempLine) strArray[dataIdx] = JSON.stringify(tempLine)
          if (tempLine) {
            resultArray.push(JSON.stringify(tempLine))

            self.push(tempLine);
          }
          //else strArray.splice(Number(dataIdx), 1) // remove the array item if handleLine returned null
        } catch (err) {
          returnErr = new PluginError(PLUGIN_NAME, err);
        }
      }
      //let data = strArray.join('\n')
      let data = strArray.join('\n');
      console.log(data)
      //file.contents = new Buffer(data)

      // send the transformed file through to the next gulp plugin, and tell the stream engine that we're done with this file
      //cb(returnErr, file)
      cb(returnErr)
    }
    else if (file.isStream()) {
      file.contents = file.contents
        // split plugin will split the file into lines
        .pipe(split())
        // our transformer stream, created above, will deal with each line using handleLine
        .pipe(transformer)
        .on('data',function(chunk:any){
          console.log("\non data: "+ chunk._contents.toString());
          self.push(chunk);
        })
        .on('finish', function () {
          // using finish event here instead of end since this is a Transform stream   https://nodejs.org/api/stream.html#stream_events_finish_and_end

          console.log('finished')
          // send the transformed file goes through to the next gulp plugin
          //self.push(file)
          // tell the stream engine that we are done with this file
          cb(returnErr);
        })
        .on('error', function (err: any) {
          //console.error(err)
          cb(new PluginError(PLUGIN_NAME, err))
        })
    }

  })

  return strm
}
