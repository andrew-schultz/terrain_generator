// terrain generator

// var headerElement = document.getElementById( 'mainHeader' );
// var newHeaderText = "Terrain Generator";
// headerElement.innerText = newHeaderText;

// var audioPlayer = document.getElementById( 'audioPlayer' );
// var audioCtx = new ( window.AudioContext || window.webkitAudioContext )();
// var analyser = audioCtx.createAnalyser();
// var source = audioCtx.createMediaElementSource( localPlayerInstance );
// source.connect(analyser);
// source.connect( audioCtx.destination );

// var frequencyData = new Uint8Array( analyser.frequencyBinCount );
// console.log( frequencyData );
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
// var audioCtx = new ( window.AudioContext || window.webkitAudioContext )();
// var analyser = audioCtx.createAnalyser();
// var frequencyData = new Uint8Array( analyser.frequencyBinCount );

// setInterval(
//   function(){
//     console.log( frequencyData );
//   },
//   1000
// );

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

        // var myp5 = new p5( createTerrainVisualizer, 'visualizer-container' );
        var myp5 = new p5( createVisualizer, 'visualizer-container' );
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

// ===========
//     p5
// ===========

var createTerrainVisualizer = function( p ) {
  var cols, rows;
  var scl = 40;
  var w = 2000;
  var h = 1400;

  var flying = 0;
  var terrain = [];

  p.setup = function() {
    p.createCanvas( 600, 600, p.WEBGL );
    cols = w / scl;
    rows = h / scl;

    for ( var i = 0; i < cols; i++ ) {
      terrain[i] = [];
      for ( var j = 0; j < rows; j++ ) {
        terrain[i][j] = [];
      }
    }

    p.frameRate( 20 );
  }

  p.draw = function() {
    p.background( 0 );
    p.stroke( 255 );
    p.noFill();

    var rotateXOffset = 2.75;

    p.translate( p.width / 2, p.height / 2 + 100 );
    p.rotateX( p.PI / rotateXOffset );
    flying -= 0.07;
    // flying = 0
    p.translate( -w / 2, -h / 2 );

    var yoff = flying;

    for ( var y = 0; y < rows; y++ ) {
      var xoff = 0;

      for ( var x = 0; x < cols; x++ ) {
        terrain[ x ][ y ] = p.map( p.noise( xoff, yoff ), 0, 1, -150, 150 );
        xoff += 0.1;
      }

      yoff += 0.1;
    }

    for ( var y = 0; y < rows - 1; y = y + 1 ) {
      p.beginShape( p.TRIANGLE_STRIP );
      for ( var x = 0; x < cols; x = x + 1 ) {
        p.vertex( x * scl, y * scl, terrain[ x ][ y ] );
        p.vertex( x * scl, ( y + 1 ) * scl, terrain[ x ][ y + 1 ] );
        // p.vertex( ( x + 2 ) * scl, y * scl, terrain[ x ][ y ] );
      }
      p.endShape( );
    }
  }
};

