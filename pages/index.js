function T9KeyPad({ onPost }) {
  const [isPosting, setIsPosting] = useState(false);
  const displayRef = useRef(null);
  const textRef = useRef('');
  const keypadRef = useRef(null);
  const lastKey = useRef({ key: null, index: -1 });

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

  const updateDisplay = (text) => {
    textRef.current = text;
    if (displayRef.current) {
      displayRef.current.textContent = text || 'Type your post...';
      const counter = displayRef.current.nextElementSibling;
      if (counter) counter.textContent = 300 - text.length;
    }
  };

  useEffect(() => {
    const keypad = keypadRef.current;
    if (!keypad) return;

    let activeKey = null;
    let touchStartTime = 0;

    const getKeyFromTouch = (touch) => {
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      return element?.getAttribute('data-key');
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      touchStartTime = performance.now();
      activeKey = getKeyFromTouch(e.touches[0]);
      if (!activeKey) return;

      if (activeKey === 'delete') {
        updateDisplay(textRef.current.slice(0, -1));
        lastKey.current = { key: null, index: -1 };
        return;
      }

      if (activeKey === 'post') {
        if (!isPosting && textRef.current.trim()) {
          setIsPosting(true);
          onPost(textRef.current).finally(() => {
            setIsPosting(false);
            updateDisplay('');
          });
        }
        return;
      }

      const chars = keyMappings[activeKey];
      if (!chars) return;

      const currentText = textRef.current;
      if (currentText.length >= 300 && lastKey.current.key !== activeKey) return;

      if (lastKey.current.key === activeKey) {
        lastKey.current.index = (lastKey.current.index + 1) % chars.length;
        updateDisplay(currentText.slice(0, -1) + chars[lastKey.current.index]);
      } else {
        lastKey.current = { key: activeKey, index: 0 };
        updateDisplay(currentText + chars[0]);
      }

      navigator?.vibrate?.(1);
    };

    const handleTouchEnd = () => {
      activeKey = null;
    };

    keypad.addEventListener('touchstart', handleTouchStart, { passive: false });
    keypad.addEventListener('touchend', handleTouchEnd);

    return () => {
      keypad.removeEventListener('touchstart', handleTouchStart);
      keypad.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPosting, onPost]);

  return (
    <div className="w-11/12 max-w-sm mx-auto bg-gray-200 rounded-lg p-4 shadow-xl">
      <div className="bg-green-800 p-3 rounded-lg mb-4">
        <div className="bg-green-900 min-h-24 p-2 rounded">
          <p ref={displayRef} className="text-green-400 break-words text-lg">
            Type your post...
          </p>
        </div>
        <div className="text-right text-sm mt-1 text-green-400">300</div>
      </div>

      <div ref={keypadRef} className="select-none">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <div
              key={num}
              data-key={num}
              className="bg-gray-300 active:bg-gray-400 rounded-lg text-center p-4 touch-manipulation"
            >
              <div className="text-xl font-bold">{num}</div>
              <div className="text-xs">
                {keyMappings[num].join(' ')}
              </div>
            </div>
          ))}
          
          <div
            data-key="delete"
            className="bg-gray-300 active:bg-gray-400 rounded-lg text-center p-4"
          >
            <div className="text-xl">*</div>
          </div>
          
          <div
            data-key="0"
            className="bg-gray-300 active:bg-gray-400 rounded-lg text-center p-4"
          >
            <div className="text-xl font-bold">0</div>
            <div className="text-xs">space</div>
          </div>
          
          <div
            data-key="delete"
            className="bg-gray-300 active:bg-gray-400 rounded-lg text-center p-4"
          >
            <div className="text-xl">#</div>
          </div>
        </div>

        <div
          data-key="post"
          className={`w-full mt-4 p-4 rounded-lg text-center text-white text-lg
                     ${isPosting ? 'bg-gray-400' : 'bg-blue-500 active:bg-blue-600'}`}
        >
          {isPosting ? 'Posting...' : 'Post to BlueSky'}
        </div>
      </div>
    </div>
  );
}
