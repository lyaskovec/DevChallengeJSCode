var W,H; // canvas width and height
// get the canvas context
const ctx = canvas.getContext("2d");
const gravity = 0.01;
function vec(x,y){return {x,y}}

const line = {
  p1 : { x : 0, y : 0 },
  p2 : { x : 0, y : 0 },
  vnorm : { x : 0, y : 0 }, // normalied vector
  vec : { x : 0, y : 0 }, // line as a vector
  len : 0,
  update(){
    this.vec.x = this.p2.x - this.p1.x;
    this.vec.y = this.p2.y - this.p1.y;
    this.len = Math.sqrt(this.vec.x * this.vec.x + this.vec.y * this.vec.y);
    this.vnorm.x = this.vec.x / this.len;
    this.vnorm.y = this.vec.y / this.len;
  },
  draw(){
    ctx.beginPath();
    ctx.moveTo(this.p1.x,this.p1.y);
    ctx.lineTo(this.p2.x,this.p2.y);
    ctx.stroke();
  },
   dLine(p1, p2, color = 'black'){

    ctx.beginPath();
    ctx.strokeStyle = color
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke()
  },

testBall(ball){  // line must be updated befor this call
    // line is one sided and ball can only approch from the right
    // find line radius distance from line
    var x = this.p1.x + this.vnorm.y * ball.radius;
    var y = this.p1.y - this.vnorm.x * ball.radius;
    x = ball.pos.x - x;
    y = ball.pos.y - y;
    // get cross product to see if ball hits line
    var c = x * this.vec.y - y * this.vec.x;
    if(c <= 0){ // ball has hit the line

      // get perpendicular line away from line
      var ox = this.vnorm.y * ball.radius
      var oy = -this.vnorm.x * ball.radius



      // get relative ball pos
      var px = ball.pos.x - (this.p1.x + ox);
      var py = ball.pos.y - (this.p1.y + oy);

      // find ball position that contacts the line
      var ld = (px * this.vec.x + py * this.vec.y)/(this.len * this.len);
      ball.pos.x  = this.vec.x * ld + (this.p1.x+ox);
      ball.pos.y = this.vec.y * ld + (this.p1.y+oy);
      // find the reflection delta (bounce direction)
      var dd = (ball.dnorm.x * this.vnorm.x + ball.dnorm.y * this.vnorm.y) * 2;
      ball.delta.x = this.vnorm.x * dd - ball.dnorm.x;
      ball.delta.y = this.vnorm.y * dd - ball.dnorm.y;

      // the ball has lost some speed (should not have but this is a fix)

      // var m = Math.sqrt(ball.delta.x * ball.delta.x + ball.delta.y * ball.delta.y);
      // ball.delta.x = (ball.delta.x / m) * ball.speed;
      // ball.delta.y = (ball.delta.y / m) * ball.speed;

      // ball.delta.x = 10
      // ball.delta.y = 10

      ball.updateContact();
      ball.col = "red";

    }
  }
}



// create a ball
function createLine(x,y,x1,y1){
  var l = Object.assign({},line,{
    p1 : vec(x,y),
    p2 : vec(x1,y1),
    vec : vec(0,0),
    vnorm : vec(0,0),

  });
  l.update();
  return l;
}
const lines = {
  items : [],
  add(line){ lines.items.push(line); return line },
  update(){
    var i;
    for(i = 0; i < lines.items.length; i++){
      lines.items[i].update();
    }
    return lines;
  },
  draw(){
    var i;
    for(i = 0; i < lines.items.length; i++){
      lines.items[i].draw();
    }
    return lines;
  },
  testBall(ball){
    var i;
    for(i = 0; i < lines.items.length; i++){
      lines.items[i].testBall(ball);
    }
    return lines;
  }


};

var ball = {
  pos : { x : 0, y: 0},
  radius : 0,
  speed : 0,
  col : "black",
  delta : { x : 0, y : 0},  // movement as vector
  dnorm : { x : 0, y: 0},  // normalised delta
  updateContact(){ // update after ball hits wall
    this.speed = Math.sqrt(this.delta.x * this.delta.x + this.delta.y * this.delta.y);
    this.dnorm.x = this.delta.x / this.speed;
    this.dnorm.y = this.delta.y / this.speed;
  },
  update(){
    this.col = "black";
    this.delta.y += gravity;
    this.pos.x += this.delta.x;
    this.pos.y += this.delta.y;
    this.speed = Math.sqrt(this.delta.x * this.delta.x + this.delta.y * this.delta.y);
    this.dnorm.x = this.delta.x / this.speed;
    this.dnorm.y = this.delta.y / this.speed;
  },
  draw(){
    ctx.strokeStyle = this.col;
    ctx.beginPath();
    ctx.arc(this.pos.x,this.pos.y,this.radius,0,Math.PI*2);
    ctx.stroke();
  },
}
// create a ball
function createBall(x,y,r){
  var b = Object.assign({},ball,{
    pos : vec(x,y),
    radius : r,
    delta : vec(0,0),
    dnorm : vec(0,0),
  });
  return b;
}

const balls = {
  items : [],
  add(b){
    balls.items.push(b);
  },
  update(){
    var i;
    for(i = 0; i < balls.items.length; i++){
      balls.items[i].update();
      lines.testBall(balls.items[i]);
      if(balls.items[i].pos.y - balls.items[i].radius > canvas.height ||
        balls.items[i].pos.x < -50 || balls.items[i].pos.x - 50  > W){
        balls.items.splice(i--,1);
      }
    }
    return balls;
  },
  draw(){
    var i;
    for(i = 0; i < balls.items.length; i++){
      balls.items[i].draw();
    }
    return balls;
  }
}





const l1 = lines.add(createLine(0,0,100,100));
const l2 = lines.add(createLine(0,0,100,100));
const mouse = { x : 0, y : 0};
canvas.addEventListener("mousemove",(e)=>{
  mouse.x = e.pageX;
  mouse.y = e.pageY;
})


function mainLoop(time){
  // resize if needed
  if(canvas.width !== innerWidth || canvas.height !== innerHeight){ // resize canvas if window size has changed
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
  }
  // clear canvas
  ctx.setTransform(1,0,0,1,0,0); // set default transform
  ctx.clearRect(0,0,W,H); // clear the canvas
  if(balls.items.length < 10){
    balls.add(createBall(Math.random() * W , Math.random() * 30, Math.random() * 20 + 10));

  }

  time /= 5;
  l1.p1.x = 0;
  l1.p2.x = 200 ;
  l2.p1.x = 0;
  l2.p2.x = 200 ;
  l1.p1.y = Math.sin(time / 1000) * H * 0.4 + H * 0.4;
  l1.p2.y = Math.cos(time / 1000) * H * 0.4 + H * 0.4;
  l2.p1.y = Math.sin(time / 500) * H * 0.4 + H * 0.4;
  l2.p2.y = Math.cos(time / 500) * H * 0.4 + H * 0.4;
  lines.update().draw();
  balls.update().draw();


  // get next animation loop
  requestAnimationFrame(mainLoop);
}
requestAnimationFrame(mainLoop);