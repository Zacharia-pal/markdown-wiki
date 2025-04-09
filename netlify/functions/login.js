const axios = require('axios');

exports.handler = async function(event, context) {
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

  try {
    const res = await axios.post(
      'https://github.com/login/device/code',
      new URLSearchParams({ client_id: CLIENT_ID, scope: 'repo' }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { device_code, user_code, verification_uri, interval } = res.data;

    setTimeout(async () => {
      const tokenRes = await axios.post(
        'https://github.com/login/oauth/access_token',
        new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' } }
      );
      const { access_token } = tokenRes.data;
      return {
        statusCode: 200,
        body: JSON.stringify({ user_code, verification_uri, access_token }),
      };
    }, interval * 1000);
  } catch (err) {
    return {
      statusCode: 500,
      body: 'GitHub authentication error',
    };
  }
};
