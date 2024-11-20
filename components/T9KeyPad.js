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
    let autoAcceptTimer = null;

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



//Part2 

  function updateSnake() {
      const snake = snakeRef.current;
      const [headX, headY] = snake.body[0];
      const [dirX, dirY] = snake.direction;
      const newHead = [headX + dirX, headY + dirY];

      if (newHead[0] === snake.food[0] && newHead[1] === snake.food[1]) {
        snake.score++;
        snake.food = [
          Math.floor(Math.random() * 20),
          Math.floor(Math.random() * 15)
        ];
      } else {
        snake.body.pop();
      }

      if (newHead[0] < 0 || newHead[0] >= 20 || 
          newHead[1] < 0 || newHead[1] >= 15 ||
          snake.body.some(([x, y]) => x === newHead[0] && y === newHead[1])) {
        gameActive = false;
        clearInterval(gameLoopRef.current);
        display.textContent = `Game Over!\nScore: ${snake.score}\nPress Menu to exit`;
        return;
      }

      snake.body.unshift(newHead);
      drawSnake();
    }

   container.innerHTML = `
      <div class="w-64 mx-auto rounded-3xl p-3 shadow-xl select-none"
           style="background: linear-gradient(145deg, #1a237e, #0d1642);">
        <div class="bg-[#b5c9a4] p-2 rounded mb-2 shadow-inner h-[340px] overflow-hidden"
             style="font-family: 'Courier New', monospace;">
          <div class="flex justify-between text-[#2c3a23] text-[10px] mb-1">
            <span>BlueSky</span>
            <span>ABC</span>
          </div>
          <div class="h-[300px] overflow-auto">
            <p id="display" class="text-[#2c3a23] text-sm break-words" 
               style="font-family: 'Courier New', monospace; line-height: 1.1;">
              Type your post...
            </p>
          </div>
          <div id="counter" class="text-right text-xs mt-1 text-[#2c3a23]">300</div>
        </div>

        <div class="flex space-x-2 mb-2">
          <!-- Left Function Keys -->
          <div class="flex-1 grid grid-rows-2 gap-1">
            <button id="menuBtn" class="bg-gradient-to-b from-gray-300 to-gray-400 h-6 rounded-sm text-gray-800 text-xs shadow-lg active:shadow-sm active:translate-y-px transition-all duration-100">
              Menu
            </button>
            <button id="sendBtn" class="bg-gradient-to-b from-gray-300 to-gray-400 h-6 rounded-sm text-gray-800 text-xs shadow-lg active:shadow-sm active:translate-y-px transition-all duration-100">
              Send
            </button>
          </div>

          <!-- D-Pad in Center -->
          <div class="relative w-16 h-14">
            <div class="absolute inset-0 bg-gradient-to-b from-gray-300 to-gray-400 rounded-sm"
                 style="clip-path: polygon(37.5% 0, 62.5% 0, 62.5% 37.5%, 100% 37.5%, 100% 62.5%, 62.5% 62.5%, 62.5% 100%, 37.5% 100%, 37.5% 62.5%, 0 62.5%, 0 37.5%, 37.5% 37.5%);">
            </div>
            
            <button class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-sm bg-gradient-to-b from-gray-400 to-gray-500 shadow-md">
            </button>

            <button id="upBtn" class="absolute top-0.5 left-1/2 -translate-x-1/2 w-5 h-3 bg-gradient-to-b from-gray-400 to-gray-500 rounded-sm shadow-md active:shadow-sm active:translate-y-px"></button>
            <button id="downBtn" class="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-3 bg-gradient-to-b from-gray-400 to-gray-500 rounded-sm shadow-md active:shadow-sm active:translate-y-px"></button>
            <button id="leftBtn" class="absolute left-0.5 top-1/2 -translate-y-1/2 w-3 h-5 bg-gradient-to-b from-gray-400 to-gray-500 rounded-sm shadow-md active:shadow-sm active:translate-x-px"></button>
            <button id="rightBtn" class="absolute right-0.5 top-1/2 -translate-y-1/2 w-3 h-5 bg-gradient-to-b from-gray-400 to-gray-500 rounded-sm shadow-md active:shadow-sm active:-translate-x-px"></button>
          </div>

          <!-- Right Function Keys -->
          <div class="flex-1 grid grid-rows-2 gap-1">
            <button id="namesBtn" class="bg-gradient-to-b from-gray-300 to-gray-400 h-6 rounded-sm text-gray-800 text-xs shadow-lg active:shadow-sm active:translate-y-px transition-all duration-100">
              Names
            </button>
            <button id="clearBtn" class="bg-gradient-to-b from-gray-300 to-gray-400 h-6 rounded-sm text-gray-800 text-xs shadow-lg active:shadow-sm active:translate-y-px transition-all duration-100">
              Clear
            </button>
          </div>
        </div>

        <div id="keypad" class="grid grid-cols-3 gap-1"></div>
      </div>
    `;

