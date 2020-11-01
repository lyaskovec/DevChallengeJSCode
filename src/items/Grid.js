class Grid {
  draw(){
    ctx.save();
    ctx.translate(ctx.xx, ctx.yy);
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    ctx.font = '10px Arial';
    ctx.beginPath();
    ctx.rect(0, 0, 1, height);
    ctx.fill();
    ctx.rect(0, height - 1, width, 1);
    ctx.fill();

    let step = 150;
    let startY = ctx.yy % step;
    let startX = ctx.xx % step;

    for (let i = 0; i < 20; i++) {
      let offset = i * step;

      // Bottom grid
      ctx.rect(parseInt(offset - startX), height - 6, 1, 6);
      ctx.fill();
      ctx.textAlign = 'center';
      let textX = offset - startX;
      textX > 1 && textX < width && ctx.fillText(parseInt((ctx.xx + offset) / step) * step, textX, height - 10);

      // Left greed
      ctx.textAlign = 'left';
      let textY = offset - startY;
      textY > 1 && textY < height && ctx.fillText(parseInt((ctx.yy + offset) / step) * step, 10, textY + 3);
      ctx.rect(0, parseInt(offset - startY), 6, 1);
      ctx.fill();
    }
    ctx.restore();
  }
}
