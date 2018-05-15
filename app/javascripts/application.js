// ================================
//            variables
// ================================

// var mainInput = document.getElementById( 'search' );

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

var mainContainer = document.getElementById( 'main-container' );
var audioPlayer = document.getElementById( 'audioPlayer' );

var artistListButton = document.getElementById( 'artist-list-button' );
var trackListButton = document.getElementById( 'track-list-button' );

var activeList;

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

// ================================
//            ImgBaseColor
// ================================

// var rgb = getAverageRGB(document.getElementById('i'));
//     document.body.style.backgroundColor = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';

var getAverageRGB = function( imgEl ) {

    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = { r:0, g:0, b:0 }, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = { r:0, g:0, b:0 },
        count = 0;

    if (!context) {
      return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height || 300;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width || 300;

    context.drawImage(imgEl, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch(e) {
        /* security error, img on diff domain */
        // alert('x');
        return defaultRGB;
    }

    length = data.data.length;

    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    return rgb;

// // Found a great workaround for cross-origin restrictions:
// // just add img.crossOrigin = ''; before setting the src attribute.
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

// ##################
// TOP STAT FUNCTIONS
// ##################

var pickImage = function( images ) {
  var image;

  images.forEach(
    function( img ) {
      if ( img.height > 350 && img.height < 450 ) {
        image = img;
      }
    }
  );

  if ( !image ) {
    image = images[ 0 ];
  }

  return image.url;
};

var fadeIn = function(element) {
    var op = 0.1;  // initial opacity
    element.style.display = 'block';
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
    }, 20);
};

var buildArtistStatDiv = function( data, index ) {
  var shell = document.createElement( 'div' );
  shell.classList.add( 'artist-stat-div' );

  var imgDiv = document.createElement( 'div' );
  imgDiv.classList.add( 'artist-stat-img-div' );

  var infoDiv = document.createElement( 'div' );
  if ( data.type == 'track' ) {
    infoDiv.classList.add( 'track-stat-info-div' );
  }
  else if ( data.type == 'artist' ) {
    infoDiv.classList.add( 'artist-stat-info-div' );
  }


  var img = document.createElement( 'img' );
  img.crossOrigin = '';

  if ( data.type == 'track' ) {
    img.classList.add( 'track-stat-img' );
    img.src = pickImage( data.album.images );
  }
  else {
    img.classList.add( 'artist-stat-img' );
    img.src = pickImage( data.images );
  }

  imgDiv.appendChild( img );

  img.addEventListener( 'load', function() {
    var rgb = getAverageRGB( img );
    shell.style.background = 'linear-gradient( -150deg, rgba( ' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.2 ), rgba( ' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8 )';
  } );

  var rankingDivContainer = document.createElement( 'div' );
  rankingDivContainer.classList.add( 'ranking-container' );

  var rankingDiv = document.createElement( 'div' );
  rankingDiv.classList.add( 'ranking-div' );

  var rankingNumber = document.createElement( 'p' );
  rankingNumber.classList.add( 'ranking-text')
  rankingNumber.textContent = index + 1;

  rankingDiv.appendChild( rankingNumber );
  rankingDivContainer.appendChild( rankingDiv );
  infoDiv.appendChild( rankingDivContainer );

  var titleNode = document.createElement( 'h2' );
  titleNode.classList.add( 'artist-stat-title' )
  titleNode.textContent = data.name;
  infoDiv.appendChild( titleNode );

  if ( data.type == 'track' ) {
    var subTitleNode = document.createElement( 'p' );
    subTitleNode.classList.add( 'track-artist-title' );
    subTitleNode.textContent = 'by ' + data.artists[ 0 ].name;
    infoDiv.appendChild( subTitleNode );
  }

  shell.appendChild( imgDiv );
  shell.appendChild( infoDiv );

  mainContainer.appendChild( shell );

  return shell;
};

var toggleListButtons = function( term ) {
  artistListButton.classList.toggle( 'inactive' );
  trackListButton.classList.toggle( 'inactive' );
};

var queryStats = function( term ) {
  if ( activeList !== term ) {
    getTopList( term ).then(
      function( results ) {
        // remove any existing stat containers
        while ( mainContainer.hasChildNodes() ) {
          mainContainer.removeChild( mainContainer.lastChild );
        };

        activeList = term;
        toggleListButtons( term );

        results.items.forEach(
          function( result, index ) {
            var newDiv = buildArtistStatDiv( result, index );
            fadeIn( newDiv );
          }
        );
      }
    );
  }
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

var getTopList = function( type) {
  return new Promise( ( resolve, reject ) => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( 'GET', 'https://api.spotify.com/v1/me/top/' + type, true );
    xmlHttp.setRequestHeader( 'Accept', 'application/json' );
    xmlHttp.setRequestHeader( 'Content-Type', 'application/json' );
    xmlHttp.setRequestHeader( 'Authorization', `Bearer ${authToken}` )
    xmlHttp.onreadystatechange = function() {
      if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
        var results = JSON.parse( xmlHttp.response );
        resolve( results );
      }
      else if ( xmlHttp.readyState == 4 && xmlHttp.status != 200 ) {
        console.log( 'error' );
      }
    };

    xmlHttp.send( );
  } );
};

// ================================
//            listeners
// ================================

// mainInput.addEventListener( 'keyup', function() {
//   var input = mainInput.value;
//   if ( input.length > 2 ) {
//     search( input ).
//     then(
//       function( results ) {
//         displayResults( results, 'artist' );
//       }
//     );
//   }
// } );

// document.addEventListener( 'click', function( e ) {
//   // if ( e.target && e.target.classList.length > 0 ) {
//     if ( e.target && e.target.parentElement.classList.value.includes( 'artist' ) ) {
//       transition( e.target.parentElement, 'artist' );
//     }
//     else if ( e.target && e.target.parentElement.classList.value.includes( 'album' ) ) {
//       transition( e.target.parentElement, 'album' );
//     }
//     else if ( e.target && e.target.parentElement.classList.value.includes( 'track' ) ) {
//       transition( e.target.parentElement, 'track' );
//     }
//   // }
// } );

// window.addEventListener( 'resize', function() {
//   resize();
// } );

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
    document.getElementById( 'login-container' ).style.display = 'none';
    document.getElementById( 'loginButton' ).style.display = 'none';

    queryStats( 'artists' );
  }
}

initialize();
