import React, { useState, useEffect } from 'react';
import WebPlayback from './WebPlayback.jsx'
import Login from './Login'
import './App.css';
import InvitadoLogin from './InvitadoLogin.js';
import Home from './Home.js';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


function App() {

  const [token, setToken] = useState(undefined);

  useEffect(() => {
    const getTokenFromLocalStorage = () => {
      const storedToken = localStorage.getItem('token');
      const storedExpiration = localStorage.getItem('tokenExpiration');

      if (storedToken && storedExpiration) {
        const currentTime = new Date().getTime();
        if (currentTime < parseInt(storedExpiration)) {
          // El token aún es válido
          setToken(storedToken);
        } else {
          // El token ha caducado
          handleTokenExpired();
        }
      } else {
        // No se encontró ningún token en el localStorage
        // Realiza las acciones necesarias

        // Obtener el token de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const tokenURL = urlParams.get('token');

        console.log(tokenURL);

        if (tokenURL) {
          console.log('El token está disponible')
          handleLogin(tokenURL);
        } else {
          // El token no está disponible
          // El usuario debe iniciar sesión
          console.log('El usuario debe iniciar sesión');
        }
      }
    };

    getTokenFromLocalStorage();
  }, []);

  const handleTokenExpired = () => {
    // El token ha caducado, realiza las acciones correspondientes
    // Por ejemplo, redirige al usuario a la página de inicio de sesión
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    // window.location.href = '/login';
  };

  const handleLogin = (receivedToken) => {
    // Guarda el token en el localStorage con una caducidad de 1 hora
    const expirationTime = new Date().getTime() + 60 * 60 * 1000; // 1 hora
    localStorage.setItem('token', receivedToken);
    localStorage.setItem('tokenExpiration', expirationTime);
    setToken(receivedToken);
  };

  return (
    <>
    <Router>
        { (token == undefined || token == null) ?
        <Routes>
          <Route path="/" element={<Home token={token}/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/*" element={<Navigate to="/" />} />
          <Route path="/invitadoLogin" element={<InvitadoLogin />} />
        </Routes>
        
        : 
        <Routes>
          <Route path="/" element={<Home token={token}/>} />
          <Route path="/webplayback" element={<WebPlayback token={token} />} />
          <Route path="/*" element={<Navigate to="/" />} />
        </Routes> 
        }
    </Router></>
  );
}

export default App;
