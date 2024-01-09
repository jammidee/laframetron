const { ipcRenderer } = require('electron');
const Swal = require('sweetalert2');

document.getElementById('apiCallButton').addEventListener('click', async () => {
  ipcRenderer.send('login-request', { username: 'yourUsername', password: 'yourPassword' });
});

ipcRenderer.on('login-response', (event, data) => {
  const apiResultDiv = document.getElementById('apiResult');
  if (data.error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: data.error,
    });
  } else {
    apiResultDiv.textContent = `API Response: ${JSON.stringify(data)}`;
  }
});
