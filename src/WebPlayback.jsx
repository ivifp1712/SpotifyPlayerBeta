import React, { useState, useEffect } from 'react';
import './webpb.css';
//import 'firebase/firestore';
import { db } from './FirebaseConfig';
import { collection, getDocs, query, where, updateDoc, doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import SpotifyWebApi from 'spotify-web-api-js';
// import searchIcon from '/buscar.png';
import { Button, Form } from 'react-bootstrap';

const spotifyApi = new SpotifyWebApi();

function WebPlayback(props) {
  const fs = db;
  const [player, setPlayer] = useState(undefined);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResponse, setSearchResponse] = useState(null);
  const [device_id, setDeviceId] = useState("");
  const [salaCode, setSalaCode] = useState('');
  const [cancionesSala, setCancionesSala] = useState([]);
  const [usuariosSala, setUsuariosSala] = useState([]);
  const [mensajesSala, setMensajesSala] = useState([]);
  const [texto, setTexto] = useState('');
  const [userName, setUserName] = useState('');
  const [randomString, setRandomString] = useState('');
  const [busquedaInvitado, setBusquedaInvitado] = useState('');
  const [resultadoInvitado, setResultadoInvitado] = useState([]);
  const [votado, setVotado] = useState(false);

  
  const track = {
      name: "",
      album: {
          images: [
              { url: "" }
          ]
      },
      artists: [
          { name: "" }
      ]
    }
  const [current_track, setTrack] = useState(track);
  
useEffect(() => {
  const getUserInfo = async () => {
      let nombreUsuario = '';
      try {
        // Configura el token de acceso en la instancia de la API de Spotify
        spotifyApi.setAccessToken(props.token);

        // Obtiene los detalles del usuario actual
        const userInfo = await spotifyApi.getMe();

        // Extrae el nombre de usuario de la respuesta
        const { display_name } = userInfo;

        nombreUsuario = display_name;

        // Actualiza el estado con el nombre de usuario
        setUserName(display_name);
        // setUsuariosSala([...usuariosSala, display_name]);
      } catch (error) {
        console.log('Error al obtener la información del usuario:', error);
      }
      createSala(nombreUsuario);
    };

    getUserInfo();
  // Generar código de sala solo si no hay sala ya creada
  const generateSalaCode = async () => {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      code += digits[randomIndex];
    }

    // Verificar si el código ya existe en la base de datos
    const salaRef = collection(fs, 'salas');
    const q = query(salaRef, where('idSala', '==', code));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // El código ya existe, generamos uno nuevo recursivamente
      return generateSalaCode();
    }
    return code;
  };

  const createSala = async (username) => {
      if (salaCode === '') {
        generateSalaCode().then(code => {
          setSalaCode(code);
          // Conectar a Firebase y crear la sala
          const salaRef = collection(fs, 'salas');
          usuariosSala.push(username);
          const docRef = doc(salaRef, code);
          setDoc(docRef, {
              idSala: code,
              usuarios: usuariosSala,
              canciones: cancionesSala,
              mensajes : mensajesSala,
              baneados: [],
              busquedainvitado: '',
              resultadoInvitado: [],
              // auth: props.token
          });
        });
      }  
    }

  const script = document.createElement("script");
  script.src = "https://sdk.scdn.co/spotify-player.js";
  script.async = true;

  document.body.appendChild(script);

  console.log(props.token)

  // funcion genera numero aleatorio de cuatro digitos
  const randomString = () => {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 4; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    };
    setRandomString(text);
    return text;
  };

  window.onSpotifyWebPlaybackSDKReady = () => {

      const player = new window.Spotify.Player({
          name: 'The We Listen App ' + randomString(),
          getOAuthToken: cb => { cb(props.token); },
          volume: 0.5
      });

      setPlayer(player);

      player.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          setDeviceId(device_id);
      });

      player.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
      });

      player.addListener('player_state_changed', ( state => {

        if (!state) {
            return;
        }
    
        setTrack(state.track_window.current_track);
        setPaused(state.paused);
    
    
        player.getCurrentState().then( state => { 
            (!state)? setActive(false) : setActive(true) 
        });
    
    }));
  
      player.connect();

  };
}, []);

const handleKeyDown = () => {
  const event = window.event;
  if (event.key === 'Enter') {
    handleSearch();
  }
}


const handleSearch = async () => {

  if (!searchText || searchText === "") {
    return;
  }

  const response = await fetch(`https://api.spotify.com/v1/search?q=${searchText}&type=track&limit=10&market=ES`, {
    headers: {
      "Authorization": `Bearer ${props.token}`
    }
  });

  console.log(response);

  const data = await response.json();

  console.log(data)

  const tracks = await data.tracks.items.map( item => {
    return {
      name: item.name,
      album: item.album,
      artists: item.artists,
      image: item.album.images[0].url,
      uri: item.uri
    }
  });
  console.log(tracks);
  setSearchResponse(tracks)
  setSearchText("");
};

