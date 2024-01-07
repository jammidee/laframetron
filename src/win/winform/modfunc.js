// Function 1
function getRemoteLookup(name) {
    return `Hello, ${name}!`;
}

const axios = require('axios');
// Function to make a POST request with base64-encoded data
async function postDataToEncrypt(penxdata) {
    try {
        // Convert data to base64
        const base64Data = Buffer.from(penxdata).toString('base64');
    
        // URL for the POST request
        const url = 'http://localhost:3101/m/utility/enxs';
    
        // Data to be sent in the form field
        const formData = {
            penxdata: base64Data,
        };
    
        // Make the POST request using Axios
        const response = await axios.post(url, formData);
    
        // Log the response from the server
        console.log('Response:', response.data);
    } catch (error) {
        // Handle errors
        console.error('Error:', error.message || error);
    }
}

// Function 2
function addNumbers(a, b) {
    return a + b;
}

// Export the functions to make them accessible
module.exports = {
    postDataToEncrypt,
    addNumbers,
};
  