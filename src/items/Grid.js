
class Grid {
  constructor() {

  }
  draw(){
    ctx.save();
    ctx.translate(-ctx.xx, -ctx.yy);
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.rect( 5, 5, 1, 500); // left
    ctx.rect( 5, 505, 500, 1); // bottom
    ctx.stroke();
    for (let i = 0; i < 10; i++) {
      ctx.rect(0, i * 50 + 10, 5, 1);
      ctx.rect(0, i * 50 + 10, 5, 1);
      ctx.fill()
    }
    ctx.restore();
  }
}
