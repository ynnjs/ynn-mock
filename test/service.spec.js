const Ynn = require( 'ynn' );
const service = require( '../' ).service;

async function create() {
    const app = new Ynn( {
        root : __dirname,
        debugging : true,
        logging : false
    } );

    await app.ready();
    return app;
}

describe( 'service', () => {
    it( 'to mock a non-existent service', async () => {
        const app = await create();
        app.debugging = false;
        await expect( service( app, 'non-existent-service', {} ) ).rejects.toThrow();
    } );

    it( 'the service should be an instance of Ynn.Service', async () => {
        const app = await create();
        app.services.serv = class extends Ynn.Service {
            constructor() {
                super( ...arguments );
            }

            fn1() {
                return 1;
            }
        }
        service( app, 'serv' );
        expect( app.service( 'serv' ) ).toBeInstanceOf( Ynn.Service );
    } );

    it( 'should be bound with the serivce', async () => {
        const app = await create();
        app.services.serv = class extends Ynn.Service {
            constructor() {
                super( ...arguments );
            }
            fn1() {
                return 1;
            }
            fn2() {
                return 2;
            }
            fn3() {
                return this.fn2();
            }
        }

        await service( app, 'serv', {
            fn1() {
                return this.fn2();
            }
        } );
        expect( app.service( 'serv' ).fn1() ).toEqual( 2 );
        expect( app.service( 'serv' ).fn3() ).toEqual( 2 );
    } );

    it( 'mock simple properties', async () => {
        const app = await create();
        app.services.serv = class extends Ynn.Service {
            constructor() {
                super( ...arguments );
            }
            fn1() {
                return 1;
            }
            fn2() {
                return 2;
            }
            fn3() {
                return this.fn2();
            }
        }

        await service( app, 'serv', { x : 1 } );
        expect( app.service( 'serv' ).x ).toEqual( 1 );
    } );

    it( 'to mock a service', async () => {
        const app = await create();
        app.services.serv = class extends Ynn.Service {
            constructor() {
                super( ...arguments );
            }

            fn1() {
                return 1;
            }

            fn2() {
                return 2;
            }
        }

        await service( app, 'serv', {
            fn2() {
                return 22;
            },
            fn3() {
                return 33;
            }
        } );

        expect( app.service( 'serv' ) ).toHaveProperty( '[[YNN_MOCK_SERVICE_PROXY]]', true );
        expect( app.service( 'serv' ).fn1() ).toEqual( 1 );
        expect( app.service( 'serv' ).fn2() ).toEqual( 22 );
        expect( app.service( 'serv' ).fn3() ).toEqual( 33 );
    } );

} );

describe( 'restore', () => {
    it( 'restore methods', async () => {
        const app = await create();
        app.services.serv = class extends Ynn.Service {
            constructor() {
                super( ...arguments );
            }
            fn1() {
                return 1;
            }
        }

        await service( app, 'serv', {
            fn1() {
                return 11;
            }
        } );

        expect( app.service( 'serv' ).fn1() ).toEqual( 11 );
        service.restore( app, 'serv', 'fn1' );
        expect( app.service( 'serv' ).fn1() ).toEqual( 1 );
    } );
    
    it( 'restore a service', async () => {
        const app = await create();
        app.services.serv = class extends Ynn.Service {
            constructor() {
                super( ...arguments );
            }
            fn1() {
                return 1;
            }
        }

        await service( app, 'serv', {
            fn1() {
                return 11;
            }
        } );

        expect( app.service( 'serv' ).fn1() ).toEqual( 11 );
        service.restore( app, 'serv' );
        expect( app.service( 'serv' ).fn1() ).toEqual( 1 );
        expect( app.service( 'serv' )[ '[[YNN_MOCK_SERVICE_PROXY]]' ] ).toBeUndefined();
    } );

    it( 'restore an app', async () => {
        const app = await create();
        app.services.serv = class extends Ynn.Service {
            constructor() {
                super( ...arguments );
            }
            fn1() {
                return 1;
            }
        }

        await service( app, 'serv', {
            fn1() {
                return 11;
            }
        } );

        expect( app.service( 'serv' ).fn1() ).toEqual( 11 );
        service.restore( app );
        expect( app.service( 'serv' ).fn1() ).toEqual( 1 );
        expect( app.service( 'serv' )[ '[[YNN_MOCK_SERVICE_PROXY]]' ] ).toBeUndefined();
    } );
    
    
} );
