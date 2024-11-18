function T9KeyPad({ onPost }) {
  const displayRef = useRef(null);
  const textRef = useRef('');
  const lastKey = useRef({ key: null, index: -1 });
  const [isPosting, setIsPosting] = useState(false);

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

  // Pre-activate touch handling
  useLayoutEffect(() => {
    const touchMap = new Map();
    let isInitialized = false;

    const handleTouch = (e) => {
      if (!isInitialized) {
        document.documentElement.style.touchAction = 'none';
        isInitialized = true;
      }

      const touch = e.changedTouches[0];
      if (!touch) return;

      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!element) return;

      const key = element.getAttribute('data-key');
      if (!key) return;

      e.preventDefault();

      // Handle key press
      if (key === 'delete') {
        textRef.current = textRef.current.slice(0, -1);
        lastKey.current = { key: null, index: -1 };
      } else if (keyMappings[key]) {
        const chars = keyMappings[key];
        if (lastKey.current.key === key) {
          lastKey.current.index = (lastKey.current.index + 1) % chars.length;
          textRef.current = textRef.current.slice(0, -1) + chars[lastKey.current.index];
        } else {
          if (textRef.current.length < 300) {
            lastKey.current = { key, index: 0 };
            textRef.current = textRef.current + chars[0];
          }
        }
      }

      // Update display directly
      if (displayRef.current) {
        displayRef.current.textContent = textRef.current || 'Type your post...';
        const counter = displayRef.current.nextElementSibling;
        if (counter) counter.textContent = 300 - textRef.current.length;
      }

      navigator?.vibrate?.(1);
    };

    // Add capture phase listeners
    document.addEventListener('touchstart', handleTouch, { capture: true, passive: false });
    document.addEventListener('touchmove', (e) => e.preventDefault(), { capture: true, passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouch, { capture: true });
      document.removeEventListener('touchmove', (e) => e.preventDefault(), { capture: true });
      document.documentElement.style.touchAction = '';
    };
  }, []);

  return (
    <div className="w-11/12 max-w-sm mx-auto bg-gray-200 rounded-lg p-4 shadow-xl select-none">
      {/* Display */}
      <div className="bg-green-800 p-3 rounded-lg mb-4">
        <div className="bg-green-900 min-h-24 p-2 rounded">
          <p ref={displayRef} className="text-green-400 break-words text-lg">
            Type your post...
          </p>
        </div>
        <div className="text-right text-sm mt-1 text-green-400">300</div>
      </div>

      {/* Pre-activated keypad */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <div
            key={num}
            data-key={num}
            className="bg-gray-300 active:bg-gray-400 rounded-lg text-center p-4"
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none'
            }}
          >
            <div className="text-xl font-bold">{num}</div>
            <div className="text-xs">{keyMappings[num].join(' ')}</div>
          </div>
        ))}
        
        <div
          data-key="delete"
          className="bg-gray-300 active:bg-gray-400 rounded-lg text-center p-4"
          style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="text-xl">*</div>
        </div>
        
        <div
          data-key="0"
          className="bg-gray-300 active:bg-gray-400 rounded-lg text-center p-4"
          style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="text-xl font-bold">0</div>
          <div className="text-xs">space</div>
        </div>
        
        <div
          data-key="delete"
          className="bg-gray-300 active:bg-gray-400 rounded-lg text-center p-4"
          style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="text-xl">#</div>
        </div>
      </div>

      <div
        onClick={async () => {
          if (!textRef.current.trim() || isPosting) return;
          setIsPosting(true);
          try {
            await onPost(textRef.current);
            textRef.current = '';
            if (displayRef.current) {
              displayRef.current.textContent = 'Type your post...';
              const counter = displayRef.current.nextElementSibling;
              if (counter) counter.textContent = '300';
            }
          } finally {
            setIsPosting(false);
          }
        }}
        className="w-full mt-4 p-4 rounded-lg bg-blue-500 text-white text-lg text-center
                   active:bg-blue-600 disabled:bg-gray-400"
      >
        {isPosting ? 'Posting...' : 'Post to BlueSky'}
      </div>
    </div>
  );
}
