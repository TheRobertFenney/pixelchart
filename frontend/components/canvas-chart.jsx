'use client';

import React, { useRef, useEffect, useCallback, useReducer } from 'react';
import { Label } from "@/frontend/components/ui/label";
import { cn } from "@/lib/utils";

const GRID_SIZE = 32;
const CELL_SIZE = 15; // 480px / 32 cells
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

// Pre-calculate grid lines paths for better performance
const createGridPath = () => {
  const path = new Path2D();
  for (let i = 0; i <= GRID_SIZE; i++) {
    const pos = i * CELL_SIZE;
    // Vertical line
    path.moveTo(pos, 0);
    path.lineTo(pos, CANVAS_SIZE);
    // Horizontal line
    path.moveTo(0, pos);
    path.lineTo(CANVAS_SIZE, pos);
  }
  return path;
};

const initialState = {
  // Local UI state
  isDragging: false,
  dragStart: null,
  dragEnd: null,
  hoverCell: null,
  // Replicated state
  gridColors: new Array(GRID_SIZE * GRID_SIZE).fill(null),
};

function gridReducer(state, action) {
  switch (action.type) {
    case 'START_DRAG':
      return {
        ...state,
        isDragging: true,
        dragStart: action.coords,
        dragEnd: action.coords,
      };
    case 'UPDATE_DRAG':
      return {
        ...state,
        dragEnd: action.coords,
      };
    case 'END_DRAG':
      return {
        ...state,
        isDragging: false,
        dragStart: null,
        dragEnd: null,
      };
    case 'SET_HOVER':
      return {
        ...state,
        hoverCell: action.coords,
      };
    case 'CLEAR_HOVER':
      return {
        ...state,
        hoverCell: null,
      };
    case 'UPDATE_CELLS': {
      const newGridColors = [...state.gridColors];
      action.updates.forEach(({ index, color }) => {
        newGridColors[index] = color;
      });
      return {
        ...state,
        gridColors: newGridColors,
      };
    }
    // Handle remote updates from SpacetimeDB
    case 'SYNC_GRID':
      return {
        ...state,
        gridColors: action.gridColors,
      };
    default:
      return state;
  }
}

