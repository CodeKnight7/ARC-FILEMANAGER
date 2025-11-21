// DOM Elements
const fileUploadInput = document.getElementById('file-upload');
const fileList = document.getElementById('file-list');
const searchInput = document.getElementById('search');
const storageUsedElement = document.getElementById('storage-used');

// Array to store uploaded files
let files = [];

// Event listener for drag-and-drop upload
document.body.addEventListener('dragover', function (event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
});

document.body.addEventListener('drop', function (event) {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    handleFileUpload(droppedFiles);
});

// Function to trigger file upload input
function triggerFileUpload() {
    fileUploadInput.click();
}

// Event listener for file upload
fileUploadInput.addEventListener('change', function (event) {
    const uploadedFiles = Array.from(event.target.files);
    handleFileUpload(uploadedFiles);
});

// Function to handle file upload
function handleFileUpload(uploadedFiles) {
    // Show loading overlay
    document.body.classList.add('uploading');

    uploadedFiles.forEach(file => {
        files.push({
            id: Date.now() + Math.random(), // Unique ID for each file
            name: file.name,
            size: file.size,
            file: file,
            pinned: false, // New feature: pinning
            shared: false, // New feature: sharing
            folder: 'default' // New feature: folder structure
        });
    });

    // Sort and render the updated file list
    sortFiles();
    renderFileList();

    // Update the storage used
    updateStorageUsed();

    // Trigger upload animation
    triggerUploadAnimation();
}

// Function to trigger upload animation
function triggerUploadAnimation() {
    const uploadMessage = document.createElement('div');
    uploadMessage.className = 'upload-message';
    uploadMessage.textContent = 'Files uploaded successfully!';
    document.body.appendChild(uploadMessage);

    setTimeout(() => {
        uploadMessage.classList.add('fade-out');
        setTimeout(() => {
            uploadMessage.remove();
            // Hide loading overlay after message fades out
            document.body.classList.remove('uploading');
        }, 1000);
    }, 2000);
}

// Function to render the file list
function renderFileList() {
    fileList.innerHTML = ''; // Clear the existing list

    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        fileItem.dataset.id = file.id; // Use dataset to store the file ID

        fileItem.innerHTML = `
            <div class="file-info">
                <p class="file-name" contenteditable="false" onblur="saveFileName(${file.id}, this)">${file.name}</p>
                <p class="file-meta">Size: ${formatFileSize(file.size)}</p>
            </div>
            <div class="file-actions">
                <button onclick="openFile(${file.id})">Open</button>
                <button onclick="copyFile(${file.id})">Copy</button>
                <button onclick="enableRename(${file.id})">Rename</button>
                <button onclick="downloadFile(${file.id})">Download</button>
                <button onclick="deleteFile(${file.id})">Delete</button>
                <button onclick="togglePinFile(${file.id})">${file.pinned ? 'Unpin' : 'Pin'}</button>
                <button onclick="toggleShareFile(${file.id})">${file.shared ? 'Unshare' : 'Share'}</button>
            </div>
        `;

        fileList.appendChild(fileItem);
    });
}

// Function to format file size (in bytes)
function formatFileSize(size) {
    const kb = size / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;
    const tb = gb / 1024;

    if (tb > 1) {
        return `${tb.toFixed(2)} TB`;
    } else if (gb > 1) {
        return `${gb.toFixed(2)} GB`;
    } else if (mb > 1) {
        return `${mb.toFixed(2)} MB`;
    } else {
        return `${kb.toFixed(2)} KB`;
    }
}

// Function to open a file
function openFile(fileId) {
    const file = files.find(f => f.id === fileId);
    if (file) {
        const fileURL = URL.createObjectURL(file.file);
        window.open(fileURL, '_blank');
    }
}

// Function to copy a file
function copyFile(fileId) {
    const file = files.find(f => f.id === fileId);
    if (file) {
        const copiedFile = { ...file, id: Date.now() + Math.random() };
        files.push(copiedFile);
        sortFiles();
        renderFileList();
        updateStorageUsed();
    }
}

