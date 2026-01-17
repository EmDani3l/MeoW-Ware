// This runs when the background script sends the "LAUNCH" signal
/*chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "LAUNCH_JUMPSCARE") {
        showMeowPopup();
    }
});
*/
function showMeowPopup() {
    // 1. Generate a cryptographically random target number of 'w's (1-10)
    const targetWs = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * 10) + 1;
    console.log("DEBUG: The magic number of w's is:", targetWs);
    
    // 2. Create the HTML Overlay (The "Jumpscare" div)
    const overlay = document.createElement('div');
    overlay.id = "meow-overlay";
    overlay.innerHTML = `
        <div class="meow-content">
            <h1>IT'S MEOW OR NEVER!! hehehehe</h1>
            <img id="cat-display" src="${chrome.runtime.getURL('assets/jumpscare_cat.png')}" />
            <p id="feedback-text">Guess the correct number of 'w's in "meow" to escape!</p>
            <input type="text" id="meow-input" placeholder="Type meow here...">
            <button id="submit-meow">Submit</button>
            <div class="attempts-counter">Attempts: <span id="attempt-count">0</span></div>
        </div>
    `;
    document.body.appendChild(overlay);

    let attempts = 0;

    // 3. The Logic Handler
    const submitButton = document.getElementById('submit-meow');
    const inputField = document.getElementById('meow-input');
    
    const handleSubmit = () => {
        const input = inputField.value.toLowerCase();
        attempts++;
        document.getElementById('attempt-count').textContent = attempts;
        
        // Check if input contains 'meow' pattern (m, e, o, then w's)
        const meowPattern = /^me+o+w*$/;
        const isValidMeow = meowPattern.test(input);
        
        const imgElement = document.getElementById('cat-display');
        const feedbackText = document.getElementById('feedback-text');

        if (!isValidMeow || !input.includes('m') || !input.includes('e') || !input.includes('o')) {
            // Wrong spelling - show dog
            imgElement.src = chrome.runtime.getURL('assets/confused_dog.png');
            feedbackText.textContent = "That's not even a meow! The dog is judging you... 🐕";
            feedbackText.style.color = "#ffa500";
            inputField.value = '';
            inputField.focus();
            return;
        }
        
        // Count the 'w's
        const userWs = (input.match(/w/g) || []).length;
        const distance = Math.abs(userWs - targetWs);

        if (distance === 0) {
            imgElement.src = chrome.runtime.getURL('assets/happy_cat.png');
            feedbackText.textContent = `Perfect! You're free! 🎉 (${attempts} attempts)`;
            feedbackText.style.color = "#4ecca3";
            submitButton.disabled = true;
            inputField.disabled = true;
            setTimeout(() => overlay.remove(), 2000);
        } else if (distance === 1) {
            imgElement.src = chrome.runtime.getURL('assets/very_close_cat.png');
            feedbackText.textContent = "SO CLOSE! You're one 'w' away! 🔥";
            feedbackText.style.color = "#ffd93d";
        } else if (distance <= 3) {
            imgElement.src = chrome.runtime.getURL('assets/neutral_cat.png');
            feedbackText.textContent = `Getting warmer... off by ${distance} 'w's 😺`;
            feedbackText.style.color = "#ff6b9d";
        } else if (distance <= 5) {
            imgElement.src = chrome.runtime.getURL('assets/confused_cat.png');
            feedbackText.textContent = `Not quite... off by ${distance} 'w's 🤔`;
            feedbackText.style.color = "#b983ff";
        } else {
            imgElement.src = chrome.runtime.getURL('assets/sad_cat.png');
            feedbackText.textContent = `Way off! Off by ${distance} 'w's 😿`;
            feedbackText.style.color = "#e94560";
        }
        
        inputField.value = '';
        inputField.focus();
    };
    
    submitButton.onclick = handleSubmit;
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    });
    
    // Auto-focus the input
    inputField.focus();
}
showMeowPopup()