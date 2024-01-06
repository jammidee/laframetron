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

module.exports = function (ipcMain) {

    ipcMain.handle('div-clicked', async (event, message) => {
        console.log('Received message from renderer process:', message);
    
        // Process the message and send a reply
        const reply = 'Reply from main process!';
        return reply;
    });

    // Listen for the div click event from the renderer process
    // ipcMain.on('div-clicked', (event, message) => {
    //     console.log(message);
    //     // Handle the click event as needed
    //     handleDivClick();
    // });

    // Define the function to handle the div click event
    function handleDivClick() {
        console.log('Handling div click event...');
        // Add your logic here
    }
};
