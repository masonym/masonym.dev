// Import BLOCK_TYPES from BlockSelector
import { BLOCK_TYPES } from '../components/BlockSelector';

// Block metadata
export const BLOCK_METADATA = {
  B: { level: 60, color: '#8e44ad' },  // Purple
  A: { level: 100, color: '#2980b9' }, // Blue
  S: { level: 140, color: '#27ae60' }, // Green
  SS: { level: 200, color: '#f39c12' }, // Orange
  SSS: { level: 250, color: '#c0392b' } // Red
}

// Rotate a shape 90 degrees clockwise
export function rotateShape(shape) {
  if (!shape || shape.length === 0) return shape;
  return shape.map(([x, y]) => [y, -x]);
}

// Get all possible rotations of a shape
export function getAllRotations(shape) {
  if (!shape || shape.length === 0) return [];
  
  const rotations = [shape];
  let currentRotation = shape;
  
  // Get up to 3 more rotations (90°, 180°, 270°)
  for (let i = 0; i < 3; i++) {
    currentRotation = rotateShape(currentRotation);
    // Normalize the rotation to top-left corner
    const minX = Math.min(...currentRotation.map(([x]) => x));
    const minY = Math.min(...currentRotation.map(([y]) => y));
    const normalized = currentRotation.map(([x, y]) => [x - minX, y - minY]);
    
    // Only add unique rotations
    if (!rotations.some(rot => shapesAreEqual(rot, normalized))) {
      rotations.push(normalized);
    }
  }
  
  return rotations;
}

// Compare two shapes for equality
export function shapesAreEqual(shape1, shape2) {
  if (shape1.length !== shape2.length) return false;
  return shape1.every(([x1, y1]) => 
    shape2.some(([x2, y2]) => x1 === x2 && y1 === y2)
  );
}

// Get all possible rotations for a block type
export function getBlockShapes(blockId) {
  const block = BLOCK_TYPES.find(b => b.id === blockId);
  if (!block) return [];
  return getAllRotations(block.shape);
}

export { BLOCK_TYPES };
