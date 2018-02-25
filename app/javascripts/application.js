// terrain generator

// var headerElement = document.getElementById( 'mainHeader' );
// var newHeaderText = "Terrain Generator";
// headerElement.innerText = newHeaderText;

// var audioPlayer = document.getElementById( 'audioPlayer' );
// var audioCtx = new ( window.AudioContext || window.webkitAudioContext )();
// var analyser = audioCtx.createAnalyser();
// var source = audioCtx.createMediaElementSource( audioPlayer );
// source.connect(analyser);
// source.connect( audioCtx.destination );

// var frequencyData = new Uint8Array( analyser.frequencyBinCount );

// function renderFrame() {
//    requestAnimationFrame( renderFrame );
//    // update data in frequencyData
//    analyser.getByteFrequencyData( frequencyData );
//    // render frame based on values in frequencyData
//    // console.log(frequencyData)

// }

// renderFrame();

// ================================
//            variables
// ================================

var mainInput = document.getElementById( 'search' );
var genresDiv = document.getElementById( 'genres' );
var relatedArtistsDiv = document.getElementById( 'ra' );
var albumsDiv = document.getElementById( 'albums' );
var tracksDiv = document.getElementById( 'tracks' );

var inHeight = window.innerHeight;

var token;
var authToken;

var deviceId;

var displayedArtists = [];

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

var flip = function( target ) {
  debugger
  var parentContainer = target.parentElement;
  var id = parentContainer.dataset.album;
  // showAlbum( id );
  var flipContainer = parentContainer.offsetParent;
  flipContainer.classList.add( 'flip' );
};

// === cleanup ===

var clear = function() {
  // genresDiv.innerHTML = null;
  // relatedArtistsDiv.innerHTML = null;
  // albumsDiv.innerHTML = null;
  tracksDiv.innerHTML = null;
};

var clearRelated = function() {
  relatedArtistsDiv.innerHTML = null;
};

var clearAlbums = function() {
  albumsDiv.innerHTML = null;
};

var clearTracks = function() {
  tracksDiv.innerHTML = null;
};

var clearPlay = function() {
  document.getElementById( 'npTitle' ).innerHTML = null;
  document.getElementById( 'play' ).innerHTML = null;
};

// === generation ===

// var showAlbum = function(x){
//   console.log(x);
// };

var generate = function( x, y ) {
  var inHeight = window.innerHeight;

  if ( x.images[ y ] ) {
    var image = x.images[ y ].url;
    var height = x.images[ y ].height;
    var width = x.images[ y ].width;

    // document.getElementById( 'image' ).innerHTML = "<img id='pic' src='" + image + "'></img>";
  }

  if ( window.innerWidth > 719 ) {
    // document.getElementById( 'right' ).style.height = inHeight + "px";
  };
};

var generateAlbums = function( x ) {
  clearAlbums();
  albumsDiv.innerHTML = "<h1 id='albumT'>Albums</h1>";
  var albums = x.items;
  var inHeight = document.documentElement.clientHeight;

  if ( window.innerWidth > 719 ) {
    albumsDiv.style.marginTop = inHeight + "px";
  }

  for ( var a = 0; a < albums.length; a++ ) {
    if ( ( a == 0 ) || ( albums[ a ].name != albums[ a - 1 ].name ) ) {
      // if ( albums[ a ].available_markets.includes( 'US' ) ) {
        var outerDiv = document.createElement( 'div' );
        outerDiv.classList.add( 'album_container' );

        var innerDiv = document.createElement( 'div' );
        innerDiv.classList.add( 'album_container_inner' );

        var albumDiv = document.createElement( 'div' );
        albumDiv.classList.add( 'album' );
        albumDiv.dataset.album = albums[ a ].id;

        var imgNode = document.createElement( 'img' );
        imgNode.classList.add( 'album_art' );
        imgNode.src = albums[ a ].images[ 1 ].url;
        albumDiv.appendChild( imgNode );

        var pNode = document.createElement( 'p' );
        pNode.classList.add( 'album_title' );
        pNode.textContent = albums[ a ].name;
        albumDiv.appendChild( pNode );

        innerDiv.appendChild( albumDiv );

        var albumIdNode = document.createElement( 'div' );
        albumIdNode.classList.add( 'album_id' );
        albumIdNode.textContent = albums[ a ].id;
        innerDiv.appendChild( albumIdNode );

        var albumBackDiv = document.createElement( 'div' );
        albumBackDiv.classList.add( 'album_back' );
        // albumBackDiv.innerHTML = "<iframe src='https://open.spotify.com/embed/?uri=spotify:album:" + albums[ a ].id + "&theme=white' width='302' height='366' frameborder='0' allowtransparency='true'></iframe>";
        innerDiv.appendChild( albumBackDiv );

        outerDiv.appendChild( innerDiv );

        albumsDiv.appendChild( outerDiv );
      // }
    };
  };

  document.querySelector( '.album_container' ).addEventListener( 'click', function( e ) {

  } );

  document.querySelector( '.album_container' ).addEventListener( 'mouseleave', function( e ) {
    var children = e.target.children;
    children[ 0 ].classList.remove( 'flip' );
  } );
};

