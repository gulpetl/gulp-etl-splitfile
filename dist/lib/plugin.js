"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PluginError = require("plugin-error");
const fs_extra_1 = require("fs-extra");
const gulp_datatube_handlelines_1 = require("gulp-datatube-handlelines");
// consts
const PLUGIN_NAME = 'gulp-datatube-saveState';
function saveState(configObj) {
    let fileName = configObj.fileName ? configObj.fileName : 'state.json';
    let removeState = configObj.removeState ? configObj.removeState : false;
    const handleLine = (lineObj) => {
        try {
            if (lineObj && lineObj.type === 'STATE') {
                fs_extra_1.writeFileSync(fileName, JSON.stringify(lineObj.value));
                if (removeState) {
                    return null;
                }
            }
        }
        catch (err) {
            throw new PluginError(PLUGIN_NAME, err);
        }
        return lineObj;
    };
    return gulp_datatube_handlelines_1.handler(configObj, handleLine);
}
exports.saveState = saveState;
//# sourceMappingURL=plugin.js.map