function T9KeyPad({ onPost }) {
  const containerRef = useRef();
  const VERSION = "v1.5.0"; // Visible version number

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let text = '';
    let lastKey = null;
    let tapCount = 0;
    let tapTimeout = null;

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
      <div class="w-11/12 max-w-sm mx-auto bg-gray-200 rounded-lg p-4 shadow-xl select-none">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs text-gray-500">${VERSION}</span>
          <span id="debug" class="text-xs text-gray-500"></span>
        </div>
        <div class="bg-green-800 p-3 rounded-lg mb-4">
          <div class="bg-green-900 min-h-24 p-2 rounded">
            <p id="display" class="text-green-400 break-words text-lg">Type your post...</p>
          </div>
          <div id="counter" class="text-right text-sm mt-1 text-green-400">300</div>
        </div>
        <div id="keypad" class="grid grid-cols-3 gap-2"></div>
        <button id="post" class="w-full mt-4 p-4 rounded-lg bg-blue-500 text-white text-lg text-center">
          Post to BlueSky
        </button>
      </div>
    `;

    const display = container.querySelector('#display');
    const counter = container.querySelector('#counter');
    const keypad = container.querySelector('#keypad');
    const debug = container.querySelector('#debug');

    function updateDisplay(newText) {
      text = newText;
      display.textContent = text || 'Type your post...';
      counter.textContent = 300 - text.length;
    }

    function handleKey(key) {
      clearTimeout(tapTimeout);
      const chars = keyMappings[key];
      
      // Update debug info
      debug.textContent = `Key: ${key}, Taps: ${tapCount + 1}`;

      if (key !== lastKey) {
        // New key pressed
        tapCount = 0;
        if (text.length < 300) {
          updateDisplay(text + chars[0]);
        }
      } else {
        // Same key - instant cycling
        tapCount = (tapCount + 1) % chars.length;
        updateDisplay(text.slice(0, -1) + chars[tapCount]);
      }
      
      lastKey = key;
      
      // Very short reset timeout
      tapTimeout = setTimeout(() => {
        lastKey = null;
        tapCount = 0;
        debug.textContent = 'Reset';
      }, 300);
    }

    function createButton(key) {
      const btn = document.createElement('div');
      btn.className = 'bg-gray-300 active:bg-gray-400 rounded-lg text-center p-4';
      
      if (keyMappings[key]) {
        btn.innerHTML = `
          <div class="text-xl font-bold">${key}</div>
          <div class="text-xs">${keyMappings[key].join(' ')}</div>
        `;
      } else {
        btn.innerHTML = `<div class="text-xl">${key}</div>`;
      }

      // Handle both touch and mouse events
      function handlePress(e) {
        e.preventDefault();
        if (key === '*' || key === '#') {
          updateDisplay(text.slice(0, -1));
          lastKey = null;
          tapCount = 0;
        } else if (keyMappings[key]) {
          handleKey(key);
        }
        navigator?.vibrate?.(1);
      }

      // Using raw event listeners for maximum speed
      btn.addEventListener('touchstart', handlePress, { passive: false });
      btn.addEventListener('mousedown', handlePress);
      
      return btn;
    }

    // Create keypad
    [...Array(9)].map((_, i) => i + 1)
      .concat(['*', '0', '#'])
      .forEach(key => {
        keypad.appendChild(createButton(key));
      });

    // Post button
    container.querySelector('#post').addEventListener('click', async () => {
      if (!text.trim()) return;
      try {
        await onPost(text);
        updateDisplay('');
        lastKey = null;
        tapCount = 0;
      } catch (error) {
        console.error(error);
      }
    });

    // Prevent default touch behaviors
    container.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    container.addEventListener('touchend', e => e.preventDefault(), { passive: false });

    return () => {
      clearTimeout(tapTimeout);
      container.innerHTML = '';
    };
  }, [onPost]);

  return <div ref={containerRef} />;
}
