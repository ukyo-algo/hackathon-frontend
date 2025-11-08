import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [message, setMessage] = useState("");

  // / (ルート) からメッセージを取得
  useEffect(() => {
    fetch(API_URL) // APIのベースURL（FastAPIのルート）にリクエスト
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setMessage(data.message); // FastAPIからの {"message": "..."} をセット
      })
      .catch(err => console.error("Error fetching root:", err));
  }, []); // [] を指定することで、コンポーネントのマウント時に1回だけ実行されます

  return (
    <div>
      <h1>React + FastAPI</h1>
      <p>Message from FastAPI: <strong>{message}</strong></p>
    </div>
  );
}

export default App;