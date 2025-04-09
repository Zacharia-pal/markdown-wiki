const axios = require('axios');

exports.handler = async function(event, context) {
  const { token, filePath, content, sha } = JSON.parse(event.body);
  const REPO = 'Zacharia-pal/DocLibPub'; // Replace with your repo name

  try {
    const res = await axios.put(
      `https://api.github.com/repos/${REPO}/contents/${filePath}`,
      {
        message: `Updated ${filePath}`,
        content: Buffer.from(content).toString('base64'),
        sha,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return {
      statusCode: 200,
      body: 'File saved successfully!',
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: 'Error saving file to GitHub',
    };
  }
};
