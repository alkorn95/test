import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import passportJWT from 'passport-jwt';
import jimp from 'jimp';
import fs from 'fs-extra';

import { serverPort } from '../etc/config.json';

import * as db from './utils/DataBaseUtils';

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
jwtOptions.secretOrKey = '123';

var strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  var user = db.getUser(jwt_payload.id);
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});
passport.use(strategy);
const app = express();
db.setUpConnection();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: '*' }));
app.use(passport.initialize());

function base64_decode(base64str, file) {
  var image = new Buffer(base64str, 'base64');
  fs.writeFileSync(file, image);
}

app.post('/login', function (req, res) {
  if (req.body.name && req.body.password) {
    var name = req.body.name;
    var password = req.body.password;
    console.log("login by " + name)
  }
  var user = db.findByName(req.body.name);
  user.then(user => {
    if (!user) {
      res.status(401).json({ message: 'incorrect name or password' });
      console.log("no user\n");
    }
    else
      if (user.password === req.body.password) {
        var payload = { id: user.id, role: user.role, name: user.name };
        var token = jwt.sign(payload, jwtOptions.secretOrKey);
        res.json({ message: 'ok', token: token });
        console.log("sucsessful\n");
      }
      else {
        res.status(401).json({ message: 'incorrect name or password' });
        console.log("incorrect password\n");
      }
  });
});

app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  var token = req.headers.authorization;
  var ID = jwt.decode(token.substring(4, token.length)).id;
  db.getUser(ID).then(user => {
    console.log("get all users by " + user.name + "\n");
    db.allUsers(user.role, user._id, user.name).then(data => res.send(data));
  });
});

app.get('/curators', passport.authenticate('jwt', { session: false }), (req, res) => {
  var token = req.headers.authorization;
  var ID = jwt.decode(token.substring(4, token.length)).id;
  db.getUser(ID).then(user => {
    console.log("get curators by " + user.name + "\n");
    db.Curators(user.role, user._id, user.name).then(data => res.send(data));
  })
});

app.get('/users/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  var token = req.headers.authorization;
  var ID = jwt.decode(token.substring(4, token.length)).id;
  db.getUser(ID).then(user => {
    switch (user.role) {
      case 0:
        db.getUser(req.params.id).then(data => {
          console.log("get " + data.name + " by " + user.name + "\n");
          res.send(data);
        });
        break;
      case 1:
        db.getUser(req.params.id).then(data => {
          if (data.curatorID == user._id || req.params.id == ID) {
            console.log("get " + data.name + " by " + user.name + "\n");
            res.send(data);
          }
          else {
            console.log("get " + data.name + " by " + user.name + "\naccess denied\n");
            res.status(403).json({ message: 'access denied' });
          }
        })
        break;
      case 2:
        if (req.params.id == ID)
          db.getUser(req.params.id).then(data => {
            console.log("get " + data.name + " by " + user.name + "\n");
            res.send(data);
          });
        else {
          console.log("get user by " + user.name + "\naccess denied\n");
          res.status(403).json({ message: 'access denied' });
        }
    }
  });
});

app.put('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  var token = req.headers.authorization;
  var ID = jwt.decode(token.substring(4, token.length)).id;
  db.getUser(ID).then(user => {
    db.findByName(req.body.name).then(_data => {
      if (_data == null || req.body._id == _data._id) {
        console.log("update " + req.body.name + " by " + user.name + "\n");
        if (user.role == 0 || user._id == req.body._id) {
          db.updateUser(req.body, user.role).then(data => {
            res.status(201).send(data);
          });
        }
        else {
          console.log("access denied\n");
          res.status(403).json({ message: 'access denied' });
        }
      }
      else {
        console.log("user exists\n");
        res.json({ message: 'user exists' });
      }
    });
  });
});

app.post('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  var token = req.headers.authorization;
  var ID = jwt.decode(token.substring(4, token.length)).id;
  db.getUser(ID).then(user => {
    db.findByName(req.body.name).then(_data => {
      if (_data == null) {
        console.log("add " + req.body.name + " by " + user.name + "\n");
        if (user.role == 0)
          db.createUser(req.body, false).then(data => {
            db.findByName(req.body.name).then(_user => {
              if (req.body.photo) {
                base64_decode(req.body.photo.substring(23, req.body.photo.length), 'temp.jpg');
                console.log("add image to " + _user._id + " by " + user.name + "\n");
                jimp.read("temp.jpg", (err, img) => {
                  if (err) {
                    console.log("no image\n");
                  }
                  else {
                    var h = img.bitmap.height;
                    var w = img.bitmap.width;
                    var diff = Math.abs(w - h);
                    if (h < w)
                      img.crop(diff / 2, 0, h, h);
                    else
                      img.crop(0, diff / 2, w, w);
                    img.resize(256, 256);
                    var img_sm = img.clone();
                    img.quality(100).write("images/" + _user._id + "/img.jpg");
                    img_sm.resize(32, 32).quality(90).write("images/" + _user._id + "/img-small.jpg");
                    res.status(201).json({ message: "ok" });
                    console.log("image saved\n");
                  }
                });
              }
              res.status(201).json({ message: "ok" })
            });
          });
        else {
          console.log("access denied\n");
          res.status(403).json({ message: 'access denied' });
        }
      }
      else {
        console.log("user exists\n");
        res.json({ message: 'user exists' });
      }
    });
  });
});

