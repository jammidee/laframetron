const { Menu } = require('electron');

function createMainMenu(app, mainWindow) {

    const mainMenu = Menu.buildFromTemplate([
        {
          label: 'File',
          submenu: [
            {
              label: 'Open',
              accelerator: 'CmdOrCtrl+O',
              click: () => {
                // Add your "Open" functionality here
              },
            },
            {
              type: 'separator',
            },
            {
              label: 'Exit',
              accelerator: 'CmdOrCtrl+Q',
              click: () => {
                app.quit();
              },
            },
          ],
        },
        {
          label: 'Edit',
          submenu: [
            {
              label: 'Cut',
              role: 'cut',
            },
            {
              label: 'Copy',
              role: 'copy',
            },
            {
              label: 'Paste',
              role: 'paste',
            },
          ],
        },
        {
          label: 'View',
          submenu: [
            {
              label: 'Reload',
              accelerator: 'CmdOrCtrl+R',
              click: () => {
                mainWindow.reload();
              },
            },
            {
              label: 'Toggle Developer Tools',
              accelerator: 'CmdOrCtrl+Shift+I',
              click: () => {
                mainWindow.webContents.toggleDevTools();
              },
            },
          ],
        },
      ]);

    Menu.setApplicationMenu(mainMenu);
}

module.exports = createMainMenu;
