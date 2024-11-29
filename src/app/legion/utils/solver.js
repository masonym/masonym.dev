// Define block shapes (relative coordinates from anchor point)
const BLOCK_SHAPES = [
  // Straight horizontal
  [[0,0], [1,0], [2,0], [3,0]],
  // Straight vertical
  [[0,0], [0,1], [0,2], [0,3]],
  // Square
  [[0,0], [1,0], [0,1], [1,1]],
  // T-shape
  [[0,0], [1,0], [2,0], [1,1]],
  // L-shape
  [[0,0], [0,1], [0,2], [1,2]],
  // Reverse L-shape
  [[1,0], [1,1], [1,2], [0,2]],
  // Z-shape
  [[0,0], [1,0], [1,1], [2,1]],
  // S-shape
  [[1,0], [2,0], [0,1], [1,1]]
]

// Rotate a block shape by 90 degrees
function rotateShape(shape) {
  return shape.map(([x, y]) => [-y, x])
}

import { getBlockShapes, BLOCK_TYPES } from './blocks'

// Check if a position is valid on the grid
function isValidPosition(x, y, width, height) {
  return x >= 0 && x < width && y >= 0 && y < height;
}

// Check if a block can be placed at a position
function canPlaceBlock(grid, shape, anchorX, anchorY, width, height) {
  for (const [dx, dy] of shape) {
    const x = anchorX + dx;
    const y = anchorY + dy;
    
    if (!isValidPosition(x, y, width, height)) {
      return false;
    }
    
    const index = y * width + x;
    if (grid[index]) {
      return false;
    }
  }
  
  return true;
}

// Place a block on the grid
function placeBlock(grid, shape, anchorX, anchorY, width) {
  for (const [dx, dy] of shape) {
    const x = anchorX + dx;
    const y = anchorY + dy;
    grid[y * width + x] = true;
  }
}

// Remove a block from the grid
function removeBlock(grid, shape, anchorX, anchorY, width) {
  for (const [dx, dy] of shape) {
    const x = anchorX + dx;
    const y = anchorY + dy;
    grid[y * width + x] = false;
  }
}

// Check if all blocks are connected using flood fill
function areBlocksConnected(grid, width, height) {
  if (!grid.some(cell => cell)) return true;
  
  const visited = new Array(width * height).fill(false);
  const queue = [];
  
  // Find first placed block
  const start = grid.findIndex(cell => cell);
  queue.push(start);
  visited[start] = true;
  let count = 1;
  
  while (queue.length > 0) {
    const pos = queue.shift();
    const x = pos % width;
    const y = Math.floor(pos / width);
    
    // Check all adjacent cells
    const neighbors = [
      [x-1, y], [x+1, y],
      [x, y-1], [x, y+1]
    ];
    
    for (const [nx, ny] of neighbors) {
      if (!isValidPosition(nx, ny, width, height)) continue;
      
      const index = ny * width + nx;
      if (grid[index] && !visited[index]) {
        queue.push(index);
        visited[index] = true;
        count++;
      }
    }
  }
  
  return count === grid.filter(cell => cell).length;
}

// Main solving function
export function solveLegion(blockCounts, width = 22, height = 20) {
  const grid = new Array(width * height).fill(false);
  const blocks = [];
  
  // Convert block counts to array of shapes to place
  for (const [blockId, count] of Object.entries(blockCounts)) {
    if (count > 0) {
      const block = BLOCK_TYPES.find(b => b.id === blockId);
      if (block) {
        const rotations = getBlockShapes(blockId);
        for (let i = 0; i < count; i++) {
          blocks.push({
            id: blockId,
            rotations
          });
        }
      }
    }
  }
  
  function solve(index) {
    if (index === blocks.length) {
      return areBlocksConnected(grid, width, height);
    }
    
    const block = blocks[index];
    
    for (const shape of block.rotations) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (canPlaceBlock(grid, shape, x, y, width, height)) {
            placeBlock(grid, shape, x, y, width);
            if (solve(index + 1)) {
              return true;
            }
            removeBlock(grid, shape, x, y, width);
          }
        }
      }
    }
    
    return false;
  }
  
  if (solve(0)) {
    return grid;
  }
  
  return null;
}
