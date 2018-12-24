const through2 = require('through2');
import Vinyl from 'vinyl';
import { Stream } from 'stream';
const split = require('split')

  /* This is a prototype for a data.tube plugin. It will be compliant with best practices (see
  https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md#what-does-a-good-plugin-look-like ),
  but with an additional feature: it accepts a configObj as its only parameter */
  export function addProperties(configObj: any) {
    let propsToAdd = configObj.propsToAdd

    // handleLine could be the only needed piece to be replaced for most dataTube plugins
    const handleLine = (line : string): string => {
      let dataObj
      dataObj = JSON.parse(line)
      for (let propName in propsToAdd) {
        dataObj[propName] = propsToAdd[propName]
      }
      return JSON.stringify(dataObj)
    }

    let transformer = through2.obj(); // new transform stream, in object mode
    // since we're in object mode, dataLine comes as a string. Since we're counting on split
    // to have already been called upstream, dataLine will be a single line at a time
    transformer._transform = function(dataLine:string, encoding: string, callback: Function) {
      try {
        let handledLine = handleLine(dataLine)
        console.log(handledLine);
        this.push(handledLine + '\n');
      } catch {
        // TODO: deal with errors
      }
      
      callback()
    }

    // see https://stackoverflow.com/a/52432089/5578474 for a note on the "this" param
    const strm = through2.obj(function(this:any, file: Vinyl, encoding: string, cb: Function) {
      const self = this;
      if (file.isNull()) {
        // return empty file
        return cb(null, file)
      } else if (file.isBuffer()) {
        const strArray = (file.contents as Buffer).toString().split(/\r?\n/)
        for (let dataIdx in strArray) {
          try {
            strArray[dataIdx] = handleLine((strArray[dataIdx].toString()))
          } catch {
            // TODO: deal with errors
          }
        }
        let data = strArray.join('\n')
        console.log(data)
        file.contents = new Buffer(data)
        cb(null, file)
        //return
        } else if (file.isStream()) {

          file.contents = file.contents.pipe(split()).pipe(transformer)
          .on('finish', function() {
            // use finish event instead of end since this is a Transform stream   https://nodejs.org/api/stream.html#stream_events_finish_and_end

            console.log('finished')
            
            // make sure the file goes through the next gulp plugin
            self.push(file)
            // tell the stream engine that we are done with this file
            cb();
          })  
      }

    })

    return strm
  }

// 
// TODO: handle errors, as indicated below
// 
  
var PluginError = require('plugin-error');
// consts
const PLUGIN_NAME = 'gulp-prefixer';

function prefixStream(prefixText:Buffer) {
  var stream = through2();
  stream.write(prefixText);
  return stream;
}

  // plugin level function (dealing with files)
export function gulpPrefixer(prefixText:string) {
  if (!prefixText) {
    throw new PluginError(PLUGIN_NAME, 'Missing prefix text!');
  }

  let prefixBuff = new Buffer(prefixText); // allocate ahead of time

  // creating a stream through which each file will pass
  var stream = through2.obj(function(this:any, file:any, enc:any, cb:any) {
    if (file.isBuffer()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Buffers not supported!'));
      return cb();
    }

    if (file.isStream()) {
      // define the streamer that will transform the content
      var streamer = prefixStream(prefixBuff);
      // catch errors from the streamer and emit a gulp plugin error
      streamer.on('error', this.emit.bind(this, 'error'));
      // start the transformation
      file.contents = file.contents.pipe(streamer);
    }

    // make sure the file goes through the next gulp plugin
    this.push(file);
    // tell the stream engine that we are done with this file
    cb();
  });

  // returning the file stream
  return stream;
}