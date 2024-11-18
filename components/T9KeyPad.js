import React, { useEffect, useRef } from 'react';

export default function T9KeyPad({ agent }) {
  const containerRef = useRef();
  const gameLoopRef = useRef(null);
  const snakeRef = useRef({
    body: [[5,5]],
    direction: [1,0],
    food: [10,10],
    score: 0
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let text = '';
    let lastKey = null;
    let gameActive = false;
    let debugLog = [];

    function addDebugLog(message) {
      debugLog.unshift(new Date().toLocaleTimeString() + ': ' + message);
      debugLog = debugLog.slice(0, 3);
      if (debugInfo) debugInfo.textContent = debugLog.join('\n');
    }

    function drawSnake() {
      const snake = snakeRef.current;
      if (!snake || !display) return;
      
      const width = 20;
      const height = 15;
      let grid = Array(height).fill().map(() => Array(width).fill('.'));
      
      snake.body.forEach(([x, y]) => {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          grid[y][x] = '█';
        }
      });
      
      const [foodX, foodY] = snake.food;
      if (foodX >= 0 && foodX < width && foodY >= 0 && foodY < height) {
        grid[foodY][foodX] = '●';
      }

      grid[0] = `Score: ${snake.score}`.split('');
      
      display.style.fontFamily = 'Courier New, monospace';
      display.style.lineHeight = '1.1';
      display.textContent = grid.map(row => row.join('')).join('\n');
    }