//Part3


  const display = container.querySelector('#display');
    const counter = container.querySelector('#counter');
    const keypad = container.querySelector('#keypad');
    const sendBtn = container.querySelector('#sendBtn');
    const clearBtn = container.querySelector('#clearBtn');
    const debugInfo = container.querySelector('#debugInfo');
    const menuBtn = container.querySelector('#menuBtn');
    const namesBtn = container.querySelector('#namesBtn');
    const upBtn = container.querySelector('#upBtn');
    const downBtn = container.querySelector('#downBtn');
    const leftBtn = container.querySelector('#leftBtn');
    const rightBtn = container.querySelector('#rightBtn');

    const keyMappings = {
      '1': ['.', ',', '!', '?', '1', '-', '\'', '"', ':', ';', '(', ')', '@'],
      '2': ['a', 'b', 'c', '2'],
      '3': ['d', 'e', 'f', '3'],
      '4': ['g', 'h', 'i', '4'],
      '5': ['j', 'k', 'l', '5'],
      '6': ['m', 'n', 'o', '6'],
      '7': ['p', 'q', 'r', 's', '7'],
      '8': ['t', 'u', 'v', '8'],
      '9': ['w', 'x', 'y', 'z', '9'],
      '0': [' ', '0']
    };

// Add this CSS to the keypad container
    keypad.style.gap = '4px';
    keypad.style.padding = '2px';

    
    function handleKey(key) {
      if (gameActive) return;
      
      const chars = keyMappings[key];
      
      // Clear existing auto-accept timer
      clearTimeout(autoAcceptTimer);
      
      if (key !== lastKey) {
        if (text.length < 300) {
          text += chars[0];
        }
      } else {
        const currentIndex = chars.indexOf(text[text.length - 1]);
        const nextIndex = (currentIndex + 1) % chars.length;
        text = text.slice(0, -1) + chars[nextIndex];
      }
      
      display.textContent = text || 'Type your post...';
      counter.textContent = 300 - text.length;
      lastKey = key;
      
      // Set new auto-accept timer
      autoAcceptTimer = setTimeout(() => {
        lastKey = null;
        addDebugLog('Character accepted');
      }, 500);
      
      navigator?.vibrate?.(1);
    }

[...Array(9)].map((_, i) => i + 1)
      .concat(['*', '0', '#'])
      .forEach(key => {
        const btn = document.createElement('div');
        btn.className = `
          relative h-8 select-none
          shadow-lg active:shadow-sm active:translate-y-px
          transition-all duration-100
          overflow-hidden
          transform
        `;
        btn.style.cssText = `
          border-radius: 35% 35% 40% 40%;
          clip-path: polygon(
            10% 0%, 
            90% 0%, 
            100% 20%,
            100% 80%,
            90% 100%,
            10% 100%,
            0% 80%,
            0% 20%
          );
          transform: scale(0.95);
          background: linear-gradient(180deg, #e0e0e0 0%, #bebebe 100%);
        `;
        
        if (keyMappings[key]) {
          btn.innerHTML = `
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <div class="text-gray-800 text-sm font-bold leading-none">${key}</div>
              <div class="text-[0.45rem] text-gray-600 mt-0.5">${keyMappings[key].join(' ')}</div>
            </div>
            <div class="absolute inset-0 pointer-events-none"
                 style="background: linear-gradient(180deg, 
                                  rgba(255,255,255,0.1) 0%, 
                                  rgba(255,255,255,0.05) 50%, 
                                  rgba(0,0,0,0.05) 51%, 
                                  rgba(0,0,0,0.1) 100%);"></div>
          `;
        } else {
          btn.innerHTML = `
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-gray-200 text-sm">${key}</div>
            </div>
            <div class="absolute inset-0 pointer-events-none"
                 style="background: linear-gradient(180deg, 
                                  rgba(255,255,255,0.1) 0%, 
                                  rgba(255,255,255,0.05) 50%, 
                                  rgba(0,0,0,0.05) 51%, 
                                  rgba(0,0,0,0.1) 100%);"></div>
          `;
        }

        const pressHandler = (e) => {
          e.preventDefault();
          btn.style.transform = 'scale(0.92)';
          btn.style.filter = 'brightness(0.95)';
          setTimeout(() => {
            btn.style.transform = 'scale(0.95)';
            btn.style.filter = 'brightness(1)';
          }, 100);

          if (key === '*' || key === '#') {
            text = text.slice(0, -1);
            display.textContent = text || 'Type your post...';
            counter.textContent = 300 - text.length;
            lastKey = null;
            clearTimeout(autoAcceptTimer);
          } else if (keyMappings[key]) {
            handleKey(key);
          }
        };

        btn.addEventListener('touchstart', pressHandler, { passive: false });
        btn.addEventListener('mousedown', pressHandler);

        keypad.appendChild(btn);
    });





    
