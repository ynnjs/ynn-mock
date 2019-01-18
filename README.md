# ynn-mock

Mocking data for Ynn

## Installation

```sh
$ npm i --save-dev ynn-mock
```

## Usage

### RSC

Mocking data for RSC request for test cases.

**mock.rsc( app, uri, response )**

**mock.rsc( app, response )**

**mock.rsc.restore( app )**

```js
const mock = require( 'ynn-mock' );

const app = new Ynn( {
    root : __dirname, 
    debugging : false,
    logging : false
} );

describe( 'Ynn test', () => {

    beforeAll( async () => {
        await app.ready();
        await mock.rsc( app, 'service:the/api', { n : 1 } );

        // To mock response data for all URIs.
        await mock.rsc( app, { n : 2 } );
    } );

    afterAll( () => mock.rsc.restore( app ) );

    it( 'should use mock response for "service:the/api"', async () => {
        const res = app.rsc.call( 'service:the/api' ); 
        expect( res ).toEqual( { n : 1 } ); // pass
    } );

    it( 'should use mock response which does not specify an URI', async () => {
        const res = app.rsc.call( 'api/that/is/not/mock' );
        expect( res ).toEqual( { n : 2 } ); // pass
    } );
} );
```
