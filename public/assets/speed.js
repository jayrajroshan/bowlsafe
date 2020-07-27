var ws = new WebSocket('ws://localhost:3000');

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



// $(document).ready(function () {

//   var speed;

//   $.ajax({
//     type: 'POST',
//     url: '/home',
//     data: speed,
//     success: function (data) {
//       const obj = JSON.parse(data);
//       gauge.set(obj.first);
//       gauge1.set(obj.second);
//       gauge2.set(obj.third);
//       console.log(data)

//     }
//   });
// });

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
    font: "10px sans-serif",  // Specifies font
    labels: [-20, -5, 0, 5, 20],  // Print labels at these values
    color: "#000000",  // Optional: Label text color
    fractionDigits: 0  // Optional: Numerical precision. 0=round off.
  },
  limitMax: 'false',
  staticZones: [
    { strokeStyle: "#F03E3E", min: -35, max: -20 }, // Red 
    { strokeStyle: "#FFDD00", min: -20, max: -5 }, // Yellow
    { strokeStyle: "#30B32D", min: -5, max: 5 }, // Green
    { strokeStyle: "#FFDD00", min: 5, max: 20 }, // Yellow
    { strokeStyle: "#F03E3E", min: 20, max: 35 }  // Red
  ], // division for color change

  strokeColor: '#E0E0E0',
  generateGradient: false

};
var target = document.getElementById('foo');
var gauge = new Gauge(target).setOptions(opts);
gauge.minValue = -35
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
  limitMax: 'false',
  percentColors: [
    [0.17, "#008000"],
    [0.50, "#f9c802"],
    [1, "#ff0000"],
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
  limitMax: 'false',
  percentColors: [
    [0.25, "#008000"],
    [0.50, "#f9c802"],
    [1, "#ff0000"],
  ],
  strokeColor: '#E0E0E0',
  generateGradient: false

};
var target = document.getElementById('foo2');
var gauge2 = new Gauge(target).setOptions(opts2);
gauge2.maxValue = 20; // upper limit
gauge2.animationSpeed = 10;