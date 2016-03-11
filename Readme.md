Cap-Relay-Drone
---------------

This is Caprica Relay Drone, made for our lord and savior Caprica the Sith.
Essentially you can use this to relay webhooks to caprica and listen to the
hooks on a pusher channel.

#Getting Started
1. Create an account at [Webtask](https://webtask.io/) and follow their init tutorial.
2. Clone this repo, if you don't know how to follow any tutorial at [Google for git tutorials](https://google.com/#q=How%20to%20use%20git).
3. Edit as you wish (add new tasks if you feel). (More on that later)
3. Create your secrets file, the file will have your shared secrets it should look like the following typically.
```json
  {
    "github": {
      "GH_HOOK_SECRET": "foo-bar-baz",
      "other-config-you-need-for-gh": "foo"
    },
    "pusher": {
      "appId": "PUSHER_APP_ID",
      "key": "PUSHER_KEY",
      "secret": "PUSHER_SECRET",
      "cluster": "eu",
      "encrypted": true,
      "channel": "not-cap-six"
    }
  }
```
The most important part is the pusher dict, do not forget it, `cluster` and `channel`
default to "eu" and "not-cap-six" on the server (but you can always change it)
4. Now upload this json file to somewhere secure keep that url.
5. Create a webtask and pass the url above as `SECRETS_URL` when creating your webtask.

The command should look something like this
```bash
$wt create --bundle --no-parse --secret SECRETS_URL=https://super-secret.com/uniqueKey/secrets.json src/drone.js
```
6. Now point Webhook to <the awesome url you got from webtask>/hook/:provider. Where :provider is the provider name same as
   the config you put in the dictionary.
7. You are done, now abuse the room bot.

## How do I handle X-Webhook Provider
1. Create a file for the handler in `/hookHandlers` directory, have a look at github.js for an example.
   For errors use the HookHandlerError from utils it will notify your hook provider for specific errors.
   A hookhandler should return nothing if it does not wishes to publish anything (useful for ignoring unwanted events) whatever you return as a dict
   will be published on pusher. Make sure your hookhandler is an async function we await for it this allows you to do some crazy stuff like finding relavent
   cat picture.
2. Add that to `/hookHandlers/index.js` keep in mind the name of the handler is what you would want to point in your webhook and in your secrets/config.json file.

## Pusher only support 10k messages!
There are two very important things to remember though
  - Pusher only allows you to have 10KB messages.
  - If you are posting more than 10KB text in your chatroom, you are evil.
