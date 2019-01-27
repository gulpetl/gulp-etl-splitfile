import {splitStream} from '../src/plugin';
const from = require('from2');
const Vinyl = require('vinyl');

describe('plugin tests', () => {
    test('Works with Vinyl file as Buffer', () => {
        let fakeFile = new Vinyl({
            contents: Buffer.from('{"type":"STATE"}\n{"type":"RECORD"}\n{"type":"RECORD"}\n{"type":"RECORD"}')
        })
    
        expect.assertions(3);

        from.obj([fakeFile]).pipe(splitStream({}))
        .once('data', function(file:any){
            expect(Vinyl.isVinyl(file)).toBeTruthy()
            expect(file.isBuffer()).toBeTruthy()
            expect(file.contents.toString()).toMatch('{"type":"STATE"}\n')
        })
    });
    
    test('Works with Vinyl file as Stream', () => {
        let fakeFile = new Vinyl({
            contents: from(['{"type":"STATE"}\n{"type":"RECORD"}\n{"type":"RECORD"}\n{"type":"RECORD"}'])
        })
    
        expect.assertions(3);
        
        from.obj([fakeFile]).pipe(splitStream({}))
        .once('data', function(file:any){
            expect(Vinyl.isVinyl(file)).toBeTruthy()
            expect(file.isStream()).toBeTruthy()
            expect(file.contents.toString()).toMatch('{"type":"STATE"}\n')
        })
    });
});
