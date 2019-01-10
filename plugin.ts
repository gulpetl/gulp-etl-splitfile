import PluginError = require('plugin-error');
import { writeFileSync } from 'fs-extra';
import {handler} from 'gulp-datatube-handlelines';

// consts
const PLUGIN_NAME = 'gulp-datatube-saveState';

export function saveState(configObj:any){

  let fileName = configObj.fileName ? configObj.fileName : 'state.json';
  let removeState = configObj.removeState ? configObj.removeState : false;

  const handleLine = (lineObj: object): object | null => {
    try {
      if (lineObj && (lineObj as any).type === 'STATE') {
        writeFileSync(fileName, JSON.stringify((lineObj as any).value));
        if (removeState) {
          return null;
        }
      }
    } catch (err) {
      throw new PluginError(PLUGIN_NAME, err);
    }
  
    return lineObj;
  }

  return handler(configObj, handleLine);
}
