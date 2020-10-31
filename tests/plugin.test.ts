import { splitFile } from '../src/plugin';
const from = require('from2');
const Vinyl = require('vinyl');

describe('plugin tests', () => {
    test('Works with Vinyl file as Buffer - no index', (done) => {
        let fakeFile = new Vinyl({
            contents: Buffer.from('{"type":"STATE"}\n{"type":"RECORD"}\n{"type":"RECORD"}\n{"type":"RECORD"}')
        })

        from.obj([fakeFile]).pipe(splitFile({}))
            .once('data', function (file: any) {
                expect(file == null).toBeTruthy()
                // expect(Vinyl.isVinyl(file)).toBeFalsy()
                // expect(file.isBuffer()).toBeTruthy()
                // expect(file.contents.toString()).toBe('{"type":"STATE"}\n')
                done();
            })
    });
/*
    test('Works with Vinyl file as Buffer - index of 2', (done) => {
        let fakeFile = new Vinyl({
            contents: Buffer.from('{"type":"STATE"}\n{"type":"RECORD"}\n{"type":"RECORD"}\n{"type":"RECORD"}')
        })

        from.obj([fakeFile]).pipe(splitFile({index:2}))
            .once('data', function (file: any) {
                expect(Vinyl.isVinyl(file)).toBeTruthy()
                expect(file.isBuffer()).toBeTruthy()
                expect(file.contents.toString()).toBe('{"type":"STATE"}\n{"type":"RECORD"}\n')
                done();
            })
    });

    test('Works with Vinyl file as Buffer - empty file', (done) => {
        let fakeFile = new Vinyl({
            contents: Buffer.from('')
        })
        from.obj([fakeFile]).pipe(splitFile({}))
            .once('data', function (file: any) {
                expect(Vinyl.isVinyl(file)).toBeTruthy()
                expect(file.isBuffer()).toBeTruthy()
                expect(file.contents.toString()).toBe('')
                done();
            })
    });

    test('Works with Vinyl file as Stream', (done) => {
        let fakeFile = new Vinyl({
            contents: from(['{"type":"STATE"}\n{"type":"RECORD"}\n{"type":"RECORD"}\n{"type":"RECORD"}'])
        })
        let result: string = '';
        from.obj([fakeFile]).pipe(splitFile({}))
            .once('data', function (file: any) {
                expect(Vinyl.isVinyl(file)).toBeTruthy()
                expect(file.isStream()).toBeTruthy()
                file.contents.on('data', function (chunk: any) {
                    result += chunk;
                })
                file.contents.on('end', function(){
                    expect(result).toBe('{"type":"STATE"}\n')
                    done();
                })
            })
    });
    
    test('Works with Vinyl file as Stream - index of 2', (done) => {
        let fakeFile = new Vinyl({
            contents: from(['{"type":"STATE"}\n{"type":"RECORD"}\n{"type":"RECORD"}\n{"type":"RECORD"}'])
        })
        let result: string = '';
        from.obj([fakeFile]).pipe(splitFile({index:2}))
            .once('data', function (file: any) {
                expect(Vinyl.isVinyl(file)).toBeTruthy()
                expect(file.isStream()).toBeTruthy()
                file.contents.on('data', function (chunk: any) {
                    result += chunk;
                })
                file.contents.on('end', function(){
                    expect(result).toBe('{"type":"STATE"}\n{"type":"RECORD"}\n')
                    done();
                })
            })
    });

    test('Works with Vinyl file as Stream - empty file --  FAILS!!', (done) => {
        let fakeFile = new Vinyl({
            path:'empty.txt'
        })
        let result: string = '';
        from.obj([fakeFile]).pipe(splitFile({index:2}))
            .once('data', function (file: any) {
                expect(Vinyl.isVinyl(file)).toBeTruthy()
                expect(file.isStream()).toBeTruthy()
                file.contents.on('data', function (chunk: any) {
                    result += chunk;
                })
                file.contents.on('end', function(){
                    expect(result).toBe('')
                    done();
                })
            })
    });
*/
    // test('Works with Vinyl file as Buffer - groupBy', (done) => {
    //     let fakeFile = new Vinyl({
    //         contents: Buffer.from('{"type":"STATE"}\n{"type":"RECORD"}\n{"type":"RECORD"}\n{"type":"RECORD"}')
    //     })

    //     from.obj([fakeFile]).pipe(splitFile({groupBy:".type"}))
    //         .once('data', function (file: any) {
    //             expect(Vinyl.isVinyl(file)).toBeTruthy()
    //             expect(file.isBuffer()).toBeTruthy()
    //             expect(file.contents.toString()).toBe('{"type":"STATE"}\n{"type":"RECORD"}\n')
    //             done();
    //         })
    // });

    // test('Works with Vinyl file as Stream - buffer', (done) => {
    //     let fakeFile = new Vinyl({
    //         contents: from(['{"type":"STATE"}\n{"type":"RECORD"}\n{"type":"RECORD"}\n{"type":"RECORD"}'])
    //     })
    //     let result: string = '';
    //     from.obj([fakeFile]).pipe(splitFile({groupBy:".type"}))
    //         .once('data', function (file: any) {
    //             expect(Vinyl.isVinyl(file)).toBeTruthy()
    //             expect(file.isStream()).toBeTruthy()
    //             file.contents.on('data', function (chunk: any) {
    //                 result += chunk;
    //             })
    //             file.contents.on('end', function(){
    //                 expect(result).toBe('{"type":"STATE"}\n{"type":"RECORD"}\n')
    //                 done();
    //             })
    //         })
    // });    
});
