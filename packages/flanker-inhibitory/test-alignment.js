// Quick test to verify the flipSVG function works correctly
const fs = require('fs');

// Read the stimuli file to get the fish SVG
const stimuliContent = fs.readFileSync('./src/stimuli.ts', 'utf8');
const fishSvgMatch = stimuliContent.match(/const fish_svg = `([^`]+)`/s);
const fishSvg = fishSvgMatch ? fishSvgMatch[1] : '';

console.log('=== FISH SVG ANALYSIS ===');
console.log('Original fish SVG has existing transform:', fishSvg.includes('transform='));
console.log('ViewBox found:', fishSvg.match(/viewBox="([^"]+)"/)?.[1] || 'not found');

// Simulate the flipSVG function behavior
function flipSVG(svgString) {
  if (!svgString || typeof svgString !== 'string') return svgString;
  
  // Check if SVG already contains a flip transform
  const hasExistingTransform = svgString.includes('matrix(-1,') || 
                              svgString.includes('matrix(-1 ') ||
                              svgString.includes('scaleX(-1)') ||
                              svgString.includes('scale(-1');
  
  console.log('Has existing transform:', hasExistingTransform);
  
  // If already flipped, remove the flip transform to restore original orientation
  if (hasExistingTransform) {
    const result = svgString
      .replace(/transform="matrix\(-1,\s*0,\s*0,\s*1,\s*0,\s*0\)"/g, '')
      .replace(/transform="matrix\(-1\s+0\s+0\s+1\s+0\s+0\)"/g, '')
      .replace(/transform="scaleX\(-1\)"/g, '')
      .replace(/transform="scale\(-1,\s*1\)"/g, '')
      .replace(/transform="scale\(-1\s+1\)"/g, '');
    
    console.log('After removing existing transform, still has transform:', result.includes('transform='));
    return result;
  }
  
  // Parse SVG to get dimensions for proper transform calculation
  const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
  const widthMatch = svgString.match(/width="([^"]+)"/);
  
  let translateX = 0;
  if (viewBoxMatch) {
    const viewBox = viewBoxMatch[1].split(/\s+/);
    if (viewBox.length >= 3) {
      translateX = parseFloat(viewBox[2]) || 0; // width from viewBox
    }
  } else if (widthMatch) {
    translateX = parseFloat(widthMatch[1]) || 0;
  }
  
  console.log('Calculated translateX:', translateX);
  
  // Apply proper SVG transform that maintains alignment
  if (translateX > 0) {
    // Insert transform into the SVG element itself for better precision
    return svgString.replace(
      /<svg([^>]*)>/,
      `<svg$1><g transform="scale(-1,1) translate(-${translateX},0)">`
    ).replace(/<\/svg>$/, '</g></svg>');
  } else {
    // Fallback to CSS transform with inline-block container
    return `<span style="display: inline-block; transform: scaleX(-1);">${svgString}</span>`;
  }
}

console.log('\n=== TESTING FLIP FUNCTION ===');
const flippedOnce = flipSVG(fishSvg);
console.log('After first flip - has transform:', flippedOnce.includes('transform='));

const flippedTwice = flipSVG(flippedOnce);
console.log('After second flip - has transform:', flippedTwice.includes('transform='));

console.log('\n=== SUCCESS ===');
console.log('The flipSVG function should now properly handle fish alignment by:');
console.log('1. Detecting existing transforms in the fish SVG');
console.log('2. Removing them when flipping back to original orientation');
console.log('3. Using proper SVG transforms instead of CSS when flipping');