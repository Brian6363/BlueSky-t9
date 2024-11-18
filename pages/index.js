import { useState, useCallback } from 'react';
import { BskyAgent } from '@atproto/api';
import Head from 'next/head';

const BLUESKY_API = 'https://bsky.social/xrpc/';
const MAX_POST_LENGTH = 300;
const agent = new BskyAgent({ service: BLUESKY_API });

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await agent.login({
        identifier: username,
        password: password,
      });
      setIsLoggedIn(true);
      setError('');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const handlePost = async (text) => {
    try {
      await agent.post({
        text: text,
        createdAt: new Date().toISOString(),
      });
      return true;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to post');
    }
  };

  return (
    <>
      <Head>
        <title>BlueSky T9 Poster</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content="#000000" />
      </Head>
      
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        {!isLoggedIn ? (
          <LoginForm
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            handleLogin={handleLogin}
            error={error}
          />
        ) : (
          <T9KeyPad onPost={handlePost} />
        )}
      </div>
    </>
  );
}

function LoginForm({ username, setUsername, password, setPassword, handleLogin, error }) {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden md:max-w-lg w-11/12">
      <div className="md:flex">
        <div className="w-full px-4 py-6 md:px-6 md:py-8">
          <h2 className="text-center text-2xl font-bold text-gray-700 mb-6">
            BlueSky T9 Poster
          </h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Username or Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-lg"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                App Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-lg"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Use an app password from your BlueSky account settings
              </p>
            </div>
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 text-lg font-medium"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function T9KeyPad({ onPost }) {
  const [displayText, setDisplayText] = useState('');
  const [mode, setMode] = useState('ABC');
  const [currentKey, setCurrentKey] = useState(null);
  const [lastKeyPressTime, setLastKeyPressTime] = useState(0);
  const [keyPressCount, setKeyPressCount] = useState(0);
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState('');

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

  const handleKeyPress = useCallback((key) => {
    const currentTime = new Date().getTime();
    
    if (currentKey === key && currentTime - lastKeyPressTime < 1000) {
      // Same key pressed within 1 second, cycle through characters
      const chars = keyMappings[key];
      setKeyPressCount((count) => (count + 1) % chars.length);
      setDisplayText((text) => text.slice(0, -1) + chars[keyPressCount % chars.length]);
    } else {
      // New key pressed or timeout exceeded
      const chars = keyMappings[key];
      if (displayText.length < MAX_POST_LENGTH) {
        setDisplayText((text) => text + chars[0]);
      }
      setKeyPressCount(0);
    }
    
    setCurrentKey(key);
    setLastKeyPressTime(currentTime);
    
    // Add haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, [currentKey, lastKeyPressTime, keyPressCount, displayText]);

  const handleDelete = () => {
    setDisplayText((text) => text.slice(0, -1));
    if (navigator.vibrate) {
      navigator.vibrate([50, 50]);
    }
  };

  const toggleMode = () => {
    setMode((current) => current === 'ABC' ? '123' : 'ABC');
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handlePostSubmit = async () => {
    if (isOverLimit || displayText.length === 0) return;
    
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

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="bg-gray-300 hover:bg-gray-400 active:bg-gray-500 p-4 rounded-lg text-center touch-manipulation"
          >
            <div className="text-xl font-bold">{num}</div>
            <div className="text-xs">{keyMappings[num].join(' ')}</div>
          </button>
        ))}
        <button
          onClick={toggleMode}
          className="bg-gray-300 hover:bg-gray-400 active:bg-gray-500 p-4 rounded-lg text-center text-xl touch-manipulation"
        >
          *
        </button>
        <button
          onClick={() => handleKeyPress('0')}
          className="bg-gray-300 hover:bg-gray-400 active:bg-gray-500 p-4 rounded-lg text-center touch-manipulation"
        >
          <div className="text-xl font-bold">0</div>
          <div className="text-xs">space</div>
        </button>
        <button
          onClick={handleDelete}
          className="bg-gray-300 hover:bg-gray-400 active:bg-gray-500 p-4 rounded-lg text-center text-xl touch-manipulation"
        >
          #
        </button>
      </div>

      {/* Send Button */}
      <button
        onClick={handlePostSubmit}
        disabled={isOverLimit || displayText.length === 0 || isPosting}
        className={`w-full mt-4 p-4 rounded-lg flex items-center justify-center gap-2 text-white text-lg font-medium
          ${isOverLimit || displayText.length === 0 || isPosting
            ? 'bg-gray-400'
            : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
          }`}
      >
        {isPosting ? 'Posting...' : 'Post to BlueSky'}
      </button>
    </div>
  );
}
