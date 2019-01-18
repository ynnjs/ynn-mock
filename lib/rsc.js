const is = require( '@lvchengbin/is' );

const ASTERISK = Symbol( 'asterisk' );
/**
 *  store - storing mock information
 *
 *  Map( {
 *      [app] : {
 *          data : Map( { [uri] : [response] } ),
 *          apis : { [name] : [stored function] }
 *      }
 *  } )
 */
const store = new Map(); 

async function rsc( app, uri, response ){
    await app.ready(); 

    if( arguments.length == 2 ) {
        response = uri;
        uri = ASTERISK;
    }

    if( store.has( app ) ) {
        store.get( app ).data.set( uri, response );
        store.get( app ).apis.call = app.call;
    } else {
        store.set( app, { 
            apis : { call : app.rsc.call },
            data : new Map( [ [ uri, response ] ] )
        } );
    }

    app.rsc.call = async function( uri ) {
        const mock = store.get( app );
        const data = mock.data;
        const call = mock.apis.call;

        const response = findMockData( data, uri );

        /**
         * if cannot find any mocked URI match the specified URI,
         * to use the original api in ynn.
         */
        if( response === false ) {
            return call.call( this, ...arguments );
        }
        if( is.function( response ) ) {
            return response.call( this, ...arguments );
        }
        return response;
    }
}

rsc.restore = function( app ) {
    if( !store.has( app ) ) return;
    const apis = store.get( app ).apis;
    for( const name of Object.keys( apis ) ) {
        app.rsc[ name ] = apis[ name ]; 
    }
    store.delete( app );
}

function findMockData( data, uri ) {
    const keys = data.keys();
    for( const key of keys ) {
        if( uri === key ) return data.get( key );
        // regular expression
        if( is.regexp( key ) && key.test( uri ) ) return data.get( key );
    }
    return data.get( ASTERISK ) || false;
}

module.exports = rsc;
