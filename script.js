// Smooth scroll to the project section with glow and advanced animation effects
function scrollToProject() {
    const projectSection = document.getElementById('project');
    projectSection.classList.add('active');

    // Smooth scroll to the project section
    window.scroll({
        top: projectSection.offsetTop - 50,  // Adjust for fixed navbar
        behavior: 'smooth'
    });
}

// Add smooth transitions between sections
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Activate the target section with a smooth animation
    document.getElementById(sectionId).classList.add('active');
}

// Initial display
document.addEventListener('DOMContentLoaded', () => {
    showSection('home');
});
function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'block';
}

function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

function getVideoDetails() {
    const youtubeLink = document.getElementById('youtube-link').value;
    if (!youtubeLink) {
        alert("Please enter a YouTube video link.");
        return;
    }

    showLoadingSpinner(); // Show spinner while fetching transcript

    const videoIdMatch = youtubeLink.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    if (!videoId) {
        alert("Invalid YouTube URL");
        hideLoadingSpinner(); // Hide spinner if an error occurs
        return;
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    document.getElementById('thumbnail-display').innerHTML = `<img src="${thumbnailUrl}" alt="Video Thumbnail" width="300" height="200">`;

    fetch(`http://127.0.0.1:5001/transcript?url=${encodeURIComponent(youtubeLink)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                document.getElementById('transcript-text').value = data.transcript;
            }
            hideLoadingSpinner(); // Hide spinner after fetching transcript
        })
        .catch(error => {
            console.error('Error fetching transcript:', error);
            hideLoadingSpinner(); // Hide spinner if an error occurs
        });
}
function getSummary() {
    const transcriptText = document.getElementById('transcript-text').value;
    if (!transcriptText) {
        alert("Please fetch the transcript first.");
        return;
    }

    // Show the summary loading spinner
    document.getElementById('loading-summary-spinner').style.display = 'block';

    fetch('http://127.0.0.1:5001/summary', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            transcript: transcriptText,
            prompt: "Summarize the transcript in a structured format with numbered points, subheadings, and bullet points."
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            const summaryOutput = data.summary;
            let formattedSummary = summaryOutput
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/(?:\r\n|\r|\n)/g, '<br>')
                .replace(/^(\d+)\./gm, '<h3>$1.</h3>')
                .replace(/^- /gm, '<ul><li>')
                .replace(/<\/li><br>/g, '</li>')
                .replace(/<\/li>\s*<\/ul>/g, '</li></ul>');
            document.getElementById('summary-output').innerHTML = `<h2>Summary:</h2>${formattedSummary}`;
        }
        // Hide the summary loading spinner
        document.getElementById('loading-summary-spinner').style.display = 'none';
    })
    .catch(error => {
        console.error('Error generating summary:', error);
        // Hide the summary loading spinner if an error occurs
        document.getElementById('loading-summary-spinner').style.display = 'none';
    });
}