const buscarInvitado = async (busqueda) => {
  if (!busqueda || busqueda === "") {
    return;
  }

  console.log("realizando busqueda de invitado")

  const response = await fetch(`https://api.spotify.com/v1/search?q=${busqueda}&type=track&limit=10&market=ES`, {
    headers: {
      "Authorization": `Bearer ${props.token}`
    }
  });

  console.log(response);

  const data = await response.json();

  console.log(data)

  const tracks = await data.tracks.items.map( item => {
    return {
      name: item.name,
      album: item.album,
      artists: item.artists,
      image: item.album.images[0].url,
      uri: item.uri
    }
  });

  console.log(tracks);
  setResultadoInvitado(tracks.map((track, index) => ({ ...track, key: index })))
  setBusquedaInvitado("");

  // actualizar la base de datos con la busqueda del invitado
  const salaRef = collection(fs, 'salas');
  const docRef = doc(salaRef, salaCode);
  updateDoc(docRef, {
    resultado: tracks
  });
};




const playThis = async (track_uri) => {
   const putPlay = await fetch(`https://api.spotify.com/v1/me/player/play`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${props.token}`
    },
    body: JSON.stringify({
      uris: [track_uri]
    })
  });
}

const addLista = async (track) => {
  const track_uri = track.uri;
//   const putPlay = await fetch(`https://api.spotify.com/v1/me/player/play`, {
//    method: "PUT",
//    headers: {
//      "Authorization": `Bearer ${props.token}`
//    },
//    body: JSON.stringify({
//      uris: [track_uri]
//    })
//  });
  const salaRef = collection(fs, 'salas');
  const q = query(salaRef, where('idSala', '==', salaCode));
  const querySnapshot = await getDocs(q);
  // añadir sobre la lista de canciones de la sala
  const sala = querySnapshot.docs[0];
  const canciones = sala.data().canciones;
  canciones.push(track);
  //setCancionesSala(canciones);
  await updateDoc(doc(salaRef, sala.id), {
    canciones: canciones
    // auth: props.token
  });
}

const addListaF = async (track) => {
  const track_uri = track.uri;
  
  // const putPlay = await fetch(`https://api.spotify.com/v1/me/player/play`, {
  //  method: "PUT",
  //  headers: {
  //    "Authorization": `Bearer ${props.token}`
  //  },
  //  body: JSON.stringify({
  //    uris: [track_uri]
  //  })
//  });

// añadir a la cola de canciones
console.log("Añadida a la cola " + track_uri)
const putPlay = await fetch(`https://api.spotify.com/v1/me/player/queue?uri=`+ track_uri, {
   method: "POST",
   headers: {
     "Authorization": `Bearer ${props.token}`
   },
  //  body: JSON.stringify({
  //    uris: [track_uri]
  //  })
 });

 // almacenar respuesta
  // const data = await putPlay.json();
  // console.log(data);

}

// escuchar cambios en la sala
useEffect(() => {
  const salaRef = collection(fs, 'salas');
  const q = query(salaRef, where('idSala', '==', salaCode));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    if (querySnapshot.docs.length > 0) {
      const sala = querySnapshot.docs[0];
      const canciones = sala.data().canciones;
      // setListaCanciones(canciones);
      // comparar con la lista de canciones actual
      if (canciones.length > cancionesSala.length) {
        // reproducir la nueva canción
        const nuevaCancion = canciones[canciones.length - 1];
        addListaF(nuevaCancion);
        setCancionesSala(canciones);
      }

      const busqueda = sala.data().busqueda;
      if (busqueda !== "") {
        //setSearchText(busqueda);
        buscarInvitado(busqueda);
        // limpiar busqueda
        // updateDoc(doc(salaRef, sala.id), {
        //   busqueda: "",
        //   resultadoInvitado: resultadoInvitado
        // });
      }

      const usuarios = sala.data().usuarios;
      setUsuariosSala(usuarios);

      const mensajes = sala.data().mensajes;
      setMensajesSala(mensajes);

      verVotaciones(mensajes, usuarios);

    }
  });
  return () => unsubscribe();
}, [fs, salaCode, cancionesSala]);


