const express = require('express')
const dotenv = require('dotenv');
const request = require('request');

const port = 5000

dotenv.config()

var spotify_client_id = process.env.SPOTIFY_CLIENT_ID
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET

var app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

var access_token = null;

var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  

app.get('/auth/login', (req, res) => {

    var scope = "streaming \
                 user-read-email \
                 user-read-private \
                 user-modify-playback-state \
                 user-read-playback-state \
                 user-read-currently-playing \
                 "
  
    var state = generateRandomString(16);
  
    var auth_query_parameters = new URLSearchParams({
      response_type: "code",
      client_id: spotify_client_id,
      scope: scope,
      redirect_uri: "http://192.168.1.50:5000/auth/callback",
      state: state
    })
  
    res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
  })

  app.get('/auth/admin/login', (req, res) => {

    var scope = "streaming \
                 user-read-email \
                 user-read-private \
                 user-modify-playback-state \
                 user-read-playback-state \
                 user-read-currently-playing \
                 "
  
    var state = generateRandomString(16);
  
    var auth_query_parameters = new URLSearchParams({
      response_type: "code",
      client_id: spotify_client_id,
      scope: scope,
      redirect_uri: "http://192.168.1.50:5000/auth/admin/callback",
      state: state
    })
  
    res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
  })

  app.get('/auth/callback', (req, res) => {

    var code = req.query.code;
  
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: "http://192.168.1.50:5000/auth/callback",
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
        'Content-Type' : 'application/x-www-form-urlencoded'
      },
      json: true
    };
  
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        access_token = body.access_token;
        res.redirect('http://192.168.1.50:3000/?token=' + access_token)
      }
    });
  })
  app.get('/auth/admin/callback', (req, res) => {

    var code = req.query.code;
  
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: "http://192.168.1.50:5000/auth/admin/callback",
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
        'Content-Type' : 'application/x-www-form-urlencoded'
      },
      json: true
    };
  
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        access_token = body.access_token;
        res.redirect('http://localhost:3000/?token=' + access_token)
      }
    });
  })

  app.get('/auth/token', (req, res) => {

    if (!access_token) {
        console.log("No access token")
      res.json(
        {
            access_token: ""
        })
    }else{
        console.log("Access token")
        res.json(
       {
          access_token: access_token
       })
    }
  })

  app.get('/auth/logout', (req, res) => {
    access_token = null;
    res.redirect('http://192.168.1.50:3000')
    })

app.listen(port, () => {
  console.log(`Listening at http://192.168.1.50:${port}`)
})
