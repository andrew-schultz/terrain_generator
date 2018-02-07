var express = require( 'express' );
var app = express();
var path = require( 'path' );

app.use( function( request, response, next ) {
  response.set( 'Access-Control-Allow-Origin', '*' );
  response.set( 'Access-Control-Allow-Headers', '*' );

  next();
} );

app.use( express.static( path.join( __dirname + '/app' )  ) );
app.use( express.static( path.join( __dirname + '/bin') ) );

app.get( '/', function ( req, res ) {
  res.sendFile( path.join( __dirname + '/index.html' ) );
} );

app.get( '*', function( request, response ) {
  response.set( 'Cache-Control', 'no-cache' );
  response.render( '/index.html', function( res, req ) {
  	console.log( res );
  	console.log( req );
  } );
} );

app.listen( 8000, function () {
  console.log( 'Example app listening on port 8000!' );
} );