export function CanvasChart({ onPixelClick, selectedColor, currentTool }) {
  const canvasRef = useRef(null);
  const gridPathRef = useRef(null);
  const rafRef = useRef(null);
  const [state, dispatch] = useReducer(gridReducer, initialState);
  const isMouseDownRef = useRef(false);
  const needsRenderRef = useRef(false);

  // Convert mouse position to grid coordinates
  const getGridCoords = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    
    // Clamp coordinates to grid boundaries
    return {
      x: Math.max(0, Math.min(x, GRID_SIZE - 1)),
      y: Math.max(0, Math.min(y, GRID_SIZE - 1))
    };
  }, []);

  // Draw the entire grid
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    
    if (!needsRenderRef.current) return;
    needsRenderRef.current = false;
    
    ctx.fillStyle = '#151515';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    const colorBatches = new Map();
    state.gridColors.forEach((color, i) => {
      if (color) {
        if (!colorBatches.has(color)) {
          colorBatches.set(color, []);
        }
        colorBatches.get(color).push(i);
      }
    });

    // Draw each color batch
    colorBatches.forEach((indices, color) => {
      ctx.fillStyle = color;
      indices.forEach(i => {
        const x = (i % GRID_SIZE) * CELL_SIZE;
        const y = Math.floor(i / GRID_SIZE) * CELL_SIZE;
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      });
    });
    
    // Draw grid lines using cached path
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke(gridPathRef.current);

    // Draw hover highlight
    if (state.hoverCell && !state.isDragging) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(
        state.hoverCell.x * CELL_SIZE,
        state.hoverCell.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    }
    
    // Draw selection overlay if dragging
    if (state.isDragging && state.dragStart && state.dragEnd) {
      const startX = Math.min(state.dragStart.x, state.dragEnd.x);
      const startY = Math.min(state.dragStart.y, state.dragEnd.y);
      const width = Math.abs(state.dragEnd.x - state.dragStart.x) + 1;
      const height = Math.abs(state.dragEnd.y - state.dragStart.y) + 1;
      
      // Draw selection fill
      ctx.fillStyle = currentTool === 'eraser' ? 
        'rgba(255, 255, 255, 0.2)' : 
        `${selectedColor}88`;
      ctx.fillRect(
        startX * CELL_SIZE,
        startY * CELL_SIZE,
        width * CELL_SIZE,
        height * CELL_SIZE
      );
      
      // Draw selection border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        startX * CELL_SIZE,
        startY * CELL_SIZE,
        width * CELL_SIZE,
        height * CELL_SIZE
      );
    }
  }, [state, currentTool, selectedColor]);

  // Set up render loop
  const renderLoop = useCallback(() => {
    drawGrid();
    rafRef.current = requestAnimationFrame(renderLoop);
  }, [drawGrid]);

  // Request a render
  const requestRender = useCallback(() => {
    needsRenderRef.current = true;
  }, []);

  // Handle mouse interactions with optimized renders
  const handleGlobalMouseMove = useCallback((e) => {
    const coords = getGridCoords(e);
    dispatch({ type: 'SET_HOVER', coords });
    requestRender();

    if (!isMouseDownRef.current) return;
    dispatch({ type: 'UPDATE_DRAG', coords });
  }, [getGridCoords, requestRender]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    dispatch({ type: 'CLEAR_HOVER' });
    requestRender();
  }, [requestRender]);

  // Handle mouse interactions
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isMouseDownRef.current = true;
    const coords = getGridCoords(e);
    dispatch({ type: 'START_DRAG', coords });
  }, [getGridCoords]);

  const handleContextMenu = useCallback((e) => {
    // Always prevent context menu during drag operations
    if (isMouseDownRef.current || state.isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, [state.isDragging]);

  const handleGlobalMouseUp = useCallback((e) => {
    if (!isMouseDownRef.current) return;
    
    if (e.button === 2) {
      e.preventDefault();
    }
    
    isMouseDownRef.current = false;
    
    if (!state.dragStart || !state.dragEnd) {
      dispatch({ type: 'END_DRAG' });
      return;
    }
    
    const isErasing = e.button === 2 || currentTool === 'eraser';
    const startX = Math.min(state.dragStart.x, state.dragEnd.x);
    const startY = Math.min(state.dragStart.y, state.dragEnd.y);
    const endX = Math.max(state.dragStart.x, state.dragEnd.x);
    const endY = Math.max(state.dragStart.y, state.dragEnd.y);
    
    const updates = [];
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const index = y * GRID_SIZE + x;
        updates.push({
          index,
          color: isErasing ? null : selectedColor
        });
      }
    }
    
    dispatch({ type: 'UPDATE_CELLS', updates });
    dispatch({ type: 'END_DRAG' });
    drawGrid();
  }, [state.dragStart, state.dragEnd, currentTool, selectedColor, drawGrid]);

  // Set up global event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    };
  }, [handleGlobalMouseMove, handleGlobalMouseUp, handleContextMenu]);

  // Initialize canvas and prevent context menu
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    
    // Create and cache grid lines path
    gridPathRef.current = createGridPath();
    
    // Prevent context menu on the entire document
    const preventContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', preventContextMenu);
    
    // Start render loop
    requestRender();
    rafRef.current = requestAnimationFrame(renderLoop);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, [renderLoop, requestRender]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className={cn(
            "bg-[#151515] border border-[#333] rounded-none shadow-xl",
            state.isDragging && "cursor-crosshair"
          )}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
      <Label className="text-sm text-gray-300 dark:text-gray-300 text-center">
        {currentTool === 'eraser' 
          ? "Click and drag to erase pixels. Right-click also works as an eraser." 
          : "Click and drag to create boxes of color. Right-click to erase."}
      </Label>
    </div>
  );
} 