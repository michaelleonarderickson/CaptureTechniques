// Handles camera initialization and photo capture
document.getElementById('startButton').addEventListener('click', startCapture);
document.getElementById('stopButton').addEventListener('click', stopCapture);
document.getElementById('downloadButton').addEventListener('click', zipAndDownloadPhotos);

// Global variables
let captureInterval;
const video = document.getElementById('video');
let photos = []; // Array to hold the photo blobs and filenames

// Visual feedback elements
const feedbackElement = document.getElementById('feedback');
const photoCountElement = document.getElementById('photoCount');
const photoTimestampsElement = document.getElementById('photoTimestamps');

function startCapture() {
    if (navigator.mediaDevices.getUserMedia) {
        // Requesting 4K resolution
        navigator.mediaDevices.getUserMedia({ video: { width: 3840, height: 2160 } })
            .then(function(stream) {
                video.srcObject = stream;
                video.onloadedmetadata = function(e) {
                    setTimeout(takePhoto, 600); // Delay before taking the first photo
                };
                captureInterval = setInterval(takePhoto, 30000); // Continue taking photos every 30 seconds
                document.getElementById('downloadButton').style.display = 'none';
                feedbackElement.style.display = 'block';
                updatePhotoCountAndTimestamps(); // Initial update for photo count and timestamps
            })
            .catch(function(error) {
                console.error("Error accessing the camera", error);
            });
    } else {
        alert("Sorry, your browser does not support accessing the camera.");
    }
}

function stopCapture() {
    clearInterval(captureInterval);
    const stream = video.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach(track => track.stop());

    video.srcObject = null;
    document.getElementById('downloadButton').style.display = 'inline-block';
    feedbackElement.style.display = 'none';
}

function takePhoto() {
    const canvas = document.createElement('canvas');
    // Adjust canvas size to 4K resolution
    canvas.width = 3840;
    canvas.height = 2160;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
        const timestamp = new Date().toISOString().replace(/[-:.T]/g, '').slice(0, -3); // Adjusted slice to correct value
        const filename = `photo-${timestamp}.jpg`;
        photos.push({ blob, filename }); // Store the photo blob and filename
        updatePhotoCountAndTimestamps(); // Update photo count and list timestamp
    }, 'image/jpeg');
}

function updatePhotoCountAndTimestamps() {
    photoCountElement.textContent = `Photos Captured: ${photos.length}`; // Update photo count

    photoTimestampsElement.innerHTML = ''; // Clear existing timestamps

    // List timestamps for each photo
    photos.forEach(photo => {
        const listItem = document.createElement('li');
        listItem.textContent = `Captured: ${photo.filename.split('photo-')[1].split('.jpg')[0]}`;
        photoTimestampsElement.appendChild(listItem);
    });
}

function zipAndDownloadPhotos() {
    const zip = new JSZip();
    photos.forEach(photo => {
        zip.file(photo.filename, photo.blob);
    });

    zip.generateAsync({type:"blob"}).then(content => {
        saveAs(content, "photos.zip");
    });

    photos = []; // Clear the photos array after downloading
}