var generateTracks = function( x ) {
  var tracks = x.tracks;

  clearTracks();

  document.getElementById( 'tt_title' ).textContent = "Top Tracks";
  document.getElementById( 'tt_subtitle' ).textContent = "select a song to listen";

  for ( var t = 0; t < tracks.length; t++ ) {
    var node = document.createElement( 'li' );
    node.classList.add( 'track_text' );
    node.dataset.track = tracks[ t ].uri;
    node.dataset.id = tracks[ t ].id;

    var textnode = document.createTextNode( tracks[ t ].name );
    node.appendChild( textnode );

    document.getElementById( 'tracks' ).appendChild( node );
  };
};

var generateRelated = function( x ) {
  var related = x.artists;
  clearRelated();

  for ( var g = 0; g < related.length; g++ ) {
    var last = related[ g ].images.length-1;
    var sm_image = related[ g ].images[ last ].url;
    var r_name = related[ g ].name

    var node = document.createElement( 'li' );
    node.classList.add( 'follower_text' );

    var imgNode = document.createElement( 'img' );
    imgNode.classList.add( 'sm_circle' );
    imgNode.src = sm_image;
    node.appendChild( imgNode );

    var spanNode = document.createElement( 'span' );
    spanNode.textContent = r_name;
    node.appendChild( spanNode );

    document.getElementById( 'ra' ).appendChild( node );
  };

  resize();
};

var generateNowPlaying = function( target ) {
  // clearPlay();

  var uri = target.dataset.track;
  var id = target.dataset.id;

  // document.getElementById( 'topPlayerTitle' ).textContent = "Now Playing";

  // play( {
  //   playerInstance: new Spotify.Player( { name: "..." } ),
  //   spotify_uri: target.dataset.track
  // } );
  getTrackFeatures( id );
  getTrackAnalysis( id );
  document.getElementById( 'topPlayer' ).classList.remove( 'hide' );
};

var update = function( x ) {
  clear();
  var i = 0
  var artist = x.artists.items[ 0 ];
  var name = artist.name;

  if ( artist.images[ i ] ) {
    var image = artist.images[ i ].url;
    var width = artist.images[ i ].width;
    var height = artist.images[ i ].height;
    var images = artist.images;
  }

  // genres returns an array of items
  var genres = artist.genres;
  var url = artist.external_urls.spotify;
  var followers = artist.followers.total;
  var popularity = artist.popularity;

  var nameDiv = document.getElementById( 'name' );

  if ( name.length > 0 ) {
    nameDiv.innerHTML = "<a id='nameA' href=" + url + ">" + name + "</a></h1>";
  }

  var nameWidth = document.getElementById( 'nameA' ).offsetWidth;

  nameDiv.style.width = nameWidth + "px";

  // document.getElementById( 'followers' ).text = "Followers: " + followers;
  // document.getElementById( 'popularity' ).text = "Popularity: " + popularity;
  // document.getElementById( 'g_title' ).text = "Genres";
  // document.getElementById( 'ra_title' ).text = "Related Artists";

  // for ( var g = 0; g < genres.length; g++ ) {
  //   var node = document.createElement( 'li' );
  //   var textnode = document.createTextNode( genres[ g ] );
  //   node.appendChild( textnode );
  //   document.getElementById( 'genres' ).appendChild( node );
  // };

  generate( artist, i );
};

var buildArtistDiv = function( artist ) {
  var node = document.createElement( 'div' );
  node.dataset.id = artist.id;
  node.classList.add( 'artist' );
  node.id = artist.id;

  var titleNode = document.createElement( 'h2' );
  titleNode.textContent = artist.name;

  node.appendChild( titleNode );

  node.addEventListener( 'click', getAlbums( artist.id ) )

  document.getElementById( 'main-container' ).appendChild( node );
};

var removeArtistDiv = function( artist ) {
  var node = document.getElementById( artist.id );
  node.outerHTML = "";
  delete node;
};

var displayArtists = function( artists ) {
  artists.items.forEach(
    function( artist ) {
      if ( displayedArtists.indexOf( artist ) < 0 ) {
        buildArtistDiv( artist );
        displayedArtists.push( artist );
      }

      displayedArtists.forEach(
        function( da ) {
          if ( artists.items.indexOf( da ) < 0 ) {
            removeArtistDiv( da );
            displayedArtists.splice( displayedArtists.indexOf( da ), 1 );
          }
        }
      );
    }
  );
};

// ================================
//           transitions
// ================================

var albumTransition = function( artistDiv ) {
  debugger
};

// ================================
//             queries
// ================================

