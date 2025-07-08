/* This file contains the animal SVGs used in the speeded matching task.
 * Researchers can modify these SVGs to change the visual stimuli used in the experiment.
 * Each SVG should be a complete SVG element as a string.
 * 
 * To add new animal SVGs:
 * 1. Go to https://www.svgrepo.com/collection/animal-portrait-vectors/
 * 2. Select an animal SVG
 * 3. Click "Edit SVG" 
 * 4. Copy the SVG code
 * 5. Add it to the array below
 * 
 * Make sure all SVGs have similar dimensions for consistent display.
 */

export const test_items = [
    // Cat SVG
    `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="45" r="25" fill="#FFA500" stroke="#000" stroke-width="2"/>
        <circle cx="42" cy="40" r="3" fill="#000"/>
        <circle cx="58" cy="40" r="3" fill="#000"/>
        <polygon points="45,50 50,55 55,50" fill="#000"/>
        <path d="M30 30 L35 25 L40 30" stroke="#000" stroke-width="2" fill="none"/>
        <path d="M60 30 L65 25 L70 30" stroke="#000" stroke-width="2" fill="none"/>
    </svg>`,
    
    // Dog SVG
    `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="45" rx="28" ry="25" fill="#8B4513" stroke="#000" stroke-width="2"/>
        <circle cx="42" cy="40" r="3" fill="#000"/>
        <circle cx="58" cy="40" r="3" fill="#000"/>
        <ellipse cx="50" cy="55" rx="8" ry="5" fill="#000"/>
        <ellipse cx="35" cy="25" rx="8" ry="12" fill="#8B4513" stroke="#000" stroke-width="2"/>
        <ellipse cx="65" cy="25" rx="8" ry="12" fill="#8B4513" stroke="#000" stroke-width="2"/>
    </svg>`,
    
    // Bird SVG
    `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="45" rx="22" ry="20" fill="#87CEEB" stroke="#000" stroke-width="2"/>
        <circle cx="45" cy="40" r="2" fill="#000"/>
        <polygon points="35,45 25,50 35,55" fill="#FFA500" stroke="#000" stroke-width="1"/>
        <path d="M30 30 Q20 25 15 35" stroke="#000" stroke-width="2" fill="none"/>
        <path d="M70 35 Q80 30 85 40" stroke="#000" stroke-width="2" fill="none"/>
    </svg>`,
    
    // Fish SVG
    `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="45" rx="25" ry="15" fill="#00CED1" stroke="#000" stroke-width="2"/>
        <circle cx="40" cy="42" r="2" fill="#000"/>
        <polygon points="75,45 85,35 85,55" fill="#00CED1" stroke="#000" stroke-width="2"/>
        <path d="M50 30 Q60 25 65 30" stroke="#000" stroke-width="1" fill="none"/>
        <path d="M50 60 Q60 65 65 60" stroke="#000" stroke-width="1" fill="none"/>
    </svg>`,
    
    // Rabbit SVG
    `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="50" rx="20" ry="22" fill="#F5F5DC" stroke="#000" stroke-width="2"/>
        <circle cx="45" cy="45" r="2" fill="#000"/>
        <circle cx="55" cy="45" r="2" fill="#000"/>
        <ellipse cx="50" cy="52" rx="3" ry="2" fill="#FFC0CB"/>
        <ellipse cx="42" cy="25" rx="5" ry="15" fill="#F5F5DC" stroke="#000" stroke-width="2"/>
        <ellipse cx="58" cy="25" rx="5" ry="15" fill="#F5F5DC" stroke="#000" stroke-width="2"/>
        <circle cx="30" cy="65" r="8" fill="#F5F5DC" stroke="#000" stroke-width="2"/>
    </svg>`,
    
    // Elephant SVG
    `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="55" cy="45" rx="25" ry="20" fill="#C0C0C0" stroke="#000" stroke-width="2"/>
        <circle cx="50" cy="40" r="2" fill="#000"/>
        <circle cx="60" cy="40" r="2" fill="#000"/>
        <path d="M35 55 Q25 60 20 70 Q25 75 35 70" stroke="#000" stroke-width="2" fill="#C0C0C0"/>
        <ellipse cx="45" cy="25" rx="8" ry="6" fill="#C0C0C0" stroke="#000" stroke-width="2"/>
        <ellipse cx="65" cy="25" rx="8" ry="6" fill="#C0C0C0" stroke="#000" stroke-width="2"/>
    </svg>`,
    
    // Lion SVG
    `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="45" r="25" fill="#DAA520" stroke="#000" stroke-width="2"/>
        <circle cx="50" cy="45" r="18" fill="#F4A460" stroke="#000" stroke-width="1"/>
        <circle cx="45" cy="40" r="2" fill="#000"/>
        <circle cx="55" cy="40" r="2" fill="#000"/>
        <ellipse cx="50" cy="50" rx="4" ry="3" fill="#000"/>
        <path d="M45 55 Q50 60 55 55" stroke="#000" stroke-width="2" fill="none"/>
    </svg>`,
    
    // Bear SVG
    `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="45" rx="22" ry="20" fill="#8B4513" stroke="#000" stroke-width="2"/>
        <circle cx="35" cy="30" r="8" fill="#8B4513" stroke="#000" stroke-width="2"/>
        <circle cx="65" cy="30" r="8" fill="#8B4513" stroke="#000" stroke-width="2"/>
        <circle cx="45" cy="42" r="2" fill="#000"/>
        <circle cx="55" cy="42" r="2" fill="#000"/>
        <ellipse cx="50" cy="50" rx="5" ry="4" fill="#000"/>
    </svg>`,
    
    // Frog SVG
    `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="50" rx="25" ry="20" fill="#228B22" stroke="#000" stroke-width="2"/>
        <circle cx="42" cy="35" r="6" fill="#228B22" stroke="#000" stroke-width="2"/>
        <circle cx="58" cy="35" r="6" fill="#228B22" stroke="#000" stroke-width="2"/>
        <circle cx="42" cy="35" r="3" fill="#000"/>
        <circle cx="58" cy="35" r="3" fill="#000"/>
        <path d="M40 55 Q50 60 60 55" stroke="#000" stroke-width="2" fill="none"/>
    </svg>`,
    
    // Butterfly SVG
    `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="50" y1="20" x2="50" y2="65" stroke="#000" stroke-width="3"/>
        <ellipse cx="35" cy="35" rx="12" ry="15" fill="#FF69B4" stroke="#000" stroke-width="2"/>
        <ellipse cx="65" cy="35" rx="12" ry="15" fill="#FF69B4" stroke="#000" stroke-width="2"/>
        <ellipse cx="35" cy="55" rx="10" ry="12" fill="#FF1493" stroke="#000" stroke-width="2"/>
        <ellipse cx="65" cy="55" rx="10" ry="12" fill="#FF1493" stroke="#000" stroke-width="2"/>
        <circle cx="50" cy="20" r="3" fill="#000"/>
        <path d="M47 18 L45 15" stroke="#000" stroke-width="2"/>
        <path d="M53 18 L55 15" stroke="#000" stroke-width="2"/>
    </svg>`
];