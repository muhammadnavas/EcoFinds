// Logo Generation Script
// This script can be run in a browser console or with Node.js with appropriate libraries
// to generate PNG versions of the EcoFinds logo

const generateLogoPNG = (size = 512) => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Scale factor for the logo elements
  const scale = size / 100;
  
  // Clear background with transparent
  ctx.clearRect(0, 0, size, size);
  
  // Green leaf
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.moveTo(20 * scale, 50 * scale);
  ctx.quadraticCurveTo(50 * scale, 20 * scale, 80 * scale, 50 * scale);
  ctx.quadraticCurveTo(50 * scale, 30 * scale, 20 * scale, 50 * scale);
  ctx.fill();
  
  // Purple leaf overlay
  ctx.fillStyle = '#8b5cf6';
  ctx.beginPath();
  ctx.moveTo(40 * scale, 50 * scale);
  ctx.quadraticCurveTo(70 * scale, 20 * scale, 80 * scale, 50 * scale);
  ctx.quadraticCurveTo(65 * scale, 30 * scale, 40 * scale, 50 * scale);
  ctx.fill();
  
  // Base arch - green
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.moveTo(10 * scale, 60 * scale);
  ctx.quadraticCurveTo(30 * scale, 40 * scale, 50 * scale, 60 * scale);
  ctx.quadraticCurveTo(70 * scale, 40 * scale, 90 * scale, 60 * scale);
  ctx.quadraticCurveTo(70 * scale, 70 * scale, 50 * scale, 60 * scale);
  ctx.quadraticCurveTo(30 * scale, 70 * scale, 10 * scale, 60 * scale);
  ctx.fill();
  
  // Base arch - purple
  ctx.fillStyle = '#7c3aed';
  ctx.beginPath();
  ctx.moveTo(20 * scale, 70 * scale);
  ctx.quadraticCurveTo(40 * scale, 50 * scale, 60 * scale, 70 * scale);
  ctx.quadraticCurveTo(80 * scale, 50 * scale, 90 * scale, 70 * scale);
  ctx.quadraticCurveTo(80 * scale, 80 * scale, 60 * scale, 70 * scale);
  ctx.quadraticCurveTo(40 * scale, 80 * scale, 20 * scale, 70 * scale);
  ctx.fill();
  
  return canvas;
};

// Function to download the generated logo
const downloadLogo = (size, filename) => {
  const canvas = generateLogoPNG(size);
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

// Usage:
// downloadLogo(192, 'logo192.png');
// downloadLogo(512, 'logo512.png');
// downloadLogo(64, 'favicon-64.png');

console.log('EcoFinds Logo Generator loaded. Use downloadLogo(size, filename) to generate logos.');
console.log('Examples:');
console.log('downloadLogo(192, "logo192.png");');
console.log('downloadLogo(512, "logo512.png");');
console.log('downloadLogo(64, "favicon-64.png");');
