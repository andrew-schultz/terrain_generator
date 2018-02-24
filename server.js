var express = require( 'express' );
var app = express();
var path = require( 'path' );
var ejs = require( 'ejs' );
var requestPromise = require( 'request-promise' );
var bodyParser = require('body-parser');
require('dotenv').load();

var CLIENT_ID = process.env.CLIENT_ID,
    CLIENT_SECRET = process.env.CLIENT_SECRET

let token;

var buildPath = function( endpoint, payload ) {
  var path = "https://api.spotify.com/v1/" + endpoint;

  if ( payload.id ) {
    path = path + "/" + payload.id;
  }

  if ( payload.append ) {
    path = path + "/" + payload.append
  }

  return path
};

var buildPayload = function( request ) {
  var payload = {}

  if ( request.id ) {
    payload.id = request.id;
  }

  if ( request.append ) {
    payload.append = request.append;
  }

  if ( request.qs ) {
    payload.qs = request.qs;
  }

  return payload
};

var spotifyTokenRequest = function( path, payload, callback ) {
  var options = {
    method: "POST",
    uri: 'https://accounts.spotify.com/api/token',
    headers: {
      "Authorization": "Basic " + ( new Buffer( CLIENT_ID  + ":" + CLIENT_SECRET ).toString( 'base64' ) )
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
  };

  requestPromise( options).
  then( callback ).
  catch(
    function( error ) {
      console.log( 'its a token error' );
      console.log( error );
    }
  );
};

var spotifyRequest = function( path, payload, callback ) {
  var options = {
    method: 'GET',
    uri: buildPath( path, payload),
    headers: {
      'Authorization': "Bearer " + token
    },
    json: true
  };

  if ( payload.qs ) {
    options.qs = payload.qs;
  }

  requestPromise( options ).
  then( callback ).
  catch(
    function( error ) {
      console.log( 'its a query error' );
      // console.log( error );
    }
  );
};

var spotifySearchRequest = function( path, payload, callback ) {
  var options = {
    method: 'GET',
    uri: "https://api.spotify.com/v1/" + path,
    qs: payload,
    headers: {
      'Authorization': "Bearer " + token
    },
    json: true
  };

  requestPromise( options ).
  then( callback ).
  catch(
    function( error ) {
      console.log( 'its a search error' );
      console.log( error.message );
    }
  );
};

app.set( 'views', __dirname );
app.engine( 'html', require( 'ejs' ).renderFile );
app.set( 'view engine', 'html' );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use( function( request, response, next ) {
  response.set( 'Access-Control-Allow-Origin', '*' );
  response.set( 'Access-Control-Allow-Headers', '*' );

  next();
} );

app.use( express.static( path.join( __dirname + '/app' )  ) );
app.use( express.static( path.join( __dirname + '/bin' ) ) );

app.post( '/query', function( request, response ) {
  response.set( 'Cache-Control', 'no-cache' );
  spotifyRequest(
    request.body.path,
    buildPayload( request.body ),
    function( results ) {
      response.send( results );
    }
  )
} );

app.post( '/search', function( request, response ) {
  response.set( 'Cache-Control', 'no-cache' );
  spotifySearchRequest(
    'search',
    {
      q: request.body.name,
      type: 'artist'
    },
    function( results ) {
      response.send( results );
    }
  )
} );

app.post( '/token', function( request, response ) {
  response.set( 'Cache-Control', 'no-cache' );
  spotifyTokenRequest(
    'https://accounts.spotify.com/api/token',
    { 'grant_type': 'client_credentials' },
    function( results ) {
      token = results.access_token;
      response.send( results );
    }
  );
} );

app.get( '/', function ( req, res ) {
  res.sendFile( path.join( __dirname + '/index.html' ) );
} );

app.get( '*', function( request, response ) {
  response.set( 'Cache-Control', 'no-cache' );
  response.render( 'index.html', function( res, req ) {

  } );
} );

app.listen( 8000, function () {
  console.log( 'Example app listening on port 8000!' );
} );
