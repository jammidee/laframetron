// Load environment variables from .env file
require('dotenv').config();

const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createAboutWindow() {
  const newWindow = new BrowserWindow({
    width: 400,
    height: 300,
    icon: path.join(__dirname, '../favicon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  newWindow.loadFile(path.join(__dirname, './content.html'));

  //Create an empty menu
  const menu = Menu.buildFromTemplate([]);
  newWindow.setMenu(menu);

  const pagedata = { title: process.env.PAGE_ABOUT_TITLE || 'About' };
  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.send('data-to-about', pagedata );
  });

}

// app.whenReady().then(() => {
//   // createMainWindow();

// });

module.exports = { createAboutWindow };
