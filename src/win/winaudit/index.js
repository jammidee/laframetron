/**
 * Copyright (C) 2023 Lalulla, Inc. All rights reserved.
 * Copyright (c) 2024 - Joel M. Damaso - mailto:jammi_dee@yahoo.com Manila/Philippines
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
 * File Create Date: 01/29/2024 03:30PM
 * Created by: Jammi Dee
 * Modified by: Jammi Dee
 *
*/

// Load environment variables from .env file
require('dotenv').config();

const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { versionMdbTools, version, sql } = require('@el3um4s/mdbtools');
const { exec } = require('child_process');
const Swal = require('sweetalert2');

function createAuditWindow( mainWindow, glovars ) {
  const newWindow = new BrowserWindow({
    width: 800,
    height: 600,
    parent: mainWindow, //make modal
    modal: true, //make modal
    //resizable: false,
    icon: path.join(__dirname, '../../favicon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  newWindow.loadFile(path.join(__dirname, './content.html'));

  //Create an empty menu
  const menu = Menu.buildFromTemplate([]);
  newWindow.setMenu(menu);

  const pagedata = { title: process.env.PAGE_AUDIT_TITLE || 'Windows Audit', pvars: glovars };

  newWindow.webContents.on('dom-ready', () => {
    newWindow.webContents.send('data-to-audit', pagedata );
  });

  //Close the current window
  ipcMain.on('close-to-audit', () => {

    const currentWindow = BrowserWindow.getFocusedWindow();
    if (currentWindow) {
      currentWindow.close();
    } else {
      console.log('No focused window found.');
    }

  });


  ipcMain.on('get-audit-device', async (event, query) => {

    console.error(`Executing VBScript...`);
    // Execute the VBScript JMD 01/29/2024
    const wintoolPath = path.join(__dirname, '../../tools/winscripts');
    exec(`cscript.exe //nologo ${wintoolPath}/auditWindows.vbs create_file=y create_filename="D:\\auditdata.xml"`, (error, stdout, stderr) => {

      console.error(`Executing VBScript done...`);

      if (error) {
        console.error(`Error executing VBScript: ${error.message}`);
        newWindow.webContents.send('resp-audit-device', "FAILED");
        return;
      }

      // // Pass the device ID to the renderer process if needed
      newWindow.webContents.send('resp-audit-device', "OK");

    });

  });

  // //Send the version to the window
  // newWindow.webContents.on('did-finish-load', () => {

  //   const appInfo = {
  //     name: app.getName(),
  //     version: app.getVersion(),
  //   };
  //   newWindow.webContents.send('version-to-mdb', appInfo);

  // });

  newWindow.on('close', (event) => {

    // Perform any cleanup or additional actions before the window is closed
    // You can use `event.preventDefault()` to prevent the window from closing
    console.log('Audit Window is closing');

    // In this example, we prevent the window from closing
    // You might want to prompt the user or save data before closing
    //event.preventDefault();

  });

}

module.exports = { createAuditWindow };
