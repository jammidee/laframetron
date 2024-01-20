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
 * File Create Date: 01/08/2024 06:29PM
 * Created by: Jammi Dee
 * Modified by: Jammi Dee
 *
*/

// Load environment variables from .env file
require('dotenv').config();

const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');

function createApiWindow( mainWindow, glovars ) {
  const newWindow = new BrowserWindow({
    width: 500,
    height: 430,
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

  const pagedata = { title: process.env.PAGE_API_TITLE || 'API' };

  newWindow.webContents.on('dom-ready', () => {
    newWindow.webContents.send('data-to-api', pagedata );
  });

  //Close the current window
  ipcMain.on('close-to-api', () => {

    const currentWindow = BrowserWindow.getFocusedWindow();
    if (currentWindow) {
      currentWindow.close();
    } else {
      console.log('No focused window found.');
    }

  });

  //Send the version to the window
  // newWindow.webContents.on('did-finish-load', () => {

  //   const appInfo = {
  //     name: app.getName(),
  //     version: app.getVersion(),
  //   };
  //   newWindow.webContents.send('version-to-api', appInfo);

  // });

  newWindow.on('close', (event) => {

    // Perform any cleanup or additional actions before the window is closed
    // You can use `event.preventDefault()` to prevent the window from closing
    console.log('API Window is closing');

    // In this example, we prevent the window from closing
    // You might want to prompt the user or save data before closing
    //event.preventDefault();

  });

  ipcMain.on('request-to-call', async (event, { username, password }) => {
    try {

      //Check for connectivity
      const constatus = await checkConnectivity();
      if( constatus === 'ERROR'){
        event.sender.send('login-response', { success: false, error: 'Connectvity error!' });
      }
      // Get base URL from environment variables
      const baseUrl = `${process.env.APP_PROTOCOL}://${process.env.APP_HOST}:${process.env.APP_PORT}`;
  
      // Request for token
      const response = await axios.get(`${baseUrl}/m/mdbex/getaccesstoken`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });
  
      // Assuming the server responds with a JWT token in the 'token' field
      const token = response.data.token;

      async function callSquery(base64EncodedSqlScript, baseUrl, token) {
          try {
              const url = `${baseUrl}/m/mdbex/squery?sqlscript=${base64EncodedSqlScript}`;
              const headers = {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              };

              const response = await axios.get(url, { headers });

              // Assuming the response is JSON, you can access the data like this:
              console.log('Response:', response.data);

              return response.data;

          } catch (error) {
              console.error('Error making API call:', error);
              throw error; // You can handle the error as needed
          }
      }


      const base64EncodedSqlScript = "c2VsZWN0ICogZnJvbSB0Ymx1c2Vy";
      //const baseUrl = "https://your-api-base-url";
      //const token = "your-access-token";

      callSquery(base64EncodedSqlScript, baseUrl, token);
  
      // Send the token back to content.html
      //event.sender.send('login-response', { success: true, token });

    } catch (error) {
      console.error('Login failed:', error.message);
      // Handle login failure here (e.g., show an error message)
      event.sender.send('login-response', { success: false, error: error.message });
    }
  });

  async function checkConnectivity() {
    try {
      await axios.get(`${process.env.APP_PROTOCOL}://${process.env.APP_HOST}:${process.env.APP_PORT}/m/index/`);
    } catch (error) {
      //throw new Error('No connectivity');
      return 'OK';
    }
  }

}

module.exports = { createApiWindow };
