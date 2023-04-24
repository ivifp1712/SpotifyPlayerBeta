import React, { useEffect, useState } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const params = getHashParams();
    const { code } = params;

    if (code) {
      setLoggedIn(true);
      spotifyApi.setAccessToken(code);
      getCurrentlyPlayingTrack();
    }
  }, []);

  const getHashParams = () => {
    const hashParams = {};
    let e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    while ((e = r.exec(q))) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  };

  const getCurrentlyPlayingTrack = () => {
    spotifyApi.getMyCurrentPlaybackState().then((data) => {
      setCurrentTrack(data.item);
    });
  };

  const handlePlay = (uri) => {
    spotifyApi.play({ uris: [uri] });
  };

  const handlePause = () => {
    spotifyApi.pause();
  };

  const handleSearch = () => {
    spotifyApi.searchTracks(searchQuery).then((data) => {
      setSearchResults(data.tracks.items);
    });
  };

  const handleSelectTrack = (uri) => {
    handlePlay(uri);
  };

  return (
    <div>
      {!loggedIn && (
        <a href='http://localhost:5000/login'>Iniciar sesión con Spotify</a>
      )}
      {loggedIn && (
        <>
          <h1>Reproduciendo actualmente:</h1>
          {currentTrack ? (
            <div>
              <h2>{currentTrack.name}</h2>
              <p>{currentTrack.artists[0].name}</p>
              <img
                src={currentTrack.album.images[0].url}
                alt={currentTrack.album.name}
              />
            </div>
          ) : (
            <p>No hay canciones en reproducción</p>
          )}
          <div>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Buscar</button>
          </div>
          <ul>
            {searchResults.map((track) => (
              <li key={track.id} onClick={() => handleSelectTrack(track.uri)}>
                {track.name} - {track.artists[0].name}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
