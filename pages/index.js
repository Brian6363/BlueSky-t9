function T9KeyPad({ onPost }) {
  const [displayText, setDisplayText] = useState('');
  const [mode, setMode] = useState('ABC');
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

  // Simplified instant press handler
  const handleKeyPress = (key) => {
    if (displayText.length < 300) {
      setDisplayText(text => text + keyMappings[key][0]);
      if (navigator.vibrate) navigator.vibrate(10);
    }
  };

  const handleDelete = () => {
    setDisplayText(text => text.slice(0, -1));
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const toggleMode = () => {
    setMode(mode => mode === 'ABC' ? '123' : 'ABC');
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handlePost = async () => {
    if (!displayText.trim()) return;
    setIsPosting(true);
    try {
      await onPost(displayText);
      setDisplayText('');
    } finally {
      setIsPosting(false);
    }
  };

  const Button = ({ children, onPress, className = "" }) => (
    <button
      onTouchStart={(e) => {
        e.preventDefault();
        onPress();
      }}
      onClick={onPress}
      className={`active:bg-gray-500 p-4 rounded-lg text-center select-none 
        touch-manipulation bg-gray-300 ${className}`}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none'
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
        
        <Button onPress={toggleMode}>
          <div className="text-xl">*</div>
        </Button>
        
        <Button onPress={() => handleKeyPress('0')}>
          <div className="text-xl font-bold">0</div>
          <div className="text-xs">space</div>
        </Button>
        
        <Button onPress={handleDelete}>
          <div className="text-xl">#</div>
        </Button>
      </div>

      <Button 
        onPress={handlePost}
        className="w-full mt-4 bg-blue-500 text-white"
      >
        {isPosting ? 'Posting...' : 'Post to BlueSky'}
      </Button>
    </div>
  );
}
