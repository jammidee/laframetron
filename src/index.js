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
const { app, BrowserWindow, nativeImage, ipcMain, Menu, ipcRenderer, dialog, Tray } = require('electron');
const path = require('path');
const machineId = require('node-machine-id');
const { exec } = require('child_process');

const os = require('os');
const osUtils = require('node-os-utils');
const driveInfo = osUtils.drive;
const osInfo = osUtils.os;

//Use for the login window
const { createLoginWindow } = require('./winlogin/index');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

//==============================
// Declare the main window here
//==============================
let mainWindow;
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    //frame: false,
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

  //====================
  // Open the DevTools.
  //====================
  //mainWindow.webContents.openDevTools();

  // Get the unique machine ID  JMD 01/11/2024
  machineId.machineId().then(id => {
    console.log('Machine ID:', id);

    // Pass the machine ID to the renderer process if needed
    //mainWindow.webContents.send('machine-id', id);
  });

  // Execute the VBScript JMD 01/11/2024
  const wintoolPath = path.join(__dirname, './tools/winscripts');
  exec(`cscript.exe //nologo ${wintoolPath}/getDeviceID.vbs`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing VBScript: ${error.message}`);
      return;
    }

    const deviceID = stdout.trim();
    console.log('Device ID:', deviceID);

    // Pass the device ID to the renderer process if needed
    mainWindow.webContents.send('machine-id', deviceID);
  });

  //===========================================
  // Get the OS information using node-os-utils
  const osInformation = {
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    cpuModel: os.cpus()[0].model,
    cpuCores: os.cpus().length,
  };

  console.log('OS Information:', osInformation);
  //============================================

  // Execute the VBScript:Get drive C:\ Serial number JMD 01/11/2024
  exec(`cscript.exe //nologo ${wintoolPath}/getDriveSerial.vbs`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing VBScript: ${error.message}`);
      return;
    }

    const driveCSerial = stdout.trim();
    console.log('Drive C: serial number', driveCSerial);

  });

  //=============================================================
  // Demo mode scripts. This will protect the app from executing 
  // when the date had expired.
  // Added by Jammi Dee 02/10/2019
  //=============================================================

    //Expiration date of the demo app
    var xdate = new Date("2030-07-19");
    //The current date
    var cdate = new Date();

    if( cdate > xdate){
      //throw  new Error ('Time-bound access to the app error!');
      console.log('==============================================');
      console.log('Time-bound access to the app has been reached!');
      console.log('The limit is ' + xdate );
      console.log('==============================================');
      
      app.quit();
      
    }

  //=============================================================

  //============================
  // Require login for the user
  //============================
  if( (process.env.ALLOW_LOGIN || 'NO') === 'YES'){
    createLoginWindow( mainWindow );
  }

  // Add this part to handle the "Open File" functionality
  ipcMain.on('main-open-file-dialog', function (event) {
    dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    })
    .then(result => {
      if (!result.canceled) {
        event.sender.send('selected-file', result.filePaths[0]);
      } else {
        console.log('No selected file!');
      }
    })
    .catch(err => {
      console.error(err);
    });
  });

};

//Added by Jammi Dee
function createTray() {
  const iconPath = path.join(__dirname, 'favicon.ico'); // Replace with your icon path
  let tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: function () {
        mainWindow.show();
        mainWindow.maximize();
      },
      icon: nativeImage
      .createFromPath(path.join(__dirname, 'icons/std/mdpi/1_navigation_back.png')).resize({ width: 16, height: 16 })
    },
    {
      label: 'Quit',
      click: function () {
        app.isQuiting = true;
        app.quit();
      },
      icon: nativeImage
      .createFromPath(path.join(__dirname, 'icons/std/mdpi/1_navigation_cancel.png')).resize({ width: 16, height: 16 })
    }
  ]);

  tray.setToolTip(app.getName());
  tray.setContextMenu(contextMenu);
};


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//app.on('ready', createWindow);
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  createTray();
});

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

// Ask for confirmation before quitting
app.on('before-quit', (event) => {
  //event.preventDefault(); // Prevent the app from quitting immediately
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Handle form submission from renderer process
ipcMain.on('form-submission', (event, formData) => {
  console.log('Form Data:', formData);
  // Process the form data as needed
});

// Handle the request to Quit the application
ipcMain.on('quit-to-index', (event, formData) => {
  app.quit();
});


//=======================================
// Listen to all IPC calls and handle it
//=======================================
require('./modipchandler')(ipcMain);

module.exports = {  createWindow };