// Function to enable renaming a file
function enableRename(fileId) {
    const fileItem = document.querySelector(`.file-item[data-id="${fileId}"] .file-name`);
    if (fileItem) {
        fileItem.contentEditable = true;
        fileItem.focus();
        fileItem.onkeydown = function (event) {
            if (event.key === "Enter") {
                event.preventDefault(); // Prevent line break
                fileItem.blur();
            }
        };
    }
}

// Function to save the renamed file name
function saveFileName(fileId, element) {
    const file = files.find(f => f.id === fileId);
    if (file && element.textContent.trim()) {
        file.name = element.textContent.trim();
    }
    element.contentEditable = false;
    sortFiles();
    renderFileList();
}

// Function to download a file
function downloadFile(fileId) {
    const file = files.find(f => f.id === fileId);
    if (file) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file.file);
        a.download = file.name;
        a.click();
    }
}

// Function to delete a file
function deleteFile(fileId) {
    files = files.filter(f => f.id !== fileId);
    renderFileList();
    updateStorageUsed();
}

// Function to toggle pinning of a file
function togglePinFile(fileId) {
    const file = files.find(f => f.id === fileId);
    if (file) {
        file.pinned = !file.pinned;
        sortFiles();
        renderFileList();
    }
}

// Function to toggle file sharing
function toggleShareFile(fileId) {
    const file = files.find(f => f.id === fileId);
    if (file) {
        file.shared = !file.shared;
        alert(`${file.name} is now ${file.shared ? 'shared' : 'unshared'}.`);
        // Add share link logic here (e.g., generate and copy a shareable link)
    }
}

// Function to sort files (Pinned files first)
function sortFiles() {
    files.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return a.name.localeCompare(b.name);
    });
}

// Function to update the storage used
function updateStorageUsed() {
    const totalSize = files.reduce((total, file) => total + file.size, 0);
    storageUsedElement.textContent = `${formatFileSize(totalSize)}`;
}

// Search functionality
searchInput.addEventListener('input', function (event) {
    const searchTerm = event.target.value.toLowerCase();
    document.querySelectorAll('.file-item').forEach(item => {
        const fileName = item.querySelector('.file-name').innerText.toLowerCase();
        item.style.display = fileName.includes(searchTerm) ? 'flex' : 'none';
    });
});
// Function to share a file (works for both web and mobile)
async function shareFile(fileId) {
    const file = files.find(f => f.id === fileId);
    if (file) {
        try {
            // Check if Web Share API is supported and can share files
            if (navigator.canShare && navigator.canShare({ files: [file.file] })) {
                await navigator.share({
                    files: [file.file],
                    title: 'Share File',
                    text: `Check out this file: ${file.name}`,
                });
                console.log('File shared successfully');
            } else {
                // Fallback for web: Provide download link and instructions
                const shareOptions = document.createElement('div');
                shareOptions.className = 'share-options';
                shareOptions.innerHTML = `
                    <p>Sharing is not supported on this device. You can download the file and share it manually:</p>
                    <a href="${URL.createObjectURL(file.file)}" download="${file.name}" class="download-link">Download ${file.name}</a>
                    <p>After downloading, you can manually share the file using email or other platforms.</p>
                `;
                document.body.appendChild(shareOptions);

                // Automatically remove the share options after 10 seconds
                setTimeout(() => {
                    shareOptions.remove();
                }, 10000);
            }
        } catch (error) {
            console.error('Error sharing file:', error);
        }
    }
}

// Updated renderFileList function to include Share button
function renderFileList() {
    fileList.innerHTML = ''; // Clear the existing list

    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        fileItem.dataset.id = file.id; // Use dataset to store the file ID

        fileItem.innerHTML = `
            <div class="file-info">
                <p class="file-name" contenteditable="false" onblur="saveFileName(${file.id}, this)">${file.name}</p>
                <p class="file-meta">Size: ${formatFileSize(file.size)}</p>
            </div>
            <div class="file-actions">
                <button onclick="copyFile(${file.id})">Duplicate</button>
                <button onclick="enableRename(${file.id})">Rename</button>
                <button onclick="downloadFile(${file.id})">Download</button>
                <button onclick="deleteFile(${file.id})">Delete</button>
                <button onclick="togglePinFile(${file.id})">${file.pinned ? 'Unpin' : 'Pin'}</button>
            </div>
        `;

        fileList.appendChild(fileItem);
    });
}
