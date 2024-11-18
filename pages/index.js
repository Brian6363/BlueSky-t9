function T9KeyPad({ onPost }) {
  const [displayText, setDisplayText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const lastKey = useRef({key: null, index: 0});

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

  const handleKey = useCallback((key) => {
    const chars = keyMappings[key];
    
    if (lastKey.current.key === key) {
      // Always cycle to next character for same key
      lastKey.current.index = (lastKey.current.index + 1) % chars.length;
      setDisplayText(prev => prev.slice(0, -1) + chars[lastKey.current.index]);
    } else {
      // New key pressed - add first character
      if (displayText.length < 300) {
        lastKey.current = { key, index: 0 };
        setDisplayText(prev => prev + chars[0]);
      }
    }
    
    navigator?.vibrate?.(1);
  }, [displayText.length]);

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
          <p className="text-green-400 break-words text-lg">
            {displayText || 'Type your post...'}
          </p>
        </div>
        <div className="text-right text-sm mt-1 text-green-400">
          {300 - displayText.length}
        </div>
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
            setDisplayText(t => t.slice(0, -1));
            navigator?.vibrate?.(1);
          }}
          className="bg-gray-300 active:bg-gray-400 rounded-lg text-center p-4"
        >
          <div className="text-xl">*</div>
        </button>
        
        <T9Button value="0" chars={keyMappings['0']} />
        
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            setDisplayText(t => t.slice(0, -1));
            navigator?.vibrate?.(1);
          }}
          className="bg-gray-300 active:bg-gray-400 rounded-lg text-center p-4"
        >
          <div className="text-xl">#</div>
        </button>
      </div>

      <button
        onTouchStart={async (e) => {
          e.preventDefault();
          if (!displayText.trim() || isPosting) return;
          setIsPosting(true);
          try {
            await onPost(displayText);
            setDisplayText('');
          } finally {
            setIsPosting(false);
          }
        }}
        className="w-full mt-4 p-4 rounded-lg bg-blue-500 text-white text-lg
                   active:bg-blue-600 disabled:bg-gray-400"
        disabled={isPosting || !displayText.trim()}
      >
        {isPosting ? 'Posting...' : 'Post to BlueSky'}
      </button>
    </div>
  );
}s
