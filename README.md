# gulp-etl-splitfile #

Split a single Message Stream file into multiple files. Ideal for chunking a stream into smaller pieces for manageability of file sizes or upload runs to database,
or for "grouping" lines into files based on properties or values

This is a **gulp-etl** plugin, and as such it is a [gulp](https://gulpjs.com/) plugin. **gulp-etl** plugins processes [ndjson](http://ndjson.org/) data streams/files which we call **Message Streams** and which are compliant with the [Singer specification](https://github.com/singer-io/getting-started/blob/master/docs/SPEC.md#output). Message Streams look like this:

``` ndjson
{"type": "SCHEMA", "stream": "users", "key_properties": ["id"], "schema": {"required": ["id"], "type": "object", "properties": {"id": {"type": "integer"}}}}
{"type": "RECORD", "stream": "users", "record": {"id": 1, "name": "Chris"}}
{"type": "RECORD", "stream": "users", "record": {"id": 2, "name": "Mike"}}
{"type": "SCHEMA", "stream": "locations", "key_properties": ["id"], "schema": {"required": ["id"], "type": "object", "properties": {"id": {"type": "integer"}}}}
{"type": "RECORD", "stream": "locations", "record": {"id": 1, "name": "Philadelphia"}}
{"type": "STATE", "value": {"users": 2, "locations": 1}}
```

## Usage ##

``` javascript
splitFile = require('gulp-etl-splitfile');
```

**gulp-etl** plugins accept a configObj as its first parameter. The configObj
will contain any info the plugin needs.

Available configObj properties for this plugin:

- `index:number` - the number of lines in each new file. Cannot be combined with `groupBy`.

``` javascript
.pipe(splitFile({index:1000}))                // Split out a new file every 1000 lines
.pipe(splitFile({groupBy:'.type', index:2 })) // cause error by using groupBy and index together
.pipe(splitFile({}))                          // default (no options): split out a new file for every line
```

- `groupBy:string|array` - value(s) in lines to split lines between files; uses [JSONSelect](https://www.npmjs.com/package/JSONSelect). Cannot be combined with `index`.

``` javascript
.pipe(splitFile({groupBy:'.type'}))                                     // group by (split lines to new files based on) the value of the "type" property of each line
.pipe(splitFile({groupBy:9999 }))                                       // cause error with invalid groupBy (not a string. Also, not a reference to a line property...)
.pipe(splitFile({groupBy:['.type', ".stream"]}))                        // group by `type` and then `stream`
.pipe(splitFile({groupBy:'.record .name'}))                             // group by `record.name` property)
.pipe(splitFile({groupBy:'.record ."Last Name", .type:val("STATE")' })) // group by `record.Last Name`, and/or by `type` (if it is equal to "STATE")
```

- `separator:string` - character(s) to separate sections of file names

``` javascript
// splitting `file.ndjson`
.pipe(splitFile({index:1000, separator:'_'}))      // -> `file_0.ndjson`, `file_1.ndjson`... (this is the default)
.pipe(splitFile({index:1000, separator:'-'}))      // -> `file-0.ndjson`, `file-1.ndjson`...
.pipe(splitFile({groupBy:'.type', separator:'-'})) // -> `file-SCHEMA.ndjson`, `file-RECORD.ndjson`...
.pipe(splitFile({groupBy:['.type', ".stream"]}))   // -> `file_SCHEMA_users.ndjson`, `file-RECORD_users.ndjson`...
```

- `timeStamp:boolean` - add a shortened string to all filenames based on the current time; use to keep successive runs from overwriting results from those before

``` javascript
.pipe(splitFile({index:1000, timeStamp:true }))    // -> `file_l4514_fe_0.ndjson`, `file_l4514_fe_1.ndjson`...
```

### Quick Start ###

- Dependencies:
  - [git](https://git-scm.com/downloads)
  - [nodejs](https://nodejs.org/en/download/releases/) - At least v6.3 (6.9 for Windows) required for TypeScript debugging
  - npm (installs with Node)
  - typescript - installed as a development dependency
- Clone this repo and  run `npm install` to install npm packages
- Debug: with [VScode](https://code.visualstudio.com/download) use `Open Folder` to open the project folder, then hit F5 to debug. This runs without compiling to javascript using [ts-node](https://www.npmjs.com/package/ts-node)
- Test: `npm test` or `npm t`
- Compile to javascript: `npm run build`
- Run using included test data (be sure to build first): `gulp --gulpfile debug/gulpfile.ts`

### Testing ###

We are using [Jest](https://facebook.github.io/jest/docs/en/getting-started.html) for our testing.  Each of our tests are in the `test` folder.

- Run `npm test` to run the test suites  **note: tests are currently broken**

### Notes ###

Note: This document is written in [Markdown](https://daringfireball.net/projects/markdown/). We like to use [Typora](https://typora.io/) and [Markdown Preview Plus](https://chrome.google.com/webstore/detail/markdown-preview-plus/febilkbfcbhebfnokafefeacimjdckgl?hl=en-US) for our Markdown work.
