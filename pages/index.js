import React, { useState } from 'react';
import { BskyAgent } from '@atproto/api';

// T9 component directly in index.js for now
function T9KeyPad({ onPost }) {
  const containerRef = React.useRef();
  // ... rest of your T9KeyPad code ...
}

// Main app
export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const agent = new BskyAgent({ service: 'https://bsky.social/xrpc/' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await agent.login({
        identifier: username,
        password: password
      });
      setIsLoggedIn(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePost = async (text) => {
    try {
      await agent.post({
        text: text,
        createdAt: new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">BlueSky T9</h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="App Password"
              className="w-full p-2 mb-4 border rounded"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <T9KeyPad onPost={handlePost} />;
}
