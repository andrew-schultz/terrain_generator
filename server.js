var express = require( 'express' );
var path = require( 'path' );
var ejs = require( 'ejs' );
var requestPromise = require( 'request-promise' );
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var querystring = require('querystring');

if ( !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ) {
  require( 'dotenv' ).load();
}

var CLIENT_ID = process.env.CLIENT_ID,
    CLIENT_SECRET = process.env.CLIENT_SECRET
    REDIRECT_URI = encodeURI( 'https://bandbrowser.herokuapp.com/tokencallback' );

let token;
let authToken;
let refreshToken;

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

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
    form: payload,
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

var app = express();

// app.use( 'port', ( process.env.PORT || 8000 ) );

app.set( 'views', __dirname );
app.set( 'view engine', 'html' );
app.engine( 'html', require( 'ejs' ).renderFile );

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: true } ) );

app.use( function( request, response, next ) {
  response.set( 'Access-Control-Allow-Origin', '*' );
  response.set( 'Access-Control-Allow-Headers', '*' );

  next();
} );

app.use( express.static( path.join( __dirname + '/app' )  ) );
app.use( express.static( path.join( __dirname + '/bin' ) ) );
app.use( cookieParser() );

// dynamic query
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

// search by artist name request
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

// user authorization token request
app.get( '/authorize', function( request, response ) {
  var authCode;
  var state = generateRandomString( 16 );
  response.cookie( stateKey, state );
  // var scope = "streaming user-read-birthdate user-read-email user-read-private";
  var scope = ["streaming", "user-read-birthdate", "user-read-email", "user-read-private"];

  response.redirect( "https://accounts.spotify.com/authorize?" +
    querystring.stringify( {
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
      state: state
    } )
  );
} );

app.get( '/tokencallback', function( request, response ) {
  var code = request.query.code || null;
  var state = request.query.state || null;
  var storedState = request.cookies ? request.cookies[ stateKey ] : null;

  if ( state == null || state !== storedState ) {
    response.redirect( '/#' +
      querystring.stringify( {
        error: 'state_mismatch'
      } )
    );
  }
  else {
    response.clearCookie( stateKey );
    spotifyTokenRequest(
      'https://accounts.spotify.com/api/token',
      {
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      function( results ) {
        token = results.access_token;
        refreshToken = body.refresh_token;
        response.send( results );
      }
    );
  }
} );

// requesting access token from refresh token
app.get( '/refresh_token', function( request, response ) {
  var refreshToken = request.query.refresh_token;
  spotifyTokenRequest(
    'https://accounts.spotify.com/api/token',
    {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    },
    function( results ) {
      var token = body.access_token;
      response.send( results );
    }
  );
} );

// client token request
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

app.listen( ( process.env.PORT || 8000 ), function () {
  console.log( 'BandBrowser listening on port', ( process.env.PORT || 8000 ) );
} );
