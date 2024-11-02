// pocket-auth.js
import fetch from 'node-fetch';

async function getPocketRequestToken(consumerKey) {
    const response = await fetch('https://getpocket.com/v3/oauth/request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Accept': 'application/json'
        },
        body: JSON.stringify({
            consumer_key: consumerKey,
            redirect_uri: 'http://localhost'
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.code; // This is your request token
}

// Usage
const CONSUMER_KEY = 'YOUR_CONSUMER_KEY';

getPocketRequestToken(CONSUMER_KEY)
    .then(requestToken => {
        console.log('Request Token:', requestToken);
        console.log('\nNow:\n');
        console.log('1. Visit this URL to authorize the app:');
        console.log(`https://getpocket.com/auth/authorize?request_token=${requestToken}&redirect_uri=http://localhost`);
        console.log('\n2. After authorizing, press Enter to continue...');
        
        // Wait for user to authorize
        process.stdin.once('data', async () => {
            try {
                // Now get the access token
                const response = await fetch('https://getpocket.com/v3/oauth/authorize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        consumer_key: CONSUMER_KEY,
                        code: requestToken
                    })
                });
                
                const data = await response.json();
                console.log('\nYour access token:', data.access_token);
                console.log('\nAdd this token to your pocket-importer.js script');
            } catch (error) {
                console.error('Error getting access token:', error);
            }
            process.exit();
        });
    })
    .catch(console.error);