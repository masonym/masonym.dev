'use client'

import { useState, useEffect } from 'react'
import { solveLegion } from '../utils/solver'
import BlockSelector, { BLOCK_TYPES } from './BlockSelector';

const GRID_WIDTH = 22
const GRID_HEIGHT = 20

// Define regions based on the bordered areas
const REGIONS = [
  // Top Left Quadrant
  {
    id: 0, // Outer corner triangle
    cells: Array.from({ length: 5 }, (_, x) => 
      Array.from({ length: 10 - x }, (_, i) => ({ x, y: x + i }))
    ).flat()
  },
  {
    id: 1, // Top triangle + rectangle
    cells: Array.from({ length: 10 }, (_, x) => 
      Array.from({ length: Math.min(x + 1, 5) }, (_, i) => ({ x: x + 1, y: i }))
    ).flat()
  },
  {
    id: 2, // Inner border triangle (left)
    cells: Array.from({ length: 5 }, (_, x) => 
      Array.from({ length: 5 - x }, (_, i) => ({ x: x + 5, y: x + 5 + i }))
    ).flat()
  },
  {
    id: 3, // Inner border triangle (right)
    cells: Array.from({ length: 5 }, (_, x) => 
      Array.from({ length: x + 1 }, (_, i) => ({ x: x + 6, y: 5 + i }))
    ).flat()
  },

  // Top Right Quadrant (mirror horizontally)
  {
    id: 4, // Outer corner triangle
    cells: Array.from({ length: 5 }, (_, x) => 
      Array.from({ length: 10 - x }, (_, i) => ({ x: 21 - x, y: x + i }))
    ).flat()
  },
  {
    id: 5, // Top triangle + rectangle
    cells: Array.from({ length: 10 }, (_, x) => 
      Array.from({ length: Math.min(x + 1, 5) }, (_, i) => ({ x: 20 - x, y: i }))
    ).flat()
  },
  {
    id: 6, // Inner border triangle (right)
    cells: Array.from({ length: 5 }, (_, x) => 
      Array.from({ length: 5 - x }, (_, i) => ({ x: 16 - x, y: x + 5 + i }))
    ).flat()
  },
  {
    id: 7, // Inner border triangle (left)
    cells: Array.from({ length: 5 }, (_, x) => 
      Array.from({ length: x + 1 }, (_, i) => ({ x: 15 - x, y: 5 + i }))
    ).flat()
  },

  // Bottom Left Quadrant (mirror vertically)
  {
    id: 8, // Outer corner triangle
    cells: Array.from({ length: 5 }, (_, x) => 
      Array.from({ length: 10 - x }, (_, i) => ({ x, y: 19 - (x + i) }))
    ).flat()
  },
  {
    id: 9, // Bottom triangle + rectangle
    cells: Array.from({ length: 10 }, (_, x) => 
      Array.from({ length: Math.min(x + 1, 5) }, (_, i) => ({ x: x + 1, y: 19 - i }))
    ).flat()
  },
  {
    id: 10, // Inner border triangle (left)
    cells: Array.from({ length: 5 }, (_, x) => 
      Array.from({ length: 5 - x }, (_, i) => ({ x: x + 5, y: 14 - x - i }))
    ).flat()
  },
  {
    id: 11, // Inner border triangle (right)
    cells: Array.from({ length: 5 }, (_, x) => 
      Array.from({ length: x + 1 }, (_, i) => ({ x: x + 6, y: 14 - i }))
    ).flat()
  },

  // Bottom Right Quadrant (mirror both ways)
  {
    id: 12, // Outer corner triangle
    cells: Array.from({ length: 5 }, (_, x) => 
      Array.from({ length: 10 - x }, (_, i) => ({ x: 21 - x, y: 19 - (x + i) }))
    ).flat()
  },
  {
    id: 13, // Bottom triangle + rectangle
    cells: Array.from({ length: 10 }, (_, x) => 
      Array.from({ length: Math.min(x + 1, 5) }, (_, i) => ({ x: 20 - x, y: 19 - i }))
    ).flat()
  },
  {
    id: 14, // Inner border triangle (right)
    cells: Array.from({ length: 5 }, (_, x) => 
      Array.from({ length: 5 - x }, (_, i) => ({ x: 16 - x, y: 14 - x - i }))
    ).flat()
  },
  {
    id: 15, // Inner border triangle (left)
    cells: Array.from({ length: 5 }, (_, x) => 
      Array.from({ length: x + 1 }, (_, i) => ({ x: 15 - x, y: 14 - i }))
    ).flat()
  }
]