var getRelated = function( id ) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( 'POST', '/query', true );
  xmlHttp.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
  xmlHttp.onreadystatechange = function() {
    if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
      var results = JSON.parse( xmlHttp.response );
      generateRelated( results );
    }
  };

  var data = {
    id: id,
    path: 'artists',
    append: 'related-artists'
  };

  xmlHttp.send( JSON.stringify( data ) );
};

var getAlbums = function( id ) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( 'POST', '/query', true );
  xmlHttp.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
  xmlHttp.onreadystatechange = function() {
    if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
      var results = JSON.parse( xmlHttp.response );
      // generateAlbums( results );
      var filteredResults
      console.log( results );
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
};

var getTracks = function( id ) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( 'POST', '/query', true );
  xmlHttp.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
  xmlHttp.onreadystatechange = function() {
    if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
      var results = JSON.parse( xmlHttp.response );
      generateTracks( results );
    }
  };

  var data = {
    id: id,
    path: 'artists',
    append: 'top-tracks',
    qs: { country: 'US' }
  };

  xmlHttp.send( JSON.stringify( data ) );
};

var getTrackFeatures = function( id ) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( 'POST', '/query', true );
  xmlHttp.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
  xmlHttp.onreadystatechange = function() {
    if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
      var results = JSON.parse( xmlHttp.response );
      console.log( 'features', results );
    }
  };

  var data = {
    id: id,
    path: 'audio-features',
  };

  xmlHttp.send( JSON.stringify( data ) );
}

var getTrackAnalysis = function( id ) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( 'POST', '/query', true );
  xmlHttp.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
  xmlHttp.onreadystatechange = function() {
    if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
      var results = JSON.parse( xmlHttp.response );
      console.log( 'analysis', results );
    }
  };

  var data = {
    id: id,
    path: 'audio-analysis',
  };

  xmlHttp.send( JSON.stringify( data ) );
}

var search = function( term ) {
  if ( token && token.length > 0 ) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( 'POST', '/search', true );
    xmlHttp.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
    xmlHttp.onreadystatechange = function() {
      if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
        var results = JSON.parse( xmlHttp.response );
        // build drop down of possible options, based on results returned?
        // all 20? or top 5? or
        if ( results.artists.items[ 0 ] ) {
          // update( results )
          // var id = results.artists.items[0].id;
          // var name = results.artists.items[0].name;
          // getAlbums( id )
          // getTracks(id)
          // getRelated(id)
          displayArtists( results.artists );
        }
      }
    };

    var data = { name: term };

    xmlHttp.send( JSON.stringify( data ) );
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
      debugger
      // generateNowPlayingStats( results );
    }
  };

  var data = {
    path: 'currently-playing',
    method: 'GET',
    token: authToken
  };

  xmlHttp.send( JSON.stringify( data ) );
};

// ================================
//            listeners
// ================================

mainInput.addEventListener( 'keyup', function() {
  var input = mainInput.value;
  if ( input.length > 2 ) {
    search( input )
  }
} );

document.addEventListener( 'click', function( e ) {
  if ( e.target && e.target.classList.value.includes( 'follower_text' ) ) {
    search( e.target.textContent );
  }
  else if ( e.target && e.target.parentElement.classList.value.includes( 'follower_text' ) ) {
    search( e.target.parentElement.textContent );
  }
  else if ( e.target && e.target.classList.value.includes( 'track_text' ) ) {
    generateNowPlaying( e.target );
  }
  else if ( e.target && e.target.classList.value.includes( 'album_container' ) ) {
    flip( e.target );
  }
  else if ( e.target && e.target.classList.value.includes( 'artist' ) ) {
    albumTransition( e.target );
  }
} );

window.addEventListener( 'resize', function() {
  resize();
} );

// ================================
//         player controls
// ================================

// const play = (
//   {
//     spotify_uri,
//     playerInstance: {
//       _options: {
//         getOAuthToken,
//         id
//       }
//     }
//   }
// ) => {
//   // fetch( `https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
//   //   method: 'PUT',
//   //   body: JSON.stringify( { uris: [ spotify_uri ] } ),
//   //   headers: {
//   //     'Content-Type': 'application/json',
//   //     'Authorization': `Bearer ${authToken}`
//   //   },
//   // } );

//   var xmlHttp = new XMLHttpRequest();
//   xmlHttp.open( 'POST', '/connect', true );
//   xmlHttp.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
//   xmlHttp.onreadystatechange = function() {
//     if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
//       var results = JSON.parse( xmlHttp.response );
//       console.log( results );
//       // debugger
//       // generateNowPlayingStats( results );
//     }
//   };

//   var data = {
//     path: 'play',
//     method: 'PUT',
//     token: authToken,
//     qs: { device_id: id },
//     body: { uris: [ spotify_uri ] }
//   };

//   xmlHttp.send( JSON.stringify( data ) );
// };

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
  player.connect();
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
