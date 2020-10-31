export declare type TransformCallback = (lineObj: Object) => Object | null;
interface ConfigObj {
    /** The maximum number of lines in each new file. Cannot be combined with `groupBy` */
    index?: number;
    /** Value(s) in lines to split lines between files; uses [JSONSelect](https://www.npmjs.com/package/JSONSelect). Cannot be combined with `index` */
    groupBy?: string;
    /** Character(s) to separate sections of file names */
    separator?: string;
    /** Add a shortened string to all filenames based on the current time? use to keep successive runs from overwriting results from those before */
    timeStamp?: boolean;
}
export declare function splitFile(configObj: ConfigObj): any;
export {};
