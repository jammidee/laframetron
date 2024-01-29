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
 * File Create Date: 01/08/2024 03:54PM
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

function createMdbWindow( mainWindow, glovars ) {
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

  const pagedata = { title: process.env.PAGE_MDB_TITLE || 'MDB Database' };

  newWindow.webContents.on('dom-ready', () => {
    newWindow.webContents.send('data-to-mdb', pagedata );
  });

  //Close the current window
  ipcMain.on('close-to-mdb', () => {

    const currentWindow = BrowserWindow.getFocusedWindow();
    if (currentWindow) {
      currentWindow.close();
    } else {
      console.log('No focused window found.');
    }

  });

  ipcMain.on('get-mdbtools-version', async (event, query) => {
    
    const windowsPath = path.join(__dirname, '../../tools/mdbtools-win');
    const versionW = await versionMdbTools(windowsPath);
    newWindow.webContents.send('resp-mdbtools-version', versionW);

  });

  ipcMain.on('get-mdb-version', async (event, query) => {
    
    const mdbtoolPath = path.join(__dirname, '../../tools/mdbtools-win');
    const mdbPath = process.env.MDB_DBPATH;
    
    // Execute mdb-tools to query the MDB database
    const command = `${mdbtoolPath}/mdb-ver ${mdbPath}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing mdbtools command:', error.message);
        newWindow.webContents.send('version-error', error.message);
      } else {
        newWindow.webContents.send('resp-mdbtools-version', stdout);
      }
    });
  });

  ipcMain.on('get-mdb-tablelist', async (event, query) => {
    
    const mdbtoolPath = path.join(__dirname, '../../tools/mdbtools-win');
    const mdbPath = process.env.MDB_DBPATH;
    
    // Execute mdb-tools to query the MDB database
    const command = `${mdbtoolPath}/mdb-tables ${mdbPath}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing mdbtools command:', error.message);
        newWindow.webContents.send('version-error', error.message);
      } else {
        newWindow.webContents.send('resp-mdb-tablelist', stdout);
      }
    });

  });

  ipcMain.on('get-mdb-records', async (event, query) => {
    
    const mdbtoolPath = path.join(__dirname, '../../tools/mdbtools-win');
    const mdbPath = process.env.MDB_DBPATH;
    
    // Execute mdb-tools to query the MDB database
    const command = `${mdbtoolPath}/mdb-json ${mdbPath} Reacord`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing mdbtools command:', error.message);
        newWindow.webContents.send('version-error', error.message);
      } else {
        newWindow.webContents.send('resp-mdb-tablelist', stdout);
      }
    });

  });

  ipcMain.on('get-mdb-lastrecord', async (event, query) => {

    const mdbtoolPath = path.join(__dirname, '../../tools/mdbtools-win');
    const mdbPath = process.env.MDB_DBPATH;
    // const s = "SELECT * FROM Reacord order by ID desc limit 1;";
    // const result = await sql({ mdbPath, mdbtoolPath, sql: s });

    // Execute mdb-tools to query the MDB database
    const command = `${mdbtoolPath}/mdb-json ${mdbPath} Reacord`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing mdbtools command:', error.message);
        newWindow.webContents.send('version-error', error.message);
      } else {
        try {
          // Parse the JSON string into an array of objects
          const records = JSON.parse(`[${stdout.trim().replace(/\}\s*\{/g, '},{')}]`);
    
          // Find the record with the highest ID value
          const lastRecord = records.reduce((maxRecord, currentRecord) => {
            return currentRecord.ID > maxRecord.ID ? currentRecord : maxRecord;
          });
    
          // Send the last record to the renderer process
          newWindow.webContents.send('resp-mdb-lastrecord', JSON.stringify(lastRecord) );
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError.message);
          newWindow.webContents.send('version-error', parseError.message);
        }
      }
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
    console.log('MDB Window is closing');

    // In this example, we prevent the window from closing
    // You might want to prompt the user or save data before closing
    //event.preventDefault();

  });

}

module.exports = { createMdbWindow };
