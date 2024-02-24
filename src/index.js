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

const path                  = require('path');
const fs                    = require('fs');

const machineId             = require('node-machine-id');
const { exec, execSync }    = require('child_process');

const os                    = require('os');
const osUtils               = require('node-os-utils');
const driveInfo             = osUtils.drive;
const osInfo                = osUtils.os;
//const getmac              = require('getmac');

const axios                 = require('axios');

//Custom library
const libt = require('./libs/lalibtools');
const { checkForUpdates } = require('./libs/update-checker');

//Use for the login window
const { createLoginWindow } = require('./winlogin/index');

// Keep the last connection status
var lastConnStatus = "ERROR";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

//==================
// Global variables
//==================
var glovars = {
  token:          "",
  macaddress:     "",
  deviceid:       "",
  driveserial:    "",

  username:       "sadmin",
  entityid:       "LALULLA",
  appid:          "TRON",
  roleid:         "USER",
  locked:         "YES",
  allowlogon:     "NO"

}

//=============================================================
// Added by Jammi Dee 01/19/2024
// Function to copy the example .env file if it doesn't exist
//=============================================================
const initializeEnvFile = () => {
  const envFilePath = path.join(__dirname, './.env');
  const exampleEnvFilePath = path.join(__dirname, 'resources', 'app', 'src',  'assets', 'env.sample');

  if (!fs.existsSync(envFilePath)) {
    const exampleEnvContent = fs.readFileSync(exampleEnvFilePath, 'utf-8');
    fs.writeFileSync(envFilePath, exampleEnvContent);
  }
};

//==================================
// Added by Jammi Dee 01/19/2024
// Function to get the MAC address
//==================================
const macAddress = libt.getMacAddress();

if (macAddress) {

  glovars.macaddress = macAddress
  console.log('MAC Address:', macAddress);

} else {
  console.log('MAC Address not found.');
}


//========================================
// Updates detection section
// Get the app version from package.json
//========================================
const packageJsonPath     = path.join(__dirname, '../package.json');
const packageJsonContent  = fs.readFileSync(packageJsonPath, 'utf-8');
const appVersion          = JSON.parse(packageJsonContent).version;

