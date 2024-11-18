import { useState } from 'react';
import { BskyAgent } from '@atproto/api';
import T9KeyPad from '../components/T9KeyPad';  // Adjust path as needed

// Configure BlueSky API
const BLUESKY_API = 'https://bsky.social/xrpc/';
const agent = new BskyAgent({ service: BLUESKY_API });

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Login handler
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

  // Post handler - this is the function we pass to T9KeyPad
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden md:max-w-lg w-11/12">
          <div className="md:flex">
            <div className="w-full px-4 py-6 md:px-6 md:py-8">
              <h2 className="text-center text-2xl font-bold text-gray-700 mb-6">
                BlueSky T9 Login
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
      </div>
    );
  }

  // Pass handlePost to T9KeyPad
  return <T9KeyPad onPost={handlePost} />;
}
