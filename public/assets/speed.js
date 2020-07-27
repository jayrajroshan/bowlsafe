var HOST = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(HOST);

ws.onopen = function () {
  console.log('websocket is connected ...')
  ws.send('connected')
}

ws.onmessage = (e) => {
  console.log(e.data)
  const obj = JSON.parse(e.data);
  gauge.set(obj.first);
  gauge1.set(obj.second);
  gauge2.set(obj.third);
}



var opts = {
  lines: 80, // smoother
  angle: 0.005, // not sure
  lineWidth: 0.44, // height of the reading
  pointer: {
    length: 0.9,
    strokeWidth: 0.035, //pointer width
    color: '#000000'
  },
  staticLabels: {
    font: "15px sans-serif",  // Specifies font
    labels: [-20, -5, 0, 5, 20],  // Print labels at these values
    color: "#000000",  // Optional: Label text color
    fractionDigits: 0  // Optional: Numerical precision. 0=round off.
  },
  limitMin: 'true',
  limitMax: 'true',
  staticZones: [
    { strokeStyle: "#F03E3E", min: -35, max: -20 }, // Red 
    { strokeStyle: "#ffc107", min: -20, max: -5 }, // Yellow
    { strokeStyle: "#30B32D", min: -5, max: 5 }, // Green
    { strokeStyle: "#ffc107", min: 5, max: 20 }, // Yellow
    { strokeStyle: "#F03E3E", min: 20, max: 35 }  // Red
  ], // division for color change

  strokeColor: '#E0E0E0',
  generateGradient: false

};
var target = document.getElementById('foo');
var gauge = new Gauge(target).setOptions(opts);
gauge.minValue = -35;
gauge.maxValue = 35; // upper limit
gauge.animationSpeed = 10;




var opts1 = {
  lines: 80, // smoother
  angle: 0.005, // not sure
  lineWidth: 0.44, // height of the reading
  pointer: {
    length: 0.9,
    strokeWidth: 0.035, //pointer width
    color: '#000000'
  },
  staticLabels: {
    font: "15px sans-serif",  // Specifies font
    labels: [5, 15],  // Print labels at these values
    color: "#000000",  // Optional: Label text color
    fractionDigits: 0  // Optional: Numerical precision. 0=round off.
  },
  limitMin: 'true',
  limitMax: 'true',
  percentColors: [
    [0.17, "#30B32D"],
    [0.50, "#ffc107"],
    [1, "#F03E3E"],
  ],
  strokeColor: '#E0E0E0',
  generateGradient: false

};
var target = document.getElementById('foo1');
var gauge1 = new Gauge(target).setOptions(opts1);
gauge1.maxValue = 30; // upper limit
gauge1.animationSpeed = 10;


var opts2 = {
  lines: 80, // smoother
  angle: 0.005, // not sure
  lineWidth: 0.44, // height of the reading
  pointer: {
    length: 0.9,
    strokeWidth: 0.035, //pointer width
    color: '#000000'
  },
  staticLabels: {
    font: "15px sans-serif",  // Specifies font
    labels: [5, 10],  // Print labels at these values
    color: "#000000",  // Optional: Label text color
    fractionDigits: 0  // Optional: Numerical precision. 0=round off.
  },
  limitMax: 'true',
  limitMin: 'true',
  percentColors: [
    [0.25, "#30B32D"],
    [0.50, "#ffc107"],
    [1, "#F03E3E"],
  ],
  strokeColor: '#E0E0E0',
  generateGradient: false

};
var target = document.getElementById('foo2');
var gauge2 = new Gauge(target).setOptions(opts2);
gauge2.maxValue = 20; // upper limit
gauge2.animationSpeed = 10;