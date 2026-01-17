// This runs when the background script sends the "LAUNCH" signal
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "LAUNCH_JUMPSCARE") {
        showMeowPopup();
    }
});

function showMeowPopup() {
    // 1. Generate a random target number of 'w's (e.g., between 1 and 5)
    const targetWs = Math.floor(Math.random() * 4) + 1;
    console.log("DEBUG: The magic number of w's is:", targetWs);
    
    // 2. Create the HTML Overlay (The "Jumpscare" div)
    const overlay = document.createElement('div');
    overlay.id = "meow-overlay";
    overlay.innerHTML = `
        <div class="meow-content">
            <h1>IT'S MEOW OR NEVER!! hehehehe</h1>
            <img id="cat-display" src="${chrome.runtime.getURL('assets/jumpscare_cat.png')}" />
            <p>Guess the correct number of 'w's in "meow" to escape!</p>
            <input type="text" id="meow-input" placeholder="Type meow here...">
            <button id="submit-meow">Submit</button>
        </div>
    `;
    document.body.appendChild(overlay);

    // 3. The Logic Handler
    document.getElementById('submit-meow').onclick = () => {
        const input = document.getElementById('meow-input').value.toLowerCase();
        
        // Count the 'w's
        const userWs = (input.match(/w/g) || []).length;
        const distance = Math.abs(userWs - targetWs);
        const imgElement = document.getElementById('cat-display');

        if (distance === 0) {
            imgElement.src = chrome.runtime.getURL('assets/happy_cat.png');
            setTimeout(() => overlay.remove(), 1500); // Release them after 1.5s
        } else if (distance <= 3) {
            imgElement.src = chrome.runtime.getURL('assets/neutral_cat.png');
        } else {
            imgElement.src = chrome.runtime.getURL('assets/sad_cat.png');
        }
    };
}

showMeowPopup();