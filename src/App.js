import React, { useState, useEffect } from 'react';
import WebPlayback from './WebPlayback.jsx'
import Login from './Login'
import './App.css';


function App() {

  const [token, setToken] = useState('');

  useEffect(() => {

    async function getToken() {
      const response = await fetch('http://localhost:5000/auth/token');
      const json = await response.json();
      console.log(json.access_token);
      setToken(json.access_token);
    }

    getToken();

  }, []);

  return (
    <>
        { (token === '') ? <Login/> : <WebPlayback token={token} /> }
    </>
  );
}

export default App;
