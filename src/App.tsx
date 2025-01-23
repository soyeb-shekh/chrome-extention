import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

interface Message {
  id: string;
  subject: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch messages from the background script
    chrome.runtime.sendMessage({ action: 'getMessages' }, (response: { status: string; data: Message[] }) => {
      if (response.status === 'messages fetched') {
        setMessages(response.data);
        setLoading(false);
      }
    });
  }, []);

  const archiveEmail = (messageId: string) => {
    chrome.runtime.sendMessage({ action: 'archive', messageId }, (response: { status: string }) => {
      if (response.status === 'success') {
        console.log(`Email with ID ${messageId} archived successfully.`);
        setMessages(messages.filter(msg => msg.id !== messageId));
      }
    });
  };

  if (loading) {
    return <div>Loading messages...</div>;
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Gmail Archive Extension</h1>
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <p>{message.subject}</p>
            <button onClick={() => archiveEmail(message.id)}>Archive</button>
          </div>
        ))}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