app.post('/register', (req, res) => {
  db.usersCount().then(count => {
    db.findByName(req.body.name).then(data => {
      if (data == null)
        db.createUser(req.body, true, count).then((data) => {
          res.status(201).send(data);
          console.log("register " + req.body.name + "\n");
        });
      else {
        res.status(200).json({ registered: "0" });
        console.log("register " + req.body.name + " (user already exists)\n");
      }
    });

  });
});

app.post('/image', passport.authenticate('jwt', { session: false }), (req, res) => {
  var token = req.headers.authorization;
  var ID = jwt.decode(token.substring(4, token.length)).id;
  db.getUser(ID).then(user => {
    if (user.role == 0 || user._id == req.body._id) {
      base64_decode(req.body.photo.substring(23, req.body.photo.length), 'temp.jpg');
      console.log("add image to " + req.body._id + " by " + user.name + "\n");
      jimp.read("temp.jpg", (err, img) => {
        if (err) {
          console.log("no image\n");
          res.json({ message: "not added" });
        }
        else {
          var h = img.bitmap.height;
          var w = img.bitmap.width;
          var diff = Math.abs(w - h);
          if (h < w)
            img.crop(diff / 2, 0, h, h);
          else
            img.crop(0, diff / 2, w, w);
          img.resize(256, 256);
          var img_sm = img.clone();
          img.quality(100).write("images/" + req.body._id + "/img.jpg");
          img_sm.resize(32, 32).quality(70).write("images/" + req.body._id + "/img-small.jpg");
          res.json({ message: "ok" });
          console.log("image saved\n");
        }
      });
    }
    else {
      console.log("add image to " + req.body._id + " by " + user.name + "\naccess denied\n");
      res.status(403).json({ message: 'access denied' });
    }
  });
});

app.get('/image/:id&:big', passport.authenticate('jwt', { session: false }), (req, res) => {
  var token = req.headers.authorization;
  var ID = jwt.decode(token.substring(4, token.length)).id;
  db.getUser(ID).then(user => {
    var path;
    if (req.params.big == '0')
      path = './images/' + req.params.id + '/img-small.jpg';
    else
      path = './images/' + req.params.id + '/img.jpg';
    fs.exists(path, exists => {
      if (exists) {
        fs.readFile(path, (err, data) => {
          switch (user.role) {
            case 0:
              res.send(data);
              console.log("get image by " + user.name);
              break;
            case 1:
              db.getUser(req.params.id).then(_user => {
                if (_user.curatorID == user._id || req.params.id == ID) {
                  res.send(data);
                  console.log("get image by " + user.name);
                }
                else {
                  console.log("get image by " + user.name + " (access denied)");
                  res.status(403).json({ message: 'access denied' });
                }
              });
              break;
            case 2:
              if (req.params.id == ID) {
                res.send(data);
                console.log("get image by " + user.name);
              }
              else {
                console.log("get image by " + user.name + " (access denied)");
                res.status(403).json({ message: 'access denied' });
              }
              break;
          }
        })
      }
      else {
        res.status(404).json({ messoge: "image not found" });
        console.log("get image by " + user.name + " (not found)");
      }
    })
  })
});

app.delete('/users/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  var token = req.headers.authorization;
  var ID = jwt.decode(token.substring(4, token.length)).id;
  db.getUser(ID).then(user => {
    if (user.role == 0) {
      console.log("delete " + req.params.id + " by " + user.name + "\n");
      db.deleteUser(req.params.id).then(data => {
        var path = './images/' + req.params.id;
        fs.remove(path, () => { });
        res.send(data);
      });
    }
    else {
      console.log("delete " + req.params.id + " by " + user.name + "\naccess denied\n");
      res.status(403).json({ message: 'access denied' });
    }
  })
});

const server = app.listen(serverPort, function () {
  console.log(`Server is up and running on port ${serverPort}`);
});
