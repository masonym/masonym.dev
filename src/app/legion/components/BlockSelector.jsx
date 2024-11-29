import React from 'react';
import { BLOCK_METADATA } from '../utils/blocks';

// Define colors for different block types
const BLOCK_COLORS = {
  // Basic ranks
  B: '#8e44ad',  // Purple
  A: '#2980b9', // Blue
  
  // Class specific colors
  WARRIOR: '#e74c3c', // Red
  MAGICIAN: '#3498db', // Blue
  BOWMAN: '#27ae60', // Green
  THIEF: '#9b59b6', // Purple
  PIRATE: '#95a5a6', // Gray
  LAB: '#16a085', // Teal
  XENON: '#2c3e50' // Dark Blue
};

// Define the 15 unique block shapes
const BLOCK_TYPES = [
  // 1-block (B rank)
  { id: 'single', rank: 'B', shape: [[0,0]], label: '1x1', color: BLOCK_COLORS.B },
  
  // 2-block (A rank)
  { id: 'double', rank: 'A', shape: [[0,0], [1,0]], label: '1x2', color: BLOCK_COLORS.A },
  
  // 3-block (S rank)
  { id: 'corner', rank: 'S', shape: [[0,0], [0,1], [1,1]], label: 'Corner', color: BLOCK_COLORS.WARRIOR },
  { id: 'triple', rank: 'S', shape: [[0,0], [1,0], [2,0]], label: 'L', color: BLOCK_COLORS.MAGICIAN },
  
  // 4-block (SS rank)
  { id: 'square', rank: 'SS', shape: [[0,0], [1,0], [0,1], [1,1]], label: 'Square', color: BLOCK_COLORS.WARRIOR },
  { id: 'quad_line', rank: 'SS', shape: [[0,0], [1,0], [2,0], [3,0]], label: '1x4', color: BLOCK_COLORS.MAGICIAN },
  { id: 'l_shape_large', rank: 'SS', shape: [[0,0], [1,1], [2,1], [0,1]], label: 'Large L', color: BLOCK_COLORS.THIEF },
  { id: 't_shape', rank: 'SS', shape: [[0,1], [1,0], [2,1], [1,1]], label: 'T', color: BLOCK_COLORS.BOWMAN },
  { id: 'z_shape', rank: 'SS', shape: [[0,0], [1,0], [1,1], [2,1]], label: 'Z', color: BLOCK_COLORS.PIRATE },
  
  // 5-block (SSS rank)
  { id: 'square_nib', rank: 'SSS', shape: [[0,0], [1,0], [2,1], [1,1], [2,0]], label: 'Square Nib', color: BLOCK_COLORS.WARRIOR },
  { id: 'penta_line', rank: 'SSS', shape: [[0,0], [1,0], [2,0], [3,0], [4,0]], label: '1x5', color: BLOCK_COLORS.BOWMAN },
  { id: 'large_t', rank: 'SSS', shape: [[2,0], [1,1], [2,1], [0,1], [2,2]], label: 'Large T', color: BLOCK_COLORS.MAGICIAN },
  { id: 'cross', rank: 'SSS', shape: [[1,0], [0,1], [1,1], [2,1], [1,2]], label: 'Cross', color: BLOCK_COLORS.THIEF },
  { id: 'long_z', rank: 'SSS', shape: [[1, 2], [2,2], [3,2], [0, 1], [1, 1]], label: 'Long Z', color: BLOCK_COLORS.PIRATE },
  { id: 'tall_z', rank: 'SSS', shape: [[0,0], [1,0], [2,2], [1,1], [1,2]], label: 'Tall Z', color: BLOCK_COLORS.XENON },
  
  // Event blocks
  { id: '200_enhanced_lab', rank: 'SS', shape: [[0,0], [2,1], [1,1], [3,1]], label: '200 Enhanced Lab', color: BLOCK_COLORS.LAB },
  { id: '250_enhanced_lab', rank: 'SSS', shape: [[0,0], [2,1], [1,1], [3,1], [4,0]], label: '250 Enhanced Lab', color: BLOCK_COLORS.LAB },
  { id: '250_lab', rank: 'SSS', shape: [[0,0], [1,1], [0,1], [2,1], [2,0]], label: '250 Lab', color: BLOCK_COLORS.LAB }
];

const BlockShape = ({ shape, size = 15, color }) => {
  const [mounted, setMounted] = React.useState(false);
  const maxX = Math.max(...shape.map(([x]) => x));
  const maxY = Math.max(...shape.map(([y]) => y));
  const width = (maxX + 1) * size;
  const height = (maxY + 1) * size;
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <div 
      className="relative" 
      style={{ 
        width: width || size, 
        height: height || size,
        minWidth: size,
        minHeight: size
      }}
    >
      {shape.map(([x, y], i) => (
        <div
          key={i}
          className="absolute border border-gray-600"
          style={{
            width: size - 2,
            height: size - 2,
            left: x * size,
            top: y * size,
            backgroundColor: mounted ? color : '#4a5568'
          }}
        />
      ))}
    </div>
  );
};

export default function BlockSelector({ counts, onChange }) {
  const handleCountChange = (blockId, value) => {
    onChange(blockId, value);
  };

  const resetCounts = () => {
    const resetValues = BLOCK_TYPES.reduce((acc, block) => ({
      ...acc,
      [block.id]: 0
    }), {});
    onChange(resetValues);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg">
      <div className="grid grid-cols-5 gap-4">
        {BLOCK_TYPES.map((block) => {
          const count = counts[block.id] || 0;
          const displayColor = count > 0 ? block.color : '#4a5568';
          
          return (
            <div 
              key={block.id} 
              className="flex items-center justify-between flex-col p-2 rounded bg-gray-700"
            >
              <BlockShape 
                shape={block.shape} 
                color={displayColor}
              />
              <input
                type="number"
                min="0"
                max="52"
                value={count}
                onChange={(e) => handleCountChange(block.id, e.target.value)}
                className="w-16 px-2 py-1 text-right bg-gray-900 border border-gray-600 rounded"
              />
            </div>
          );
        })}
      </div>
      
      <button
        onClick={resetCounts}
        className="px-4 py-2 mt-4 text-white bg-red-600 rounded hover:bg-red-700"
      >
        Reset All
      </button>
    </div>
  );
}

// Export block types for use in other components
export { BLOCK_TYPES };
