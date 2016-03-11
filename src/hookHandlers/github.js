import HookHandlerError from '../utils/HookHandlerError';
import crypto from 'crypto';

function signBlob (key, blob) {
  return 'sha1=' + crypto.createHmac('sha1', key).update(blob).digest('hex')
}

const handlers = {
  issues(body){
    const payload = {
      url: body.issue.html_url,
      title: body.issue.title,
      action: body.action,
      type: 'issues'
    };
    return payload;
  },
  passThrough(){
    // noop
  }
}

export default async function ghHookHandler(req, secrets){
  const sharedSecret = secrets.GH_HOOK_SECRET;
  const {headers, body, rawBody} = req;
  const hash  = headers['x-hub-signature'];
  const eventName = headers['x-github-event'];

  const payloadHash = signBlob(sharedSecret, req.rawBody);

  if( hash !== payloadHash ){
      throw new HookHandlerError(401, 'Signature does not match');
  }

  if(!body){
      throw new HookHandlerError(400, 'No body');
  }

  const handler = handlers[eventName] || handlers.passThrough;

  return handler(body);
}
