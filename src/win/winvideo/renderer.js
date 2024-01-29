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
 * File Create Date: 01/07/2024 02:43pm
 * Created by: Jammi Dee
 * Modified by: Jammi Dee
 *
*/

document.addEventListener('DOMContentLoaded', function () {

    const videoElement          = document.getElementById('camera');
    const capturedImageElement  = document.getElementById('capturedImage');
    const cameraDropdown        = document.getElementById('cameraDropdown');
    const captureButton         = document.getElementById('captureButton');
    const resetButton           = document.getElementById('resetButton');
    const saveButton            = document.getElementById('saveButton');
    const timestampOption       = document.getElementById('timestampOption');
    const timestampCheckbox     = document.getElementById('timestampCheckbox');

    // Load logo image
    const logoImage = new Image();
    logoImage.src = '../../assets/captured-image-logo.png';
    logoImage.onload = function() {
        console.log('Logo loaded');
    };
  
    let currentStream;
  
    function populateCameraList() {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          // Clear existing options
          cameraDropdown.innerHTML = '';
  
          // Filter only video input devices
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
  
          // Populate the dropdown with camera options
          videoDevices.forEach((device, index) => {

            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text  = `Camera ${index + 1}`;
            cameraDropdown.appendChild(option);

          });
  
          // Set the default camera (first in the list)
          if (videoDevices.length > 0) {
            startCamera(videoDevices[0].deviceId);
          }
        })
        .catch(err => {
          console.error('Error enumerating devices:', err);
        });
    }
  
    function startCamera(deviceId) {
      navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: false
      })
      .then(stream => {
        videoElement.srcObject = stream;
        videoElement.play();
        currentStream = stream;
        showCamera();
      })
      .catch(err => {
        console.error('Error accessing camera:', err);
      });
    }
  
    function showCamera() {
      videoElement.style.display = 'block';
      capturedImageElement.style.display = 'none';
    }
  
    function showCapturedImage() {
      videoElement.style.display = 'none';
      capturedImageElement.style.display = 'block';
    }
  
    function captureImage() {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
  
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
      // Display the captured image
      capturedImageElement.src = addTimestamp(canvas.toDataURL('image/png'));
      showCapturedImage();
    }
  
    function resetCamera() {
      showCamera();
    }
  
    function saveImage() {
      if (!currentStream) {
        console.error('No active stream');
        return;
      }
  
      const canvas  = document.createElement('canvas');
      canvas.width  = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
  
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
      // Convert the canvas content to a data URL
      const dataUrl = addTimestamp(canvas.toDataURL('image/png'));
  
      // Create a link element and trigger a click to download the image
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'captured_image.png';
      link.click();
  
      // Reset to the camera view after saving
      showCamera();
    }
  
    function addTimestamp(dataUrl) {

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      // Set canvas dimensions to match the video or captured image
      canvas.width = videoElement.videoWidth || capturedImageElement.width;
      canvas.height = videoElement.videoHeight || capturedImageElement.height;
  
      // Draw the image onto the canvas
      if (videoElement.style.display === 'block') {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(capturedImageElement, 0, 0, canvas.width, canvas.height);
      }
  
      // Add timestamp
      if (timestampCheckbox.checked) {
        const timestamp = new Date().toLocaleString();
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(timestamp, 10, canvas.height - 10);
      }
  
      // Add logo, adjust position and size of the logo
      ctx.drawImage(logoImage, canvas.width - 100, 0, 100, 100);

      return canvas.toDataURL('image/png');
    }
  
    function toggleTimestamp() {
      if (timestampCheckbox.checked) {
        timestampOption.style.color = 'white';
      } else {
        timestampOption.style.color = 'gray';
      }
    }
  
    // Populate the camera dropdown and start the default camera
    populateCameraList();
  
    // Event listener for changing the selected camera
    cameraDropdown.addEventListener('change', function () {
      const selectedDeviceId = this.value;
      startCamera(selectedDeviceId);
    });
  
    // Event listeners for buttons
    captureButton.addEventListener('click', captureImage);
    resetButton.addEventListener('click', resetCamera);
    saveButton.addEventListener('click', saveImage);
    
  });
  