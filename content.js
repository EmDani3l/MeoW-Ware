chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "LAUNCH_JUMPSCARE") {
        showMeowPopup();
    }
});

function getRandomVariant(baseName, count) {
    const variant = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * count) + 1;
    return `assets/${baseName}${variant}.png`;
}

function showMeowPopup() {
    // 1. Generate Target
    const targetWs = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * 10) + 1;
    console.log("DEBUG: The magic number of w's is:", targetWs);
    
    // 2. Tab Title Hijack (Psychological Warfare)
    const originalTitle = document.title;
    let panicInterval;
    
    const startPanic = () => {
        const messages = [
            "⚠️ SYSTEM ERROR 404",
            "🐈 MEOW_OVERFLOW DETECTED",
            "Deleting System32...",
            "Don't look behind you...",
            "Uploading Browser History (99%)...",
            "Calculating Meow Trajectory...",
            "⚠️ VIRUS DETECTED: CAT.EXE"
        ];
        panicInterval = setInterval(() => {
            document.title = messages[Math.floor(Math.random() * messages.length)];
        }, 2000);
    };
    startPanic(); 

    // 3. Create Overlay
    const overlay = document.createElement('div');
    overlay.id = "meow-overlay";
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
    let isTricked = false;

    const submitButton = document.getElementById('submit-meow');
    const inputField = document.getElementById('meow-input');
    
    // 4. Sabotaged Input (Broken Backspace)
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            e.preventDefault(); 
            const start = inputField.selectionStart;
            const end = inputField.selectionEnd;
            const text = inputField.value;
            // Insert 'w' instead of deleting
            inputField.value = text.substring(0, start) + 'w' + text.substring(end);
            inputField.selectionStart = inputField.selectionEnd = start + 1;
        }
    });

    // 5. Shake Animation Trigger
    const triggerShake = () => {
        inputField.classList.add('shake-animation');
        setTimeout(() => inputField.classList.remove('shake-animation'), 500);
    };
    
    // 6. Game Logic
    const handleSubmit = () => {
        const input = inputField.value.toLowerCase();
        const imgElement = document.getElementById('cat-display');
        const feedbackText = document.getElementById('feedback-text');
        
        // Handle Tricked State
        if (isTricked) {
            const jumpscareImage = getRandomVariant('jumpscare', 2);
            imgElement.src = chrome.runtime.getURL(jumpscareImage);
            feedbackText.textContent = "HAHA! Tricked you! Now try again! 😹";
            feedbackText.style.color = "#e94560";
            isTricked = false;
            inputField.value = '';
            inputField.focus();
            triggerShake();
            return;
        }
        
        attempts++;
        document.getElementById('attempt-count').textContent = attempts;
        
        // Validate Spelling
        const meowPattern = /^me+o+w*$/;
        if (!meowPattern.test(input) || !input.includes('m') || !input.includes('e') || !input.includes('o')) {
            const confusedImage = getRandomVariant('confused', 2);
            imgElement.src = chrome.runtime.getURL(confusedImage);
            feedbackText.textContent = "That's not even a meow! Try spelling it correctly... 🤔";
            feedbackText.style.color = "#ffa500";
            inputField.value = '';
            inputField.focus();
            triggerShake(); 
            return;
        }
        
        const userWs = (input.match(/w/g) || []).length;
        const distance = Math.abs(userWs - targetWs);

        if (distance === 0) {
            // WINNER
            clearInterval(panicInterval); // Stop panic
            document.title = originalTitle; // Restore title
            
            const happyImage = getRandomVariant('happy', 2);
            imgElement.src = chrome.runtime.getURL(happyImage);
            feedbackText.textContent = `Perfect! You're free! 🎉 (${attempts} attempts)`;
            feedbackText.style.color = "#4ecca3";
            submitButton.disabled = true;
            inputField.disabled = true;
            setTimeout(() => overlay.remove(), 2000);
        } else {
            // LOSER
            triggerShake();
            
            if (distance === 10) {
                // The Trap
                imgElement.src = chrome.runtime.getURL('assets/tricked1.png');
                feedbackText.textContent = "🎊 PERFECT! You won! Click Submit to claim your freedom! 🎊";
                feedbackText.style.color = "#4ecca3";
                isTricked = true;
            } else if (distance === 6 || distance === 7) {
                imgElement.src = chrome.runtime.getURL('assets/six_seven.png');
                feedbackText.textContent = `Ouch! That's a special kind of wrong 🙀`;
                feedbackText.style.color = "#ff6b9d";
            } else if (distance <= 2) {
                const neutralImage = getRandomVariant('neutral', 2);
                imgElement.src = chrome.runtime.getURL(neutralImage);
                feedbackText.textContent = `Cat is not satisfied`;
                feedbackText.style.color = "#ffd93d";
            } else if (distance <= 5) {
                const depressedImage = getRandomVariant('depressed', 2);
                imgElement.src = chrome.runtime.getURL(depressedImage);
                feedbackText.textContent = `Cat is feeling distant :(`;
                feedbackText.style.color = "#b983ff";
            } else {
                const sadImage = getRandomVariant('sad', 2);
                imgElement.src = chrome.runtime.getURL(sadImage);
                feedbackText.textContent = `Cat gna go cry in a corner`;
                feedbackText.style.color = "#e94560";
            }
            inputField.value = '';
            inputField.focus();
        }
    };
    
    submitButton.onclick = handleSubmit;
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSubmit();
    });
    
    inputField.focus();
}

// Uncomment for immediate testing without waiting for background timer
// showMeowPopup();