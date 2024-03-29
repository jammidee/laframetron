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
 * File Create Date: 01/16/2024 02:40PM
 * Created by: Jammi Dee
 * Modified by: Jammi Dee
 *
*/

// Load environment variables from .env file
require('dotenv').config();

const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path  = require('path');
const fs    = require('fs');
const pdf   = require('html-pdf');

function createReportWindow( mainWindow, glovars ) {
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

  const pagedata = { title: process.env.PAGE_REPORT_TITLE || 'Report', pvars: glovars };

  newWindow.webContents.on('dom-ready', () => {
    newWindow.webContents.send('data-to-report', pagedata );
  });

  //Close the current window
  ipcMain.on('close-to-report', () => {

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
    newWindow.webContents.send('version-to-report', appInfo);

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
    console.log('Report Window is closing');

    // In this example, we prevent the window from closing
    // You might want to prompt the user or save data before closing
    //event.preventDefault();

  });

  const customHeader = '<header><h1>Custom Header</h1></header>';
  const customFooter = '<footer><p>Custom Footer</p></footer>';

  // Generate PDF function
  function generatePdf(headerContent, footerContent) {
    // Main content for the PDF
    const mainContent = `
      <div class="main-content">
        <h1>Generated PDF Report</h1>
        <p>This PDF report is generated from an Electron app.</p>
      </div>
    `;

      // Complete HTML content with header, main content, and footer
      const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Generated PDF Report</title>
        <style>
          body {
            margin: 20px; /* Add margin to the entire page */
          }

          .page-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }

          .main-content {
            flex: 1;
            padding: 20px;
          }

          footer {
            background-color: #f1f1f1;
            padding: 10px;
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          ${headerContent}
          ${mainContent}
        </div>
        ${footerContent}
      </body>
      </html>
    `;


    const pdfOptions = { format: 'Letter' };

    pdf.create(content, pdfOptions).toFile('./generated-report.pdf', function (err, res) {
      if (err) return console.log(err);
      console.log(res);

      // Open the generated PDF file
      const pdfWindow = new BrowserWindow({ width: 800, height: 600 });
      pdfWindow.loadFile(res.filename);

      // Set the zoom factor to 100%
      pdfWindow.webContents.on('did-finish-load', () => {
        pdfWindow.webContents.setZoomFactor(1);
      });

    });
  }


  //Execute generation of PDF JMD 01/16/2024
  ipcMain.on('generate-pdf', () => {

    generatePdf(customHeader, customFooter);

  });


}

module.exports = { createReportWindow };
