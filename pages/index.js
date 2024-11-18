function T9KeyPad({ onPost }) {
  const [isPosting, setIsPosting] = useState(false);
  const containerRef = useRef();

  useEffect(() => {
    // Pure JS implementation
    const container = containerRef.current;
    if (!container) return;

    let display, counter;
    let text = '';
    let lastKey = null;
    let lastIndex = -1;

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

    // Create UI
    container.innerHTML = `
      <div class="w-11/12 max-w-sm mx-auto bg-gray-200 rounded-lg p-4 shadow-xl select-none">
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

    display = container.querySelector('#display');
    counter = container.querySelector('#counter');
    const keypad = container.querySelector('#keypad');
    const postButton = container.querySelector('#post');

    // Create keypad
    const keys = [...Array(9)].map((_, i) => i + 1).concat(['*', 0, '#']);
    keys.forEach(key => {
      const btn = document.createElement('div');
      btn.className = 'bg-gray-300 active:bg-gray-400 rounded-lg text-center p-4';
      btn.setAttribute('data-key', key);
      if (keyMappings[key]) {
        btn.innerHTML = `
          <div class="text-xl font-bold">${key}</div>
          <div class="text-xs">${keyMappings[key].join(' ')}</div>
        `;
      } else {
        btn.innerHTML = `<div class="text-xl">${key}</div>`;
      }
      btn.style.cssText = 'touch-action: none; -webkit-user-select: none; user-select: none;';
      keypad.appendChild(btn);
    });

    // Direct touch handler
    function handleTouch(e) {
      const key = e.target.closest('[data-key]')?.getAttribute('data-key');
      if (!key) return;
      
      e.preventDefault();

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

    // Attach handlers at the lowest level
    container.addEventListener('touchstart', handleTouch, {capture: true, passive: false});
    
    postButton.addEventListener('click', async () => {
      if (!text.trim() || isPosting) return;
      setIsPosting(true);
      try {
        await onPost(text);
        text = '';
        lastKey = null;
        lastIndex = -1;
        display.textContent = 'Type your post...';
        counter.textContent = '300';
      } finally {
        setIsPosting(false);
      }
    });

    // Prevent default touch behaviors
    container.addEventListener('touchmove', e => e.preventDefault(), {passive: false});
    container.addEventListener('touchend', e => e.preventDefault(), {passive: false});

    return () => {
      container.innerHTML = '';
    };
  }, [isPosting, onPost]);

  return <div ref={containerRef} />;
}
