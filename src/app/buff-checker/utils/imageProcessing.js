// Constants for buff icon detection
const BUFF_ICON_SIZE = 32; // Updated to match actual icon size
const SIMILARITY_THRESHOLD = 0.75;
const MIN_PIXEL_DENSITY = 0.3; // Increased to avoid detecting sparse regions
const MAX_PIXEL_DENSITY = 0.9; // Decreased to avoid solid blocks
const SCAN_STEP = 16; // Half of icon size for overlap
const EDGE_THRESHOLD = 40; // Minimum edge strength to consider

// Color ranges for timer overlay detection
const TIMER_OVERLAY = {
    maxBrightness: 100,
    minAlpha: 50,
    maxAlpha: 200
};

// Reference icons cache
let referenceIcons = null;

async function loadReferenceIcons() {
    if (referenceIcons) return referenceIcons;

    console.log('Loading reference icons...');
    referenceIcons = {};
    const categories = {
        skills: ['echo', 'fame', 'familiars', 'guild-boss-slayers', 'guild-for-the-guild', 
                'guild-hard-hitter', 'guild-undeterred', 'home'],
        stackingConsumables: ['mp-red', 'mp-green', 'mp-blue', 'candied-apple', 'legions-might',
                            'blessing-of-the-guild', 'ursus', 'mvp'],
        eventBuffs: ['vip'],
        alchemy: ['exceptional-boost', 'legendary-hero'],
        smithing: ['weapon-tempering'],
        advStatPotions: ['adv-stat-pill', 'adv-stat-pill2', 'adv-stat-potion', 'adv-stat-potion2'],
        nonstackingConsumables: {
            group1: ['ssiws-cheese', 'onyx-apple', 'tengu', 'cold-winter-energy',
                    'overpower', 'warrior-elixir', 'wizard-elixir', 'baby-dragon-food',
                    'cider', 'energizer-drink'],
            group2: ['red-star', 'boss-rush']
        }
    };

    const prefixes = {
        skills: 'skill',
        stackingConsumables: 'stack',
        eventBuffs: 'event',
        alchemy: 'alchemy',
        smithing: 'smithing',
        advStatPotions: 'adv',
        nonstackingConsumables: 'nonstack'
    };

    for (const [category, items] of Object.entries(categories)) {
        if (category === 'nonstackingConsumables') {
            referenceIcons[category] = {
                group1: {},
                group2: {}
            };
            
            // Process group1
            for (const buff of items.group1) {
                try {
                    const iconPath = `/images/buffs/${prefixes[category]}-${buff}.png`;
                    console.log(`Loading icon: ${iconPath}`);
                    const features = await loadAndExtractFeatures(iconPath);
                    referenceIcons[category].group1[buff] = features;
                    console.log(`Successfully loaded: ${iconPath}`);
                } catch (error) {
                    console.warn(`Failed to load reference icon: ${prefixes[category]}-${buff}.png`, error);
                }
            }
            
            // Process group2
            for (const buff of items.group2) {
                try {
                    const iconPath = `/images/buffs/${prefixes[category]}-${buff}.png`;
                    console.log(`Loading icon: ${iconPath}`);
                    const features = await loadAndExtractFeatures(iconPath);
                    referenceIcons[category].group2[buff] = features;
                    console.log(`Successfully loaded: ${iconPath}`);
                } catch (error) {
                    console.warn(`Failed to load reference icon: ${prefixes[category]}-${buff}.png`, error);
                }
            }
        } else {
            referenceIcons[category] = {};
            const prefix = prefixes[category];
            
            for (const id of items) {
                try {
                    const iconPath = `/images/buffs/${prefix}-${id}.png`;
                    console.log(`Loading icon: ${iconPath}`);
                    const features = await loadAndExtractFeatures(iconPath);
                    referenceIcons[category][id] = features;
                    console.log(`Successfully loaded: ${iconPath}`);
                } catch (error) {
                    console.warn(`Failed to load reference icon: ${prefix}-${id}.png`, error);
                }
            }
        }
    }

    console.log('Finished loading reference icons');
    return referenceIcons;
}

