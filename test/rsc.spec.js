const Ynn = require( 'ynn' );
const rsc = require( '../' ).rsc;

const app = new Ynn( {
    root : __dirname,
    debugging : false,
    logging : false
} );

let original;

describe( 'rsc', () => {
    beforeAll( async () => {
        await app.ready();
        original = app.rsc.call;
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

    it( 'mock all uri', async () => {
        await rsc( app, {
            status : 1
        } );

        await expect ( app.rsc.call( 'x' ) ).resolves.toEqual( {
            status : 1
        } );

        rsc.restore( app );
    } );

    it( 'restore mocked api', async () => {
        
        await rsc( app, {
            status : 1
        } );

        rsc.restore( app );

        expect( app.rsc.call ).toEqual( original );
    } );
} );
