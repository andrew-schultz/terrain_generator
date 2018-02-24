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

// ####################

// band browser

//   $(window).on('resize', function(){
//     resize()
//   });

//   var inHeight = window.innerHeight;

//   var resize = function(){
//     if(window.innerWidth < 719){
//       console.log('hello');
//       var imgHeight = $('#pic').height();
//       var lHeight = $('#left').height();
//       var rHeight = $('#right').height();
//       var nHeight = $('#name').height();
//       $('#left').css({'margin-top' : imgHeight + nHeight+ "px"});
//       $('#name').css({'top' : imgHeight + 98 + "px"});
//       $('#right').css({'height' : "100%"})
//     }

//     if(window.innerWidth > 719){
//       $('#right').css({'height' : window.innerHeight + "px"})
//     }
//   }

//   $(window).on('resize', function(){
//     resize()
//   });
// });

// ================================
//            variables
// ================================

var mainInput = document.getElementById( 'search' );
var genresDiv = document.getElementById( 'genres' );
var relatedArtistsDiv = document.getElementById( 'ra' );
var albumsDiv = document.getElementById( 'albums' );
var tracksDiv = document.getElementById( 'tracks' );

let token;

// ================================
//            functions
// ================================

// === cleanup ===

var clear = function(){
  genresDiv.innerHTML = null;
  relatedArtistsDiv.innerHTML = null;
  albumsDiv.innerHTML = null;
  tracksDiv.innerHTML = null;
};

var clearRelated = function(){
  relatedArtistsDiv.innerHTML = null;
};

var clearAlbums = function(){
  albumsDiv.innerHTML = null;
};

var clearTracks = function(){
  tracksDiv.innerHTML = null;
};

var clearPlay = function(){
  document.getElementById( 'npTitle' ).innerHTML = null;
  document.getElementById( 'play' ).innerHTML = null;
};

// === generation ===

// var showAlbum = function(x){
//   console.log(x);
// };

var generate = function( x, y ){
  var image = x.images[ y ].url;
  var height = x.images[ y ].height;
  var width = x.images[ y ].width;
  var inHeight = window.innerHeight;
  console.log(inHeight);
  document.getElementById( 'image' ).innerHTML = "<img id='pic' src='" + image + "'></img>";

  if( window.innerWidth > 719 ) {
    document.getElementById( 'right' ).style.height =  inHeight + "px";
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

  for( var a = 0; a < albums.length; a++ ) {
    if( ( a == 0 ) || ( albums[ a ].name != albums[ a - 1 ].name ) ) {
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
      albumBackDiv.innerHTML = "iframe src='https://embed.spotify.com/?uri=spotify:album:" + albums[ a ].id + "&theme=white' width='302' height='366' frameborder='0' allowtransparency='true'></iframe>"
      innerDiv.appendChild( albumBackDiv );

      outerDiv.appendChild( innerDiv );

      albumsDiv.appendChild( outerDiv );
    };
  };

  document.querySelector( '.album_container' ).addEventListener( 'click', function( e ) {
    var parentContainer = e.target.parentElement;
    var id = parentContainer.attributes['data-album'].value;
    // showAlbum( id );
    var flipContainer = parentContainer.offsetParent;
    flipContainer.classList.add( 'flip' );
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

  for( var t = 0; t < tracks.length; t++ ) {
    var node = document.createElement( 'li' );
    node.classList.add( 'track_text' );
    node.dataset.track = tracks[ t ].uri;

    var textnode = document.createTextNode( tracks[ t ].name );
    node.appendChild( textnode );

    document.getElementById( 'tracks' ).appendChild( node );
  };
};

var generateRelated = function( x ) {
  var related = x.artists;
  clearRelated();

  for( var g = 0; g < related.length; g++ ) {
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
  // resize();
};

var generateNowPlaying = function( target ) {
  clearPlay();

  var uri = target.dataset.track;

  document.getElementById( 'npTitle' ).textContent = "Now Playing";

  iframeNode = "<iframe src='https://open.spotify.com/embed?uri=" + uri + "&theme=white' width='250' height='80' frameborder='0' allowtransparency='true' autoplay='true' allow='encrypted-media'></iframe>";
  document.getElementById( 'play' ).innerHTML = iframeNode;
};

var update = function( x ) {
  clear();
  var i = 0
  var artist = x.artists.items[ 0 ];
  var name = artist.name;
  var image = artist.images[ i ].url;
  var width = artist.images[ i ].width;
  var height = artist.images[ i ].height;
  var images = artist.images;
  // genres returns an array of items
  var genres = artist.genres;
  var url = artist.external_urls.spotify;
  var followers = artist.followers.total;
  var popularity = artist.popularity;

  var nameDiv = document.getElementById( 'name' );

  if ( name.length > 0 ) {
    nameDiv.innerHTML = "<a id='nameA' href=" + url + ">" + name + "</a></h1>";
  }

  var nameWidth = document.getElementById( 'nameA').style.width;

  nameDiv.style.width = nameWidth + "px";

  document.getElementById( 'followers' ).text = "Followers: " + followers;
  document.getElementById( 'popularity' ).text = "Popularity: " + popularity;
  document.getElementById( 'g_title' ).text = "Genres";
  document.getElementById( 'ra_title' ).text = "Related Artists";

  for( var g = 0; g < genres.length; g++ ) {
    var node = document.createElement( 'li' );
    var textnode = document.createTextNode( genres[ g ] );
    node.appendChild( textnode );
    document.getElementById( 'genres' ).appendChild( node );
  };

  generate( artist, i );
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
  }

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
      generateAlbums( results );
    }
  }

  var data = {
    id: id,
    path: 'artists',
    append: 'albums'
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
  }

  var data = {
    id: id,
    path: 'artists',
    append: 'top-tracks',
    qs: { country: 'US' }
  };

  xmlHttp.send( JSON.stringify( data ) );
};

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
          update( results )
          var id = results.artists.items[0].id;
          var name = results.artists.items[0].name;
          getAlbums( id )
          getTracks(id)
          getRelated(id)
        }
      }
    }
    var data = { name: term };

    xmlHttp.send( JSON.stringify( data ) );
  }
  else {
    initialize( term );
  }
};

// ================================
//            listeners
// ================================

mainInput.addEventListener( 'keyup', function() {
  var input = mainInput.value;
  if ( input.length > 3 ) {
    search( input )
  }
} );

document.addEventListener( 'click', function( e ) {
  if ( e.target && e.target.classList.value.includes( 'follower_text' ) ) {
    search( e.target.textContent );
  }
  else if ( e.target && e.target.classList.value.includes( 'track_text' ) ) {
    generateNowPlaying( e.target );
  }
} );

// ================================
//            initialize
// ================================

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
  }
  xmlHttp.send();
};

initialize();
