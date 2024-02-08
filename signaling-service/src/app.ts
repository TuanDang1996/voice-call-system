import authMiddleware from "@/api/middlewares/auth";
import routes from "@/api/routes";
import swaggerRoute from "@/api/routes/swagger";
import config from "@/config";
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import expressSession from 'express-session';
import * as http from "http";
import passport from 'passport';
import KeycloakBearerStrategy from 'passport-keycloak-bearer';
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
require("module-alias/register");
require("@/database/mongodb");

const app: express.Express = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(authMiddleware);

const appHost =  process.env.APP_SERVER_HOST || 'localhost';
const appPort =  process.env.APP_SERVER_PORT || '8333';
const asUri= "http://" + appHost + ":" + appPort + "/"
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


const server = http.createServer(app).listen(appPort, function() {
  console.log('Kurento Tutorial started');
  console.log(`Open app http://localhost:${appPort} with a WebRTC capable browser`);
  console.log(process.env.MEDIA_SERVER_HOST)
app.use(express.static(config.STATIC_PATH));
app.use(config.API_PREFIX, routes);
app.use("/swagger", swaggerRoute);



//init websocket
new WebSocket(config.KMS_URI, server);
})
