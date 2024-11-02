# pocket-importer
Import browser bookmarks to Pocket. Supports tags

## How to
1. Run `npm install jsdom node-fetch`
2. Create a Pocket API app: https://getpocket.com/developer/
3. In `pocket-auth.js`, replace `YOUR_CONSUMER_KEY` with your consumer key
4. Run `node pocket-auth.js` and follow prompts
5. In `pocket-importer.js`, replace `YOUR_CONSUMER_KEY` with your consumer key and `YOUR_ACCESS_TOKEN` with the access token you got from step 4
6. Run `node pocket-importer.js bookmarks.html`, where `bookmarks.html` is your bookmarks file exported from the browser
