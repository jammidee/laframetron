module.exports = function (ipcMain) {

    ipcMain.handle('div-clicked', async (event, message) => {
        console.log('Received message from renderer process:', message);
    
        // Process the message and send a reply
        const reply = 'Reply from main process!';
        return reply;
      });

    // Define the function to handle the div click event
    function handleDivClick() {
        console.log('Handling div click event...');
        // Add your logic here
    };

};