// Define the coordinates where borders should appear
const VERTICAL_BORDERS = [10] // x coordinates for vertical borders
const HORIZONTAL_BORDERS = [9] // y coordinates for horizontal borders

// Define diagonal border coordinates (x coordinates for each row)
const DIAGONAL_BORDERS = {
  // Top half
  topLeft: [
    [0], // y=0
    [1], // y=1
    [2],
    [3],
    [4],
    [5],
    [6],
    [7],
    [8],
    [9],
  ],
  topRight: [
    [21], // y=0
    [20],
    [19],
    [18],
    [17],
    [16],
    [15],
    [14],
    [13],
    [12],
  ],
  // Bottom half
  bottomLeft: [
    [9], // y=10
    [8],
    [7],
    [6],
    [5],
    [4],
    [3],
    [2],
    [1],
    [0]
  ],
  bottomRight: [
    [12], // y=10
    [13],
    [14],
    [15],
    [16],
    [17],
    [18],
    [19],
    [20],
    [21]
  ]
}

export default function LegionSolver() {
  const MAX_GRID_SQUARES = GRID_WIDTH * GRID_HEIGHT // 22 * 20 = 440
  const MAX_BLOCK_COUNT = 52
  const [grid, setGrid] = useState(() => Array(GRID_WIDTH * GRID_HEIGHT).fill(false))
  const [solution, setSolution] = useState(null)
  const [solving, setSolving] = useState(false)
  const [error, setError] = useState(null)
  const [blockCounts, setBlockCounts] = useState(() => {
    // Try to load from localStorage first
    try {
      const savedState = localStorage.getItem('legionSolverState')
      if (savedState) {
        const { blockCounts } = JSON.parse(savedState)
        // Validate the loaded counts
        return BLOCK_TYPES.reduce((acc, block) => ({
          ...acc,
          [block.id]: blockCounts[block.id] || 0
        }), {})
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
    // Default to empty counts if no saved state or error
    return BLOCK_TYPES.reduce((acc, block) => ({
      ...acc,
      [block.id]: 0
    }), {})
  })
  const [isRegionMode, setIsRegionMode] = useState(false)
  const [selectedCount, setSelectedCount] = useState(0)
  const [maxSelectable, setMaxSelectable] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragValue, setDragValue] = useState(null)
  const [hoveredCell, setHoveredCell] = useState(null)

  useEffect(() => {
    // Load grid and region mode from localStorage
    try {
      const savedState = localStorage.getItem('legionSolverState')
      if (savedState) {
        const { grid: savedGrid, isRegionMode } = JSON.parse(savedState)
        // Ensure grid is an array of booleans
        if (Array.isArray(savedGrid) && savedGrid.length === GRID_WIDTH * GRID_HEIGHT) {
          setGrid(savedGrid.map(cell => Boolean(cell)))
        }
        setIsRegionMode(isRegionMode)
      }
    } catch (error) {
      console.error('Error loading grid state:', error)
    }
  }, [])

  useEffect(() => {
    // Save state to localStorage whenever it changes
    try {
      localStorage.setItem('legionSolverState', JSON.stringify({
        blockCounts,
        grid: Array.from(grid), // Convert to serializable array
        isRegionMode
      }))

      // Update selected count
      const selectedSquares = grid.filter(Boolean).length
      setSelectedCount(selectedSquares)

      // Calculate max selectable squares
      const total = Object.entries(blockCounts).reduce((sum, [id, count]) => {
        const block = BLOCK_TYPES.find(b => b.id === id)
        if (!block) return sum
        return sum + (count * block.shape.length)
      }, 0)
      setMaxSelectable(total)
    } catch (error) {
      console.error('Error saving state:', error)
    }
  }, [blockCounts, grid, isRegionMode])

  const handleBlockCountChange = (blockId, value) => {
    const numValue = Math.max(0, Math.min(MAX_BLOCK_COUNT, parseInt(value) || 0))
    
    // Calculate new total squares with this change
    const newCounts = {
      ...blockCounts,
      [blockId]: numValue
    }
    
    const totalSquares = Object.entries(newCounts).reduce((sum, [id, count]) => {
      const block = BLOCK_TYPES.find(b => b.id === id)
      if (!block) return sum
      return sum + (count * block.shape.length)
    }, 0)
    
    // Only update if total squares doesn't exceed max
    if (totalSquares <= MAX_GRID_SQUARES) {
      setBlockCounts(prev => ({
        ...prev,
        [blockId]: numValue
      }))
    }
  }

  const getBorderClasses = (x, y) => {
    const classes = []

    // Add vertical borders
    if (VERTICAL_BORDERS.includes(x)) {
      classes.push('border-r-2 border-r-black')
    }

    // Add horizontal borders
    if (HORIZONTAL_BORDERS.includes(y)) {
      classes.push('border-b-2 border-b-black')
    }

    // Add diagonal borders for top half
    const topLeftDiagonal = DIAGONAL_BORDERS.topLeft[y]
    const topRightDiagonal = DIAGONAL_BORDERS.topRight[y]
    
    if (y < 10) {  // Top half
      if (topLeftDiagonal && topLeftDiagonal.includes(x)) {
        classes.push('border-r-2 border-r-black border-t-2 border-t-black')
      }
      if (topRightDiagonal && topRightDiagonal.includes(x)) {
        classes.push('border-l-2 border-l-black border-t-2 border-t-black')
      }
    } else {  // Bottom half
      const bottomY = y - 10
      const bottomLeftDiagonal = DIAGONAL_BORDERS.bottomLeft[bottomY]
      const bottomRightDiagonal = DIAGONAL_BORDERS.bottomRight[bottomY]
      
      if (bottomLeftDiagonal && bottomLeftDiagonal.includes(x)) {
        classes.push('border-r-2 border-r-black border-b-2 border-b-black')
      }
      if (bottomRightDiagonal && bottomRightDiagonal.includes(x)) {
        classes.push('border-l-2 border-l-black border-b-2 border-b-black')
      }
    }

    return classes.join(' ')
  }

  const getHoveredCells = (x, y) => {
    if (!isRegionMode) return [{ x, y }]
    
    const region = REGIONS.find(region => 
      region.cells.some(cell => cell.x === x && cell.y === y)
    )
    
    return region ? region.cells : []
  }

  const toggleCell = (index, value) => {
    const x = index % GRID_WIDTH
    const y = Math.floor(index / GRID_WIDTH)

    if (isRegionMode) {
      // Find which region was clicked
      const clickedRegion = REGIONS.find(region => 
        region.cells.some(cell => cell.x === x && cell.y === y)
      )

      if (clickedRegion) {
        const newGrid = [...grid]
        const currentState = !grid[y * GRID_WIDTH + x]

        // Toggle all cells in the region
        clickedRegion.cells.forEach(({ x, y }) => {
          const cellIndex = y * GRID_WIDTH + x
          newGrid[cellIndex] = value !== null ? value : currentState
        })

        setGrid(newGrid)
      }
    } else {
      const newGrid = [...grid]
      newGrid[index] = value !== null ? value : !newGrid[index]
      setGrid(newGrid)
    }
  }

  const handleMouseDown = (x, y) => {
    setIsDragging(true)
    const newValue = !grid[y * GRID_WIDTH + x]
    setDragValue(newValue)
    toggleCell(y * GRID_WIDTH + x, newValue)
  }

  const handleMouseMove = (x, y) => {
    if (isDragging && dragValue !== null) {
      toggleCell(y * GRID_WIDTH + x, dragValue)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragValue(null)
  }

  const handleMouseEnter = (x, y) => {
    if (isDragging && dragValue !== null) {
      toggleCell(y * GRID_WIDTH + x, dragValue)
    }
    setHoveredCell({ x, y })
  }

  const handleMouseLeave = () => {
    setHoveredCell(null)
  }

  const handleSolve = async () => {
    setSolving(true)
    setError(null)
    try {
      const result = await solveLegion(blockCounts)
      setSolution(result)
    } catch (err) {
      setError(err.message)
      console.error('Solving error:', err)
    } finally {
      setSolving(false)
    }
  }

  const resetGrid = () => {
    setGrid(Array(GRID_WIDTH * GRID_HEIGHT).fill(false))
  }

  return (
    <div className="flex gap-8">
      <div className="flex-1">
        <div className="inline-grid border-2 border-black" style={{ 
          gridTemplateColumns: `repeat(${GRID_WIDTH}, 2rem)`,
          gridTemplateRows: `repeat(${GRID_HEIGHT}, 2rem)`
        }}>
          {Array(GRID_WIDTH * GRID_HEIGHT).fill(null).map((_, index) => {
            const x = index % GRID_WIDTH
            const y = Math.floor(index / GRID_WIDTH)
            
            // Calculate the inner border position
            // For a 12x10 square centered in a 22x20 grid:
            // X: (22-12)/2 = 5 start, 5+12 = 17 end
            // Y: (20-10)/2 = 5 start, 5+10 = 15 end
            const innerBorder = []
            if (x >= 5 && x < 17) { // Within inner square width
                if (y === 5) innerBorder.push('border-t-2 border-t-black')  // Top
                if (y === 14) innerBorder.push('border-b-2 border-b-black') // Bottom
            }
            if (y >= 5 && y < 15) { // Within inner square height
                if (x === 5) innerBorder.push('border-l-2 border-l-black')  // Left
                if (x === 16) innerBorder.push('border-r-2 border-r-black') // Right
            }
            
            const hoveredCells = hoveredCell ? getHoveredCells(hoveredCell.x, hoveredCell.y) : []
            const isHovered = hoveredCells.some(cell => cell.x === x && cell.y === y)

            return (
              <div
                key={index}
                onMouseDown={() => handleMouseDown(x, y)}
                onMouseEnter={() => handleMouseEnter(x, y)}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                className={`
                  w-8 h-8 
                  border border-gray-300 
                  cursor-pointer 
                  ${grid[index] ? 'bg-blue-500' : 'bg-white'}
                  ${isHovered && !isDragging ? (grid[index] ? 'bg-blue-600' : 'bg-blue-100') : ''}
                  ${getBorderClasses(x, y)}
                  ${innerBorder.join(' ')}
                `}
              />
            )
          })}
        </div>
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => setIsRegionMode(!isRegionMode)}
            className={`px-4 py-2 rounded ${
              isRegionMode ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {isRegionMode ? 'Region Mode' : 'Single Cell Mode'}
          </button>
          <button
            onClick={handleSolve}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Solve Grid
          </button>
          <button
            onClick={resetGrid}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Reset Grid
          </button>
        </div>
        <div className="mt-4">
          <p>Selected: {selectedCount} squares</p>
          <p>Maximum selectable: {maxSelectable} squares</p>
        </div>
      </div>

      <div className="">
        <BlockSelector 
          counts={blockCounts}
          onChange={handleBlockCountChange}
        />
      </div>
    </div>
  )
}
