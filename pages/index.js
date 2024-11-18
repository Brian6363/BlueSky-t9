function T9KeyPad({ onPost }) {
  const [displayText, setDisplayText] = useState('');
  const [mode, setMode] = useState('ABC');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState('');
  
  // Simplified key state using a single ref instead of multiple states
  const keyState = useRef({
    currentKey: null,
    lastPressTime: 0,
    pressCount: 0
  });

  const remainingChars = MAX_POST_LENGTH - displayText.length;
  const isOverLimit = remainingChars < 0;

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

  // Optimized key press handler
  const handleKeyPress = useCallback((key) => {
    const now = Date.now();
    const state = keyState.current;
    
    if (state.currentKey === key && now - state.lastPressTime < 800) {
      // Same key pressed within 800ms, cycle through characters
      const chars = keyMappings[key];
      state.pressCount = (state.pressCount + 1) % chars.length;
      setDisplayText(text => text.slice(0, -1) + chars[state.pressCount]);
    } else {
      // New key or timeout exceeded
      if (displayText.length < MAX_POST_LENGTH) {
        setDisplayText(text => text + keyMappings[key][0]);
      }
      state.pressCount = 0;
    }
    
    state.currentKey = key;
    state.lastPressTime = now;

    // Quick vibration feedback
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  }, [displayText]);

  // Optimized handlers with immediate feedback
  const handleDelete = useCallback(() => {
    setDisplayText(text => text.slice(0, -1));
    if (navigator.vibrate) navigator.vibrate([25, 25]);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode => mode === 'ABC' ? '123' : 'ABC');
    if (navigator.vibrate) navigator.vibrate(25);
  }, []);

  const handlePostSubmit = async () => {
    if (isOverLimit || !displayText.length) return;
    setIsPosting(true);
    setPostError('');
    
    try {
      await onPost(displayText);
      setDisplayText('');
      alert('Posted successfully!');
    } catch (error) {
      setPostError('Failed to post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="w-11/12 max-w-sm mx-auto bg-gray-200 rounded-lg p-4 shadow-xl">
      {/* Screen */}
      <div className="bg-green-800 p-3 rounded-lg mb-4">
        <div className="flex justify-between text-green-400 text-xs mb-1">
          <span>BlueSky</span>
          <span>{mode}</span>
        </div>
        <div className="bg-green-900 min-h-24 p-2 rounded relative">
          <p className="text-green-400 break-words text-lg">
            {displayText || 'Type your post...'}
          </p>
          {isPosting && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-green-400">Posting...</span>
            </div>
          )}
        </div>
        <div className={`text-right text-sm mt-1 ${isOverLimit ? 'text-red-400' : 'text-green-400'}`}>
          {remainingChars}
        </div>
      </div>

      {postError && (
        <div className="text-red-500 text-sm mb-2 text-center">{postError}</div>
      )}

      {/* Optimized Keypad */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onTouchStart={() => handleKeyPress(num.toString())}
            onClick={() => handleKeyPress(num.toString())}
            className="bg-gray-300 active:bg-gray-500 p-4 rounded-lg text-center select-none touch-manipulation"
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              userSelect: 'none'
            }}
          >
            <div className="text-xl font-bold">{num}</div>
            <div className="text-xs">{keyMappings[num].join(' ')}</div>
          </button>
        ))}
        <button
          onTouchStart={toggleMode}
          onClick={toggleMode}
          className="bg-gray-300 active:bg-gray-500 p-4 rounded-lg text-center text-xl select-none touch-manipulation"
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            userSelect: 'none'
          }}
        >
          *
        </button>
        <button
          onTouchStart={() => handleKeyPress('0')}
          onClick={() => handleKeyPress('0')}
          className="bg-gray-300 active:bg-gray-500 p-4 rounded-lg text-center select-none touch-manipulation"
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            userSelect: 'none'
          }}
        >
          <div className="text-xl font-bold">0</div>
          <div className="text-xs">space</div>
        </button>
        <button
          onTouchStart={handleDelete}
          onClick={handleDelete}
          className="bg-gray-300 active:bg-gray-500 p-4 rounded-lg text-center text-xl select-none touch-manipulation"
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            userSelect: 'none'
          }}
        >
          #
        </button>
      </div>

      {/* Send Button */}
      <button
        onClick={handlePostSubmit}
        disabled={isOverLimit || displayText.length === 0 || isPosting}
        className={`w-full mt-4 p-4 rounded-lg flex items-center justify-center gap-2 text-white text-lg font-medium select-none
          ${isOverLimit || displayText.length === 0 || isPosting
            ? 'bg-gray-400'
            : 'bg-blue-500 active:bg-blue-700'}`}
        style={{
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          userSelect: 'none'
        }}
      >
        {isPosting ? 'Posting...' : 'Post to BlueSky'}
      </button>
    </div>
  );
}