//Part4

async function handleSend() {
      if (!text.trim() || gameActive) return;

      sendBtn.style.backgroundColor = '#1c6a13';

      try {
        if (!agent.session) return;

        const response = await agent.post({
          text: text,
          createdAt: new Date().toISOString()
        });

        if (response.uri) {
          text = '';
          display.textContent = 'Type your post...';
          counter.textContent = '300';
          lastKey = null;
          clearTimeout(autoAcceptTimer);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setTimeout(() => {
          sendBtn.style.backgroundColor = '#2c8a23';
        }, 100);
      }
    }

    // Menu button handlers
    async function handleMenu() {
      if (gameActive) {
        gameActive = false;
        clearInterval(gameLoopRef.current);
        display.textContent = 'Type your post...';
        display.style.lineHeight = '1.2';
        return;
      }

      try {
        const profile = await agent.getProfile({ actor: agent.session?.handle });
        display.style.fontFamily = 'Courier New, monospace';
        display.style.lineHeight = '1.5';
        display.textContent = `
@${profile.data.handle}
${profile.data.displayName}
Followers: ${profile.data.followersCount}
Following: ${profile.data.followsCount}
Posts: ${profile.data.postsCount}
${profile.data.description || ''}
        `.trim();
      } catch (err) {
        display.textContent = 'Could not load profile';
      }
    }

    // Names (Snake) button handler
    function handleNames() {
      if (gameActive) return;
      
      gameActive = true;
      snakeRef.current = {
        body: [[5,5]],
        direction: [1,0],
        food: [10,10],
        score: 0
      };
      
      display.style.lineHeight = '1.1';
      drawSnake();
      gameLoopRef.current = setInterval(updateSnake, 150);
    }

    // Clear button handler
    function handleClear() {
      text = '';
      lastKey = null;
      gameActive = false;
      clearInterval(gameLoopRef.current);
      clearTimeout(autoAcceptTimer);
      display.textContent = 'Type your post...';
      display.style.lineHeight = '1.2';
      counter.textContent = '300';
    }

    // Add both click and touch handlers for all function buttons
    menuBtn.addEventListener('click', handleMenu);
    menuBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleMenu();
    }, { passive: false });

    namesBtn.addEventListener('click', handleNames);
    namesBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleNames();
    }, { passive: false });

    clearBtn.addEventListener('click', handleClear);
    clearBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleClear();
    }, { passive: false });

    sendBtn.addEventListener('click', handleSend);
    sendBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleSend();
    }, { passive: false });


//Part5

function handleUp() {
      if (gameActive && snakeRef.current.direction[1] !== 1) {
        snakeRef.current.direction = [0, -1];
      }
    }

    function handleDown() {
      if (gameActive && snakeRef.current.direction[1] !== -1) {
        snakeRef.current.direction = [0, 1];
      }
    }

    function handleLeft() {
      if (gameActive && snakeRef.current.direction[0] !== 1) {
        snakeRef.current.direction = [-1, 0];
      }
    }

    function handleRight() {
      if (gameActive && snakeRef.current.direction[0] !== -1) {
        snakeRef.current.direction = [1, 0];
      }
    }

    // D-pad touch and click handlers
    upBtn?.addEventListener('click', handleUp);
    upBtn?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleUp();
    }, { passive: false });

    downBtn?.addEventListener('click', handleDown);
    downBtn?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleDown();
    }, { passive: false });

    leftBtn?.addEventListener('click', handleLeft);
    leftBtn?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleLeft();
    }, { passive: false });

    rightBtn?.addEventListener('click', handleRight);
    rightBtn?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleRight();
    }, { passive: false });

    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleSend();
    });

    sendBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleSend();
    }, { passive: false });

    clearBtn.addEventListener('click', () => {
      text = '';
      lastKey = null;
      gameActive = false;
      clearInterval(gameLoopRef.current);
      clearTimeout(autoAcceptTimer);
      display.textContent = 'Type your post...';
      display.style.lineHeight = '1.2';
      counter.textContent = '300';
    });

    container.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    container.addEventListener('touchend', e => e.preventDefault(), { passive: false });

    return () => {
      clearInterval(gameLoopRef.current);
      clearTimeout(autoAcceptTimer);
      container.innerHTML = '';
    };
  }, [agent]);

  return <div ref={containerRef} />;
}
