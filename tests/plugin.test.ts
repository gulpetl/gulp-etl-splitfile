import { splitStream } from '../src/plugin';
const from = require('from2');
const Vinyl = require('vinyl');

describe('plugin tests', () => {
    test('Works with Vinyl file as Buffer', (done) => {
        let fakeFile = new Vinyl({
            contents: Buffer.from('{"type":"STATE"}\n{"type":"RECORD"}\n{"type":"RECORD"}\n{"type":"RECORD"}')
        })

        from.obj([fakeFile]).pipe(splitStream({}))
            .once('data', function (file: any) {
                expect(Vinyl.isVinyl(file)).toBeTruthy()
                expect(file.isBuffer()).toBeTruthy()
                expect(file.contents.toString()).toBe('{"type":"STATE"}\n')
                done();
            })
    });

    test('Works with Vinyl file as Stream', (done) => {
        let fakeFile = new Vinyl({
            contents: from(['{"type":"STATE"}\n{"type":"RECORD"}\n{"type":"RECORD"}\n{"type":"RECORD"}'])
        })

        from.obj([fakeFile]).pipe(splitStream({}))
            .once('data', function (file: any) {
                expect(Vinyl.isVinyl(file)).toBeTruthy()
                expect(file.isStream()).toBeTruthy()
                file.contents.once('data', function (chunk: any) {
                    expect(chunk).toMatch('{"type":"STATE"}\n')
                    done();
                })
            })
    });
});
