import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import expressSession from 'express-session';
import * as http from "http";
import passport from 'passport';
import KeycloakBearerStrategy from 'passport-keycloak-bearer';
import { authenticateWithKeycloak } from './middeware/authen.js';
import router from './routes/route.js';
import { WebSocket } from './websocket/websocket';


dotenv.config();

// const mongoConnection = new MongoConnection(process.env.MONGO_URL);

// if (process.env.MONGO_URL == undefined) {
//   console.log(
//    'MONGO_URL not specified in environment'  );
//   process.exit(1);

// } else {
//   mongoConnection.connect(() => {
//     console.log("Mongo start")
//   });
// }

const mediaHost =  process.env.MEDIA_SERVER_HOST || 'localhost';
const mediaPort =  process.env.MEDIA_SERVER_PORT || '8899';
const mediaUri= "ws://" + mediaHost + ":" + mediaPort + "/kurento"

const appHost =  process.env.APP_SERVER_HOST || 'localhost';
const appPort =  process.env.APP_SERVER_PORT || '8333';
const asUri= "http://" + appHost + ":" + appPort + "/"

const app:express.Express = express();
app.use("/api/sessions", router);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



var memoryStore = new expressSession.MemoryStore();
app.use(require("express-session")({
  secret: "Rusty is the worst and ugliest dog in the wolrd",
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors())



passport.use(new KeycloakBearerStrategy({
  "realm": "keycloak-express",
  "url": "http://localhost:8080"
}, (jwtPayload, done) => {
 
  
  return done(null, jwtPayload);
}));

export interface IGetUserAuthInfoRequest extends Request {
  user: string // or any other type
}

app.get('/test', (req, res, next) => {
  res.json("200");
  
});
app.get(
  '/path',
  passport.authenticate('keycloak', { session: false }),
  (req: IGetUserAuthInfoRequest, res: any) =>{
    
    res.json(req.user);
    console.log(req.user)
  } 
);

app.use(
  '/signaling',
  authenticateWithKeycloak , 
  
);




const server = http.createServer(app).listen(appPort, function() {
  console.log('Kurento Tutorial started');
  console.log(`Open app http://localhost:${appPort} with a WebRTC capable browser`);
  console.log(process.env.MEDIA_SERVER_HOST)
});

//init websocket
new WebSocket(mediaUri, server)
