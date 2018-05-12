// ================================
//            variables
// ================================

var mainInput = document.getElementById( 'search' );

var inHeight = window.innerHeight;

var token;
var authToken;
var localPlayerInstance;

var deviceId;

var trackData = {};
var searchData = {};

var selectedSong = {
  selected: false
};

var audioPlayer = document.getElementById( 'audioPlayer' );

// ================================
//            functions
// ================================

var resize = function() {
  if ( window.innerWidth < 719 ) {
    var imgHeight = document.getElementById( 'pic' ).style.height;
    var lHeight = document.getElementById( 'left' ).style.height;
    var rHeight = document.getElementById( 'right' ).style.height;
    var nHeight = document.getElementById( 'name' ).style.height;

    document.getElementById( 'left' ).style.marginTop = imgHeight + nHeight+ "px";
    document.getElementById( 'name' ).style.top = imgHeight + 98 + "px";
    document.getElementById( 'right' ).style.height =  "100%";
  }

  if ( window.innerWidth > 719 ) {
    document.getElementById( 'right' ).style.height = window.innerHeight + "px";
  }
};

// ================
// Generation
// ================

var displayResults = function( results, type ) {
  var resultContainer = document.getElementById( `${type}-container` );

  if ( type == 'artist' ) {
    while ( resultContainer.firstChild ) {
      resultContainer.removeChild( resultContainer.firstChild );
    }
  }

  results.items.forEach(
    function( result ) {
      buildDiv( result, type );
    }
  );
};

var transition = function( div, type ) {
  var container = document.getElementById( `${type}-container` );
  var childrenArray = Array.from( container.children );

  childrenArray.forEach(
    function( child ) {
      if ( child.dataset.id !== div.dataset.id ) {
        removeDiv( child );
      }
    }
  );

  if ( type == 'artist' ) {
    getAlbums( div.dataset.id ).
    then(
      function( results ) {
        trackData.artist = filterData( div.dataset.id, 'artist' );
        displayResults( results, 'album' );
      }
    )
  }
  else if ( type == 'album' ) {
    getTracks( div.dataset.id ).
    then(
      function( results ) {
        trackData.album = filterData( div.dataset.id, 'album' );
        displayResults( results, 'track' );
      }
    );
  }
  else if ( type == 'track' ) {
    Promise.all( [ getTrackFeatures( div.dataset.id ), getTrackAnalysis( div.dataset.id ) ] ).
    then(
      function( results ) {
        trackData.features = results[ 0 ];
        trackData.analysis = results[ 1 ];
        trackData.track = filterData( div.dataset.id, 'track' );

        play( {
          playerInstance: localPlayerInstance,
          spotify_uri: trackData.track.uri,
        } );
      }
    )
  }
};

var removeDiv = function( div ) {
  var node = document.getElementById( div.id );
  node.outerHTML = "";
  delete node;
};

var buildDiv = function( data, type ) {
  var node = document.createElement( 'div' );
  node.dataset.id = data.id;
  node.classList.add( type, 'entry' );
  node.id = data.id;

  var titleNode = document.createElement( 'h2' );
  titleNode.textContent = data.name;

  node.appendChild( titleNode );

  document.getElementById( `${type}-container` ).appendChild( node );
};

// ===========
// filter data
// ===========

var filterData = function( id, type ) {
  var result;

  searchData[ type ].forEach(
    function( item ) {
      if ( item.id == id ) {
        result = item;
      }
    }
  );

  return result;
};

// ================================
//             queries
// ================================

var getAlbums = function( id ) {
  return new Promise( ( resolve, reject ) => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( 'POST', '/query', true );
    xmlHttp.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
    xmlHttp.onreadystatechange = function() {
      if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
        var results = JSON.parse( xmlHttp.response );
        searchData.album = results.items;
        resolve( results );
      }
    };

    var data = {
      id: id,
      path: 'artists',
      append: 'albums',
      qs: {
        album_type: 'album,single',
        market: 'US'
      }
    };

    xmlHttp.send( JSON.stringify( data ) );
  } );
};

var getTracks = function( id ) {
  return new Promise( ( resolve, reject ) => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( 'POST', '/query', true );
    xmlHttp.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
    xmlHttp.onreadystatechange = function() {
      if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
        var results = JSON.parse( xmlHttp.response );
        searchData.track = results.items;
        resolve( results );
      }
    };

    var data = {
      id: id,
      path: 'albums',
      append: 'tracks',
      qs: { country: 'US' }
    };

    xmlHttp.send( JSON.stringify( data ) );
  } );
};

var getTrackFeatures = function( id ) {
  return new Promise( ( resolve, reject ) => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( 'POST', '/query', true );
    xmlHttp.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
    xmlHttp.onreadystatechange = function() {
      if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
        var results = JSON.parse( xmlHttp.response );
        resolve( results );
      }
    };

    var data = {
      id: id,
      path: 'audio-features',
    };

    xmlHttp.send( JSON.stringify( data ) );
  } );
}

var getTrackAnalysis = function( id ) {
  return new Promise( ( resolve, reject ) => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( 'POST', '/query', true );
    xmlHttp.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
    xmlHttp.onreadystatechange = function() {
      if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
        var results = JSON.parse( xmlHttp.response );
        resolve( results );
      }
    };

    var data = {
      id: id,
      path: 'audio-analysis',
    };

    xmlHttp.send( JSON.stringify( data ) );
  } );
}

