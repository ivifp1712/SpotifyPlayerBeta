// const express = require('express')
// const dotenv = require('dotenv');

// const port = 5000

// dotenv.config()

// var spotify_client_id = process.env.SPOTIFY_CLIENT_ID
// var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET

// var app = express();

// var generateRandomString = function (length) {
//     var text = '';
//     var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
//     for (var i = 0; i < length; i++) {
//       text += possible.charAt(Math.floor(Math.random() * possible.length));
//     }
//     return text;
//   };

// // app.get('/auth/login', (req, res) => {
// // });

// app.get('/auth/callback', (req, res) => {
// });

// app.listen(port, () => {
//   console.log(`Listening at http://localhost:${port}`)
// })

// app.get('/auth/login', (req, res) => {

//     var scope = "streaming \
//                  user-read-email \
//                  user-read-private"
  
//     var state = generateRandomString(16);
  
//     var auth_query_parameters = new URLSearchParams({
//       response_type: "code",
//       client_id: spotify_client_id,
//       scope: scope,
//       redirect_uri: "http://localhost:3000/auth/callback",
//       state: state
//     })
  
//     res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
//   })

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const SpotifyWebApi = require('spotify-web-api-node');
const port = 5000;

const spotifyApi = new SpotifyWebApi({
  clientId: '5726d46336994425b4b04561c68e1be2',
  clientSecret: 'e32a580d630449e59c1f206afce735ed',
  redirectUri: 'http://localhost:3000/callback'
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ruta para autenticar con Spotify
app.get('/login', (req, res) => {
  const scopes = ['user-read-private', 'user-read-email', 'streaming'];
  const authorizeUrl = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authorizeUrl);
});

// Ruta para manejar el callback de autenticación
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.status(400).send('Error al autenticar con Spotify');
  }
});

// Ruta para obtener la información de la cuenta del usuario
app.get('/me', async (req, res) => {
  try {
    const data = await spotifyApi.getMe();
    res.send(data.body);
  } catch (error) {
    console.log(error);
    res.status(400).send('Error al obtener información del usuario');
  }
});

// Ruta para iniciar la reproducción de una canción
app.get('/play', async (req, res) => {
  const { uri } = req.query;
  try {
    await spotifyApi.play({ uris: [uri] });
    res.send('Reproduciendo');
  } catch (error) {
    console.log(error);
    res.status(400).send('Error al iniciar la reproducción');
  }
});

// Ruta para pausar la reproducción
app.get('/pause', async (req, res) => {
  try {
    await spotifyApi.pause();
    res.send('Pausado');
  } catch (error) {
    console.log(error);
    res.status(400).send('Error al pausar la reproducción');
  }
});

app.listen(port, () => {
  console.log('Servidor iniciado en el puerto' + port);
});
