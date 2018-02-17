var express = require( 'express' );
var app = express();
var path = require( 'path' );
var requestPromise = require( 'request-promise' );
var ejs = require( 'ejs' );

var spotifyRequest = function( path, payload, callback ) {
  var options = {
    method: 'POST',
    url: path,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload
  };

  requestPromise( options ).
  then( callback ).
  catch(
    function( error ) {
      console.log( 'we got to an error' );
      console.log( error );
      response.send( error );
    }
  );
};

app.set( 'views', __dirname );
// app.set( 'view engine', ejs( 'html' ) );

app.use( function( request, response, next ) {
  response.set( 'Access-Control-Allow-Origin', '*' );
  response.set( 'Access-Control-Allow-Headers', '*' );

  next();
} );

app.use( express.static( path.join( __dirname + '/app' )  ) );
app.use( express.static( path.join( __dirname + '/bin') ) );

app.post( '/token', function( request, response ) {
  response.set( 'Cache-Control', 'no-cache' );
  console.log( request.headers );
  // spotifyRequest(
  //   'https://accounts.spotify.com/api/',
  //   { grant_type: 'client_credentials' },
  //   function( results ) {
  //     console.log( 'we made it to the results' );
  //     console.log( results );
  //     response.send( results );
  //   }
  // );

} );

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
