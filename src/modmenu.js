const { Menu, nativeImage } = require('electron');
const path = require('path');
const Swal = require('sweetalert2');

const { createAboutWindow } = require('./winabout/index');

const iconSize = { width: 16, height: 16 };

function createMainMenu(app, mainWindow) {

    const mainMenu = Menu.buildFromTemplate([
        {
          label: 'File',
          submenu: [
            {
              label: 'Open',
              accelerator: 'CmdOrCtrl+O',
              click: async () => {

                // Add your "Open" functionality here
                //mainWindow.webContents.executeJavaScript('alert("File/Open Clicked!!!");');
                mainWindow.webContents.executeJavaScript(`
                Swal.fire({
                  title: 'Div Clicked!',
                  text: 'File/Open Clicked!!!',
                  icon: 'success',
                });
              `);

              },
              icon: nativeImage
              .createFromPath(path.join(__dirname, 'icons/std/mdpi/5_content_new.png'))
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
              icon: nativeImage
              .createFromPath(path.join(__dirname, 'icons/std/mdpi/1_navigation_cancel.png'))
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
        {
          label: 'About',
          accelerator: 'CmdOrCtrl+A',
          click: () => {
            createAboutWindow();
          },
          icon: nativeImage
          .createFromPath(path.join(__dirname, 'icons/std/mdpi/1_navigation_cancel.png'))
        },
      ]);

    Menu.setApplicationMenu(mainMenu);
}

module.exports = createMainMenu;