var search = function( term ) {
  if ( token && token.length > 0 ) {
    return new Promise( ( resolve, reject ) => {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open( 'POST', '/search', true );
      xmlHttp.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
      xmlHttp.onreadystatechange = function() {
        if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
          var results = JSON.parse( xmlHttp.response );

          if ( results.artists.items[ 0 ] ) {
            searchData.artist = results.artists.items;
            resolve( results.artists );
          }
        }
      };

      var data = { name: term };

      xmlHttp.send( JSON.stringify( data ) );
    } );
  }
  else {
    initialize( term );
  }
};

var getCurrentState = function() {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( 'POST', '/connect', true );
  xmlHttp.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
  xmlHttp.onreadystatechange = function() {
    if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
      // var results = JSON.parse( xmlHttp.response );
      generateNowPlayingStats( results );
    }
  };

  var data = {
    path: 'currently-playing',
    method: 'GET',
    token: authToken
  };

  xmlHttp.send( JSON.stringify( data ) );
};

var getTopList = function() {

  return new Promise( ( resolve, reject ) => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( 'GET', 'https://api.spotify.com/v1/me/top/artists', true );
    xmlHttp.setRequestHeader( 'Accept', 'application/json' );
    xmlHttp.setRequestHeader( 'Content-Type', 'application/json' );
    xmlHttp.setRequestHeader( 'Authorization', "Bearer " + token )
    xmlHttp.onreadystatechange = function() {
      if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
        var results = JSON.parse( xmlHttp.response );
        // debugger
        resolve( results );
      }
      else if ( xmlHttp.readyState == 4 && xmlHttp.status != 200 ) {
        // debugger
      }
    };

    // var data = {
    //   path: 'me/top/artists',
    // };

    xmlHttp.send( );
  } );
};

// ================================
//            listeners
// ================================

mainInput.addEventListener( 'keyup', function() {
  var input = mainInput.value;
  if ( input.length > 2 ) {
    search( input ).
    then(
      function( results ) {
        displayResults( results, 'artist' );
      }
    );
  }
} );

document.addEventListener( 'click', function( e ) {
  // if ( e.target && e.target.classList.length > 0 ) {
    if ( e.target && e.target.parentElement.classList.value.includes( 'artist' ) ) {
      transition( e.target.parentElement, 'artist' );
    }
    else if ( e.target && e.target.parentElement.classList.value.includes( 'album' ) ) {
      transition( e.target.parentElement, 'album' );
    }
    else if ( e.target && e.target.parentElement.classList.value.includes( 'track' ) ) {
      transition( e.target.parentElement, 'track' );
    }
  // }
} );

window.addEventListener( 'resize', function() {
  resize();
} );

// ================================
//         player controls
// ================================

var togglePlay = function() {
  localPlayerInstance.togglePlay().then(() => {
    console.log('Toggled playback!');
  });
};

const play = (
  {
    spotify_uri,
    playerInstance: {
      _options: {
        getOAuthToken,
        id
      }
    }
  }
) => {
  getOAuthToken( access_token => {
    fetch( `https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
      method: 'PUT',
      body: JSON.stringify( { uris: [ spotify_uri ] } ),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
    } );
  } );

  // var xmlHttp = new XMLHttpRequest();
  // xmlHttp.open( 'POST', '/connect', true );
  // xmlHttp.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
  // xmlHttp.onreadystatechange = function() {
  //   if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
  //     var results = JSON.parse( xmlHttp.response );
  //     console.log( results );
  //     // debugger
  //     // generateNowPlayingStats( results );
  //   }
  // };

  // var data = {
  //   path: 'play',
  //   method: 'PUT',
  //   token: authToken,
  //   qs: { device_id: id },
  //   body: { uris: [ spotify_uri ] }
  // };

  // xmlHttp.send( JSON.stringify( data ) );
};

// ================================
//            initialize
// ================================

window.onSpotifyWebPlaybackSDKReady = () => {
  const token = authToken;
  const player = new Spotify.Player( {
    name: 'Band Browser Player',
    getOAuthToken: cb => {
     cb( token );
    }
  });

  localPlayerInstance = player;
  // Error handling
  player.addListener( 'initialization_error', ( { message } ) => { console.error( message); } );
  player.addListener( 'authentication_error', ( { message } ) => { console.error( message); } );
  player.addListener( 'account_error', ( { message } ) => { console.error( message); } );
  player.addListener( 'playback_error', ( { message } ) => { console.error( message); } );

  // Playback status updates
  player.addListener( 'player_state_changed', state => { console.log( state ); } );

  // Ready
  player.addListener( 'ready', ( { device_id } ) => {
    deviceId = device_id;
    console.log( 'Ready with Device ID', device_id );
  } );

  // Connect to the player!
  player.connect().then(
    function( success ) {
      if ( success ){
        console.log( 'The Web Playback SDK successfully connected to Spotify!' );
      }
    }
  );
};

var initialize = function( query ) {
  var preTerm;

  if ( query && query.length > 0 ) {
    preTerm = query;
  }

  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( 'POST', '/token', true ); // true for asynchronous
  xmlHttp.onreadystatechange = function() {
    if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
      var results = JSON.parse( xmlHttp.response );
      token = results.access_token;

      if ( preTerm && preTerm.length > 0 ) {
        search( preTerm );
      }
    }
  };

  xmlHttp.send();
};

if ( window.location.hash ) {
  var queryParams = window.location.hash.slice( 2 ).split( '&' );
  var result = {};
  queryParams.forEach( function( param ) {
      param = param.split( '=' );
      result[ param[ 0 ] ] = decodeURIComponent( param[ 1 ] || '' );
  } );

  var params = JSON.parse( JSON.stringify( result ) );

  if ( params.access_token ) {
    authToken = params.access_token;
    document.getElementById( 'loginButton' ).style.display = 'none';
  }
}

initialize();
