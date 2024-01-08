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
 * File Create Date: 01/08/2024 12:38 PM
 * Created by: Jammi Dee
 * Modified by: Jammi Dee
 *
*/

const { ipcRenderer } = require('electron');
const { SerialPort } = require('serialport');

// Open the serial port and send data
const sndport = new SerialPort({ path: process.env.PORT_SND_NAME || 'COM4',
    baudRate: parseInt(process.env.PORT_SND_BAUD) || 9600,
});

document.addEventListener('DOMContentLoaded', () => {
  const serialDataDiv = document.getElementById('serial-data');

  ipcRenderer.on('serial-data', (event, data) => {
    // Append the received data to the serialDataDiv
    serialDataDiv.innerHTML += `<p>${data}</p>`;
    
    // Optionally, you can scroll to the bottom to always show the latest message
    serialDataDiv.scrollTop = serialDataDiv.scrollHeight;
  });

});

function sendData() {
    const inputBox = document.getElementById('input-box');
    const dataToSend = inputBox.value;
  
    // Send the data to the actual serial port
    sndport.write(dataToSend, (err) => {
      if (err) {
        console.error('Error sending data:', err);
      } else {
        console.log('Data sent successfully:', dataToSend);
      }
    });
  
    // Display the sent data in the serial-data div
    const serialDataDiv = document.getElementById('serial-data');
    const newParagraph = document.createElement('p');
    newParagraph.textContent = `Sent: ${dataToSend}`;
    serialDataDiv.appendChild(newParagraph);
  
    // Clear the input box after sending data
    inputBox.value = '';
  }
  
  
