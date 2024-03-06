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
const { versionMdbTools, version, sql } = require('@el3um4s/mdbtools');
const { exec } = require('child_process');

const path    = require('path');
const fs      = require('fs');
const xml2js  = require('xml2js');

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

  //newWindow.webContents.openDevTools();

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

    const wintoolPath = path.join(__dirname, '../../tools/winscripts');
    const wincwd = path.join(process.cwd(), '/tools/winscripts');
  
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
    let sourceFile      = path.join(wintoolPath, 'auditWindows.vbs');
    let destinationFile = path.join(wincwd, 'auditWindows.vbs');
  
    copyFileSync(sourceFile, destinationFile);

    console.log(`Executing VBScript...`);

    // Execute the VBScript JMD 01/29/2024
    exec(`cscript.exe //nologo ${wincwd}/auditWindows.vbs create_file=y create_filename="D:\\auditdata.xml"`, (error, stdout, stderr) => {

      console.error(`Executing VBScript done...`);

      const xmlFilePath       = 'D:\\auditdata.xml';
      const jsonFilePath      = 'D:\\auditdata.json';

      // Read the XML file
      fs.readFile(xmlFilePath, 'utf-8', (err, data) => {
          if (err) {
              console.error('Error reading file:', err);
              return;
          }

          // Convert XML to JSON
          xml2js.parseString(data, (parseErr, result) => {
              if (parseErr) {
                  console.error('Error parsing XML:', parseErr);
                  return;
              }

              // Convert JSON object to string
              const jsonData = JSON.stringify(result, null, 2);

              // Write JSON data to file
              fs.writeFile(jsonFilePath, jsonData, 'utf-8', (writeErr) => {
                  if (writeErr) {
                      console.error('Error writing to file:', writeErr);
                      return;
                  }
                  console.log('JSON data saved to:', jsonFilePath);
              });
          });
      });

      if (error) {
        console.error(`Error executing VBScript: ${error.message}`);
        newWindow.webContents.send('resp-audit-device', { result: "FAILED", message: "Failed executing audit", deviceid: 'Unknown' } );
        return;
      }

      // // Pass the device ID to the renderer process if needed
      newWindow.webContents.send('resp-audit-device', { result: "OK", message: "Successfully created audit file.", deviceid: 'Unknown' } );

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

  
  //newWindow.webContents.openDevTools();

}

module.exports = { createAuditWindow };
