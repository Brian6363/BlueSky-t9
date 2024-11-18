function T9KeyPad({ onPost }) {
  const [isPosting, setIsPosting] = useState(false);
  const displayRef = useRef(null);
  const textRef = useRef('');
  const lastKey = useRef({key: null, index: -1});
  
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

  const handleKey = useCallback((key) => {
    const chars = keyMappings[key];
    const currentText = textRef.current;
    
    if (currentText.length >= 300 && lastKey.current.key !== key) return;
    
    if (lastKey.current.key === key) {
      // Instant cycle through characters
      lastKey.current.index = (lastKey.current.index + 1) % chars.length;
      updateDisplay(currentText.slice(0, -1) + chars[lastKey.current.index]);
    } else {
      // New key pressed
      lastKey.current = { key, index: 0 };
      updateDisplay(currentText + chars[0]);
    }
    
    navigator?.vibrate?.(1);
  }, []);

  const handleDelete = useCallback(() => {
    updateDisplay(textRef.current.slice(0, -1));
    lastKey.current = { key: null, index: -1 };
    navigator?.vibrate?.(1);
  }, []);

  const handlePost = async () => {
    if (!textRef.current.trim() || isPosting) return;
    setIsPosting(true);
    try {
      await onPost(textRef.current);
      updateDisplay('');
      lastKey.current = { key: null, index: -1 };
    } finally {
      setIsPosting(false);
    }
  };

  const T9Button = memo(({ value, chars }) => (
    <button
      onTouchStart={(e) => {
        e.preventDefault();
        handleKey(value);
      }}
      className="bg-gray-300 active:bg-gray-400 rounded-lg text-center p-4
                 touch-manipulation select-none"
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none'
      }}
    >
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs">{chars.join(' ')}</div>
    </button>
  ));

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

      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <T9Button 
            key={num} 
            value={num.toString()} 
            chars={keyMappings[num.toString()]}
          />
        ))}
        
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            handleDelete();
          }}
          className="bg-gray-300 active:bg-gray-400 rounded-lg text-center p-4"
        >
          <div className="text-xl">*</div>
        </button>
        
        <T9Button value="0" chars={keyMappings['0']} />
        
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            handleDelete();
          }}
          className="bg-gray-300 active:bg-gray-400 rounded-lg text-center p-4"
        >
          <div className="text-xl">#</div>
        </button>
      </div>

      <button
        onTouchStart={(e) => {
          e.preventDefault();
          handlePost();
        }}
        className="w-full mt-4 p-4 rounded-lg bg-blue-500 text-white text-lg
                   active:bg-blue-600 disabled:bg-gray-400"
        disabled={isPosting}
      >
        {isPosting ? 'Posting...' : 'Post to BlueSky'}
      </button>
    </div>
  );
}