var createVisualizer = function( p ) {
  // const runTime = trackData.features.duration_ms;
  // const sections = trackData.analysis.sections;
  // each section has a duration and start
  //


  let angle = 0;
  var song;
  var FFT;
  var button;
  var amplitude;

  var spectrumHistory = [];
  // var displayHistory = [];
  var currentDisplay = 0;

  var xspacing = 16;    // Distance between each horizontal location
  var w;                // Width of entire wave
  var theta = 0.0;      // Start angle at 0
  var waveHeight = 75.0; // Height of wave
  var period = 500.0;   // How many pixels before the wave repeats
  var dx;               // Value for incrementing x
  var yvalues;  // Using an array to store height values for the wave
  var level;

  var segments = trackData.analysis.segments;
  var beats = trackData.analysis.beats;
  var i = 0;
  var fr = 1 / beats[ 0 ].duration;
  var timeZero;

  p.preload = function() {
    // debugger

  };

  p.setup = function() {
    p.createCanvas( 700, 350 );
    w = p.width + 16;
    dx = ( p.TWO_PI / period ) * xspacing;
    yvalues = new Array( p.floor( w / xspacing ) );
    p.colorMode( p.HSB );
    fft = new p5.FFT( 0.9, 16 );
    p.frameRate( fr );

    // set timeZero to time.now
    timeZero = Date.now();
  };

// set a variable to track height / loudness_max for smooth transitions

  var drawVertex = function( segment ) {
    // var color = p.map( segment.loudness_max, 0, 1, 255, 10 );
    p.stroke( 255 );
    // var y = p.map( segment.loudness_max, 0, 1, 0, p.height / 2 );
    // console.log( y, segment.loudness_max, p.height );
    p.vertex(30 + i, 20);
    p.vertex(30 + i, 75);
    p.vertex(50 + i, 20);
    p.vertex(50 + i, 75);
    p.vertex(70 + i, 20);
    p.vertex(70 + i, 75);
    p.vertex(90 + i, 20);
    p.vertex(90 + i, 75);
    i += 1
  };

  p.draw = function() {
// timeNext = timeZero + segment[ i ].duration
// when timeZero === time.now => i += 1
// drawVertex( segments[ i ] )


    p.background( 0 );
    // var spectrum = fft.waveform(32);
    // spectrumHistory.push( spectrum );

    p.noFill();
    p.stroke( 255 );

    p.beginShape(p.QUAD_STRIP);
      setTimeout( drawVertex( segments[ i ] ), segments[ i ].duration );
    p.endShape();

    // if( spectrumHistory.length > p.width ) {
    //   spectrumHistory.splice( 0, 1);
    // }



    // var displayHistory = [];
    // var totalLength = 0;
    // p.background( 0 );

    // // p.noFill();
    // // p.stroke( 255 );

    // var counter = 0;
    //   p.beginShape();
    //   setInterval(
    //     function() {
    //       var i = counter;
    //       displayHistory.push( spectrumHistory[ i ].loudness_max );
    //       // var color = p.map( displayHistory[ i ], 0, 1, 255, 10 );
    //       // p.stroke( color, 100, 150 );
    //       p.stroke = ( 255 );
    //       var y = p.map( displayHistory[ i ] * 0.001, 0, 1, p.height / 2, 0);
    //       console.log( y );

    //       // p.vertex( i, y );

    //       p.vertex( i, 100 );
    //       console.log( "duration",  spectrumHistory[ i ].duration * 10000 )
    //       counter++
    //       // totalLength += displayHistory[ i ];
    //     },
    //     spectrumHistory[ counter ].duration * 10000
    //   );
    //   p.endShape();

    // if( totalLength > p.width ) {
    //   spectrumHistory.splice( 0, 1);
    // }
  }
};

// var myp5 = new p5( createVisualizer, 'visualizer-container' );

// let angle = 0;
// var song;
// var FFT;
// var button;
// var amplitude;

// var spectrumHistory = [];

// var xspacing = 16;    // Distance between each horizontal location
// var w;                // Width of entire wave
// var theta = 0.0;      // Start angle at 0
// var waveHeight = 75.0; // Height of wave
// var period = 500.0;   // How many pixels before the wave repeats
// var dx;               // Value for incrementing x
// var yvalues;  // Using an array to store height values for the wave
// var level;

// function toggleSong()  {
//   if ( song.isPlaying() ) {
//     song.pause();
//   }
//   else {
//     song.play();
//   }
// }

// function preload() {
//   song = loadSound( 'audio/jack_straw.ogg' );
// }

// function setup() {
//   createCanvas( 700, 350 );
//   w = width + 16;
//   dx = ( TWO_PI / period ) * xspacing;
//   yvalues = new Array( floor( w / xspacing ) );
//   colorMode( HSB );

//   fft = new p5.FFT( 0.9, 16 );

//   button = createButton( 'toggle' );
//   button.mousePressed( toggleSong );
// }

// function draw() {
//   background( 0 );
//   var spectrum = fft.waveform(32);

//   spectrumHistory.push( spectrum );

//   noFill();
//   stroke( 255 );

//   beginShape();
//   for ( var i = 0; i < spectrumHistory.length; i++ ) {
//     var color = map( spectrumHistory[ i ][ 0 ], 0, 1, 255, 10 );
//     stroke( color, 100, 150 );
//     var y = map( spectrumHistory[ i ][ 0 ], 0, 1, height / 2, 0);
//     vertex( i, y );
//   }
//   endShape();

//   if( spectrumHistory.length > width ) {
//     spectrumHistory.splice( 0, 1);
//   }
// }

// function calcWave() {
//   theta += 0.02;

//   var x = theta;
//   for ( var i = 0; i < yvalues.length; i++ ) {
//     yvalues[ i ] = sin( x ) * waveHeight;
//     x += dx;
//   }
// }

// function renderWave() {
//   push();
//   fill( 200, 100, 150 );
//   noStroke();
//   for ( var x = 0; x < yvalues.length; x++ ) {
//     ellipse( x * xspacing, height / 2 + yvalues[ x ], 16, 16 );
//   }
//   pop();
// }

