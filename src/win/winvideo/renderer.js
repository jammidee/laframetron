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
    const capturedImage800600   = document.getElementById('capturedImage800600');
    const capturedImage320240   = document.getElementById('capturedImage320240');

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

      //Override - remove this if you want the original
      const targetWidth   = 800;
      const targetHeight  = 600; 
      canvas.width        = targetWidth;
      canvas.height       = targetHeight;
  
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
      // Display the captured image
      //console.log(`datUrl: ${canvas.toDataURL('image/png')}`);
      capturedImageElement.src = addTimestamp(canvas.toDataURL('image/png'));

      showCapturedImage();

      // const canvas1 = document.createElement('canvas');
      // const targetWidth1   = 800;
      // const targetHeight1  = 600; 
      // canvas1.width        = targetWidth1;
      // canvas1.height       = targetHeight1;
      // const ctx1 = canvas1.getContext('2d');
      // ctx1.drawImage(videoElement, 0, 0, canvas1.width, canvas1.height);
      capturedImage800600.src = addTimestampV2('800', canvas.toDataURL('image/png'));

      // const canvas2 = document.createElement('canvas');
      // const targetWidth2   = 320;
      // const targetHeight2  = 240; 
      // canvas2.width        = targetWidth2;
      // canvas2.height       = targetHeight2;
      // const ctx2 = canvas2.getContext('2d');
      // ctx2.drawImage(videoElement, 0, 0, canvas2.width, canvas2.height);
      capturedImage320240.src = addTimestampV2('320', canvas.toDataURL('image/png'));


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

      // //Override - remove this if you want the original
      const targetWidth   = 800;
      const targetHeight  = 600; 
      canvas.width        = targetWidth;
      canvas.height       = targetHeight;
  
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
      // Convert the canvas content to a data URL
      const dataUrl = addTimestampV2( '800', videoElement );
  
      // Create a link element and trigger a click to download the image
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'captured_image.png';
      link.click();
  
      // Reset to the camera view after saving
      showCamera();

      window.close();

    }
  
    function addTimestamp( dataUrl ) {

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      // Set canvas dimensions to match the video or captured image
      canvas.width = videoElement.videoWidth || capturedImageElement.width;
      canvas.height = videoElement.videoHeight || capturedImageElement.height;
  
      //Override - remove this if you want the original
      const targetWidth   = 800;
      const targetHeight  = 600; 
      canvas.width        = targetWidth;
      canvas.height       = targetHeight;

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
      ctx.drawImage(logoImage, canvas.width - 120, 20, 100, 100);

      return canvas.toDataURL('image/png');
    }
  
    function addTimestampV2(csize, videoElement) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      let targetWidth = 800;
      let targetHeight = 600;
      if (csize === '1024') {
          targetWidth = 1024;
          targetHeight = 800;
      } else if (csize === '800') {
          targetWidth = 800;
          targetHeight = 600;
      } else if (csize === '320') {
          targetWidth = 320;
          targetHeight = 240;
      }
  
      canvas.width = targetWidth;
      canvas.height = targetHeight;
  
      // Draw the main content (video frame) onto the canvas
      ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
  
      // Add timestamp
      if (timestampCheckbox.checked) {
          const timestamp = new Date().toLocaleString();
          ctx.fillStyle = 'white';
          ctx.font = '14px Arial';
          ctx.fillText(timestamp, 10, canvas.height - 10);
      }
  
      // Add logo, adjust position and size of the logo
      ctx.drawImage(logoImage, canvas.width - 120, 20, 100, 100);
  
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
    timestampCheckbox.addEventListener('change', toggleTimestamp);
    

    // Function to check if zoom is supported
    function isZoomSupported(track) {
      return track.getCapabilities && track.getCapabilities().zoom;
    };

    // Function to set zoom level
    function setZoomLevel(track, zoomLevel) {
      const capabilities = track.getCapabilities();
      const minZoom = capabilities.zoom.min;
      const maxZoom = capabilities.zoom.max;

      if (zoomLevel < minZoom || zoomLevel > maxZoom) {
        console.error(`Zoom level ${zoomLevel} is out of supported range [${minZoom}, ${maxZoom}]`);
        return;
      };

      const constraints = {
        advanced: [{ zoom: zoomLevel }]
      };

      track.applyConstraints(constraints)
      .then(() => {
        console.log(`Zoom level set to ${zoomLevel}`);
      })
      .catch((error) => {
        console.error('Error setting zoom level:', error);
      });
    };

    
    // Check if zoom is supported
    const minZoom     = parseInt(process.env.CAM_MIN_ZOOM_VALUE);
    const maxZoom     = parseInt(process.env.CAM_MAX_ZOOM_VALUE);
    const stepZoom    = parseInt(process.env.CAM_ZOOM_STEP);
    const initvalue   = parseInt(process.env.CAM_INIT_VALUE);

    let currZoom = initvalue;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
          const videoTrack = stream.getVideoTracks()[0];

          if (isZoomSupported(videoTrack)) {

            setZoomLevel(videoTrack, currZoom );

            document.getElementById('zoomInButton').addEventListener('click', () => {
                if(currZoom < maxZoom ){
                  currZoom = currZoom + stepZoom;
                  setZoomLevel(videoTrack, currZoom ); 
                };
                
            });

            document.getElementById('zoomOutButton').addEventListener('click', () => {
              if(currZoom > minZoom ){
                currZoom = currZoom - stepZoom;
                setZoomLevel(videoTrack, currZoom ); 
              };
            });

          } else {

            console.warn('Zoom is not supported by the camera.');

          }
      })
      .catch((error) => {
        console.log('Error accessing camera:', error.name, error.message);
      });
    };

    
  });
  