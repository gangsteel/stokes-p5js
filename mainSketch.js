var CANVAS_HEIGHT = 400;
var CANVAS_WIDTH = 600;
var PIXEL_STEP = 8;
var PIXEL_ARROW_STEP = 20;
var DT = 0.1;
var x0 = CANVAS_WIDTH/2;
var y0 = CANVAS_HEIGHT/2;
var swimmer_x = [CANVAS_WIDTH/4, CANVAS_WIDTH/4*3, CANVAS_WIDTH/4, CANVAS_WIDTH/4*3];
var swimmer_y = [CANVAS_HEIGHT/4, CANVAS_HEIGHT/4*3, CANVAS_HEIGHT/4*3, CANVAS_HEIGHT/4];
var swimmer_theta = [0.0, -Math.PI/2, Math.PI, Math.PI/2];
var CANVAS_SHIFT = 75;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  frameRate(60);
  noStroke();
  // sliders
  VelSlider = createSlider(0, 100.0, 80.0);
  VelSlider.position(20, CANVAS_HEIGHT - 20 + CANVAS_SHIFT);
  BrownianSlider = createSlider(0, 20.0, 5.0);
  BrownianSlider.position(20, CANVAS_HEIGHT + CANVAS_SHIFT);
  // buttons
  AddButton = createButton("ADD MORE!");
  AddButton.position(CANVAS_WIDTH-100, CANVAS_HEIGHT-4 + CANVAS_SHIFT);
  AddButton.mousePressed(addSwimmer);
}

function draw() {

  MIN_VAL = 0.0;
  MAX_VAL = 10.0;
  rgb_v = [0.0,0.0,0.0]

  dx = mouseX - x0; dy = mouseY - y0;
  SWIM_F = VelSlider.value();

  for (i = 0; i < CANVAS_WIDTH; i=i+PIXEL_STEP){
    for (j = 0; j < CANVAS_HEIGHT; j=j+PIXEL_STEP){
      vxy = [0.0, 0.0];
      Oseen(i-x0,j-y0,dx,dy,vxy);
      for (si = 0; si < swimmer_x.length; si++){
        f_xy = fVector(swimmer_theta[si], SWIM_F); 
        Oseen(i-swimmer_x[si], j-swimmer_y[si], f_xy[0], f_xy[1], vxy);
      }
      pValue = Math.sqrt(vxy[0]*vxy[0] + vxy[1]*vxy[1]);

      if (!isFinite(pValue)){ continue; }

      if (pValue > MAX_VAL){ colorMap(1.0,rgb_v); }
      else if (pValue < MIN_VAL){ colorMap(0.0,rgb_v); }
      else{ colorMap((pValue-MIN_VAL)/(MAX_VAL-MIN_VAL),rgb_v); }
      fill(rgb_v[0],rgb_v[1],rgb_v[2]);
      rect(i,j,PIXEL_STEP,PIXEL_STEP);

    }
  }

  for (i = 0; i < CANVAS_WIDTH; i=i+PIXEL_ARROW_STEP){
    for (j = 0; j < CANVAS_HEIGHT; j=j+PIXEL_ARROW_STEP){
      vxy = [0.0, 0.0];
      Oseen(i-x0,j-y0,dx,dy,vxy);
      for (si = 0; si < swimmer_x.length; si++){
        f_xy = fVector(swimmer_theta[si], SWIM_F);
        Oseen(i-swimmer_x[si], j-swimmer_y[si], f_xy[0], f_xy[1], vxy);
      }
      drawArrow(vxy,[i,j]);
    }
  }

  push();
  strokeWeight(4);
  stroke(255,255,255);
  fill('rgba(255,255,255,0.6)');
  ellipse(x0,y0,1.2*PIXEL_ARROW_STEP,1.2*PIXEL_ARROW_STEP);
  fill('rgba(255,0,0,0.8)');
  ellipse(x0,y0,PIXEL_ARROW_STEP/2,PIXEL_ARROW_STEP/2);
  pop();

  x0 = x0 + dx * DT;
  y0 = y0 + dy * DT;

  SwimmerUpdate(swimmer_x, swimmer_y, swimmer_theta, SWIM_F);
  drawSwimmer(swimmer_x, swimmer_y);
  push();
  fill(255,255,255);
  textSize(18);
  text("Vitality", BrownianSlider.x + BrownianSlider.width + 10, CANVAS_HEIGHT - 47);
  text("Curiosity", BrownianSlider.x + BrownianSlider.width + 10, CANVAS_HEIGHT - 25);
  pop();
}

