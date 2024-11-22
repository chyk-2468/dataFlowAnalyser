document.getElementById('calculateBtn').addEventListener('click', function () {
  // Get the input values
  let dataRate = parseFloat(document.getElementById('dataRate').value);
  let distance = parseFloat(document.getElementById('distance').value);
  let dataSize = parseFloat(document.getElementById('dataSize').value);
  let packetSize = parseFloat(document.getElementById('packetSize').value);
  let macOverhead = parseFloat(document.getElementById('macOverhead').value) || 100;
  let propagationSpeed = parseFloat(document.getElementById('propagationSpeed').value);
  let queueingDelay = parseFloat(document.getElementById('queueingDelay').value);
  let processingDelay = parseFloat(document.getElementById('processingDelay').value);

  // Get the selected units
  let dataRateUnit = document.getElementById('dataRateUnit').value;
  let distanceUnit = document.getElementById('distanceUnit').value;
  let dataSizeUnit = document.getElementById('dataSizeUnit').value;
  let propagationSpeedUnit = document.getElementById('propogation speed unit').value;
  let queueingDelayUnit = document.getElementById('queueingDelay speed unit').value;
  let processingDelayUnit = document.getElementById('processingDelay speed unit').value;

  // Validate inputs
  if (isNaN(dataRate) || isNaN(distance) || isNaN(dataSize) || isNaN(packetSize) || isNaN(propagationSpeed) || isNaN(queueingDelay) || isNaN(processingDelay)) {
      alert("Please fill all fields.");
      return;
  }

  // Convert units
  let dataRateBps;
  if (dataRateUnit === "Gbps") {
      dataRateBps = dataRate * 1e9;
  } else if (dataRateUnit === "Mbps") {
      dataRateBps = dataRate * 1e6;
  } else if (dataRateUnit === "Kbps") {
      dataRateBps = dataRate * 1e3;
  } else {
      dataRateBps = dataRate; // Already in bps
  }

  let distanceM;
  if (distanceUnit === "km") {
      distanceM = distance * 1000;
  } else if (distanceUnit === "m") {
      distanceM = distance;
  } else if (distanceUnit === "miles") {
      distanceM = distance * 1609.34;
  }

  let dataSizeBits;
  if (dataSizeUnit === "GB") {
      dataSizeBits = dataSize * 8 * 1e9;
  } else if (dataSizeUnit === "MB") {
      dataSizeBits = dataSize * 8 * 1e6;
  } else if (dataSizeUnit === "KB") {
      dataSizeBits = dataSize * 8 * 1e3;
  } else {
      dataSizeBits = dataSize * 8; // Bytes to bits
  }

  let packetSizeBits = (packetSize + macOverhead) * 8;

  if (propagationSpeedUnit === "m/s8") {
      propagationSpeed *= 1e8; // Convert to m/s
  }

  if (queueingDelayUnit === "s") {
      queueingDelay *= 1000; // Convert to ms
  }

  if (processingDelayUnit === "s") {
      processingDelay *= 1000; // Convert to ms
  }

  // Calculate delays and total packets
  let propagationDelayMs = calculatePropagationDelay(distanceM, propagationSpeed);
  let transmissionDelayMs = calculateTransmissionDelay(packetSizeBits, dataRateBps);
  let totalPackets = calculateTotalPackets(dataSizeBits, packetSizeBits);
  let rttMs = calculateRTT(propagationDelayMs, queueingDelay, processingDelay);

  // Show direct solution
  document.getElementById('directSolution').style.display = 'block';
  document.getElementById('directResult').innerHTML = `
      <strong>Propagation Delay</strong>: ${propagationDelayMs.toFixed(3)} ms<br>
      <strong>Transmission Delay</strong>: ${transmissionDelayMs.toFixed(3)} ms<br>
      <strong>Total Packets</strong>: ${totalPackets.toFixed(2)} packets<br>
      <strong>Round-trip time (RTT)</strong>: ${rttMs.toFixed(3)} ms
  `;

  // Show full solution button
  document.getElementById('fullSolutionBtn').style.display = 'inline-block';

  // Event listener for full solution
  document.getElementById('fullSolutionBtn').addEventListener('click', function () {
      document.getElementById('fullSolution').style.display = 'block';
      document.getElementById('output').innerText = `
Propagation Delay:
Propagation Delay = Distance / Propagation Speed 
Propagation Delay = ${distanceM} meters / ${propagationSpeed} m/s 
Propagation Delay = ${propagationDelayMs.toFixed(3)} ms

Transmission Delay:
Transmission Delay = Packet Size / Data Rate 
Transmission Delay = ${packetSizeBits} bits / ${dataRateBps} bps  
Transmission Delay = ${transmissionDelayMs.toFixed(3)} ms

Total Packets:
Total Packets = Data Size / Packet Size 
Total Packets = ${dataSizeBits} bits / ${packetSizeBits} bits 
Total Packets = ${totalPackets.toFixed(2)} packets

Round-trip time (RTT):
RTT = 2 * (Propagation Delay + Queueing Delay + Processing Delay) 
RTT = 2 * (${propagationDelayMs.toFixed(3)} ms + ${queueingDelay} ms + ${processingDelay} ms) 
RTT = ${rttMs.toFixed(3)} ms
      `;
  });
});

// Function to calculate propagation delay
function calculatePropagationDelay(distance, propagationSpeed) {
  return (distance / propagationSpeed) * 1000; // Return delay in milliseconds
}

// Function to calculate transmission delay
function calculateTransmissionDelay(packetSizeBits, dataRateBps) {
  return (packetSizeBits / dataRateBps) * 1000; // Return delay in milliseconds
}

// Function to calculate RTT
function calculateRTT(propagationDelayMs, queueingDelayMs, processingDelayMs) {
  return 2 * (propagationDelayMs + queueingDelayMs + processingDelayMs); // Round-trip time
}

// Function to calculate total packets
function calculateTotalPackets(dataSizeBits, packetSizeBits) {
  return dataSizeBits / packetSizeBits;
}


const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 100;
const mouse = { x: null, y: null, radius: 150 };

canvas.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

class Particle {
    constructor(x, y, size, speedX, speedY) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
    }

    update() {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            const angle = Math.atan2(dy, dx);
            const force = (mouse.radius - distance) / mouse.radius;
            const forceX = force * Math.cos(angle);
            const forceY = force * Math.sin(angle);

            this.x += forceX * 5;
            this.y += forceY * 5;
        } else {
            this.x += this.speedX;
            this.y += this.speedY;
        }

        if (this.x > canvas.width || this.x < 0 || this.y > canvas.height || this.y < 0) {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
        }
    }

    draw() {
        ctx.fillStyle = '#00e639';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}

function initParticles() {
    for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 3 + 1;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const speedX = Math.random() * 0.5 - 0.25;
        const speedY = Math.random() * 0.5 - 0.25;
        particles.push(new Particle(x, y, size, speedX, speedY));
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
        particle.update();
        particle.draw();
    });
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});