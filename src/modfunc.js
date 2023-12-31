module.exports = function (ipcMain) {
    // Listen for the div click event from the renderer process
    ipcMain.on('div-clicked', (event, message) => {
        console.log(message);
        // Handle the click event as needed
        handleDivClick();
    });

    // Define the function to handle the div click event
    function handleDivClick() {
        console.log('Handling div click event...');
        // Add your logic here
    }
};
