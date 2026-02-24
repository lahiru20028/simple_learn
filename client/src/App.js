import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askTeacher = async () => {
    if (!input) return;
    setLoading(true);
    setResponse(''); // Clear previous response
    try {
      // Connecting to backend
      const res = await axios.post('http://localhost:5000/api/chat', { question: input });
      setResponse(res.data.answer);
    } catch (error) {
      console.error(error);
      setResponse("Sorry, there was a problem getting the answer.");
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Simple Learn 🎓</h1>
        <p>AI Assistant for Students</p>
      </header>
      
      <div className="chat-container" style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
        <textarea 
          style={{ width: '100%', height: '100px', borderRadius: '8px', padding: '10px' }}
          placeholder="Type the topic you want to learn here..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <br />
        <button 
          onClick={askTeacher} 
          disabled={loading}
          style={{ marginTop: '10px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          {loading ? "Thinking..." : "Ask Teacher"}
        </button>

        {response && (
          <div className="response-box" style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'left', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ color: '#007bff' }}>Simple Learn's Answer:</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;