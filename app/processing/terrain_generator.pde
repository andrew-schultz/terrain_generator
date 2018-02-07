int cols,rows;
int scl = 20;
int w = 2000;
int h = 1400;

float flying = 0;
float[][] terrain;

void setup() {
  size( 600, 600, P3D );
  cols = w / scl;
  rows = h / scl;
  terrain = new float[ cols ][ rows ]; 
}

void draw() {
  int tintVar;

  flying -= 0.07;
  
  float yoff = flying;

  for ( int y=0; y < rows; y++ ) {
   float xoff = 0;

   for ( int x = 0; x < cols; x++ ) {
     terrain[ x ][ y ] = map( noise( xoff, yoff ), 0, 1, -100, 100 );
     // tintVar = Math.round( map( noise( xoff, yoff ), 0, 1, 0.0, 1.0 ) );

     xoff += 0.1;
   }

   yoff += 0.1 ;
  }

 background( 100, 150, 1 );
 stroke( 80, 70, 1 );
 noFill();
 // fill( ( 100, 150, 1), tintVar );
 float rotateXOffset = 2.75;
 translate( width / 2, height / 2 + 100 );
 rotateX( PI / rotateXOffset );

 translate( -w / 2, -h / 2 );
 for ( int y = 0; y < rows - 1; y++ ) {
   beginShape( TRIANGLE_STRIP );
   for ( int x=0; x < cols; x++ ) {
     vertex( x * scl, y * scl, terrain[ x ][ y ] );
     vertex( x * scl, ( y + 1 ) * scl, terrain[ x ][ y + 1 ] );

     //rect(x*scl, y*scl, scl, scl);
   }
   endShape();
 } 
}