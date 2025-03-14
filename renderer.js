const { ipcRenderer } = require('electron');
const fs = require('fs');

const editor = document.getElementById('editor');
const findInput = document.getElementById('findInput');
const replaceInput = document.getElementById('replaceInput');
const wordCountElement = document.getElementById('wordCount');
const markdownPreview = document.getElementById('markdownPreview');

ipcRenderer.on('clear-content', () => {
    editor.value = '';
    updateWordCount();
});

ipcRenderer.on('file-opened', (event, data) => {
    editor.value = data;
    updateWordCount();
});

ipcRenderer.on('save-content', (event, filePath) => {
    fs.writeFile(filePath, editor.value, (err) => {
        if (err) alert('Error saving file');
    });
});

ipcRenderer.on('toggle-theme', () => {
    document.body.classList.toggle('dark-mode');
});

ipcRenderer.on('toggle-find', () => {
    findInput.focus();
});

ipcRenderer.on('toggle-replace', () => {
    replaceInput.focus();
});

ipcRenderer.on('toggle-markdown', () => {
    if (markdownPreview.style.display === 'block') {
        markdownPreview.style.display = 'none';
        editor.style.display = 'block';
    } else {
        markdownPreview.style.display = 'block';
        editor.style.display = 'none';
        renderMarkdown();
    }
});

editor.addEventListener('input', updateWordCount);

function updateWordCount() {
    const text = editor.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    wordCountElement.textContent = words;
}

function replaceText() {
    const findText = findInput.value;
    const replaceText = replaceInput.value;
    editor.value = editor.value.replaceAll(findText, replaceText);
    updateWordCount();
}

function renderMarkdown() {
    const markdown = editor.value;
    markdownPreview.innerHTML = markdown.replace(/\n/g, '<br>'); // Basic Markdown rendering
}
