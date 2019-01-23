const Ynn = require( 'ynn' );
const rsc = require( '../' ).rsc;

const app = new Ynn( {
    root : __dirname,
    debugging : false,
    logging : false
} );

let original;
let originCallSpy;

describe( 'rsc', () => {
    beforeAll( async () => {
        await app.ready();
        originCallSpy = jest.spyOn( app.rsc, 'call' );
        original = app.rsc.call;
    } );

    afterAll( () => {
        originCallSpy.mockRestore();
    } );

    it( 'mock specified uri', async () => {
        await rsc( app, 'uri', {
            status : 1
        } );

        await expect ( app.rsc.call( 'uri' ) ).resolves.toEqual( {
            status : 1
        } );

        rsc.restore( app );
    } );

    it( 'mock mutiple URIs', async () => {
        await rsc( app, 'uri', {
            status : 1
        } );

        await rsc( app, 'uri2', {
            status : 1
        } );

        await expect ( app.rsc.call( 'uri' ) ).resolves.toEqual( {
            status : 1
        } );

        await expect( app.rsc.call( 'uri2' ) ).resolves.toEqual( {
            status : 1
        } );

        rsc.restore( app );
        expect( app.rsc.call ).toEqual( original );
    } );

    it( 'mock all uri', async () => {
        await rsc( app, {
            status : 1
        } );

        await expect ( app.rsc.call( 'x' ) ).resolves.toEqual( {
            status : 1
        } );

        rsc.restore( app );
    } );
    
    it( 'mock URI with a function', async () => {
        await rsc( app, 'function', function( uri, params, options ) {
            expect( uri ).toEqual( 'function' );
            expect( params ).toEqual( { x : 1 } );
            expect( options ).toEqual( { x : true } );
            return { status : 1 }
        } );

        await expect ( app.rsc.call( 'function', { x : 1 }, { x : true } ) ).resolves.toEqual( {
            status : 1
        } );

        rsc.restore( app );
    } );

    it( 'should call the origin RSC.call function', async () => {
        await expect ( app.rsc.call( 'calling-a-unmocked-api' ).catch( () => {} ) );
        expect( originCallSpy ).toHaveBeenCalled();
    } );

    it( 'restore mocked api', async () => {
        
        await rsc( app, {
            status : 1
        } );

        rsc.restore( app );

        expect( app.rsc.call ).toEqual( original );
    } );
} );
