function T9KeyPad({ onPost }) {
  const containerRef = useRef();
  const VERSION = "v2.0.0"; // Increased version number

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let text = '';
    let lastKey = null;
    let tapCount = 0;

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

    // Dramatically different UI
    container.innerHTML = `
      <div class="w-11/12 max-w-sm mx-auto bg-purple-900 rounded-lg p-4 shadow-xl select-none">
        <div class="text-center mb-4">
          <h1 class="text-yellow-400 text-2xl font-bold">📱 NEW T9 KEYBOARD ${VERSION}</h1>
        </div>
        <div class="bg-purple-800 p-3 rounded-lg mb-4">
          <div class="bg-purple-950 min-h-24 p-2 rounded">
            <p id="display" class="text-yellow-400 break-words text-lg">Type your post...</p>
          </div>
          <div id="counter" class="text-right text-sm mt-1 text-yellow-400">300</div>
        </div>
        <div id="keypad" class="grid grid-cols-3 gap-2"></div>
        <button id="post" class="w-full mt-4 p-4 rounded-lg bg-yellow-500 text-purple-900 text-lg font-bold text-center">
          Post to BlueSky
        </button>
      </div>
    `;

    const display = container.querySelector('#display');
    const counter = container.querySelector('#counter');
    const keypad = container.querySelector('#keypad');

    function handleKey(key) {
      const chars = keyMappings[key];
      
      if (key !== lastKey) {
        tapCount = 0;
        if (text.length < 300) {
          text += chars[0];
        }
      } else {
        tapCount = (tapCount + 1) % chars.length;
        text = text.slice(0, -1) + chars[tapCount];
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
        btn.className = 'bg-purple-700 hover:bg-purple-600 active:bg-purple-500 rounded-lg text-center p-4';
        
        if (keyMappings[key]) {
          btn.innerHTML = `
            <div class="text-xl font-bold text-yellow-400">${key}</div>
            <div class="text-xs text-yellow-300">${keyMappings[key].join(' ')}</div>
          `;
        } else {
          btn.innerHTML = `<div class="text-xl text-yellow-400">${key}</div>`;
        }

        btn.addEventListener('touchstart', (e) => {
          e.preventDefault();
          if (key === '*' || key === '#') {
            text = text.slice(0, -1);
            display.textContent = text || 'Type your post...';
            counter.textContent = 300 - text.length;
            lastKey = null;
          } else if (keyMappings[key]) {
            handleKey(key);
          }
        }, { passive: false });

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
