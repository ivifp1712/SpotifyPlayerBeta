import {React, useState } from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { collection, query, where, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";


const InvitadoLogin = () =>  {
    const fs = getFirestore();
    // acceder a local storage y registrar el nombre del invitado
    const [nombreInvitado, setNombreInvitado] = useState('');
    const [codigoSala, setCodigoSala] = useState('');


    const handleNameChange = (event) => {
        setNombreInvitado(event.target.value);
    };
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        localStorage.setItem('guestName', nombreInvitado);
        // comprobar si la sala existe, devolver error en caso de fallo
        // redirigir a la sala

        const salaRef = collection(fs, 'salas');
        const q = query(salaRef, where('idSala', '==', codigoSala));
        const querySnapshot = await getDocs(q);
    
        if (!querySnapshot.empty) {
            // redirigir a la sala /salas/:idSala

        } else {
            
        }

    };


  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Form
        onSubmit={handleSubmit}
        style={{
          width: '400px',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '10px',
        }}
      >
        <Form.Group controlId="formNombreInvitado">
          <Form.Label> Código de la sala </Form.Label>
          <Form.Control type="text" value={codigoSala} />
        </Form.Group>
        <br />
        <Button variant="primary" type="submit">
          Conectarse
        </Button>
      </Form>
    </div>

  )
}

export default InvitadoLogin