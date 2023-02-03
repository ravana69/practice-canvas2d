import {Ease}   from 'https://assets.codepen.io/3919397/ease.js';
import {Utils}  from 'https://assets.codepen.io/3919397/utilities.js';
import {Vector} from 'https://assets.codepen.io/3919397/vector.js';
import {Points} from 'https://assets.codepen.io/3919397/points.js';
import {Grid}   from 'https://assets.codepen.io/3919397/grid.js';

let gui, canvas, c, width, height, frameSize, id,
    ease, shapes, scale, size, number, maxDist, vector, points, newPoints, star;

const setupGui = () => {
  gui = new dat.GUI();
  
  gui.params = {
    tScale: 0.0002,
    ease: 'easeInOutQuart',
    number: 3,
    scale: 250,
    frame: false,
    start: () => start(),
    stop: () => stop()
  };

  gui.ctrls = {
    tScale: gui.add(gui.params, 'tScale', 0.0001, 0.005, 0.0001),
    ease: gui.add(gui.params, 'ease', Ease.returnEaseType())
      .onChange(() => initialize()),
    number: gui.add(gui.params, 'number', 1, 30, 1)
      .onChange(() => initialize()),
    scale: gui.add(gui.params, 'scale', 1, 500, 1)
      .onChange(() => initialize()),
    frame: gui.add(gui.params, 'frame', false),
    start: gui.add(gui.params, 'start'),
    stop: gui.add(gui.params, 'stop')
  };
  
  gui.close();
};

const initialize = () => {
  if (id) {
    cancelAnimationFrame(id);
  }

  vector = new Vector();
  ease = Ease.returnEaseFunc(gui.params.ease);
  
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  frameSize = Math.min(width * 0.9, height * 0.9);
    
  scale = gui.params.scale;
  number = gui.params.number;
  
  points = Points.star(vector, 360);
  //star = Points.polygon(vector, 360, 3);
  
  // choise shape size
  //size = Math.floor(scale * Math.sqrt(2) / 2);
  size = Math.floor(scale / 2); // square
  //size = Math.floor(Math.sqrt(3) * scale / 2 / 2); // hex
  //size = Math.floor(scale * 0.4 * 2 * Math.PI / number / 2); // circle
  //shapes = Grid.square(vector, number, scale);
  
  size = gui.params.scale;
  
  const tmp = {
    v: vector.create(0, 0),
    d: 1
  };
  
  shapes = [tmp, tmp];
  
  maxDist = Grid.maxDist(shapes);
  
  draw(0);
};

const drawShape = (points, x, y, size) => {
  c.save();
  
  c.beginPath();
  for (let i = 0; i < points.length; i++) {
    if (i === 0) {
      c.moveTo(points[i].getX() * size + x, points[i].getY() * size + y);
    } else {
      c.lineTo(points[i].getX() * size + x, points[i].getY() * size + y);
    }
  }
  c.closePath();
  //c.fill();
  c.stroke();
  
  c.restore();
};

const drawPoints = (points, x, y, size, pointSize) => {
  c.save();
  
  for (let i = 0; i < points.length; i++) {
    const nx = points[i].getX() * size + x;
    const ny = points[i].getY() * size + y;
    
    c.beginPath();
    c.arc(nx, ny, pointSize, 0, Math.PI * 2, false);
    c.fill();
    //c.stroke();
  }
  
  c.restore();
};

const drawTrailLine = (t, points, size) => {
  const index = Math.floor(Utils.map(t, 0, 1, 0, points.length - 1));
  const endex = Math.ceil(Utils.map(t, 0, 1, index + 1, points.length - 1));
  
  const color = `hsl(${360 * t}, 80%, 60%)`;
  
  c.strokeStyle = color;
  c.shadowColor = color;
  c.shadowBlur = 10;

  c.beginPath();
  c.moveTo(points[index].getX() * size, points[index].getY() * size);
  for (let i = index; i < endex; i++) {
    const p = points[i];
    
    c.lineTo(p.getX() * size, p.getY() * size);
  }
  c.stroke();    
};

const getNewPoints = (t, pointA, pointB) => {
  const tmp = new Array();

  for (let i = 0; i < pointA.length; i++) {
    let x, y;
    
    if (t < 0.5) {
      x = Utils.map(t, 0, 0.5, pointA[i].getX(), pointB[i].getX());
      y = Utils.map(t, 0, 0.5, pointA[i].getY(), pointB[i].getY());
    } else {
      x = Utils.map(t, 0.5, 1, pointB[i].getX(), pointA[i].getX());
      y = Utils.map(t, 0.5, 1, pointB[i].getY(), pointA[i].getY());
    }
    
    const v = vector.create(x, y);

    tmp.push(v);
  }

  return tmp;
};

const draw = (t) => {
  t *= gui.params.tScale;
  
  c.save();
  
  c.fillStyle = 'rgba(0, 0, 0, 0.1)';
  c.fillRect(0, 0, width, height);
  //c.clearRect(0, 0, width, height);
  
  if (gui.params.frame) addFrame();
  
  c.translate(width / 2, height / 2);
  
  c.lineWidth = 2;
  c.lineCap = 'round';
  c.globalCompositeOperation = 'lighter';
  
  for (let i = 0; i < shapes.length; i++) {
    const s = shapes[i];
    const x = s.v.getX();
    const y = s.v.getY();
    
    let scaledT = (t - i / shapes.length) % 1;
    //let scaledT = t % 1;
    scaledT = ease(Math.abs(scaledT));
    
    c.save();
    
    /*
    c.translate(x, y);
    if (scaledT < 0.5) {
      c.scale(Utils.map(scaledT, 0, 0.5, 1, 5), Utils.map(scaledT, 0, 0.5, 1, 5));
    } else {
      c.scale(Utils.map(scaledT, 0.5, 1, 5, 1), Utils.map(scaledT, 0.5, 1, 5, 1));
    }
    c.translate(-x, -y);
    */
    
    c.translate(x, y);
    
    c.rotate(270 * Math.PI / 180);
    
    //newPoints = getNewPoints(scaledT, points, star);
    
    for (let j = 1; j <= 10; j++) {
      let scaledT = (t - i / shapes.length / Math.PI * 2) % 1;
      scaledT = ease(Math.abs(scaledT));
      c.rotate(72 * Math.PI / 180);
      drawTrailLine(scaledT, points, size * j / 10);
    }
    
    //drawShape(points, x, y, size, 1);
    
    c.restore();
  }
  
  c.restore();
  
  id = requestAnimationFrame(draw);
};

const addFrame = () => {
  c.rect(
    width / 2 - frameSize / 2,
    height / 2 - frameSize / 2,
    frameSize,
    frameSize
  );
  c.clip();
};

const setupCanvas = () => {
  canvas = document.createElement('canvas');
  document.getElementsByTagName('body')[0].appendChild(canvas);
  c = canvas.getContext('2d');
};

const start = () => {
  initialize();
};

const stop = () => {
  if (id) {
    cancelAnimationFrame(id);
    id = null;
  }
};

(() => {
  window.addEventListener('DOMContentLoaded', () => {
    console.clear();

    setupGui();
    setupCanvas();
    
    initialize();
  });

  window.addEventListener('resize', () => {
    initialize();
  });
})();