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
 * File Create Date: 01/28/2024 08:40AM
 * Created by: Jammi Dee
 * Modified by: Jammi Dee
 *
*/

// Load environment variables from .env file
require('dotenv').config();

const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path  = require('path');
const fs    = require('fs');
//const pdf   = require('html-pdf');

function createPdfWindow( mainWindow, glovars ) {
  const newWindow = new BrowserWindow({
    width: 500,
    height: 430,
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

  const pagedata = { title: process.env.PAGE_PDFMAKE_TITLE || 'PDF Make', pvars: glovars };

  newWindow.webContents.on('dom-ready', () => {
    newWindow.webContents.send('data-to-pdfmake', pagedata );
  });

  //newWindow.webContents.openDevTools();

  //Close the current window
  ipcMain.on('close-to-pdfmake', () => {

    const currentWindow = BrowserWindow.getFocusedWindow();
    if (currentWindow) {
      currentWindow.close();
    } else {
      console.log('No focused window found.');
    }

  });

  //Send the version to the window
  newWindow.webContents.on('did-finish-load', () => {

    const appInfo = {
      name: app.getName(),
      version: app.getVersion(),
    };
    newWindow.webContents.send('version-to-pdfmake', appInfo);

    // newWindow.webContents.executeJavaScript(`
    //   const generatePdfBtn = document.getElementById('generatePdfBtn');
    //   generatePdfBtn.addEventListener('click', () => {
    //     require('electron').ipcRenderer.send('generate-pdf');
    //   });
    // `);

  });

  newWindow.on('close', (event) => {

    // Perform any cleanup or additional actions before the window is closed
    // You can use `event.preventDefault()` to prevent the window from closing
    console.log('PDF Make Window is closing');

    // In this example, we prevent the window from closing
    // You might want to prompt the user or save data before closing
    //event.preventDefault();

  });


  //Execute generation of PDF JMD 01/29/2024
  // ipcMain.on('generate-pdfmake', (event, data) => {

  //   console.log('Making PDF?');

  //   const pdfData = Buffer.from(data, 'base64');
  //   const filePath = dialog.showSaveDialogSync(mainWindow, {
  //       title: 'Save PDF',
  //       defaultPath: path.join(app.getPath('documents'), 'pdfmake.pdf'),
  //       filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  //   });

  //   if (filePath) {
  //       fs.writeFileSync(filePath, pdfData);
  //   }
  // });

  //Execute generation of PDF JMD 01/29/2024
  ipcMain.on('generate-pdfmake', (event, data) => {
    const pdfData = Buffer.from(data, 'base64');
    const defaultFilePath = path.join(app.getPath('documents'), 'pdfmake.pdf');

    try {
        fs.writeFileSync(defaultFilePath, pdfData);
        console.log('PDF saved successfully at:', defaultFilePath);

        // Send a confirmation to renderer process if needed
        event.sender.send('pdf-saved', defaultFilePath); 

        // Open the generated PDF file
        const pdfWindow = new BrowserWindow({ width: 800, height: 600 });
        pdfWindow.loadFile(defaultFilePath);

        // Set the zoom factor to 100%
        pdfWindow.webContents.on('did-finish-load', () => {
          pdfWindow.webContents.setZoomFactor(1);
        });

    } catch (error) {
        console.error('Error saving PDF:', error);

        // Send an error message to renderer process if needed
        event.sender.send('pdf-save-error', error.message);

    }
});


}

module.exports = { createPdfWindow };
