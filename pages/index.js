function T9KeyPad({ onPost }) {
  const [displayText, setDisplayText] = useState('');
  const [mode, setMode] = useState('ABC');
  const [isPosting, setIsPosting] = useState(false);
  
  // Use refs for instant updates
  const textRef = useRef(displayText);
  textRef.current = displayText;
  
  const keyState = useRef({
    lastKey: null,
    lastPress: 0,
    count: 0
  });

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

  const handleKeyPress = useCallback((key) => {
    const now = Date.now();
    const state = keyState.current;
    const chars = keyMappings[key];
    
    // Direct state mutation for instant feedback
    if (state.lastKey !== key || now - state.lastPress > 750) {
      state.count = 0;
      if (textRef.current.length < 300) {
        setDisplayText(text => text + chars[0]);
      }
    } else {
      state.count = (state.count + 1) % chars.length;
      setDisplayText(text => text.slice(0, -1) + chars[state.count]);
    }
    
    state.lastKey = key;
    state.lastPress = now;
    
    // Ultra-short vibration
    if (navigator.vibrate) navigator.vibrate(5);
  }, []);

  const Button = ({ children, onPress }) => (
    <button
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      className="bg-gray-300 active:bg-gray-500 p-4 rounded-lg text-center select-none"
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
        MozUserSelect: 'none'
      }}
    >
      {children}
    </button>
  );

  return (
    <div className="w-11/12 max-w-sm mx-auto bg-gray-200 rounded-lg p-4 shadow-xl">
      <div className="bg-green-800 p-3 rounded-lg mb-4">
        <div className="flex justify-between text-green-400 text-xs mb-1">
          <span>BlueSky</span>
          <span>{mode}</span>
        </div>
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
          <Button
            key={num}
            onPress={() => handleKeyPress(num.toString())}
          >
            <div className="text-xl font-bold">{num}</div>
            <div className="text-xs">{keyMappings[num].join(' ')}</div>
          </Button>
        ))}
        
        <Button onPress={() => {
          setMode(m => m === 'ABC' ? '123' : 'ABC');
          if (navigator.vibrate) navigator.vibrate(5);
        }}>
          <div className="text-xl">*</div>
        </Button>
        
        <Button onPress={() => handleKeyPress('0')}>
          <div className="text-xl font-bold">0</div>
          <div className="text-xs">space</div>
        </Button>
        
        <Button onPress={() => {
          setDisplayText(t => t.slice(0, -1));
          if (navigator.vibrate) navigator.vibrate(5);
        }}>
          <div className="text-xl">#</div>
        </Button>
      </div>

      <button
        onClick={async () => {
          if (!displayText.trim() || isPosting) return;
          setIsPosting(true);
          try {
            await onPost(displayText);
            setDisplayText('');
          } finally {
            setIsPosting(false);
          }
        }}
        className="w-full mt-4 p-4 rounded-lg bg-blue-500 text-white text-lg font-medium
          disabled:bg-gray-400 active:bg-blue-700"
        disabled={isPosting || !displayText.trim()}
      >
        {isPosting ? 'Posting...' : 'Post to BlueSky'}
      </button>
    </div>
  );
}
