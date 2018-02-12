var headerElement = document.getElementById( 'mainHeader' );
var newHeaderText = "Terrain Generator";
headerElement.innerText = newHeaderText; 

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
