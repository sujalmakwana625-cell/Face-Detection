
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const output = document.getElementById("output");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

let stream = null;
let detectionTimer = null;
let busy = false;

startBtn.addEventListener("click", async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        video.srcObject = stream;
        startBtn.disabled = true;

        detectionTimer = setInterval(detectFace, 500);

    } catch (error) {
        alert("Camera access denied or unavailable!");
    }
});

async function detectFace() {
    if (!stream || busy || video.videoWidth === 0) return;

    busy = true;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
        if (!blob) {
            busy = false;
            return;
        }

        const formData = new FormData();
        formData.append("frame", blob, "frame.jpg");

        try {
            const response = await fetch("/detect", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.image) {
                output.src = "data:image/jpeg;base64," + data.image;
            }
        } catch (error) {
            console.log("Detection error:", error);
        }

        busy = false;
    }, "image/jpeg");
}

stopBtn.addEventListener("click", () => {
    clearInterval(detectionTimer);

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    video.srcObject = null;
    output.src = "";
    startBtn.disabled = false;
});