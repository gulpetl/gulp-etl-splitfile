import PluginError = require('plugin-error');
import Vinyl = require('vinyl')
import { writeFileSync } from 'fs-extra';
import { ThroughStream } from 'through';
// import {handler} from 'gulp-datatube-handlelines';
const through2 = require('through2')
const split = require('split')
// consts
const PLUGIN_NAME = 'gulp-datatube-splitstream';


export type TransformCallback = (lineObj: Object) => Object | null
type EOF = "EOF";
/* This is a model data.tube plugin. It is compliant with best practices for Gulp plugins (see
https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md#what-does-a-good-plugin-look-like ),
but with an additional feature: it accepts a configObj as its first parameter */
export function streamSplitter(configObj: any) {
  let index: number = configObj.index ? configObj.index : 1;
  let includeState: boolean = configObj.includeState ? configObj.includeState : false;
  let state: object | null = null;


  // const handleLine = (lineObj: object | null): object | null => {
  //   const dateStamp = getDateStamp();

  //   try {
  //     if (lineObj && (lineObj as any).type === 'STATE') {
  //       state = lineObj;
  //       return null;
  //     }
  //     if (lineObj && (lineObj as any).type === 'RECORD') {
  //       result += JSON.stringify(lineObj) + '\n';
  //       count++;
  //     } 

  //     if(count >= index || lineObj === null){
  //       let newFile = new Vinyl({
  //         path: 'lines.txt',
  //         contents: Buffer.from(result)
  //       })
  //       newFile.stem = newFile.stem + ' ' + dateStamp+fileCount  // add a timestamp and then a digit to end of file name, e.g. foo.txt becomes foo 0j14_e1259_9q1.txt
  //       count = 0;
  //       result = '';
  //       fileCount++;
  //       return newFile;
  //     }else{
  //       return null;
  //     }

  //   } catch (err) {
  //     throw new PluginError(PLUGIN_NAME, err);
  //   }
  // }

  let transformer = through2.obj(); // new transform stream, in object mode
  // since we're in object mode, dataLine comes as a string. Since we're counting on split
  // to have already been called upstream, dataLine will be a single line at a time
  // transformer._transform = function (dataLine: string, encoding: string, callback: Function) {
  //   let returnErr: any = null
  //   try {
  //     let dataObj
  //     if (dataLine.trim() != "") dataObj = JSON.parse(dataLine)
  //     let handledObj = handleLine(dataObj)
  //     if (handledObj) {
  //       let handledLine = JSON.stringify(handledObj)
  //       //console.log(handledLine)
  //       //this.push(handledLine + '\n');
  //       this.push(handledObj);
  //     }
  //   } catch (err) {
  //     returnErr = new PluginError(PLUGIN_NAME, err);
  //   }

  //   callback(returnErr)
  // }





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
      let filecount: number = 0;
      let currentfile: Vinyl;
      currentfile = new Vinyl({
        path: 'lines' + '-' + getDateStamp() + '-' + filecount + '.txt',
        contents: Buffer.from('')
      })
      // strArray will hold file.contents, split into lines
      const strArray = (file.contents as Buffer).toString().split(/\r?\n/)

      // we'll call handleLine on each line
      for (let dataIdx in strArray) {
        try {
          if (Number(dataIdx) > 0 && ((Number(dataIdx)) % index == 0 || Number(dataIdx) === strArray.length - 1)) {
            self.push(currentfile);
            if (Number(dataIdx) !== strArray.length - 1) {
              currentfile = new Vinyl({
                path: 'lines' + '-' + getDateStamp() + '-' + (++filecount) + '.txt',
                contents: Buffer.from('')
              })
            }
          }
          if (strArray[dataIdx].trim() != "") {
            currentfile.contents = Buffer.concat([(currentfile.contents as Buffer), Buffer.from(strArray[dataIdx] + '\n')])
          }

        } catch (err) {
          returnErr = new PluginError(PLUGIN_NAME, err);
        }
      }

      cb(returnErr)
    }
    else if (file.isStream()) {
      let count: number = 0;
      let filecount: number = 0;
      let currentfile: Vinyl;

      file.contents
        // split plugin will split the file into lines
        .pipe(split())
        .on('data', function (chunk: any) {
          // console.log("\non data: " + (chunk));
          if (count == 0) {
            currentfile = new Vinyl({
              path: 'lines' + '-' + getDateStamp() + '-' + filecount + '.txt',
              contents: through2.obj()
            });
            (currentfile.contents as ThroughStream).on('drain',function(){
              console.log('drain');
            });
            (currentfile.contents as ThroughStream).on('error',function(error){
              returnErr = new PluginError(PLUGIN_NAME,error);
            });
          }
    
          if (chunk.trim() != "") { //if chunk is not an empty line, push chunk to currentfile
            //console.log("push: " + (currentfile.contents as ThroughStream).push(chunk + '\n'));
            (currentfile.contents as ThroughStream).push(chunk + '\n')
            count++;
          }

          //if the number of lines in the current file is equal to the target index param, push file through
          if (count == index) {
            //https://nodejs.org/api/stream.html#stream_writable_end_chunk_encoding_callback
            //need to end writable streams, 'end' signals no more data will be written to the stream
            (currentfile.contents as ThroughStream).end()
            self.push(currentfile)
            count = 0;
            filecount++;
          }

        })
        .on('finish', function () {
          // using finish event here instead of end since this is a Transform stream   https://nodejs.org/api/stream.html#stream_events_finish_and_end
          console.log('finished')
          cb(returnErr);
        })
        .on('end', function () {

          if (count > 0) {
            //if end of input stream but still have a file to be pushed
            (currentfile.contents as unknown as ThroughStream).end()
            self.push(currentfile);
          }
          console.log('end');
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

function getDateStamp() {
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
  return dateStamp;
}