const verVotaciones = async (mensajes, usuarios) => {
  console.log("Ver votaciones");
  const votaciones = mensajes.filter(mensaje => mensaje.si);
  console.log("votaciones")
  // recorrer votaciones
  
  for (const votacion of votaciones) {
    if (votacion.si >= (usuarios.length)) {
      // reproducir la canción
      console.log("Se ha saltado la canción con " + votacion.si + " votos");
      handleNext();
      // actualizar mensajes
      const salaRef = collection(fs, 'salas');
      const q = query(salaRef, where('idSala', '==', salaCode));
      const querySnapshot = await getDocs(q);
      const sala = querySnapshot.docs[0];
      const mensajes = sala.data().mensajes;
      // encontrar mensaje que tenga mensaje.si y borrar
      const index = mensajes.findIndex(mensaje => mensaje.si === votacion.si);
      mensajes.splice(index, 1);
      await updateDoc(doc(salaRef, sala.id), {
        mensajes: mensajes
      });
      setVotado(false);
    }
  }};



const handleLogout = async () => {

  localStorage.removeItem('token');
  localStorage.removeItem('tokenExpiration');

  const response = await fetch(`https://api.spotify.com/v1/me/player`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${props.token}`
    },
    body: JSON.stringify({
      "device_ids": [player._options.id],
      "play": false
    })
  });

  window.location = "http://192.168.1.50:5000/auth/logout";

  // Borrar sala
  const salaRef = collection(fs, 'salas');
  const q = query(salaRef, where('idSala', '==', salaCode));
  const querySnapshot = await getDocs(q);
  const sala = querySnapshot.docs[0];
  await deleteDoc(doc(salaRef, sala.id));

}


const handlePause = async () => {
  const response = await fetch(`https://api.spotify.com/v1/me/player/pause`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${props.token}`
    },
  });
}

const handlePlay = async () => {
  console.log("Play");
  const response = await fetch(`https://api.spotify.com/v1/me/player/play`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${props.token}`
    },
  });
}

const handleNext = async () => {
  const response = await fetch(`https://api.spotify.com/v1/me/player/next`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${props.token}`
    },
  });
}

