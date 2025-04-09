import { useState, useEffect } from 'react';
import axios from 'axios';

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

  return ("
    <div>
      {!token ? (
        <button onClick={login}>Login with GitHub</button>
      ) : (
        <div>
          <h2>Markdown Wiki</h2>
          <button onClick={saveFile}>Save</button>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: '100%', height: '200px' }}
          ></textarea>
          <ul>
            {files.map((file) => (
              <li key={file.path}>
                <button onClick={() => loadFile(file.path)}>{file.path}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>"
  );
};

export default App;
