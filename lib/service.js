const is = require( '@lvchengbin/is' );
const util = require( './util' );

/**
 * store - storing mock information
 *
 * Map( {
 *     [app] : Map( {
 *         [service] : {
 *             original : [service],
 *             properties : {
 *                 [name] : [value]
 *             }
 *         }
 *     } )
 * } );
 */
const store = new Map();

async function service( app, service, properties = {} ) {
    await app.ready();

    if( !app.services[ service ] ) {
        const msg = `[Ynn Mock Service] does not have a service named ${service}`;
        app.console.error( msg );
        throw new TypeError( msg );
    }

    if( !store.has( app ) ) store.set( app, new Map() )

    if( !store.get( app ).has( service ) ) {
        store.get( app ).set( service, {
            original : app.services[ service ],
            properties : util.assign( {}, properties )
        } );
    } else {
        util.assign( store.get( app ).get( service ).properties, properties );
    }

    if( app.services[ service ][ '[[YNN_MOCK_SERVICE_PROXY]]' ] ) return;

    /**
     * to replace the service in app.services with a Proxy
     */
    app.services[ service ] = class {
        constructor() {
            const Service = store.get( app ).get( service ).original;
            const s = new Service( ...arguments );

            const proxy = new Proxy( s, {
                get( obj, prop ) {
                    const properties = store.get( app ).get( service ).properties;
                    if( prop in properties ) {
                        const v = properties[ prop ];
                        if( !is.function( v ) ) return v;
                        return v.bind( obj );
                    }
                    const v = obj[ prop ];
                    if( !is.function( v ) ) return v;
                    return v.bind( obj );
                }
            } );

            Object.defineProperty( proxy, '[[YNN_MOCK_SERVICE_PROXY]]', {
                value : true,
                writable : false,
                enumerable : false,
                configurable : false
            } );

            return proxy;
        }
    }
}

service.restore = function( app, service, properties ) {
    /**
     * to remove the mocked properties
     */
    if( properties ) {
        if( is.string( properties ) ) properties = [ properties ];
        try {
            const props = store.get( app ).get( service ).properties;
            for( const name of properties ) {
                delete props[ name ];
            }
            return;
        } catch( e ) { return }
    }

    /**
     * to restore a specified service
     */
    if( service ) {
        try {
            app.services[ service ] = store.get( app ).get( service ).original;
            store.get( app ).delete( service );
            return;
        } catch( e ) { return }
    }

    try {
        store.get( app ).forEach( ( v, k ) => {
            app.services[ k ] = v.original;
        } );
        store.delete( app );
    } catch( e ) { return }
}

module.exports = service;
