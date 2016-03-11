import Pusher from 'pusher';
import Express from 'express';
import request from 'request-promise';
import hookHandlers from './hookHandlers';
import bodyParser from 'body-parser';
import dotEnv from 'dotenv';
try{
  dotEnv.config();
}catch(e){
  // do nothing
}

const app = Express();

app.use(bodyParser.json({
  // We will need this to parse raw body
  // and do cool stuff like signatures
  verify: function(req,res,buf){
    req.rawBody = buf;
  }
}));

async function attachSecrets(req, res, next){
  const isWebTask   = process.env.DEBUG !== true;
  const SECRETS_URL = isWebTask
                        ? req.webtaskContext.data.SECRETS_URL
                        : process.env.SECRETS_URL;

  const secrets = await request({
    uri: SECRETS_URL,
    headers: {
      'User-Agent': 'CapDrone',
    },
    json: true
  });
  req.secrets = secrets;
  next();
}

async function publishPusher(req, res){
  const pusherConfig = Object.assign({
    // sane defaults
    cluster: 'eu',
    channel: 'not-cap-six'
  }, req.secrets.pusher);

  const pusher = new Pusher(pusherConfig);
  const provider = req.params.provider;
  const hookHandler = hookHandlers[provider];
  const hookSecret  = req.secrets[provider];

  if( !hookHandler && !hookSecret ){
    return res.sendStatus(401);
  }

  try{
    const relay = await hookHandler(req, hookSecret);
    // Relay only if it is needed.
    if( relay ){
      const eventName = 'hook_push';
      pusher.trigger(pusherConfig.channel, eventName, relay);
    }
  }catch(e){
    console.log("Error while handling the hook")
    console.error(e.message);
    return res.sendStatus(e.statusCode || 500);
  }

  return res.sendStatus(200);
}

app.use(attachSecrets);
app.use('/hook/:provider/', publishPusher);
app.use((req, res) => res.sendStatus(404));

let exportable = null;
if( process.env.DEBUG ){
  exportable = app.listen(3000);
}else{
  const WebTask = require('webtask-tools');
  exportable = WebTask.fromExpress(app);
}

module.exports = exportable;
