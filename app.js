<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GitHub Markdown Editor</title>
  <style>
    /* Simple styling for textarea and buttons */
    textarea {
      width: 100%;
      height: 200px;
    }
  </style>
</head>
<body>
  <div id="app">
    <!-- Login button or content will go here -->
  </div>

  <script>
    const CLIENT_ID = 'your-client-id'; // Use your GitHub OAuth Client ID
    const REPO = 'Zacharia-pal/DocLibPub'; // Replace with your repo

    let token = null;
    let content = '';
    let path = 'README.md';
    let files = [];

    const appDiv = document.getElementById('app');

    // Show login button or file editor based on token
    const renderApp = () => {
      if (!token) {
        appDiv.innerHTML = `
          <button id="loginBtn">Login with GitHub</button>
        `;
        document.getElementById('loginBtn').addEventListener('click', login);
      } else {
        appDiv.innerHTML = `
          <h2>Markdown Wiki</h2>
          <button id="saveBtn">Save</button>
          <textarea id="editor">${content}</textarea>
          <ul id="fileList"></ul>
        `;
        document.getElementById('saveBtn').addEventListener('click', saveFile);
        document.getElementById('editor').addEventListener('input', (e) => {
          content = e.target.value;
        });
        renderFileList();
      }
    };

    // GitHub login flow
    const login = async () => {
      const res = await fetch('/.netlify/functions/login', { method: 'POST' });
      const data = await res.json();
      const { user_code, verification_uri } = data;
      alert(`Go to GitHub and enter the code: ${user_code}`);
      window.open(verification_uri, '_blank');
    };

    // Save file to GitHub
    const saveFile = async () => {
      const shaRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shaData = await shaRes.json();
      const sha = shaData.sha;

      const saveRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update ${path}`,
          content: btoa(content),
          sha,
        }),
      });

      if (saveRes.ok) {
        alert('File saved!');
      }
    };

    // Load a specific file
    const loadFile = async (filePath) => {
      const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      content = atob(data.content);
      path = filePath;
      renderApp();
    };

    // Fetch the list of markdown files from the repo
    const fetchFiles = async () => {
      const res = await fetch(`https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      files = data.tree.filter((file) => file.path.endsWith('.md'));
      renderApp();
    };

    // Render the file list
    const renderFileList = () => {
      const fileList = document.getElementById('fileList');
      fileList.innerHTML = '';
      files.forEach((file) => {
        const listItem = document.createElement('li');
        const button = document.createElement('button');
        button.textContent = file.path;
        button.addEventListener('click', () => loadFile(file.path));
        listItem.appendChild(button);
        fileList.appendChild(listItem);
      });
    };

    // Use token and fetch files on initial load
    const setToken = (newToken) => {
      token = newToken;
      fetchFiles();
    };

    // Simulate OAuth flow for demo (replace with actual token retrieval)
    // Normally, you'd get the token from GitHub OAuth flow
    // Example token for testing purposes:
    setToken('your-github-oauth-token');  // You need to replace this with a valid token

    // Render the app
    renderApp();
  </script>
</body>
</html>
