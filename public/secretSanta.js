//function to upload the csv files
async function uploadCSV() {
    const currentFile = document.getElementById("currentFile").files[0];
    const previousFile = document.getElementById("previousFile").files[0];
    const message = document.getElementById("message");

    if (!currentFile || !previousFile) {
        message.innerText = "Please upload both CSV files.";
        return;
    }

    const formData = new FormData();
    formData.append("currentFile", currentFile);
    formData.append("previousFile", previousFile);

    try {
        const response = await fetch("http://localhost:3000/api/upload", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        message.innerText = data.message;
    } catch (error) {
        console.error("Error uploading files:", error);
        message.innerText = "Failed to process files. Please try again.";
    }
}


//function to download the csv file
function downloadCSV() {
    const currentFile = document.getElementById("currentFile").files[0];
    const previousFile = document.getElementById("previousFile").files[0];

    if (!currentFile || !previousFile) {
        $.notify()
        alert("Both CSV files are required before downloading.");
        return;
    }

    window.location.href = "http://localhost:3000/api/download";
}
