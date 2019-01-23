/**
 * A function just like Object.assign but it also can copy descriptors to the dest object.
 */
const assign = ( dest, ...sources ) => {
    const source = sources[ 0 ];
    for( let name of Object.keys( source ) ) {
        const descriptor = Object.getOwnPropertyDescriptor( source, name );

        if( descriptor ) {
            Object.defineProperty( dest, name, descriptor );
        } else {
            dest[ name ] = source[ name ];
        }
    }

    if( sources.length > 1 ) {
        return assign( dest, ...sources.splice( 1, sources.length - 1 ) );
    }
    return dest;
}

module.exports.assign = assign;