async function loadAndExtractFeatures(iconPath) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = BUFF_ICON_SIZE;
            canvas.height = BUFF_ICON_SIZE;
            const ctx = canvas.getContext('2d');
            
            ctx.drawImage(img, 0, 0, BUFF_ICON_SIZE, BUFF_ICON_SIZE);
            const imageData = ctx.getImageData(0, 0, BUFF_ICON_SIZE, BUFF_ICON_SIZE);
            const features = calculateIconFeatures(imageData.data);
            resolve(features);
        };
        img.onerror = reject;
        img.src = iconPath;
    });
}

let orb = null;
let buffDescriptors = null;

export async function initializeBuffDetection() {
    if (!window.cv) {
        console.warn('OpenCV not loaded yet');
        return;
    }
    
    if (!orb) {
        orb = new cv.AKAZE();
    }
    
    if (!buffDescriptors) {
        buffDescriptors = {};
        const categories = {
            skills: ['echo', 'fame', 'familiars', 'guild-boss-slayers', 'guild-for-the-guild', 
                    'guild-hard-hitter', 'guild-undeterred', 'home'],
            stackingConsumables: ['mp-red', 'mp-green', 'mp-blue', 'candied-apple', 'legions-might',
                                'blessing-of-the-guild', 'ursus', 'mvp'],
            eventBuffs: ['vip'],
            alchemy: ['exceptional-boost', 'legendary-hero'],
            smithing: ['weapon-tempering'],
            advStatPotions: ['adv-stat-pill', 'adv-stat-pill2', 'adv-stat-potion', 'adv-stat-potion2'],
            nonstackingConsumables: {
                group1: ['ssiws-cheese', 'onyx-apple', 'tengu', 'cold-winter-energy',
                        'overpower', 'warrior-elixir', 'wizard-elixir', 'baby-dragon-food',
                        'cider', 'energizer-drink'],
                group2: ['red-star', 'boss-rush']
            }
        };

        const prefixes = {
            skills: 'skill',
            stackingConsumables: 'stack',
            eventBuffs: 'event',
            alchemy: 'alchemy',
            smithing: 'smithing',
            advStatPotions: 'adv',
            nonstackingConsumables: 'nonstack'
        };

        for (const [category, items] of Object.entries(categories)) {
            if (category === 'nonstackingConsumables') {
                buffDescriptors[category] = {
                    group1: {},
                    group2: {}
                };
                
                // Process group1
                for (const buff of items.group1) {
                    try {
                        const img = await loadImage(`/images/buffs/${prefixes[category]}-${buff}.png`);
                        const descriptors = await processReferenceIcon(img);
                        buffDescriptors[category].group1[buff] = descriptors;
                    } catch (error) {
                        console.warn(`Failed to load reference icon: ${prefixes[category]}-${buff}.png`, error);
                    }
                }
                
                // Process group2
                for (const buff of items.group2) {
                    try {
                        const img = await loadImage(`/images/buffs/${prefixes[category]}-${buff}.png`);
                        const descriptors = await processReferenceIcon(img);
                        buffDescriptors[category].group2[buff] = descriptors;
                    } catch (error) {
                        console.warn(`Failed to load reference icon: ${prefixes[category]}-${buff}.png`, error);
                    }
                }
            } else {
                buffDescriptors[category] = {};
                const prefix = prefixes[category];
                
                for (const buff of items) {
                    try {
                        const img = await loadImage(`/images/buffs/${prefix}-${buff}.png`);
                        const descriptors = await processReferenceIcon(img);
                        buffDescriptors[category][buff] = descriptors;
                    } catch (error) {
                        console.warn(`Failed to load reference icon: ${prefix}-${buff}.png`, error);
                    }
                }
            }
        }
    }
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

async function processReferenceIcon(img) {
    const mat = cv.imread(img);
    const resized = new cv.Mat();
    const dsize = new cv.Size(mat.cols * 5, mat.rows * 5);
    cv.resize(mat, resized, dsize, 0, 0, cv.INTER_AREA);
    
    const gray = new cv.Mat();
    cv.cvtColor(resized, gray, cv.COLOR_BGRA2GRAY);
    
    const keypoints = new cv.KeyPointVector();
    const descriptors = new cv.Mat();
    orb.detectAndCompute(gray, new cv.Mat(), keypoints, descriptors);
    
    mat.delete();
    resized.delete();
    gray.delete();
    keypoints.delete();
    
    return descriptors;
}

export async function processBuffImage(imageData) {
    if (!orb || !buffDescriptors) {
        await initializeBuffDetection();
    }

    const img = await loadImage(imageData);
    const mat = cv.imread(img);
    const resized = new cv.Mat();
    const dsize = new cv.Size(mat.cols * 5, mat.rows * 5);
    cv.resize(mat, resized, dsize, 0, 0, cv.INTER_AREA);
    
    const gray = new cv.Mat();
    cv.cvtColor(resized, gray, cv.COLOR_BGRA2GRAY);
    
    const keypoints = new cv.KeyPointVector();
    const descriptors = new cv.Mat();
    orb.detectAndCompute(gray, new cv.Mat(), keypoints, descriptors);
    
    const detected = {
        skills: [],
        stackingConsumables: [],
        eventBuffs: [],
        alchemy: [],
        smithing: [],
        advStatPotions: [],
        nonstackingConsumables: {
            group1: [],
            group2: []
        }
    };

    const bf = new cv.BFMatcher();
    const matches = new cv.DMatchVectorVector();
    const knnDistance = 0.7;

    for (const [category, buffs] of Object.entries(buffDescriptors)) {
        if (category === 'nonstackingConsumables') {
            for (const [group, buffsInGroup] of Object.entries(buffs)) {
                for (const [buffId, buffDescriptor] of Object.entries(buffsInGroup)) {
                    try {
                        bf.knnMatch(buffDescriptor, descriptors, matches, 2);
                        
                        let goodMatches = 0;
                        for (let i = 0; i < matches.size(); ++i) {
                            const match = matches.get(i);
                            const dMatch1 = match.get(0);
                            const dMatch2 = match.get(1);
                            
                            if (dMatch1.distance <= dMatch2.distance * knnDistance) {
                                goodMatches++;
                            }
                        }
                        
                        if (goodMatches > 1) {
                            detected.nonstackingConsumables[group].push(buffId);
                        }
                    } catch (error) {
                        console.warn(`Error matching ${category}/${group}/${buffId}:`, error);
                    }
                }
            }
        } else {
            for (const [buffId, buffDescriptor] of Object.entries(buffs)) {
                try {
                    bf.knnMatch(buffDescriptor, descriptors, matches, 2);
                    
                    let goodMatches = 0;
                    for (let i = 0; i < matches.size(); ++i) {
                        const match = matches.get(i);
                        const dMatch1 = match.get(0);
                        const dMatch2 = match.get(1);
                        
                        if (dMatch1.distance <= dMatch2.distance * knnDistance) {
                            goodMatches++;
                        }
                    }
                    
                    if (goodMatches > 1) {
                        detected[category].push(buffId);
                    }
                } catch (error) {
                    console.warn(`Error matching ${category}/${buffId}:`, error);
                }
            }
        }
    }

    // Cleanup
    mat.delete();
    resized.delete();
    gray.delete();
    keypoints.delete();
    descriptors.delete();
    matches.delete();

    return detected;
}

async function detectBuffs(imageData) {
    console.time('buff-detection');
    const buffIcons = extractBuffIcons(imageData);
    console.log('Found', buffIcons.length, 'potential buff icons');
    
    const detected = {
        skills: [],
        stackingConsumables: [],
        eventBuffs: [],
        alchemy: [],
        smithing: [],
        advStatPotions: [],
        nonstackingConsumables: {
            group1: [],
            group2: []
        }
    };

    // Process each icon
    for (const icon of buffIcons) {
        try {
            const cleanIcon = removeTimerOverlay(icon);
            const match = await findMatchingBuff(cleanIcon);
            if (match) {
                console.log('Found match:', match);
                const { category, id, group } = match;
                if (category === 'nonstackingConsumables') {
                    detected[category][group].push(id);
                } else {
                    detected[category].push(id);
                }
            }
        } catch (error) {
            console.error('Error processing icon:', error);
        }
    }

    console.log('Detection results:', detected);
    console.timeEnd('buff-detection');
    return detected;
}

function extractBuffIcons(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const buffIcons = [];
    const debugCanvas = document.createElement('canvas');
    debugCanvas.width = width;
    debugCanvas.height = height;
    const debugCtx = debugCanvas.getContext('2d');
    debugCtx.putImageData(imageData, 0, 0);

    // Different colors for different detection criteria
    debugCtx.strokeStyle = 'yellow'; // Initial candidates
    debugCtx.lineWidth = 1;

    // Scan the image for potential buff icons
    for (let y = 0; y < height - BUFF_ICON_SIZE; y += SCAN_STEP) {
        for (let x = 0; x < width - BUFF_ICON_SIZE; x += SCAN_STEP) {
            const region = extractRegion(imageData, x, y, BUFF_ICON_SIZE);
            const { density, hasEdges, hasBorder } = analyzeRegion(region);
            
            // Draw all candidates in yellow
            if (density >= MIN_PIXEL_DENSITY && density <= MAX_PIXEL_DENSITY) {
                debugCtx.strokeStyle = 'yellow';
                debugCtx.strokeRect(x, y, BUFF_ICON_SIZE, BUFF_ICON_SIZE);
                
                // If it has strong edges and a border, mark it in green
                if (hasEdges && hasBorder) {
                    debugCtx.strokeStyle = 'lime';
                    debugCtx.strokeRect(x+1, y+1, BUFF_ICON_SIZE-2, BUFF_ICON_SIZE-2);
                    buffIcons.push(region);
                }
            }
        }
    }

    // Add debug visualization
    const debugImage = debugCanvas.toDataURL();
    if (typeof window !== 'undefined') {
        const existingDebug = document.getElementById('buff-debug');
        if (existingDebug) existingDebug.remove();
        
        const debugDiv = document.createElement('div');
        debugDiv.id = 'buff-debug';
        debugDiv.innerHTML = `
            <div style="position: fixed; top: 10px; right: 10px; z-index: 1000; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 5px; color: white;">
                <h3 style="margin: 0 0 10px 0;">Debug View</h3>
                <div style="margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; margin-bottom: 5px;">
                        <div style="width: 20px; height: 2px; background: yellow; margin-right: 5px;"></div>
                        <span>Potential icons</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <div style="width: 20px; height: 2px; background: lime; margin-right: 5px;"></div>
                        <span>Confirmed icons</span>
                    </div>
                </div>
                <img src="${debugImage}" style="max-width: 300px; border: 2px solid #333;" />
            </div>`;
        document.body.appendChild(debugDiv);
    }

    console.log(`Found ${buffIcons.length} potential buff icons`);
    return buffIcons;
}

function analyzeRegion(region) {
    const data = region.data;
    let nonEmptyPixels = 0;
    let edgePixels = 0;
    let borderPixels = 0;
    const totalPixels = BUFF_ICON_SIZE * BUFF_ICON_SIZE;
    
    // Check border pixels
    for (let i = 0; i < BUFF_ICON_SIZE; i++) {
        for (let j = 0; j < BUFF_ICON_SIZE; j++) {
            const idx = (i * BUFF_ICON_SIZE + j) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];
            
            // Count non-empty pixels
            if (a > 20 && (r > 20 || g > 20 || b > 20)) {
                nonEmptyPixels++;
                
                // Check for edges (only for inner pixels)
                if (i > 0 && i < BUFF_ICON_SIZE - 1 && j > 0 && j < BUFF_ICON_SIZE - 1) {
                    const up = data[(i - 1) * BUFF_ICON_SIZE * 4 + j * 4];
                    const down = data[(i + 1) * BUFF_ICON_SIZE * 4 + j * 4];
                    const left = data[i * BUFF_ICON_SIZE * 4 + (j - 1) * 4];
                    const right = data[i * BUFF_ICON_SIZE * 4 + (j + 1) * 4];
                    
                    const edgeStrength = Math.max(
                        Math.abs(up - data[idx]),
                        Math.abs(down - data[idx]),
                        Math.abs(left - data[idx]),
                        Math.abs(right - data[idx])
                    );
                    
                    if (edgeStrength > EDGE_THRESHOLD) {
                        edgePixels++;
                    }
                }
                
                // Check if it's a border pixel
                if (i === 0 || i === BUFF_ICON_SIZE - 1 || j === 0 || j === BUFF_ICON_SIZE - 1) {
                    borderPixels++;
                }
            }
        }
    }
    
    const density = nonEmptyPixels / totalPixels;
    const hasEdges = edgePixels > (totalPixels * 0.1); // At least 10% edge pixels
    const hasBorder = borderPixels > (BUFF_ICON_SIZE * 2); // At least half the border pixels
    
    return { density, hasEdges, hasBorder };
}