const handlePrevious = async () => {
  const response = await fetch(`https://api.spotify.com/v1/me/player/previous`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${props.token}`
    },
  });
}

const handleDeleteUser = async (user) => {
  // const salaRef = collection(fs, 'salas');
  // const q = query(salaRef, where('idSala', '==', salaCode));
  // const querySnapshot = await getDocs(q);
  // const sala = querySnapshot.docs[0];
  // const usuarios = sala.data().usuarios;
  // const index = usuarios.indexOf(user);
  // if (index > -1) {
  //   usuarios.splice(index, 1);
  // }
  // setUsuariosSala(usuarios);
  // await updateDoc(doc(salaRef, sala.id), {
  //   usuarios: usuarios
  // });

  // funcion para sacar de la sala al otro usuario
  // lista de baenados??

  // borrar usuario de la sala
  const salaRef = collection(fs, 'salas');
  const q = query(salaRef, where('idSala', '==', salaCode));
  const querySnapshot = await getDocs(q);
  const sala = querySnapshot.docs[0];
  const usuarios = sala.data().usuarios;
  const index = usuarios.indexOf(user);
  if (index > -1) {
    usuarios.splice(index, 1);
  }
  setUsuariosSala(usuarios);

  // añadir a lista de baneados
  const baneados = sala.data().baneados;
  baneados.push(user);
  await updateDoc(doc(salaRef, sala.id), {
    usuarios: usuarios,
    baneados: baneados
  });
}

const createskipTrackVote = async () => {
    const salaRef = collection(fs, 'salas');
    const q = query(salaRef, where('idSala', '==', salaCode));
    const querySnapshot = await getDocs(q);
    const sala = querySnapshot.docs[0];
    // añadir mensaje a la sala cuya estructura sea  { usuario: "nombre", cancion: curren_track.name, si: 1, no: 0}
    const mensajes = sala.data().mensajes;
          mensajes.push({
              usuarios: [userName],
              cancion: current_track.name,
              si: 1,
              no: 0
          });
          await updateDoc(doc(salaRef, salaCode), {
              mensajes : mensajes
          });
    setVotado(true);
}

const handleSend = async () => {
  const salaRef = collection(fs, 'salas');
  const q = query(salaRef, where('idSala', '==', salaCode));
  const querySnapshot = await getDocs(q);
  const sala = querySnapshot.docs[0];
  const mensajes = sala.data().mensajes;
  mensajes.push({
    usuario: userName,
    mensaje: texto
  });
  setMensajesSala(mensajes);
  await updateDoc(doc(salaRef, sala.id), {
    mensajes : mensajes
  });
  setTexto("");
}

const handleVotar = async (si) => {
  // mandar mensaje 

  if (si) {
      // Añadir el voto a la base de datos
      const salaRef = collection(fs, 'salas');
      const q = query(salaRef, where('idSala', '==', salaCode));
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
      await updateDoc(doc(salaRef, salaCode), {
          mensajes: mensajes
       });

       setVotado(true);
      
      console.log(mensajes);
    } else {
      // Añadir el voto a la base de datos
      const salaRef = collection(fs, 'salas');
      const q = query(salaRef, where('idSala', '==', salaCode));
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
      await updateDoc(doc(salaRef, salaCode), { 
          mensajes: mensajes
       });    
      console.log(mensajes);
      setVotado(true);
  }
  
}


return (
  <>
      <div className="contenido">
        <div className='codigoSala'>
            <h2> El codigo de tu sala es: <strong>{salaCode}</strong></h2>
            <h2> El nombre del reproductor es: The We listen App {randomString} <Button variant="danger" onClick={handleLogout} className='clogout'> Cerrar sesión </Button> </h2>
            {/* Cola de reproducción */}
            
                {cancionesSala.length > 0 ? 
                  <div className="repro"> 
                    <h2> Cola de reproducción </h2>
                    <ol className="listaCanciones can">
                      {cancionesSala.map((cancion, index) => {
                        return (
                          <li key={index}>
                              <p className="can_text"><img src={cancion.album.images[0].url}  alt="" className='imgcbusc' /> <strong>{cancion.name}</strong></p>
                          </li>
                        )
                      }
                      )}
                    </ol>
                  </div>
                  : null
                }
            {/* Lista de usuarios */}

            <div className="usuarios">
              <h2> Usuarios en la sala </h2>
              <ol className="listaUsuarios">
                {usuariosSala.map((usuario, index) => {
                  if (usuario != userName) {
                    return(
                    <li key={index}>
                    <p className="user_text"><strong>{usuario} <Button variant='danger' size='sm' onClick={() => handleDeleteUser(usuario)}> Borrar usuario</Button> </strong></p>
                    </li>
                    )
                  }
                  return (
                    <br key={index}/>
                  )
                }
                )}
              </ol>
            </div>
        </div>
        <div className="cbusqueda">
              <input type="text" placeholder="Buscar" className="busqueda" 
              value={searchText} 
              onChange={(e) => { setSearchText(e.target.value) } }
              onKeyDown={handleKeyDown}
              // onChange={(e) => { handleSearch(e.target.value) } }
              />
              <button className="botonBuscar" onClick={handleSearch} > 
                <img src="/buscar.png" />
               </button>
          </div>

          <div className="cancionychat">
            <div className="cancion">

                  {current_track != { name: "", album: { images: [{ url: "" }] }, artists: [{ name: "" }] } ? 
                      <>

                      <img src={current_track.album.images[0].url} 
                          className="now-playing__cover" alt="" />
    
                      <div className="now-playing__side">
                          <div className="now-playing__name">{
                                        current_track.name
                                        }</div>
    
                          <div className="now-playing__artist">{
                                        current_track.artists[0].name
                                        }</div>
                      </div>
                      <div className="botones">
                        <button className="btn-spotify" onClick={() => { handlePrevious() }} >
                        <img src="/previous.png" />
                        </button>

                        <button className="btn-spotify">
                            { is_paused ? <img src="/play.png" onClick={ () => { handlePlay()} } /> : <img src="/pause.png" onClick={ () => handlePause() } /> }
                        </button>

                        <button className="btn-spotify" onClick={() => { handleNext() }} >
                        <img src="/pasar.png" />
                        </button>

                        
                      </div>
                      {/* <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={handleVolumeChange}
                        /> */}
                  </>
                   : 
                      <div className="now-playing__side">
                          <div className="now-playing__name">No song currently playing</div>
                      </div>
                  }
            </div>

            <div className="chat">
              <div className="mensajes">
                <h2> Chat </h2>
                <div className="listaMensajes">
                  {mensajesSala.map((mensaje, index) => { 
                    if (mensaje.si) {
                      if (votado) {
                        return (
                          <div className="mensaje" key={index}>
                            <div className="nombre">{mensaje.usuario}</div>
                            <div className="texto">Votacion para saltar {mensaje.cancion} {mensaje.si}/{usuariosSala.length} </div>
                            <div> Ya has votado.</div>
                          </div>
                          )
                      } else {
                        return (
                        <div className="mensaje" key={index}>
                          <div className="nombre">{mensaje.usuario}</div>
                          <div className="texto">Votacion para saltar {mensaje.cancion} {mensaje.si}/{usuariosSala.length} </div>
                          <div>
                              <Button variant="success" onClick={() => { handleVotar(true) }} > Si </Button>
                              <Button variant="danger" onClick={() => { handleVotar(false) }} > No </Button>
                          </div>
                        </div>
                        )
                      }
                       
                    }
                    return (
                      <p className="mensaje_text" key={index}><strong>{mensaje.usuario}: </strong>{mensaje.mensaje}</p>
                    )
                  }
                  )}
                </div>
                {/* añadir separacion contenido en form */}
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
          </div>
          

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
          <br />
   </>
)
}


export default WebPlayback
