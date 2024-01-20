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
 * File Create Date: 01/06/2024 04:29PM
 * Created by: Jammi Dee
 * Modified by: Jammi Dee
 *
*/

// Load environment variables from .env file
require('dotenv').config();

const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createConfigWindow( mainWindow, glovars ) {
  const newWindow = new BrowserWindow({
    width: 600,
    height: 550,
    parent: mainWindow, //make modal
    modal: true, //make modal
    resizable: false,
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

  const pagedata = { title: process.env.PAGE_CONFIG_TITLE || 'Configuration' };


  newWindow.webContents.on('dom-ready', () => {
    newWindow.webContents.send('data-to-config', pagedata );
  });

  //Close the current window
  ipcMain.on('close-to-config', () => {

    const currentWindow = BrowserWindow.getFocusedWindow();
    if (currentWindow) {
      currentWindow.close();
    } else {
      console.log('No focused window found.');
    }
    
  });

  // Listen for the 'load-config' message from the renderer process
  ipcMain.on('load-config', (event) => {
    try {
      // Read existing content of .env file
      const envPath = path.join(__dirname, '.env');
      let existingContent = '';

      if (fs.existsSync(envPath)) {
        existingContent = fs.readFileSync(envPath, 'utf-8');
      }

      // Parse existing content to extract initial configuration
      const initialConfig = {};
      existingContent.split('\n').forEach((line) => {
        const [key, value] = line.trim().split('=');
        if (key && value) {
          initialConfig[key] = value;
        }
      });

      // Send the initial configuration to the renderer process
      event.reply('initial-config', initialConfig);
    } catch (error) {
      console.error('Error while loading initial configuration:', error);
      // Notify the renderer process about the error
      event.reply('load-config-error', error.message);
    }
  });


  // Listen for the 'save-config' message from the renderer process
  ipcMain.on('save-config', (event, config) => {
    try {
      // Read existing content of .env file
      const envPath = path.join(__dirname, '.env');
      let existingContent = '';

      if (fs.existsSync(envPath)) {
        existingContent = fs.readFileSync(envPath, 'utf-8');
      }

      // Parse existing content to preserve other settings
      const existingSettings = existingContent
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '');

      // Update only database-related settings
      const updatedContent = existingSettings
        .map((line) => {
          const [key, value] = line.split('=');

          // Check if the key is a database-related setting
          if (['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'].includes(key)) {
            // Use the new value from the config parameter
            return `${key}=${config[key]}`;
          }

          // Preserve other settings
          return line;
        })
        .join('\n');

      // Write updated content back to .env file
      fs.writeFileSync(envPath, updatedContent);

      // Notify the renderer process about successful save
      event.reply('save-config-success');
    } catch (error) {
      console.error('Error while saving configuration:', error);
      // Notify the renderer process about the error
      event.reply('save-config-error', error.message);
    }
  });

  newWindow.on('close', (event) => {

    // Perform any cleanup or additional actions before the window is closed
    // You can use `event.preventDefault()` to prevent the window from closing
    console.log('MainWindow is closing');

    // In this example, we prevent the window from closing
    // You might want to prompt the user or save data before closing
    //event.preventDefault();

  });

}

module.exports = { createConfigWindow };
