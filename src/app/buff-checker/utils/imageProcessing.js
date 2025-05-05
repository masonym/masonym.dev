import { buffCategories } from '../data/buffData';

// Prefix mapping for icon filenames
const PREFIXES = {
    skills: 'skill',
    stackingConsumables: 'stack',
    eventBuffs: 'event',
    alchemy: 'alchemy',
    smithing: 'smithing',
    advStatPotions: 'adv',
    nonstackingConsumables: 'nonstack'
};

const BUFF_ICON_SIZE = 32;                // icon dimensions
const SCAN_STEP = 16;                     // scan step (half icon size)
const MATCH_DISTANCE_THRESHOLD = 50;      // Hamming distance threshold for "good" match (relaxed)
const MATCH_COUNT_THRESHOLD = 3;         // minimum good matches to confirm buff (lowered)
const MATCH_RATIO = 0.9;                // knn-match ratio threshold for good match (relaxed)
const TEMPLATE_MATCH_THRESHOLD = 0.8;

let orb = null;
let bf = null;
let buffDescriptors = null;
let buffTemplates = null;

// Load image element
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
}

// Extract region from imageData
function extractRegion(imageData, x, y, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, -x, -y);
    return ctx.getImageData(0, 0, size, size);
}

// No-op overlay removal stub
function removeTimerOverlay(data) {
    return data;
}

// Pre-compute ORB descriptors for each buff icon
async function loadReferenceDescriptors() {
    console.log('loadReferenceDescriptors: start');
    if (buffDescriptors) return buffDescriptors;
    console.log('loadReferenceDescriptors: no cache, proceeding');
    // init ORB (robust)
    if (!orb) {
        console.log('loadReferenceDescriptors: initializing ORB detector');
        if (typeof cv.ORB_create === 'function') {
            orb = cv.ORB_create(1000, 1.2, 8);
        } else if (cv.ORB && typeof cv.ORB.create === 'function') {
            orb = cv.ORB.create(1000, 1.2, 8);
        } else if (typeof cv.ORB === 'function') {
            orb = new cv.ORB();
        } else {
            console.warn('cv.ORB unavailable, trying AKAZE');
            if (typeof cv.AKAZE_create === 'function') orb = cv.AKAZE_create();
            else if (cv.AKAZE && typeof cv.AKAZE.create === 'function') orb = cv.AKAZE.create();
            else if (typeof cv.AKAZE === 'function') orb = new cv.AKAZE();
            else throw new Error('No ORB or AKAZE feature detector available');
            console.warn('loadReferenceDescriptors: using AKAZE for feature detection');
        }
        // boost max features if possible
        if (orb.setMaxFeatures) orb.setMaxFeatures(1000);
    }
    console.log('loadReferenceDescriptors: initializing BFMatcher');
    if (!bf) bf = new cv.BFMatcher(cv.NORM_HAMMING, false); // disable crossCheck for knnMatch
    buffDescriptors = {};
    console.log('loadReferenceDescriptors: loading categories');
    for (const [category, data] of Object.entries(buffCategories)) {
        console.log(`loadReferenceDescriptors: processing category ${category}`);
        if (category === 'nonstackingConsumables') {
            buffDescriptors[category] = { group1: {}, group2: {} };
            for (const group of ['group1', 'group2']) {
                for (const buff of data[group].buffs) {
                    const prefix = PREFIXES[category] || category;
                    const path = `/images/buffs/${prefix}-${buff.id}.png`;
                    try {
                        const img = await loadImage(path);
                        buffDescriptors[category][group][buff.id] = await processReferenceIcon(img);
                    } catch (err) {
                        console.warn('Failed to load icon:', path, err);
                    }
                }
            }
        } else {
            buffDescriptors[category] = {};
            for (const buff of data.buffs) {
                const prefix = PREFIXES[category] || category;
                const path = `/images/buffs/${prefix}-${buff.id}.png`;
                try {
                    const img = await loadImage(path);
                    buffDescriptors[category][buff.id] = await processReferenceIcon(img);
                    console.log(`Loaded reference ${buff.id}`);
                } catch (err) {
                    console.warn('Failed to load icon:', path, err);
                }
            }
        }
    }
    console.log('loadReferenceDescriptors: done');
    // Log descriptor counts
    for (const [category, icons] of Object.entries(buffDescriptors)) {
        if (category === 'nonstackingConsumables') {
            for (const group of ['group1','group2']) {
                for (const [id, desc] of Object.entries(icons[group])) {
                    console.log(`Descriptor [${category}][${group}][${id}]: rows=${desc.rows}`);
                }
            }
        } else {
            for (const [id, desc] of Object.entries(icons)) {
                console.log(`Descriptor [${category}][${id}]: rows=${desc.rows}`);
            }
        }
    }
    return buffDescriptors;
}