function fVector(thetaAngle, F){
  return [F * Math.cos(thetaAngle), F * Math.sin(thetaAngle)];
}

function wrap(x, L){
  return x - Math.floor(x/L)*L;
}

function SwimmerUpdate(x,y,theta,f){
  Brownian_strength = BrownianSlider.value();
  for (i = 0; i < theta.length; i++){
    theta[i] = theta[i] + Brownian_strength * (Math.random()-0.5) * DT;
    fXY = fVector(theta[i], f);
    x[i] = x[i] + fXY[0] * DT;
    y[i] = y[i] + fXY[1] * DT;
    x[i] = wrap(x[i], CANVAS_WIDTH);
    y[i] = wrap(y[i], CANVAS_HEIGHT);
  } 
}

function drawSwimmer(x,y){
  for (i = 0; i < x.length; i++){
    push();
    strokeWeight(4);
    stroke(255,255,255);
    fill('rgba(255,255,255,0.6)');
    ellipse(x[i],y[i],1.2*PIXEL_ARROW_STEP,1.2*PIXEL_ARROW_STEP);
    pop();
  }
}

// Oseen tensor
// Input: x,y: relative distance
// Input: fx,fy: force
// Output: vxy: velocity, array, overwritten
function Oseen(x, y, fx, fy, vxy){
  xx = x*x; yy = y*y; xy = x*y;
  rr = xx + yy;
  r = Math.sqrt(rr);

  vxy[0] = vxy[0] + (fx + (xx*fx + xy*fy)/rr)/r;
  vxy[1] = vxy[1] + (fy + (xy*fx + yy*fy)/rr)/r;
}

// colormap function
// Input: fraction, between 0 and 1, and an array
// Output: Modify the values of the array
function colorMap(fraction,rgbarray){

  if (fraction<0.33) { rgbarray[0] = 0.0; }
  else if (fraction>0.67) { rgbarray[0] = 255.0; }
  else { rgbarray[0] = interpolate(fraction,0.33,0.67,0.0,255.0); }
  
  if (fraction<0.33) { rgbarray[1] = interpolate(fraction,0.0,0.33,0.0,255.0); }
  else if (fraction>0.67) { rgbarray[1] = interpolate(fraction,0.67,1.0,255.0,0.0); }
  else { rgbarray[1] = 255.0; }
  
  if (fraction<0.33) { rgbarray[2] = 255.0; }
  else if (fraction>0.67) { rgbarray[2] = 0.0; }
  else { rgbarray[2] = interpolate(fraction,0.33,0.67,255.0,0.0); }

}

// helper function for jet colormap
function interpolate(value,xL,xR,yL,yR){
  return (value-xL)*(yR-yL)/(xR-xL) + yL;
}

// helper function drawing an arrow
function drawArrow(v,loc){
  push();
  stroke(0);
  normalizeV = [0.0, 0.0];
  vMag = Math.sqrt(v[0]*v[0]+v[1]*v[1]);
  if (vMag>0){
    normalizeV[0] = 5 * v[0]/vMag;
    normalizeV[1] = 5 * v[1]/vMag;
  }
  line(loc[0]-normalizeV[0],loc[1]-normalizeV[1],loc[0]+normalizeV[0],loc[1]+normalizeV[1]);
  fill(0);
  triangle(loc[0]+normalizeV[0],loc[1]+normalizeV[1],loc[0]+0.8*normalizeV[0]-0.2*normalizeV[1],loc[1]+0.8*normalizeV[1]+0.2*normalizeV[0],loc[0]+0.8*normalizeV[0]+0.2*normalizeV[1],loc[1]+0.8*normalizeV[1]-0.2*normalizeV[0]);
  
  pop();
}

function addSwimmer(){
  swimmer_x.push(CANVAS_WIDTH/2);
  swimmer_y.push(CANVAS_HEIGHT/2);
  swimmer_theta.push(0.0);  
}
