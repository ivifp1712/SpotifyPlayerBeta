
import { Button } from 'react-bootstrap';
import React from 'react';

function Login() {
    return (
        <div className="App">
            <header className="App-header">
                <a className="btn-spotify" href="http://192.168.1.50:5000/auth/admin/login" >
                    <Button variant="success">
                        Login in Spotify para admin
                    </Button>
                </a>
                <br />
                <a className="btn-spotify" href="http://192.168.1.50:5000/auth/login" >
                    <Button variant="success">
                        Login in Spotify para invitado
                    </Button>
                </a>
            </header>
        </div>
    );
}

export default Login;