function calculatePixelDensity(region) {
    let nonEmptyPixels = 0;
    const totalPixels = region.width * region.height;
    const data = region.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Consider a pixel non-empty if it has significant color or alpha
        if (a > 20 && (r > 20 || g > 20 || b > 20)) {
            nonEmptyPixels++;
        }
    }

    return nonEmptyPixels / totalPixels;
}

function extractRegion(imageData, x, y, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, -x, -y);
    return ctx.getImageData(0, 0, size, size);
}

function removeTimerOverlay(iconData) {
    const cleanData = new Uint8ClampedArray(iconData);

    for (let i = 0; i < cleanData.length; i += 4) {
        const r = cleanData[i];
        const g = cleanData[i + 1];
        const b = cleanData[i + 2];
        const a = cleanData[i + 3];

        // Check if this pixel is likely part of the timer overlay
        const brightness = (r + g + b) / 3;
        const isOverlay = brightness <= TIMER_OVERLAY.maxBrightness && 
                         a >= TIMER_OVERLAY.minAlpha && 
                         a <= TIMER_OVERLAY.maxAlpha;

        if (isOverlay) {
            // Make overlay pixels transparent
            cleanData[i + 3] = 0;
        }
    }

    return cleanData;
}

async function findMatchingBuff(iconData) {
    if (!referenceIcons) {
        console.warn('No reference icons loaded!');
        return null;
    }

    const iconFeatures = calculateIconFeatures(iconData);
    let bestMatch = null;
    let bestSimilarity = 0;

    // Compare with each reference icon
    for (const [category, icons] of Object.entries(referenceIcons)) {
        if (category === 'nonstackingConsumables') {
            for (const [group, buffs] of Object.entries(icons)) {
                for (const [id, refFeatures] of Object.entries(buffs)) {
                    const similarity = calculateFeatureSimilarity(iconFeatures, refFeatures);
                    console.log(`Comparing with ${category}/${group}/${id}: similarity = ${similarity}`);
                    if (similarity > SIMILARITY_THRESHOLD && similarity > bestSimilarity) {
                        bestSimilarity = similarity;
                        bestMatch = { category, id, group };
                        console.log(`New best match: ${category}/${group}/${id} (${similarity})`);
                    }
                }
            }
        } else {
            for (const [id, refFeatures] of Object.entries(icons)) {
                const similarity = calculateFeatureSimilarity(iconFeatures, refFeatures);
                console.log(`Comparing with ${category}/${id}: similarity = ${similarity}`);
                if (similarity > SIMILARITY_THRESHOLD && similarity > bestSimilarity) {
                    bestSimilarity = similarity;
                    bestMatch = { category, id };
                    console.log(`New best match: ${category}/${id} (${similarity})`);
                }
            }
        }
    }

    return bestMatch;
}