// Define your update URL
// Used by checkForUpdates(appVersion, updateUrl);
const updateUrl           = process.env.APP_UPDATE_URL || 'https://example.com/version.txt';


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
  createMainMenu(app, mainWindow, glovars, "ON");

  // Maximize the window
  mainWindow.maximize();

  //====================
  // Open the DevTools.
  //====================
  //mainWindow.webContents.openDevTools();

  //=========================================
  // Other initialization can be placed here
  //=========================================
  // ...
  // ...initialization that does not require
  // ...fully loaded UI.

  //===========================================
  // Get the OS information using node-os-utils
  const osInformation = {
    platform:       os.platform(),
    arch:           os.arch(),
    release:        os.release(),
    totalMemory:    os.totalmem(),
    freeMemory:     os.freemem(),
    cpuModel:       os.cpus()[0].model,
    cpuCores:       os.cpus().length,
  };

  //console.log('OS Information:', osInformation);
  //============================================

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

  // Handle the login process after local initialization
  ipcMain.on('request-to-login', function (event) {

    //============================
    // Require login for the user
    //============================
    //console.log(`Allow_login ${process.env.ALLOW_LOGIN}`);
    if( (process.env.ALLOW_LOGIN || 'NO') === 'YES'){
      createLoginWindow( mainWindow );
    }    

  });

  // Add this part to handle the "Open File" functionality
  ipcMain.on('login-response', function (event, { success, token }) {

    console.log( `The token is ${token}` );

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

  // Perform your initialization before reading the .env file
  initializeEnvFile();

  //Check if there is a latest version
  //checkForUpdates(appVersion, updateUrl);

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  createTray();

  // Set up an interval to send IPC messages every second
  setInterval( async () => {

    //Get the server time
    async function getServerDateTime( token ) {
      try {
  
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        const response = await axios.get(`${process.env.APP_PROTOCOL}://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/security/datetime`,{headers});
        return response ;
  
      } catch (error) {
  
        console.log(error);
        //throw new Error('No connectivity');
        return 'ERROR';
  
      }
    }

    const createMainMenu  = require('./modmenu');
    const constatus       = await getServerDateTime(glovars.token);

    if( lastConnStatus == "ERROR" && constatus !== "ERROR"){

      // have menu
      createMainMenu(app, mainWindow, glovars, "ON" );

    }
    if( lastConnStatus !== "ERROR" && constatus == "ERROR"){

      // No menu
      createMainMenu(app, mainWindow, glovars, "OFF" );

    }

    if( constatus === "ERROR"){

      mainWindow.webContents.send('main-update-time', 'Cannot connect to the server <span style="color: red;"><b>(OFFLINE)</b></span>');

    } else {

      //console.log(constatus.data.datetime);
      const currentTime = new Date( constatus.data.datetime ).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
      mainWindow.webContents.send('main-update-time', `${currentTime} <span style="color: green;"><b>(ONLINE)</b></span>` );

    }
    
    // const currentTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
    // mainWindow.webContents.send('main-update-time', `${currentTime} <span style="color: green;"><b>(ONLINE)</b></span>` );

    lastConnStatus = constatus;

  }, 10000);

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

//===================================================
// Global Initialization goes here when DOM is ready
// This means we have a nice UI already to be used.
//===================================================
ipcMain.on('gather-env-info', async function (event) {

  //==========================================
  // Get the latest client version 02/07/2024
  //==========================================
  var needUpdate      = 0;
  var currVersion     = "";
  var currChanges     = "";
  var appUpdatePath   = "";
  try {

    const locVersion  = app.getVersion();
    const locComp     = locVersion.split('.');
    // Calculate the version value
    const locValue =  parseInt(locComp[0]) * 10000 + 
                      parseInt(locComp[1]) * 1000 + 
                      parseInt(locComp[2]);

    glovars.clientversion = locValue;

    const baseUrl   = `${process.env.APP_PROTOCOL}://${process.env.APP_HOST}:${process.env.APP_PORT}`;
    appUpdatePath   = `${baseUrl}/resources/notice/clientlatest.zip`
    const response  = await axios.get(`${baseUrl}/resources/notice/clientversion.json`);
    const verData   = response.data;
    
    console.log('Version File:', JSON.stringify(verData) );

    // Extract the current version
    currVersion = verData.currentversion;
    currChanges = verData.updates;
    
    // Split the version into its components
    const verComp = currVersion.split('.');
    
    // Calculate the version value
    const verValue =  parseInt(verComp[0]) * 10000 + 
                      parseInt(verComp[1]) * 1000 + 
                      parseInt(verComp[2]);
                         
    console.log('Version value:', verValue);
    glovars.latestclientversion  = verValue;
  
    console.log(`Versions: latest ${verValue} local ${locValue}`);
    if( verValue > locValue){
      needUpdate = 1;
    }
    glovars.needupdate            = needUpdate;
    glovars.currversion           = currVersion;
    glovars.currchanges           = currChanges;

  } catch (error) {

    glovars.latestclientversion  = 0;
    console.error('Error fetching version:', error);
      
  }  

    // Execute the VBScript JMD 01/19/2024

  // (1) Execute the VBScript JMD 01/11/2024
  const wintoolPath = path.join(__dirname, './tools/winscripts');
  const wincwd = path.join(process.cwd(), '/tools/winscripts');

  // exec(`cscript.exe //nologo ${wintoolPath}/getDeviceID.vbs`, (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`Error executing VBScript: ${error.message}`);
  //     return;
  //   }

  //   const deviceID = stdout.trim();
  //   glovars.deviceid = deviceID;

  //   console.log('Device ID:', deviceID);

  //   // Pass the device ID to the renderer process if needed
  //   mainWindow.webContents.send('machine-id', deviceID);

  // });

  // Function to copy file (synchronously)
  function copyFileSync(source, destination) {
    try {
        // Read the source file
        const data = fs.readFileSync(source);
        // Write to the destination file
        fs.writeFileSync(destination, data);
        console.log(`File ${source} copied to ${destination} successfully.`);
    } catch (err) {
        // Handle error
        console.error('Error copying file:', err);
    };

  };

  // Function to create directory if it doesn't exist
  function createDirectoryIfNotExists(directory) {
    if (!fs.existsSync(directory)) {
        try {
            fs.mkdirSync(directory, { recursive: true });
            console.log(`Directory ${directory} created.`);
        } catch (err) {
            console.error('Error creating directory:', err);
        }
    }
  }
  createDirectoryIfNotExists(wincwd);

  // Copy the file
  let sourceFile      = path.join(wintoolPath, 'getDeviceID.vbs');
  let destinationFile = path.join(wincwd, 'getDeviceID.vbs');

  copyFileSync(sourceFile, destinationFile);

  let deviceID          = "";
  try {
    const stdout        = execSync(`cscript.exe //nologo ${wincwd}/getDeviceID.vbs`);
    deviceID            = stdout.toString().trim();
    glovars.deviceid    = deviceID;
    console.log('Device ID:', deviceID);
    //mainWindow.webContents.send('machine-id', deviceID);
  } catch (error) {
      deviceID = "ERROR";
      console.error(`Error executing VBScript: ${error.message}`);
  }

  // (2) Execute the VBScript:Get drive C:\ Serial number JMD 01/11/2024
  // exec(`cscript.exe //nologo ${wintoolPath}/getDriveSerial.vbs`, (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`Error executing VBScript: ${error.message}`);
  //     return;
  //   }

  //   const driveCSerial = stdout.trim();
  //   glovars.driveserial = driveCSerial;
  //   console.log('Drive C: serial number', driveCSerial);

  // });

  // Copy the file
  sourceFile      = path.join(wintoolPath, 'getDriveSerial.vbs');
  destinationFile = path.join(wincwd, 'getDriveSerial.vbs');

  copyFileSync(sourceFile, destinationFile);

  let driveCSerial        = "";
  try {
    const stdout          = execSync(`cscript.exe //nologo ${wincwd}/getDriveSerial.vbs`);
    driveCSerial          = stdout.toString().trim();
    glovars.driveserial   = driveCSerial;
    console.log('Drive C: serial number', driveCSerial);
  } catch (error) {
      driveCSerial = "ERROR";
      console.error(`Error executing VBScript: ${error.message}`);
  }

  // wintoolPath = path.join(__dirname, './tools/winscripts');
  // exec(`cscript.exe //nologo ${wintoolPath}/getMacAddress.vbs`, (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`Error executing VBScript: ${error.message}`);
  //     return;
  //   }

  //   const macAddress = stdout.trim();
  //   console.log('Mac Address:', macAddress);

  // });

  // Copy the file
  sourceFile      = path.join(wintoolPath, 'getMacAddress.vbs');
  destinationFile = path.join(wincwd, 'getMacAddress.vbs');

  copyFileSync(sourceFile, destinationFile);

  let macAddress          = "";
  try {
    const stdout          = execSync(`cscript.exe //nologo ${wintoolPath}/getMacAddress.vbs`);
    macAddress            = stdout.toString().trim();
    glovars.macaddress    = macAddress;
    console.log('Mac Address:', macAddress);
    //mainWindow.webContents.send('machine-id', macaddress);
  } catch (error) {
      macAddress = "ERROR";
      console.error(`Error executing VBScript: ${error.message}`);
  }

  // Get the server presense JMD 02/13/2024
  async function checkConnectivity() {
    try {

      await axios.get(`${process.env.APP_PROTOCOL}://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/security/`);
      return 'OK';

    } catch (error) {

      //throw new Error('No connectivity');
      return 'ERROR';

    }
  }

  // Detect if the Server is running or not.
  let isServerUp = 'YES';
  const enforce_server_up_detection = process.env.ENFORCE_SERVER_UP_DETECTION || "YES";
  if( enforce_server_up_detection == "YES"){

    const constatus = await checkConnectivity();
    if( constatus === 'ERROR'){
      isServerUp = 'NO';
    }

  }


  let macid = "";
  // Get the unique machine ID  JMD 01/11/2024
  machineId.machineId().then(id => {
    macid = id;
    glovars.macid    = macid;
    console.log('Machine ID:', id);

    //Send the gathered info
    mainWindow.webContents.send('receive-env-info', {deviceID, driveCSerial, macAddress, macid, needUpdate, currVersion, currChanges, appUpdatePath, isServerUp });

  });

});


//=======================
// Global Token Updates
//=======================

ipcMain.on('global-update-token', function (event, { token, userData }) {

  const jwt = require('jsonwebtoken');

  function decodeJwtAndGetUserData(token) {
    try {
      // Decode the JWT without verifying the signature
      const decoded = jwt.decode(token, { complete: true });
  
      // Extract the payload from the decoded JWT
      const payload = decoded.payload;
  
      // Check if the payload contains the 'username' field
      if (payload && payload.username) {
        // Return the user data as a JSON object
        return payload.username;
      } else {
        // If 'username' field is not present, return null or handle as needed
        return null;
      }
    } catch (error) {
      // Handle decoding errors, such as invalid tokens
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  const jwtData = decodeJwtAndGetUserData(userData);
  
  glovars.token = token;
  glovars.username    = jwtData.username;
  glovars.entityid    = jwtData.entityid;
  glovars.roleid      = jwtData.roleid;
  glovars.locked      = jwtData.locked;
  glovars.allowlogon  = jwtData.allowlogon;

  //console.log(`The token is: ${token}`);
  //console.log(`The user data is: ${JSON.stringify(decodeJwtAndGetUserData(userData))}`);

});


//=======================================
// Listen to all IPC calls and handle it
//=======================================
require('./modipchandler')(ipcMain);

module.exports = {  createWindow };