// Compute ORB descriptors for a reference icon image
async function processReferenceIcon(img) {
    // Draw and upscale reference icon
    const canvas = document.createElement('canvas');
    canvas.width = BUFF_ICON_SIZE;
    canvas.height = BUFF_ICON_SIZE;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, BUFF_ICON_SIZE, BUFF_ICON_SIZE);
    const mat = cv.imread(canvas);
    const resized = new cv.Mat();
    cv.resize(mat, resized, new cv.Size(BUFF_ICON_SIZE*4, BUFF_ICON_SIZE*4), 0, 0, cv.INTER_CUBIC);
    mat.delete();
    // Grayscale
    const gray = new cv.Mat();
    cv.cvtColor(resized, gray, cv.COLOR_RGBA2GRAY);
    resized.delete();
    console.log('Reference scaled gray size:', gray.rows, gray.cols);
    // ORB detect/compute
    const keypoints = new cv.KeyPointVector();
    const descriptors = new cv.Mat();
    orb.detect(gray, keypoints);
    orb.compute(gray, keypoints, descriptors);
    gray.delete(); keypoints.delete();
    const refCount = descriptors.rows;
    if (refCount === 0) console.warn('Empty ORB descriptors for reference icon', img.src);
    else console.log('Reference descriptors count:', refCount);
    return descriptors;
}

// Preload reference icon gray mats
async function loadReferenceTemplates() {
    if (buffTemplates) return buffTemplates;
    buffTemplates = {};
    for (const [category,data] of Object.entries(buffCategories)) {
        if (category === 'nonstackingConsumables') {
            buffTemplates[category] = { group1:{}, group2:{} };
            for (const group of ['group1','group2']) {
                for (const buff of data[group].buffs) {
                    const path = `/images/buffs/${PREFIXES[category]}-${buff.id}.png`;
                    try {
                        const img = await loadImage(path);
                        const c = document.createElement('canvas');
                        c.width = c.height = BUFF_ICON_SIZE;
                        c.getContext('2d').drawImage(img, 0, 0, BUFF_ICON_SIZE, BUFF_ICON_SIZE);
                        const mat = cv.imread(c);
                        const gray = new cv.Mat();
                        cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
                        mat.delete();
                        buffTemplates[category][group][buff.id] = gray;
                        console.log(`Loaded template [${category}][${group}][${buff.id}] size: ${gray.rows}x${gray.cols}`);
                    } catch(e) { console.warn('Template load failed', path, e); }
                }
            }
        } else {
            buffTemplates[category] = {};
            for (const buff of data.buffs) {
                const path = `/images/buffs/${PREFIXES[category]}-${buff.id}.png`;
                try {
                    const img = await loadImage(path);
                    const c = document.createElement('canvas');
                    c.width = c.height = BUFF_ICON_SIZE;
                    c.getContext('2d').drawImage(img, 0, 0, BUFF_ICON_SIZE, BUFF_ICON_SIZE);
                    const mat = cv.imread(c);
                    const gray = new cv.Mat();
                    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
                    mat.delete();
                    buffTemplates[category][buff.id] = gray;
                    console.log(`Loaded template [${category}][${buff.id}] size: ${gray.rows}x${gray.cols}`);
                } catch(e) { console.warn('Template load failed', path, e); }
            }
        }
    }
    return buffTemplates;
}

// Initialize detection by loading reference templates
export async function initializeBuffDetection() {
    if (!window.cv) { console.warn('OpenCV not loaded'); return; }
    await loadReferenceTemplates();
}

// Detect buffs in screenshot using template matching
export async function processBuffImage(imageSrc) {
    if (!window.cv) { console.warn('OpenCV not loaded'); return {}; }
    await initializeBuffDetection();
    // Load screenshot and convert to grayscale
    const img = await loadImage(imageSrc);
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = img.width; screenCanvas.height = img.height;
    screenCanvas.getContext('2d').drawImage(img, 0, 0);
    const screenMat = cv.imread(screenCanvas);
    const screenGray = new cv.Mat();
    cv.cvtColor(screenMat, screenGray, cv.COLOR_RGBA2GRAY);
    screenMat.delete();
    console.log(`Screenshot gray size: ${screenGray.rows}x${screenGray.cols}`);
    // Prepare result
    const detected = {
        skills: [], stackingConsumables: [], eventBuffs: [],
        alchemy: [], smithing: [], advStatPotions: [],
        nonstackingConsumables1: [], nonstackingConsumables2: []
    };
    const templates = await loadReferenceTemplates();
    // Perform template matching
    for (const [category, icons] of Object.entries(templates)) {
        if (category === 'nonstackingConsumables') {
            for (const [group, grp] of Object.entries(icons)) {
                for (const [id, refGray] of Object.entries(grp)) {
                    console.log(`Matching template [${category}][${group}][${id}] template size: ${refGray.rows}x${refGray.cols}`);
                    const res = new cv.Mat();
                    cv.matchTemplate(screenGray, refGray, res, cv.TM_CCOEFF_NORMED);
                    const { maxVal } = cv.minMaxLoc(res);
                    res.delete();
                    console.log(`Match result [${category}][${group}][${id}] maxVal: ${maxVal}`);
                    if (maxVal >= TEMPLATE_MATCH_THRESHOLD) {
                        const key = group === 'group1' ? 'nonstackingConsumables1' : 'nonstackingConsumables2';
                        detected[key].push(id);
                    }
                }
            }
        } else {
            for (const [id, refGray] of Object.entries(icons)) {
                console.log(`Matching template [${category}][${id}] template size: ${refGray.rows}x${refGray.cols}`);
                const res = new cv.Mat();
                cv.matchTemplate(screenGray, refGray, res, cv.TM_CCOEFF_NORMED);
                const { maxVal } = cv.minMaxLoc(res);
                res.delete();
                console.log(`Match result [${category}][${id}] maxVal: ${maxVal}`);
                if (maxVal >= TEMPLATE_MATCH_THRESHOLD) detected[category].push(id);
            }
        }
    }
    screenGray.delete();
    return detected;
}
