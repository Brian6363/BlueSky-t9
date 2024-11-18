import React, { useEffect, useRef } from 'react';

function T9KeyPad({ onPost }) {
  const containerRef = useRef();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let text = '';
    let lastKey = null;

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

    container.innerHTML = `
      <div class="w-11/12 max-w-sm mx-auto bg-gray-600 rounded-3xl p-6 shadow-xl select-none"
           style="background: linear-gradient(145deg, #666666, #4a4a4a);">
        <div class="bg-[#b5c9a4] p-4 rounded-lg mb-6 shadow-inner"
             style="font-family: 'Courier New', monospace;">
          <div class="flex justify-between text-[#2c3a23] text-xs mb-1">
            <span>BlueSky</span>
            <span>ABC</span>
          </div>
          <div class="min-h-24 break-words">
            <p id="display" class="text-[#2c3a23] text-lg" 
               style="font-family: 'Courier New', monospace; line-height: 1.2;">
              Type your post...
            </p>
          </div>
          <div id="counter" class="text-right text-sm mt-1 text-[#2c3a23]">300</div>
        </div>
        <div id="keypad" class="grid grid-cols-3 gap-3"></div>
        <button id="post" class="w-full mt-4 p-3 rounded bg-[#2c3a23] text-gray-200 text-sm font-bold text-center
                                shadow-lg active:shadow-sm active:translate-y-px transition-all duration-100">
          Send to BlueSky
        </button>
      </div>
    `;

    const display = container.querySelector('#display');
    const counter = container.querySelector('#counter');
    const keypad = container.querySelector('#keypad');

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
          rounded-lg text-center p-3 select-none
          bg-gradient-to-b from-gray-700 to-gray-800
          shadow-lg active:shadow-sm active:translate-y-px
          transition-all duration-100
        `;
        
        if (keyMappings[key]) {
          btn.innerHTML = `
            <div class="text-gray-200 text-lg font-bold">${key}</div>
            <div class="text-[0.65rem] text-gray-400">${keyMappings[key].join(' ')}</div>
          `;
        } else {
          btn.innerHTML = `<div class="text-gray-200 text-lg">${key}</div>`;
        }

        const pressHandler = (e) => {
          e.preventDefault();
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

    container.querySelector('#post').addEventListener('click', async () => {
      if (!text.trim()) return;
      try {
        await onPost(text);
        text = '';
        display.textContent = 'Type your post...';
        counter.textContent = '300';
        lastKey = null;
      } catch (error) {
        console.error(error);
      }
    });

    container.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    container.addEventListener('touchend', e => e.preventDefault(), { passive: false });

    return () => {
      container.innerHTML = '';
    };
  }, [onPost]);

  return <div ref={containerRef} />;
}

export default T9KeyPad;
