const { useState, useEffect } = require('react');
const axios = require('axios');

const CLIENT_ID = 'your-client-id'; // Use your GitHub OAuth Client ID
const REPO = 'Zacharia-pal/DocLibPub'; // Replace with your repo

const App = () => {
  const [token, setToken] = useState(null);
  const [content, setContent] = useState('');
  const [path, setPath] = useState('README.md');
  const [files, setFiles] = useState([]);
  const [newFileName, setNewFileName] = useState('');

  const login = async () => {
    const res = await axios.post('/.netlify/functions/login');
    const { user_code, verification_uri } = res.data;
    alert(`Go to GitHub and enter the code: ${user_code}`);
    window.open(verification_uri, '_blank');
  };

  const saveFile = async () => {
    const shaRes = await axios.get(
      `https://api.github.com/repos/${REPO}/contents/${path}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const sha = shaRes.data.sha;

    await axios.put(
      `https://api.github.com/repos/${REPO}/contents/${path}`,
      {
        message: `Update ${path}`,
        content: btoa(content),
        sha,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert('File saved!');
  };

  const loadFile = async (filePath) => {
    const res = await axios.get(
      `https://api.github.com/repos/${REPO}/contents/${filePath}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setContent(atob(res.data.content));
    setPath(filePath);
  };

  useEffect(() => {
    const fetchFiles = async () => {
      const res = await axios.get(
        `https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const mdFiles = res.data.tree.filter((file) => file.path.endsWith('.md'));
      setFiles(mdFiles);
    };
    if (token) fetchFiles();
  }, [token]);

  return React.createElement(
    'div',
    null,
    !token
      ? React.createElement(
          'button',
          { onClick: login },
          'Login with GitHub'
        )
      : React.createElement(
          'div',
          null,
          React.createElement('h2', null, 'Markdown Wiki'),
          React.createElement(
            'button',
            { onClick: saveFile },
            'Save'
          ),
          React.createElement('textarea', {
            value: content,
            onChange: (e) => setContent(e.target.value),
            style: { width: '100%', height: '200px' },
          }),
          React.createElement(
            'ul',
            null,
            files.map((file) =>
              React.createElement(
                'li',
                { key: file.path },
                React.createElement(
                  'button',
                  { onClick: () => loadFile(file.path) },
                  file.path
                )
              )
            )
          )
        )
  );
};

module.exports = App;
