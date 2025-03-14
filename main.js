const { app, BrowserWindow, dialog, Menu } = require('electron');
const fs = require('fs');

let mainWindow;
let currentFile = null;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    mainWindow.loadFile('index.html');
    updateTitle('Untitled - Notepad');

    const menu = Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                { label: 'New', accelerator: 'Ctrl+N', click: () => createNewFile() },
                { label: 'Open', accelerator: 'Ctrl+O', click: () => openFile() },
                { label: 'Save', accelerator: 'Ctrl+S', click: () => saveFile() },
                { label: 'Save As', accelerator: 'Ctrl+Shift+S', click: () => saveFileAs() },
                { type: 'separator' },
                { label: 'Exit', accelerator: 'Ctrl+Q', click: () => app.quit() }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { label: 'Find', accelerator: 'Ctrl+F', click: () => mainWindow.webContents.send('toggle-find') },
                { label: 'Replace', accelerator: 'Ctrl+H', click: () => mainWindow.webContents.send('toggle-replace') }
            ]
        },
        {
            label: 'View',
            submenu: [
                { label: 'Toggle Dark Mode', click: () => mainWindow.webContents.send('toggle-theme') },
                { label: 'Markdown Preview', click: () => mainWindow.webContents.send('toggle-markdown') }
            ]
        }
    ]);

    Menu.setApplicationMenu(menu);
});

function updateTitle(title) {
    mainWindow.setTitle(title);
}

function createNewFile() {
    mainWindow.webContents.send('clear-content');
    currentFile = null;
    updateTitle('Untitled - Notepad');
}

function openFile() {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Text Files', extensions: ['txt', 'md'] }]
    }).then(result => {
        if (!result.canceled) {
            const filePath = result.filePaths[0];
            fs.readFile(filePath, 'utf-8', (err, data) => {
                if (!err) {
                    currentFile = filePath;
                    mainWindow.webContents.send('file-opened', data);
                    updateTitle(`${filePath} - Notepad`);
                }
            });
        }
    });
}

function saveFile() {
    if (currentFile) {
        mainWindow.webContents.send('save-content', currentFile);
    } else {
        saveFileAs();
    }
}

function saveFileAs() {
    dialog.showSaveDialog({
        filters: [{ name: 'Text Files', extensions: ['txt', 'md'] }]
    }).then(result => {
        if (!result.canceled) {
            currentFile = result.filePath;
            mainWindow.webContents.send('save-content', currentFile);
            updateTitle(`${currentFile} - Notepad`);
        }
    });
}
