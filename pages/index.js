import React, { useState, useEffect, useRef } from 'react';
import { BskyAgent } from '@atproto/api';

// T9KeyPad component
function T9KeyPad({ onPost }) {
  const containerRef = useRef();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let text = '';
    let lastKey = null;
    let debugLog = [];

    function addDebugLog(message) {
      debugLog.unshift(message);
      debugLog = debugLog.slice(0, 3);
      debugInfo?.textContent = debugLog.join('\n');
    }

    container.innerHTML = `
      <div class="w-64 mx-auto bg-gray-600 rounded-3xl p-4 shadow-xl select-none"
           style="background: linear-gradient(145deg, #666666, #4a4a4a);">
        <!-- Tiny Debug Panel -->
        <div class="mb-2 p-1 bg-black rounded text-[8px]">
          <div class="text-yellow-400 font-mono" id="debugInfo"></div>
        </div>

        <!-- Nokia Screen -->
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

        <!-- Function Buttons -->
        <div class="flex justify-between mb-4">
          <button class="bg-gradient-to-b from-gray-700 to-gray-800 w-16 h-8 rounded-sm text-gray-200 text-xs shadow-lg active:shadow-sm active:translate-y-px transition-all duration-100">
            Menu
          </button>
          <button class="bg-gradient-to-b from-gray-700 to-gray-800 w-16 h-8 rounded-sm text-gray-200 text-xs shadow-lg active:shadow-sm active:translate-y-px transition-all duration-100">
            Names
          </button>
        </div>

        <!-- D-Pad -->
        <div class="relative h-24 mb-4 flex items-center justify-center">
          <div class="relative w-24 h-24">
            <div class="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-800 rounded-sm"
                 style="clip-path: polygon(37.5% 0, 62.5% 0, 62.5% 37.5%, 100% 37.5%, 100% 62.5%, 62.5% 62.5%, 62.5% 100%, 37.5% 100%, 37.5% 62.5%, 0 62.5%, 0 37.5%, 37.5% 37.5%);">
            </div>
            
            <button class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-sm bg-gradient-to-b from-gray-600 to-gray-700 shadow-md">
            </button>

            <button class="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-6 bg-gradient-to-b from-gray-600 to-gray-700 rounded-sm shadow-md active:shadow-sm active:translate-y-px"></button>
            <button class="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-6 bg-gradient-to-b from-gray-600 to-gray-700 rounded-sm shadow-md active:shadow-sm active:translate-y-px"></button>
            <button class="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-8 bg-gradient-to-b from-gray-600 to-gray-700 rounded-sm shadow-md active:shadow-sm active:translate-x-px"></button>
            <button class="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-8 bg-gradient-to-b from-gray-600 to-gray-700 rounded-sm shadow-md active:shadow-sm active:-translate-x-px"></button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-between mb-4">
          <button id="sendBtn" class="bg-[#2c8a23] w-16 h-8 rounded-sm text-white text-xs shadow-lg active:shadow-sm active:translate-y-px transition-all duration-100">
            Send
          </button>
          <button id="clearBtn" class="bg-[#8a2323] w-16 h-8 rounded-sm text-white text-xs shadow-lg active:shadow-sm active:translate-y-px transition-all duration-100">
            Clear
          </button>
        </div>

        <!-- Keypad -->
        <div id="keypad" class="grid grid-cols-3 gap-2"></div>
      </div>
    `;

    const display = container.querySelector('#display');
    const counter = container.querySelector('#counter');
    const keypad = container.querySelector('#keypad');
    const sendBtn = container.querySelector('#sendBtn');
    const clearBtn = container.querySelector('#clearBtn');
    const debugInfo = container.querySelector('#debugInfo');

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

    function handleSend() {
      addDebugLog('Send pressed: ' + new Date().toLocaleTimeString());
      addDebugLog('Text to send: ' + text);
      
      if (!text.trim()) {
        addDebugLog('Error: No text to send');
        return;
      }

      if (typeof onPost !== 'function') {
        addDebugLog('Error: onPost not a function');
        return;
      }

      sendBtn.style.backgroundColor = '#1c6a13';
      
      try {
        onPost(text);
        text = '';
        display.textContent = 'Type your post...';
        counter.textContent = '300';
        lastKey = null;
        addDebugLog('Success: Text sent');
      } catch (error) {
        addDebugLog('Error: ' + error.message);
      } finally {
        setTimeout(() => {
          sendBtn.style.backgroundColor = '#2c8a23';
        }, 100);
      }
    }

    sendBtn.addEventListener('click', handleSend);
    sendBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleSend();
    }, { passive: false });

    clearBtn.addEventListener('click', () => {
      text = '';
      display.textContent = 'Type your post...';
      counter.textContent = '300';
      lastKey = null;
      addDebugLog('Cleared text');
    });

    container.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    container.addEventListener('touchend', e => e.preventDefault(), { passive: false });

    addDebugLog('T9 Ready - onPost: ' + (typeof onPost === 'function'));

    return () => {
      container.innerHTML = '';
    };
  }, [onPost]);

  return <div ref={containerRef} />;
}

// Main App Component
export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const agent = new BskyAgent({ service: 'https://bsky.social/xrpc/' });

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

  const handlePost = async (text) => {
    try {
      await agent.post({
        text: text,
        createdAt: new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
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

  return <T9KeyPad onPost={handlePost} />;
}