function calculateIconFeatures(iconData) {
    // Calculate various features for icon matching
    const features = {
        edgeHistogram: new Array(8).fill(0),  // Edge direction histogram
        colorHistogram: new Array(16).fill(0), // Simplified color histogram
        moments: [],                           // Image moments
    };

    // Calculate edge directions using Sobel operator
    for (let y = 1; y < BUFF_ICON_SIZE - 1; y++) {
        for (let x = 1; x < BUFF_ICON_SIZE - 1; x++) {
            const idx = (y * BUFF_ICON_SIZE + x) * 4;
            
            // Simplified Sobel operator for edge detection
            const gx = (
                -1 * iconData[((y-1) * BUFF_ICON_SIZE + (x-1)) * 4] +
                 1 * iconData[((y-1) * BUFF_ICON_SIZE + (x+1)) * 4] +
                -2 * iconData[(y * BUFF_ICON_SIZE + (x-1)) * 4] +
                 2 * iconData[(y * BUFF_ICON_SIZE + (x+1)) * 4] +
                -1 * iconData[((y+1) * BUFF_ICON_SIZE + (x-1)) * 4] +
                 1 * iconData[((y+1) * BUFF_ICON_SIZE + (x+1)) * 4]
            ) / 8;

            const gy = (
                -1 * iconData[((y-1) * BUFF_ICON_SIZE + (x-1)) * 4] +
                -2 * iconData[((y-1) * BUFF_ICON_SIZE + x) * 4] +
                -1 * iconData[((y-1) * BUFF_ICON_SIZE + (x+1)) * 4] +
                 1 * iconData[((y+1) * BUFF_ICON_SIZE + (x-1)) * 4] +
                 2 * iconData[((y+1) * BUFF_ICON_SIZE + x) * 4] +
                 1 * iconData[((y+1) * BUFF_ICON_SIZE + (x+1)) * 4]
            ) / 8;

            const magnitude = Math.sqrt(gx * gx + gy * gy);
            if (magnitude > 30) {  // Threshold for edge detection
                const angle = Math.atan2(gy, gx);
                const bin = Math.floor((angle + Math.PI) / (Math.PI / 4));
                features.edgeHistogram[bin]++;
            }
        }
    }

    return features;
}

function calculateFeatureSimilarity(features1, features2) {
    // Calculate similarity between edge histograms
    const edgeSimilarity = calculateHistogramSimilarity(
        features1.edgeHistogram,
        features2.edgeHistogram
    );

    // Calculate similarity between color histograms
    const colorSimilarity = calculateHistogramSimilarity(
        features1.colorHistogram,
        features2.colorHistogram
    );

    // Combine similarities with weights
    return (edgeSimilarity * 0.7 + colorSimilarity * 0.3);
}

function calculateHistogramSimilarity(hist1, hist2) {
    const sum1 = hist1.reduce((a, b) => a + b, 0);
    const sum2 = hist2.reduce((a, b) => a + b, 0);
    
    if (sum1 === 0 || sum2 === 0) return 0;

    // Normalize histograms
    const norm1 = hist1.map(v => v / sum1);
    const norm2 = hist2.map(v => v / sum2);

    // Calculate histogram intersection
    let intersection = 0;
    for (let i = 0; i < norm1.length; i++) {
        intersection += Math.min(norm1[i], norm2[i]);
    }

    return intersection;
}
