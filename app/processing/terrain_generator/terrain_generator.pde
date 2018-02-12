int cols,rows;
int scl = 40;
int w = 2000;
int h = 1400;

float flying = 0;
float[][] terrain;

var audioPlayer = document.getElementById( 'audioPlayer' );
var audioCtx = new ( window.AudioContext || window.webkitAudioContext )();
var analyser = audioCtx.createAnalyser();
var source = audioCtx.createMediaElementSource( audioPlayer );
source.connect(analyser);
source.connect( audioCtx.destination );

analyser.fftSize = 2048;
var bufferLength = analyser.fftSize;
console.log(bufferLength);
var dataArray = new Uint8Array(bufferLength);

void setup() {
  size( 600, 600, P3D );
  cols = w / scl;
  rows = h / scl;
  terrain = new float[ cols ][ rows ]; 
  frameRate( 20 );
}

void draw() {
  background( 100, 150, 1 );
  stroke( 80, 70, 1 );
  //noFill();
  
  float rotateXOffset = 2.75;

  translate( width / 2, height / 2 + 100 );
  rotateX( PI / rotateXOffset );
  flying -= 0.07;
  translate( -w / 2, -h / 2 );

  float yoff = flying;
  float tintVar;

  for ( int y=0; y < rows; y++ ) {
    float xoff = 0;

    for ( int x = 0; x < cols; x++ ) {
      terrain[ x ][ y ] = map( noise( xoff, yoff ), 0, 1, -150, 150 );
      tintVar = nf( noise( xoff, yoff ), 1, 1 );
      xoff += 0.1;
    }

    yoff += 0.1 ;
  }
  
  for ( int y = 0; y < rows - 1; y++ ) {
    beginShape( TRIANGLE );
    for ( int x=0; x < cols; x++ ) {
      vertex( x * scl, y * scl, terrain[ x ][ y ] );
      vertex( x * scl, ( y + 1 ) * scl, terrain[ x ][ y + 1 ] );
    }

    console.log( tintVar );
    fill( ( 150, 210, 50 ), tintVar );
    endShape();
  } 
}