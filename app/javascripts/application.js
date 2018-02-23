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


//   var get_related = function(x){
//     $.ajax({
//       type: "GET",
//       url: "https://api.spotify.com/v1/artists/"+x+"/related-artists",
//       success: function(response){
//         gen_related(response);
//       }
//     });
//   };

//   var get_albums = function(x){
//     $.ajax({
//       type: "GET",
//       url: "https://api.spotify.com/v1/artists/"+x+"/albums",
//       success: function(response){
//         console.log(response);
//         gen_albums(response);
//       }
//     });
//   };

//   var get_tracks = function(x){
//     $.ajax({
//       type: "GET",
//       url: "https://api.spotify.com/v1/artists/"+x+"/top-tracks?country=US",
//       success: function(response){
//         console.log(response);
//         gen_tracks(response);
//       }
//     });
//   };

//   var update = function(x){
//     clear();
//     var i = 0
//     var artist = x.artists.items[0];
//     console.log(artist);
//     var name = artist.name;
//     var image = artist.images[i].url;
//     var width = artist.images[i].width;
//     var height = artist.images[i].height;
//     var images = artist.images;
//     // genres returns an array of items
//     var genres = artist.genres;
//     var url = artist.external_urls.spotify;
//     var followers = artist.followers.total;
//     var popularity = artist.popularity;

//     $('#name').html("<a id='nameA' href=" + url + ">" + name + "</a></h1>");

//     var nameWidth = $('#nameA').width();
//     console.log(nameWidth);

//     $('#name').css({'width' : nameWidth + "px"});

//     $('#followers').text("Followers: " + followers);
//     $('#popularity').text("Popularity: " + popularity);
//     $('#g_title').text("Genres");
//     $('#ra_title').text("Related Artists");

//     for(var g=0; g < genres.length; g++){
//       $('#genres').append("<li>" + genres[g] + "</li>");
//     };

//     generate(artist, i);
//   };

//   var generate = function(x, y){
//     var image = x.images[y].url;
//     var height = x.images[y].height;
//     var width = x.images[y].width;
//     var inHeight = window.innerHeight;
//     console.log(inHeight);
//     $('#image').html("<img id='pic' src='" + image + "'></img>");

//     if(window.innerWidth > 719){
//       $('#right').css({'height': inHeight + "px"});
//     };
//   };

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

//   var clear = function(){
//     $('#genres').empty();
//     $('#ra').empty();
//     $('#albums').empty();
//     $('#tracks').empty();
//   };

//   var clear_related = function(){
//     $('#ra').empty();
//   }

//   var clear_albums = function(){
//     $('#albums').empty();
//   }

//   var clear_tracks = function(){
//     $('#tracks').empty();
//   }

//   var clear_play = function(){
//     $('#npTitle').empty();
//     $('#play').empty();
//   }

//   var gen_related = function(x){
//     clear_related();
//     var related = x.artists;
//     for(var g = 0; g < related.length; g++){
//       var last = related[g].images.length-1;
//       var sm_image = related[g].images[last].url;
//       var r_name = related[g].name
//       $('#ra').append("<li class='follower_text'><img class='sm_circle' src='" + sm_image + "'></img><span>" + r_name + "</span></li>");
//     };

//     $('.follower_text').on('click', function(){
//       search($(this).text());
//     });

//     resize();
//   };

//   var gen_albums = function(x){
//     clear_albums();
//     $('#albums').append("<h1 id='albumT'>Albums</h1>");
//     console.log(x);
//     var albums = x.items;
//     var inHeight = document.documentElement.clientHeight
//     if(window.innerWidth > 719){
//       $('#albums').css({'margin-top' : inHeight + "px"})
//     }
//     for(var a = 0; a < albums.length; a++){
//       if((a == 0) || (albums[a].name != albums[a-1].name)){
//         $('#albums').append("<div class='album_container'><div class='album_container_inner'><div class='album' data-album=" + albums[a].id + "><img class='album_art' src='" + albums[a].images[1].url + "'></img><p class='album_title'>"+ albums[a].name +"</p></div><div class='album_id'>"+albums[a].id+"</div><div class='album_back'><iframe src='https://embed.spotify.com/?uri=spotify:album:"+ albums[a].id +"&theme=white' width='302' height='366' frameborder='0' allowtransparency='true'></iframe></div></div></div>");
//       };
//     };

//     $('.album_container').on('click', function(){
//       id = $(this).data("album");
//       show_album(id);
//       $(this).children('.album_container_inner').addClass('flip');
//     });
//     $('.album_container').on('mouseleave', function(){
//       $(this).children('.album_container_inner').removeClass('flip');
//     });
//   };

//   var gen_tracks = function(x){
//     clear_tracks();
//     $('#tt_title').text("Top Tracks");
//     $('#tt_subtitle').text("select a song to listen")
//     var tracks = x.tracks;
//     for(var t = 0; t < tracks.length; t++){
//       $('#tracks').append("<li class='track_text' data-track="+tracks[t].uri+">"+tracks[t].name+"</li>")
//     };

//     $('.track_text').on('click', function(){
//       clear_play();
//       uri = $(this).data("track");
//       console.log(uri)
//       $('#npTitle').text("Now Playing");
//       $('#play').append("<iframe src='https://embed.spotify.com/?uri="+uri+"&theme=white' width='250' height='80' frameborder='0' allowtransparency='true' autoplay='true'></iframe>")
//     });
//   };

//   var show_album = function(x){
//     console.log(x);


//   };

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
var mainInput = document.getElementById( 'search' );
let token;

mainInput.addEventListener( 'keyup', function(){
  var input = mainInput.value;
  if( input.length > 3 ){
    search( input )
  }
});

var search = function( term ) {
  if ( token && token.length > 0 ) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", '/search', true );
    xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlHttp.onreadystatechange = function() {
      if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
        var results = JSON.parse( xmlHttp.response );
        // build drop down of possible options, based on results returned?
        // all 20? or top 5? or
        console.log( results.artists.items[ 0 ] );
        // update(results)
        var id = results.artists.items[0].id;
        var name = results.artists.items[0].name;
        // get_albums(id)
        // get_tracks(id)
        // get_related(id)
      }
    }
    var data = { name: term };

    xmlHttp.send( JSON.stringify( data ) );
  }
  else {
    initialize( term );
  }
};

var initialize = function( query ) {
  var preTerm;

  if ( query && query.length > 0 ) {
    preTerm = query;
  }

  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "POST", '/token', true ); // true for asynchronous
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
