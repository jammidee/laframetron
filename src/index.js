/**
 * Copyright (C) 2023 Lalulla, Inc. All rights reserved.
 * Copyright (c) 2023 - Joel M. Damaso - mailto:jammi_dee@yahoo.com Manila/Philippines
 * This file is part of Lalulla System.
 * 
 * LaKuboTron Framework is distributed under the terms of the GNU General Public License 
 * as published by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * LaKuboTron System is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Lalulla System.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * Framework Designed by: Jammi Dee (jammi_dee@yahoo.com)
 *
 * File Create Date: 12/30/2023
 * Created by: Jammi Dee
 * Modified by: Jammi Dee
 *
*/

// Load environment variables from .env file
require('dotenv').config();

//Declare other important libraries here
const { app, BrowserWindow, ipcMain, Menu, ipcRenderer } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  const pagedata = { title: process.env.PAGE_INDEX_TITLE || 'Electron' };

  // mainWindow.webContents.on('dom-ready', () => {
  //   mainWindow.webContents.executeJavaScript(`document.title = "${pagedata.title}";`);
  // });
  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.send('data-to-index', pagedata );
  });

  // Create an empty menu
  // const menu = Menu.buildFromTemplate([]);
  // Menu.setApplicationMenu(menu);

  //Create the customized menu here
  const createMainMenu = require('./modmenu');
  createMainMenu(app, mainWindow);

  // Maximize the window
  mainWindow.maximize();

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Handle form submission from renderer process
ipcMain.on('form-submission', (event, formData) => {
  console.log('Form Data:', formData);
  // Process the form data as needed
});

//=======================================
// Listen to all IPC calls and handle it
//=======================================
require('./modipchandler')(ipcMain);

// function createAboutWindow() {
//   const aboutWindow = new BrowserWindow({
//     width: 400,
//     height: 300,
//     webPreferences: {
//       nodeIntegration: true
//     }
//   });

//   // Load the HTML file for the new window
//   aboutWindow.loadFile('about.html');
// }

module.exports = {
  createWindow
  //createAboutWindow
};