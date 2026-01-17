// This runs when the background script sends the "LAUNCH" signal
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "LAUNCH_JUMPSCARE") {
        showMeowPopup();
    }
});

function getRandomVariant(baseName, count) {
    // Returns random variant: baseName_1.png or baseName_2.png
    const variant = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * count) + 1;
    return `assets/${baseName}${variant}.png`;
}

function showMeowPopup() {
    // 1. Generate a cryptographically random target number of 'w's (1-10)
    const targetWs = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * 10) + 1;
    console.log("DEBUG: The magic number of w's is:", targetWs);
    
    // 2. Create the HTML Overlay (The "Jumpscare" div)
    const overlay = document.createElement('div');
    overlay.id = "meow-overlay";
    
    // Random jumpscare variant (1 or 2)
    const jumpscareImage = getRandomVariant('jumpscare', 2);
    
    overlay.innerHTML = `
        <div class="meow-content">
            <h1>IT'S MEOW OR NEVER!! hehehehe</h1>
            <img id="cat-display" src="${chrome.runtime.getURL(jumpscareImage)}" />
            <p id="feedback-text">Guess the correct number of 'w's in "meow" to escape!</p>
            <input type="text" id="meow-input" placeholder="Type meow here...">
            <button id="submit-meow">Submit</button>
            <div class="attempts-counter">Attempts: <span id="attempt-count">0</span></div>
        </div>
    `;
    document.body.appendChild(overlay);

    let attempts = 0;
    let isTricked = false; // Track if user is in "tricked" state

    // 3. The Logic Handler
    const submitButton = document.getElementById('submit-meow');
    const inputField = document.getElementById('meow-input');
    
    const handleSubmit = () => {
        const input = inputField.value.toLowerCase();
        const imgElement = document.getElementById('cat-display');
        const feedbackText = document.getElementById('feedback-text');
        
        // Special case: If they're tricked and click submit again
        if (isTricked) {
            // Reset to jumpscare state
            const jumpscareImage = getRandomVariant('jumpscare', 2);
            imgElement.src = chrome.runtime.getURL(jumpscareImage);
            feedbackText.textContent = "HAHA! Tricked you! Now try again! 😹";
            feedbackText.style.color = "#e94560";
            isTricked = false;
            inputField.value = '';
            inputField.focus();
            return;
        }
        
        attempts++;
        document.getElementById('attempt-count').textContent = attempts;
        
        // Check if input contains 'meow' pattern (m, e, o, then w's)
        const meowPattern = /^me+o+w*$/;
        const isValidMeow = meowPattern.test(input);

        if (!isValidMeow || !input.includes('m') || !input.includes('e') || !input.includes('o')) {
            // Wrong spelling - show random confused cat (1 or 2)
            const confusedImage = getRandomVariant('confused', 2);
            imgElement.src = chrome.runtime.getURL(confusedImage);
            feedbackText.textContent = "That's not even a meow! Try spelling it correctly... 🤔";
            feedbackText.style.color = "#ffa500";
            inputField.value = '';
            inputField.focus();
            return;
        }
        
        // Count the 'w's
        const userWs = (input.match(/w/g) || []).length;
        const distance = Math.abs(userWs - targetWs);


        if (distance === 0) {
            // Perfect! Random happy cat (1 or 2)
            const happyImage = getRandomVariant('happy', 2);
            imgElement.src = chrome.runtime.getURL(happyImage);
            feedbackText.textContent = `Perfect! You're free! 🎉 (${attempts} attempts)`;
            feedbackText.style.color = "#4ecca3";
            submitButton.disabled = true;
            inputField.disabled = true;
            setTimeout(() => overlay.remove(), 2000);
        } else if (distance === 10) {
            // Exactly 10 off - TRICKED!
            imgElement.src = chrome.runtime.getURL('assets/tricked1.png');
            feedbackText.textContent = "🎊 PERFECT! You won! Click Submit to claim your freedom! 🎊";
            feedbackText.style.color = "#4ecca3";
            isTricked = true;
            inputField.value = '';
            inputField.focus();
        } else if (distance === 6 || distance === 7) {
            // Special case: 6 or 7 off - six_seven cat
            imgElement.src = chrome.runtime.getURL('assets/six_seven.png');
            feedbackText.textContent = `Ouch! That's a special kind of wrong 🙀`;
            feedbackText.style.color = "#ff6b9d";
        } else if (distance <= 2) {
            // Close! Random neutral cat (1 or 2)
            const neutralImage = getRandomVariant('neutral', 2);
            imgElement.src = chrome.runtime.getURL(neutralImage);
            feedbackText.textContent = `Cat is not satisfied`;
            feedbackText.style.color = "#ffd93d";
        } else if (distance <= 5) {
            // Somewhat off (3-5) - Random depressed cat (1 or 2)
            const depressedImage = getRandomVariant('depressed', 2);
            imgElement.src = chrome.runtime.getURL(depressedImage);
            feedbackText.textContent = `Cat is feeling distant :(`;
            feedbackText.style.color = "#b983ff";
        } else {
            // Very off (8, 9) - Random sad cat (1 or 2)
            const sadImage = getRandomVariant('sad', 2);
            imgElement.src = chrome.runtime.getURL(sadImage);
            feedbackText.textContent = `Cat gna go cry in a corner`;
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

// Uncomment for testing
showMeowPopup();
