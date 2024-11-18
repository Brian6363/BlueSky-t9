import React, { useEffect, useRef } from 'react';

function T9KeyPad({ onPost }) {
  const containerRef = useRef();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let text = '';
    let lastKey = null;
    let debugLog = [];

    function addDebugLog(message) {
      debugLog.unshift(message);
      debugLog = debugLog.slice(0, 3); // Keep last 3 messages
      debugInfo.textContent = debugLog.join('\n');
    }

    // Add debug info at the top
    container.innerHTML = `
      <div class="w-64 mx-auto bg-gray-600 rounded-3xl p-4 shadow-xl select-none">
        <!-- Debug Panel -->
        <div class="mb-2 p-2 bg-black rounded text-xs">
          <div class="text-yellow-400 font-mono" id="debugInfo">Debug info will appear here</div>
        </div>

        <div class="bg-[#b5c9a4] p-3 rounded mb-4 shadow-inner"
             style="font-family: 'Courier New', monospace;">
          <!-- Rest of the UI same as before -->
    `;

    // ... (rest of your UI HTML)

    function handleSend() {
      addDebugLog('Send pressed: ' + new Date().toLocaleTimeString());
      addDebugLog('Text length: ' + text.length);
      
      if (!text.trim()) {
        addDebugLog('Error: No text to send');
        return;
      }

      if (!onPost) {
        addDebugLog('Error: onPost not available');
        return;
      }

      sendBtn.style.backgroundColor = '#1c6a13';
      
      try {
        onPost(text);
        text = '';
        display.textContent = 'Type your post...';
        counter.textContent = '300';
        lastKey = null;
        addDebugLog('Success: Text sent');
      } catch (error) {
        addDebugLog('Error: ' + error.message);
      } finally {
        setTimeout(() => {
          sendBtn.style.backgroundColor = '#2c8a23';
        }, 100);
      }
    }

    // ... (rest of your code remains the same)

    return () => {
      container.innerHTML = '';
    };
  }, [onPost]);

  return <div ref={containerRef} />;
}

export default T9KeyPad;
