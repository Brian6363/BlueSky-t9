import React, { useState, useEffect, useRef } from 'react';
import { BskyAgent } from '@atproto/api';

function T9KeyPad({ agent }) {
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
      const timestamp = new Date().toLocaleTimeString();
      debugLog.unshift(`${timestamp}: ${message}`);
      debugLog = debugLog.slice(0, 3);
      if (debugInfo) {
        debugInfo.textContent = debugLog.join('\n');
      }
    }

    container.innerHTML = `
      <div class="w-64 mx-auto bg-gray-600 rounded-3xl p-4 shadow-xl select-none"
           style="background: linear-gradient(145deg, #666666, #4a4a4a);">
        <div class="mb-2 p-1 bg-black rounded">
          <div class="text-yellow-400 font-mono text-[8px] whitespace-pre-line" id="debugInfo"></div>
        </div>

        <div class="bg-[#b5c9a4] p-3 rounded mb-4 shadow-inner"
             style="font-family: 'Courier New', monospace;">
          <div class="flex justify-between text-[#2c3a23] text-[10px] mb-1">
            <span>BlueSky</span>
            <span>ABC</span>
          </div>
          <div class="min-h-20">
            <p id="display" class="text-[#2c3a23] text-sm break-words" 
               style="font-family: 'Courier New', monospace; line-height: 1.2;">
              Type your post...
            </p>
          </div>
          <div id="counter" class="text-right text-xs mt-1 text-[#2c3a23]">300</div>
        </div>

        <div class="flex justify-between mb-4">
          <button id="menuBtn" class="bg-gradient-to-b from-gray-700 to-gray-800 w-16 h-8 rounded-sm text-gray-200 text-xs shadow-lg active:shadow-sm active:translate-y-px transition-all duration-100">
            Menu
          </button>
          <button id="namesBtn" class="bg-gradient-to-b from-gray-700 to-gray-800 w-16 h-8 rounded-sm text-gray-200 text-xs shadow-lg active:shadow-sm active:translate-y-px transition-all duration-100">
            Names
          </button>
        </div>

        <div class="relative h-24 mb-4 flex items-center justify-center">
          <div class="relative w-24 h-24">
            <div class="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-800 rounded-sm"
                 style="clip-path: polygon(37.5% 0, 62.5% 0, 62.5% 37.5%, 100% 37.5%, 100% 62.5%, 62.5% 62.5%, 62.5% 100%, 37.5% 100%, 37.5% 62.5%, 0 62.5%, 0 37.5%, 37.5% 37.5%);">
            </div>
            
            <button class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-sm bg-gradient-to-b from-gray-600 to-gray-700 shadow-md">
            </button>

            <button id="upBtn" class="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-6 bg-gradient-to-b from-gray-600 to-gray-700 rounded-sm shadow-md active:shadow-sm active:translate-y-px"></button>
            <button id="downBtn" class="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-6 bg-gradient-to-b from-gray-600 to-gray-700 rounded-sm shadow-md active:shadow-sm active:translate-y-px"></button>
            <button id="leftBtn" class="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-8 bg-gradient-to-b from-gray-600 to-gray-700 rounded-sm shadow-md active:shadow-sm active:translate-x-px"></button>
            <button id="rightBtn" class="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-8 bg-gradient-to-b from-gray-600 to-gray-700 rounded-sm shadow-md active:shadow-sm active:-translate-x-px"></button>
          </div>
        </div>

        <div class="flex justify-between mb-4">
          <button id="sendBtn" class="bg-[#2c8a23] w-16 h-8 rounded-sm text-white text-xs shadow-lg active:shadow-sm active:translate-y-px transition-all duration-100">
            Send
          </button>
          <button id="clearBtn" class="bg-[#8a2323] w-16 h-8 rounded-sm text-white text-xs shadow-lg active:shadow-sm active:translate-y-px transition-all duration-100">
            Clear
          </button>
        </div>

        <div id="keypad" class="grid grid-cols-3 gap-2"></div>
      </div>
    `;

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
      '1': ['.', ',', '!', '1'],
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
      display.textContent = grid.map(row => row.join('')).join('\n');
    }

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

    function handleKey(key) {
      const chars = keyMappings[key];
      
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
      
      navigator?.vibrate?.(1);
    }

    [...Array(9)].map((_, i) => i + 1)
      .concat(['*', '0', '#'])
      .forEach(key => {
        const btn = document.createElement('div');
        btn.className = `
          rounded-sm text-center p-2 select-none
          bg-gradient-to-b from-gray-700 to-gray-800
          shadow-lg active:shadow-sm active:translate-y-px
          transition-all duration-100
        `;
        
        if (keyMappings[key]) {
          btn.innerHTML = `
            <div class="text-gray-200 text-sm font-bold">${key}</div>
            <div class="text-[0.6rem] text-gray-400">${keyMappings[key].join(' ')}</div>
          `;
        } else {
          btn.innerHTML = `<div class="text-gray-200 text-sm">${key}</div>`;
        }

        const pressHandler = (e) => {
          e.preventDefault();
          if (gameActive) return;  // Disable typing during game
          
          btn.classList.add('translate-y-px', 'shadow-sm');
          setTimeout(() => btn.classList.remove('translate-y-px', 'shadow-sm'), 100);

          if (key === '*' || key === '#') {
            text = text.slice(0, -1);
            display.textContent = text || 'Type your post...';
            counter.textContent = 300 - text.length;
            lastKey = null;
          } else if (keyMappings[key]) {
            handleKey(key);
          }
        };

        btn.addEventListener('touchstart', pressHandler, { passive: false });
        btn.addEventListener('mousedown', pressHandler);

        keypad.appendChild(btn);
    });

    async function handleSend() {
      if (!text.trim()) {
        addDebugLog('No text to send');
        return;
      }

      addDebugLog('Sending: ' + text);
      sendBtn.style.backgroundColor = '#1c6a13';

      try {
        if (!agent.session) {
          addDebugLog('Error: Not logged in');
          return;
        }

        const response = await agent.post({
          text: text,
          createdAt: new Date().toISOString()
        });

        if (response.uri) {
          addDebugLog('Posted successfully!');
          text = '';
          display.textContent = 'Type your post...';
          counter.textContent = '300';
          lastKey = null;
        } else {
          addDebugLog('Error: No post URI');
        }
      } catch (error) {
        addDebugLog('Post error: ' + (error.message || 'Unknown error'));
      } finally {
        setTimeout(() => {
          sendBtn.style.backgroundColor = '#2c8a23';
        }, 100);
      }
    }

    menuBtn.addEventListener('click', async () => {
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
    });

    namesBtn.addEventListener('click', () => {
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
    });

    upBtn?.addEventListener('click', () => {
      if (gameActive && snakeRef.current.direction[1] !== 1) {
        snakeRef.current.direction = [0, -1];
      }
    });

    downBtn?.addEventListener('click', () => {
      if (gameActive && snakeRef.current.direction[1] !== -1) {
        snakeRef.current.direction = [0, 1];
      }
    });

    leftBtn?.addEventListener('click', () => {
      if (gameActive && snakeRef.current.direction[0] !== 1) {
        snakeRef.current.direction = [-1, 0];
      }
    });

    rightBtn?.addEventListener('click', () => {
      if (gameActive && snakeRef.current.direction[0] !== -1) {
        snakeRef.current.direction = [1, 0];
      }
    });

    // Handle send button
    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!gameActive) handleSend();
    });

    sendBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!gameActive) handleSend();
    }, { passive: false });

[Previous code remains the same until clearBtn event listener]

    clearBtn.addEventListener('click', () => {
      text = '';
      lastKey = null;
      gameActive = false;
      clearInterval(gameLoopRef.current);
      display.textContent = 'Type your post...';
      display.style.lineHeight = '1.2';
      counter.textContent = '300';
      addDebugLog('Cleared all');
    });

    container.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    container.addEventListener('touchend', e => e.preventDefault(), { passive: false });

    addDebugLog('T9 Ready');
    return () => {
      clearInterval(gameLoopRef.current);
      container.innerHTML = '';
    };
  }, [agent]);

  return <div ref={containerRef} />;
}

// Main App Component
export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [agent] = useState(() => new BskyAgent({ service: 'https://bsky.social/xrpc/' }));

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await agent.login({
        identifier: username,
        password: password
      });
      setIsLoggedIn(true);
      setError('');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">BlueSky T9</h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="App Password"
              className="w-full p-2 mb-4 border rounded"
            />
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <T9KeyPad agent={agent} />;
}

export default Home;
