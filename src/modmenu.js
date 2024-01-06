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
 * File Create Date: 01/06/2024
 * Created by: Jammi Dee
 * Modified by: Jammi Dee
 *
*/

const { Menu, nativeImage } = require('electron');
const path = require('path');
const Swal = require('sweetalert2');

const { createAboutWindow } = require('./winabout/index');
const { createConfigWindow } = require('./winconfig/index');
const { createFormWindow } = require('./winform/index');

const iconSize = { width: 16, height: 16 };

function createMainMenu(app, mainWindow) {

    const mainMenu = Menu.buildFromTemplate([
        {
          label: 'File',
          submenu: [
            {
              label: 'Open',
              accelerator: 'CmdOrCtrl+O',
              click: async () => {

                  // Add your "Open" functionality here
                  //mainWindow.webContents.executeJavaScript('alert("File/Open Clicked!!!");');
                  mainWindow.webContents.executeJavaScript(`
                  Swal.fire({
                    title: 'Div Clicked!',
                    text: 'File/Open Clicked!!!',
                    icon: 'success',
                  });
                `);

              },
              icon: nativeImage
              .createFromPath(path.join(__dirname, 'icons/std/mdpi/4_collections_collection.png'))
            },
            {
              label: 'New Data Entry',
              accelerator: 'CmdOrCtrl+N',
              click: async () => {

                createFormWindow( mainWindow );

              },
              icon: nativeImage
              .createFromPath(path.join(__dirname, 'icons/std/mdpi/5_content_new.png'))
            },
            {
              label: 'Configure',
              accelerator: 'CmdOrCtrl+C',
              click: async () => {

                createConfigWindow( mainWindow );

              },
              icon: nativeImage
              .createFromPath(path.join(__dirname, 'icons/std/mdpi/2_action_settings.png'))
            },
            {
              type: 'separator',
            },
            {
              label: 'Exit',
              accelerator: 'CmdOrCtrl+Q',
              click: () => {

                mainWindow.webContents.executeJavaScript(`
                  Swal.fire({
                    title: 'Are you sure?',
                    text: 'Do you really want to quit?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, quit!'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      // If the user clicks "Yes, quit!" in the dialog, quit the app
                      //app.quit();
                      ipcRenderer.send('quit-to-index', 'OK')
                    }
                  });
                `);
              },
              icon: nativeImage
              .createFromPath(path.join(__dirname, 'icons/std/mdpi/1_navigation_cancel.png'))
            },
          ],
        },
        // {
        //   label: 'Edit',
        //   submenu: [
        //     {
        //       label: 'Cut',
        //       role: 'cut',
        //     },
        //     {
        //       label: 'Copy',
        //       role: 'copy',
        //     },
        //     {
        //       label: 'Paste',
        //       role: 'paste',
        //     },
        //   ],
        // },
        {
          label: 'View',
          submenu: [
            {
              label: 'Reload',
              accelerator: 'CmdOrCtrl+R',
              click: () => {
                mainWindow.reload();
              },
            },
            {
              label: 'Toggle Developer Tools',
              accelerator: 'CmdOrCtrl+Shift+I',
              click: () => {
                mainWindow.webContents.toggleDevTools();
              },
            },
          ],
        },
        {
          label: 'About',
          accelerator: 'CmdOrCtrl+A',
          click: () => {
            createAboutWindow( mainWindow );
          },
          icon: nativeImage
          .createFromPath(path.join(__dirname, 'icons/std/mdpi/1_navigation_cancel.png'))
        },
      ]);

    Menu.setApplicationMenu(mainMenu);
}

module.exports = createMainMenu;

