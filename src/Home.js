import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import WebPlayback from './WebPlayback.jsx';
import Login from './Login';
import Invitado from './Invitado.js';

function Home(props) {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState('');
  
  useEffect(() => {
    setToken(props.token);
    }, [props.token]);

    useEffect(() => {
        const getTokenFromLocalStorage = () => {
          const storedToken = localStorage.getItem('token');
          const storedExpiration = localStorage.getItem('tokenExpiration');

            
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

    
          if (storedToken && storedExpiration) {
            const currentTime = new Date().getTime();
            if (currentTime < parseInt(storedExpiration)) {
              // El token aún es válido
              console.log("token anterior" + token)

              console.log('El token aún es válido, se establece en el estado')
              setToken(storedToken);
            } else {
              // El token ha caducado
              handleTokenExpired();
            }
        
        } 
        }
        //else {
        //     // No se encontró ningún token en el localStorage
        //     // Realiza las acciones necesarias
    
        //     // Obtener el token de la URL
        //     const urlParams = new URLSearchParams(window.location.search);
        //     const tokenURL = urlParams.get('token');
    
        //     console.log(tokenURL);
    
        //     if (tokenURL) {
        //       console.log('El token está disponible')
        //       handleLogin(tokenURL);
        //     } else {
        //       // El token no está disponible
        //       // El usuario debe iniciar sesión
        //       console.log('El usuario debe iniciar sesión');
        //     }
        //   }
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

  const handleAnfitrionClick = () => {
    setRole('anfitrion');
  };

  const handleInvitadoClick = () => {
    setRole('invitado');
  };

  return (
    <>
      {(!token) ? (
        <Login />
      ) : role === 'anfitrion' ? (
        <WebPlayback token={token} />
      ) : role === 'invitado' ? (
        <Invitado token={token} />
      ) : (
        <Container className="d-flex justify-content-center align-items-center vh-100">
          <Button variant="success" className="me-2" onClick={handleAnfitrionClick}>
            Ser Anfitrión
          </Button>
          <Button variant="info" onClick={handleInvitadoClick}>
            Ser Invitado
          </Button>
        </Container>
      )}
    </>
  );
}

export default Home;
