import React, { useState, useEffect } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import { Button, Form, Alert } from 'react-bootstrap';
import { db } from './FirebaseConfig';
import { collection, query, where, getDocs, updateDoc, addDoc, onSnapshot, doc } from 'firebase/firestore';
import './Invitado.css'


const spotifyApi = new SpotifyWebApi();

function Invitado(props) {
    const fs = db;
    const [userName, setUserName] = useState('');
    const [codigoSala, setCodigoSala] = useState('');
    const [enSala, setEnSala] = useState(false);
    const [mensajesSala, setMensajesSala] = useState(null);
    const [texto, setTexto] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const [canciones, setCanciones] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [searchResponse, setSearchResponse] = useState(null);
    const [usuarios, setUsuarios] = useState(null);
    const [errorMessage , setErrorMessage] = useState('');

    // console.log(props.token);

    const getMensajesSala = async () => {

        if (!codigoSala) {
            return;
        }

        const salaRef = collection(fs, 'salas');
        const q = query(salaRef, where('idSala', '==', codigoSala));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            console.log(querySnapshot.docs[0].data());
            if (querySnapshot.docs.length > 0) {
                const sala = querySnapshot.docs[0];
                const mensajes = sala.data().mensajes;
                // setListaCanciones(canciones);
                // comparar con la lista de canciones actual
                setMensajesSala(mensajes);
                const canciones = sala.data().canciones;
                setCanciones(canciones);
                console.log(canciones);
                const resultado = sala.data().resultado;
                if (resultado !== "") {
                    resultadoInvitado(resultado);
                }
                const usuarios = sala.data().usuarios;
                setUsuarios(usuarios);

                if (!usuarios.includes(userName)) {
                    setEnSala(false);
                }

                if (usuarios.includes(userName)) {
                    setEnSala(true);
                }
            }

            
        });
        return () => unsubscribe();


    }

  useEffect(() => {
    getMensajesSala();
    //getCanciones();

  }, [props.token]);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');

    if (userName !== '') {
        // console.log(userName);
        handleLeft();
    }

    window.location = 'http://192.168.1.50:5000/auth/logout';
  };

    const handleSubmit = async (event) => {
    
        const salaRef = collection(fs, 'salas');
        console.log(codigoSala);
        const q = query(salaRef, where('idSala', '==', codigoSala));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            setErrorMessage('La sala no existe');
            return;
        } else {
            console.log('La sala existe');
            // comprobar si el usuario existe en la sala, devolver error en caso de fallo
            const salaRef2 = collection(fs, 'salas');
            console.log(codigoSala);
            const q2 = query(salaRef2, where('idSala', '==', codigoSala));
            const querySnapshot2 = await getDocs(q2); // Utilizar q2 en lugar de q
            console.log(querySnapshot2.docs[0].data());
            const sala = querySnapshot2.docs[0];
            const users = sala.data().usuarios;
            console.log(users);
            if (users.includes(userName)) {
                setErrorMessage('El usuario ya está en la sala');
                return;
            }
            const baneados = sala.data().baneados;
            if (baneados.includes(userName)) {
                console.log(userName + ' está baneado');
                setEnSala(false);
                setErrorMessage('Has sido baneado de la sala');
                return;
            }

            setErrorMessage('');
            setEnSala(true);
            const salaRef = collection(fs, 'salas');
            const q = query(salaRef, where('idSala', '==', codigoSala));
            const querySnapshot = await getDocs(q);
            // const mensajes = sala.data().mensajes;
            // mensajes.push({
            //     usuario: userName,
            //     mensaje: texto
            // });
            // setMensajesSala(mensajes);
            // await updateDoc(doc(salaRef, codigoSala), {
            //     mensajes : mensajes
            // });
            users.push(userName);
            setUsuarios(users);
            await updateDoc(doc(salaRef, sala.id), {
                usuarios: users
            });
            getMensajesSala();

        // añadir el usuario a la sala
        
        
    }

    }

    const handleCodigoSala = (event) => {
        setCodigoSala(event.target.value);
    }

    const handleLeft = async () => {
        setEnSala(false);

        // borrar el usuario de la sala
        const salaRef = collection(fs, 'salas');
        const q = query(salaRef, where('idSala', '==', codigoSala));
        const querySnapshot = await getDocs(q);
        const sala = querySnapshot.docs[0];
        const usuarios = sala.data().usuarios;
        const index = usuarios.indexOf(userName);
        console.log(index, usuarios, userName);
        if (index > -1) {
            usuarios.splice(index, 1);
        }
        await updateDoc(doc(salaRef, sala.id), {
            usuarios : usuarios
        });

    }

    // const handleSend = async () => {
    //     const salaRef = collection(fs, 'salas');
    //     const q = query(salaRef, where('idSala', '==', codigoSala));
    //     const querySnapshot = await getDocs(q);
    //     const sala = querySnapshot.docs[0];
    //     const salaId = sala.id;
    //     const salaRef2 = collection(fs, 'salas', salaId, 'mensajes');
    //     const mensaje = {
    //         nombre: userName,
    //         texto: texto
    //     }
    //     await addDoc(salaRef2, mensaje);
    // }

    const handleSend = async () => {
        const salaRef = collection(fs, 'salas');
        const q = query(salaRef, where('idSala', '==', codigoSala));
        const querySnapshot = await getDocs(q);
        const sala = querySnapshot.docs[0];
        const mensajes = sala.data().mensajes;
        mensajes.push({
            usuario: userName,
            mensaje: texto
        });
        setMensajesSala(mensajes);
        await updateDoc(doc(salaRef, codigoSala), {
            mensajes : mensajes
        });
        setTexto("");
    }

    const handleVotar = async (si) => {
        // mandar mensaje 
    
        if (si) {
            // Añadir el voto a la base de datos
            const salaRef = collection(fs, 'salas');
            const q = query(salaRef, where('idSala', '==', codigoSala));
            const querySnapshot = await getDocs(q);
            const sala = querySnapshot.docs[0];
            const mensajes = sala.data().mensajes;
            
            // Buscar el mensaje que tenga el campo "si" y modificar su valor
            const mensajeSi = mensajes.find(mensaje => mensaje.si !== undefined);
            if (mensajeSi) {
              mensajeSi.si += 1;
              mensajeSi.usuarios.push(userName);
            }
            
            // Actualizar los mensajes en la base de datos
            await updateDoc(doc(salaRef, sala.id), { 
                mensajes: mensajes
             });
            
            console.log(mensajes);
          } else {
            // Añadir el voto a la base de datos
            const salaRef = collection(fs, 'salas');
            const q = query(salaRef, where('idSala', '==', codigoSala));
            const querySnapshot = await getDocs(q);
            const sala = querySnapshot.docs[0];
            const mensajes = sala.data().mensajes;
            
            // Buscar el mensaje que tenga el campo "no" y modificar su valor
            const mensajeNo = mensajes.find(mensaje => mensaje.no !== undefined);
            if (mensajeNo) {
                mensajeNo.no += 1;
                mensajeNo.usuarios.push(userName);
            }
            
            // Actualizar los mensajes en la base de datos
            await updateDoc(doc(salaRef, sala.id), { 
                mensajes: mensajes
             });    
            console.log(mensajes);
            
        }
        
    }

    const handleUserName = (event) => {
        setUserName(event.target.value);
    }

    const handleSearch = async () => {
        // enviar busqueda a la base de datos
        const salaRef = collection(fs, 'salas');
        const q = query(salaRef, where('idSala', '==', codigoSala));
        const querySnapshot = await getDocs(q);
        const sala = querySnapshot.docs[0];
        console.log("texto a buscar " + searchText);
        await updateDoc(doc(salaRef, codigoSala), {
            busqueda : searchText
        });

    }

    const handleKeyDownBusqueda = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    }

    const resultadoInvitado = async (resultado) => {
        console.log("resultados de la busqueda", resultado);
        setSearchResponse(resultado);
        // borrar resultado y busqueda de la sala
        const salaRef = collection(fs, 'salas');
        const q = query(salaRef, where('idSala', '==', codigoSala));
        const querySnapshot = await getDocs(q);
        const sala = querySnapshot.docs[0];
        await updateDoc(doc(salaRef, sala.id), {
            busqueda : "",
            resultado : ""
        });
    }

    const addLista = async (cancion) => {
        // agregar cancion a la lista de la sala
        const salaRef = collection(fs, 'salas');
        const q = query(salaRef, where('idSala', '==', codigoSala));
        const querySnapshot = await getDocs(q);
        const sala = querySnapshot.docs[0];
        const canciones = sala.data().canciones;
        canciones.push(cancion);
        await updateDoc(doc(salaRef, sala.id), {
            canciones : canciones
        });
    }

    const createskipTrackVote = async () => {
        // crear voto para saltar cancion
        const salaRef = collection(fs, 'salas');
        const q = query(salaRef, where('idSala', '==', codigoSala));
        const querySnapshot = await getDocs(q);
        const sala = querySnapshot.docs[0];
        // añadir mensaje a la sala cuya estructura sea  { usuario: "nombre", cancion: curren_track.name, si: 1, no: 0}
        const mensajes = sala.data().mensajes;
            mensajes.push({
                usuarios: [userName],
                cancion: "Cancion actual de la lista",
                si: 1,
                no: 0
            });
            await updateDoc(doc(salaRef, codigoSala), {
                mensajes : mensajes
            });
    }

    
  return (
    <>
    <h3>Estás logueado como invitado</h3>

    {/* <p>Tu nombre es {userName}</p> */}
    { userName != "" ?
    <p>Tu nombre en la sala va a ser <strong>{userName}</strong></p> : 
    <> </>}

    <Button variant="danger" onClick={handleLogout} style={{ float: 'right'}}>
        Cerrar Sesión
    </Button>
    
    { enSala ? 
    <div>
    <h4>Estás en la sala {codigoSala}</h4>

    <Button variant="primary" onClick={handleLeft}>
        Salir de la sala
    </Button>

    {/* canciones de la listra de reproducción */}
    <div id='infoSala'>
        <div id='canciones'>
                <div id='canciones-titulo'>
                <h3>Canciones en cola</h3>
                </div>
                <div id='canciones-lista'>
                <ol>
                {canciones && canciones.map((cancion, index) => {
                    return (
                    <li key={index}>
                        <div className="cbusc">
                                <img src={cancion.image} className="imgcbusc" alt="" />
                                <div className="infocbusc">
                                    <div className="nombrecbusc"> {cancion.name} </div>
                                </div>
                            </div>
                    </li>
                    )
                })}</ol>
                </div>
        </div>
        <div id='usuarios'>
                <div id='usuarios-titulo'>
                <h3>Usuarios en la sala</h3>
                </div>
                <div id='usuarios-lista'>
                <ol>
                {usuarios && usuarios.map((usuario, index) => {
                    return (
                    <li key={index} className="infocbusc">
                        <div className="nombrecbusc">{usuario}</div> 
                    </li>
                    )
                })}</ol>
        </div>
        </div>
    </div>
    

    {/* buscador de canciones */}

    <div className="cbusqueda">
              <input type="text" placeholder="Buscar" className="busqueda" 
              value={searchText} 
              onChange={(e) => { setSearchText(e.target.value) } }
              onKeyDown={handleKeyDownBusqueda}
              // onChange={(e) => { handleSearch(e.target.value) } }
              />
              <button className="botonBuscar" onClick={handleSearch} > 
                <img src="/buscar.png" />
               </button>
          </div>

    <div className="lcbusc">
          { searchResponse && searchResponse.length > 0 &&
          <>
            <h2> Resultados de la búsqueda </h2>
            <ol>
              { searchResponse && searchResponse.map( (track, key) => {
                  return (
                    <li key={key}>
                      {/* <div key={key} className="cbusc"
                      onClick={() => { playThis(track.uri) }}
                      > */}
                      <div className="cbusc"
                      onClick={() => { addLista(track) }}
                      >
                          <img src={track.image} className="imgcbusc" alt="" />
                          <div className="infocbusc">
                              <div className="nombrecbusc"> {track.name} </div>
                              <div className="artistacbusc"> {track.artists[0].name} </div>
                          </div>
                      </div>
                    </li>  
                  )
              })
              }
              </ol>
              </>}
          </div>

    <div className='chat'>
        <div className='mensajes'>
            <h2> Chat </h2>
            <div className='listaMensajes'>
        {mensajesSala && mensajesSala.map((mensaje, index) => {

            if (mensaje.si) {
            return (
                <div className="mensaje" key={index}>
                <div className="nombre">{mensaje.usuario}</div>
                <div className="texto">Votacion para saltar
                {mensaje.si}/{usuarios.length} </div>
                {/* si no ha votado se muestran los botones */}
                {mensaje.usuarios && !mensaje.usuarios.includes(userName) &&
                <div>
                    <Button variant="success" onClick={() => { handleVotar(true) }} > Si </Button>
                    <Button variant="danger" onClick={() => { handleVotar(false) }} > No </Button>
                </div>
                }
                </div>
            )
            } else {
            return (
            <div className="mensaje" key={index}>
                <div className="nombre"><strong>{mensaje.usuario}: </strong>{mensaje.mensaje}</div>
            </div>
            )
            }
        })}
        </div>
        </div>
        {/* <div id='send'>
            <input type='text' placeholder='Escribe un mensaje...' value={texto} onChange={(e) => { setTexto(e.target.value) }} />
            <button onClick={handleSend}>Enviar</button>
        </div> */}
        <div style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px' }}>
                <Form className="d-flex">
                  <Form.Control
                    type="text"
                    placeholder="Escribe tu mensaje"
                    className="mr-2"
                    style={{ backgroundColor: '#1F1F1F', color: '#fff', border: 'none', outline: 'none' }}
                    value={texto}
                    onChange={(e) => { setTexto(e.target.value) }}
                  />
                  <Button variant="success" onClick={handleSend}>Enviar</Button>
                </Form>
        </div>
        <br />
        <Button variant="primary" onClick={createskipTrackVote}>
            Iniciar votación de salto de canción
        </Button>
    </div>
    </div>
    
    :      
    // cuando no está en sala
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
            <Form.Label>Código de la sala</Form.Label>
            <Form.Control type="text" value={codigoSala} onChange={handleCodigoSala}/>
            <Form.Label>Nombre Usuario</Form.Label>
            <Form.Control type="text" value={userName} onChange={handleUserName}/>
            <br />
            {errorMessage && <Alert variant='danger'>{errorMessage}</Alert>}
        </Form.Group>
        <br />
        <Button variant="primary" onClick={handleSubmit}>
            Conectarse
        </Button>
        </Form>
    </div> }
    
    
    </>
  );
}

export default Invitado;
