import React, { useState, useEffect } from 'react';
import './webpb.css';
// import searchIcon from '/buscar.png';

function WebPlayback(props) {
  const [player, setPlayer] = useState(undefined);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResponse, setSearchResponse] = useState(null);
  const [volume, setVolume] = useState(50);
  const [device_id, setDeviceId] = useState("");
  
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
    return text;
  };

  window.onSpotifyWebPlaybackSDKReady = () => {

      const player = new window.Spotify.Player({
          name: 'We Listen App' + randomString(),
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

const handleLogout = async () => {
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

  window.location = "http://localhost:5000/auth/logout";
}

const handleVolumeChange = async (e) => {
  const volume = e.target.value;
  setVolume(volume);
  const response = await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}&device_id=${device_id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${props.token}`
    },
  }).then( response => {
    console.log(response);
  });
  
}

return (
  <>
      <div className="contenido">
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
          <div className="cancion">
                  {current_track ? 
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
                        <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
                        <img src="/previous.png" />
                        </button>

                        <button className="btn-spotify" onClick={() => { player.togglePlay() }} >
                            { is_paused ? <img src="/play.png" /> : <img src="/pause.png" /> }
                        </button>

                        <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
                        <img src="/pasar.png" />
                        </button>

                        
                      </div>
                      <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={handleVolumeChange}
                        />
                  </>
                   : 
                      <div className="now-playing__side">
                          <div className="now-playing__name">No song currently playing</div>
                      </div>
                  }
                  </div>
          </div>
          

          <div className="lcbusc">
          { searchResponse && searchResponse.length > 0 &&
          <>
            <h2> Resultados de la búsqueda </h2>
            <ol>
              { searchResponse && searchResponse.map( (track, key) => {
                  return (
                    <li>
                      <div key={key} className="cbusc"
                      onClick={() => { playThis(track.uri) }}
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
    <div>
        <button className="clogout" onClick={() => { handleLogout() }} >
            <img src="/logout.png" className='logout' />
        </button>
    </div>
   </>
)

}

export default WebPlayback
