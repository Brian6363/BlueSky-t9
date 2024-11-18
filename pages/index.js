function T9KeyPad({ onPost }) {
  const containerRef = useRef();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let text = '';
    let lastKey = null;
    let lastIndex = -1;

    // Define key positions - we'll use this to determine which key was pressed
    const keyPositions = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['*', '0', '#']
    ];

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

    // Create bare minimum UI structure
    container.innerHTML = `
      <div class="w-11/12 max-w-sm mx-auto bg-gray-200 rounded-lg p-4 shadow-xl select-none">
        <div class="bg-green-800 p-3 rounded-lg mb-4">
          <div class="bg-green-900 min-h-24 p-2 rounded">
            <p id="display" class="text-green-400 break-words text-lg">Type your post...</p>
          </div>
          <div id="counter" class="text-right text-sm mt-1 text-green-400">300</div>
        </div>
        <div id="touchSurface" class="relative" style="touch-action:none">
          <div id="keypad" class="grid grid-cols-3 gap-2 pointer-events-none"></div>
        </div>
        <button id="post" class="w-full mt-4 p-4 rounded-lg bg-blue-500 text-white text-lg text-center">
          Post to BlueSky
        </button>
      </div>
    `;

    const display = container.querySelector('#display');
    const counter = container.querySelector('#counter');
    const touchSurface = container.querySelector('#touchSurface');
    const keypad = container.querySelector('#keypad');
    
    // Set up visual keypad (no event handlers on individual buttons)
    keyPositions.flat().forEach(key => {
      const btn = document.createElement('div');
      btn.className = 'bg-gray-300 rounded-lg text-center p-4';
      if (keyMappings[key]) {
        btn.innerHTML = `
          <div class="text-xl font-bold">${key}</div>
          <div class="text-xs">${keyMappings[key].join(' ')}</div>
        `;
      } else {
        btn.innerHTML = `<div class="text-xl">${key}</div>`;
      }
      keypad.appendChild(btn);
    });

    // Get key based on touch coordinates
    function getKeyFromTouch(touch) {
      const rect = touchSurface.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const colWidth = rect.width / 3;
      const rowHeight = rect.height / 4;
      
      const col = Math.floor(x / colWidth);
      const row = Math.floor(y / rowHeight);
      
      return keyPositions[row]?.[col];
    }

    // Single touch handler for entire surface
    function handleTouch(e) {
      e.preventDefault();
      
      const key = getKeyFromTouch(e.touches[0]);
      if (!key) return;

      // Visual feedback for the touched key
      const buttons = keypad.children;
      const index = keyPositions.flat().indexOf(key);
      if (index >= 0) {
        buttons[index].classList.add('bg-gray-400');
        setTimeout(() => buttons[index].classList.remove('bg-gray-400'), 100);
      }

      if (key === '*' || key === '#') {
        if (text.length > 0) {
          text = text.slice(0, -1);
          lastKey = null;
          lastIndex = -1;
        }
      } else if (keyMappings[key]) {
        const chars = keyMappings[key];
        if (key === lastKey) {
          lastIndex = (lastIndex + 1) % chars.length;
          text = text.slice(0, -1) + chars[lastIndex];
        } else if (text.length < 300) {
          text += chars[0];
          lastKey = key;
          lastIndex = 0;
        }
      }

      display.textContent = text || 'Type your post...';
      counter.textContent = 300 - text.length;
      navigator?.vibrate?.(1);
    }

    // Attach single touch handler to surface
    touchSurface.addEventListener('touchstart', handleTouch, {passive: false});
    
    // Prevent any default touch behaviors
    container.addEventListener('touchmove', e => e.preventDefault(), {passive: false});
    container.addEventListener('touchend', e => e.preventDefault(), {passive: false});

    // Handle posting
    container.querySelector('#post').addEventListener('click', async () => {
      if (!text.trim()) return;
      try {
        await onPost(text);
        text = '';
        lastKey = null;
        lastIndex = -1;
        display.textContent = 'Type your post...';
        counter.textContent = '300';
      } catch (error) {
        console.error(error);
      }
    });

    return () => {
      container.innerHTML = '';
    };
  }, [onPost]);

  return <div ref={containerRef} />;
}
