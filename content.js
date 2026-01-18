// Listen for the background script trigger
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "LAUNCH_JUMPSCARE") {
        showMeowPopup(0); // Start fresh with 0 attempts
    }
});

function getRandomVariant(baseName, count) {
    const variant = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * count) + 1;
    return `assets/${baseName}${variant}.png`;
}

// 1. UPDATED: Accepts incomingAttempts to preserve count after Boss Battle
function showMeowPopup(incomingAttempts = 0) {
    const targetWs = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * 10) + 1;
    console.log("DEBUG: The magic number of w's is:", targetWs);
    
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
            <div class="attempts-counter">Attempts: <span id="attempt-count">${incomingAttempts}</span></div>
        </div>
    `;
    document.body.appendChild(overlay);

    let attempts = incomingAttempts; // Resume from where we left off
    let isTricked = false;

    const submitButton = document.getElementById('submit-meow');
    const inputField = document.getElementById('meow-input');
    
    // 💀 1. SABOTAGED INPUT (BROKEN BACKSPACE) 💀
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

    // 💀 2. SHAKE HELPER 💀
    const triggerShake = () => {
        inputField.classList.add('shake-animation');
        setTimeout(() => inputField.classList.remove('shake-animation'), 500);
    };
    
    const handleSubmit = () => {
        const input = inputField.value.toLowerCase();
        const imgElement = document.getElementById('cat-display');
        const feedbackText = document.getElementById('feedback-text');
        
        if (isTricked) {
            const jumpscareImage = getRandomVariant('jumpscare', 2);
            imgElement.src = chrome.runtime.getURL(jumpscareImage);
            feedbackText.textContent = "HAHA! Tricked you! Now try again! 😹";
            feedbackText.style.color = "#e94560";
            isTricked = false;
            inputField.value = '';
            inputField.focus();
            triggerShake(); // Shake on trick reveal
            return;
        }
        
        attempts++;
        document.getElementById('attempt-count').textContent = attempts;
        
        const meowPattern = /^me+o+w*$/;
        const isValidMeow = meowPattern.test(input);

        if (!isValidMeow || !input.includes('m') || !input.includes('e') || !input.includes('o')) {
            const confusedImage = getRandomVariant('confused', 2);
            imgElement.src = chrome.runtime.getURL(confusedImage);
            feedbackText.textContent = "That's not even a meow! Try spelling it correctly... 🤔";
            feedbackText.style.color = "#ffa500";
            inputField.value = '';
            inputField.focus();
            triggerShake(); // Shake on bad spelling
            return;
        }
        
        const userWs = (input.match(/w/g) || []).length;
        const distance = Math.abs(userWs - targetWs);

        if (distance === 0) {
            // --- VICTORY ---
            const happyImage = getRandomVariant('happy', 2);
            imgElement.src = chrome.runtime.getURL(happyImage);
            feedbackText.textContent = `Perfect! You're free! 🎉 (${attempts} attempts)`;
            feedbackText.style.color = "#4ecca3";
            submitButton.disabled = true;
            inputField.disabled = true;
            setTimeout(() => overlay.remove(), 2000);
        } else {
            // --- FAILURE ---
            triggerShake();

            // 💀 3. CHECK FOR BOSS BATTLE TRIGGER (ONLY ATTEMPT 4) 💀
            if (attempts === 4) {
                // Pass the overlay and current attempts to the Petting Game
                startPettingGame(overlay, attempts); 
                return; // Stop here, do not show other cat images
            }

            if (attempts === 10) {
                startExplodingKittens(overlay, attempts);
                return;
            }
            
            // Standard Feedback Logic
            if (distance === 10) {
                imgElement.src = chrome.runtime.getURL('assets/tricked1.png');
                feedbackText.textContent = "🎊 PERFECT! You won! Click Submit to claim your freedom! 🎊";
                feedbackText.style.color = "#4ecca3";
                isTricked = true;
                inputField.value = '';
                inputField.focus();
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

/**
 * 💀 4. THE PETTING BOSS BATTLE FUNCTION 💀
 * (Replaces content, handles game, then calls showMeowPopup to loop back)
 */
function startPettingGame(overlayContainer, currentAttempts) {
    // Assets (Make sure these match your filenames!)
    const bellyImage = chrome.runtime.getURL('assets/bellycat.png');
    const attackImage = chrome.runtime.getURL('assets/bite.png');
    const happyImage = chrome.runtime.getURL('assets/happy1.png');

    // Inject Petting UI
    overlayContainer.innerHTML = `
        <div class="meow-content" style="text-align:center; color: white;">
            <h1 style="color: #ff6b9d;">ATTEMPT 3 FAILED.</h1>
            <p>You must pay the toll. Pet the cat.</p>
            <p style="font-size: 0.8rem; opacity: 0.8;">(Keep it in the dashed zone for 2 seconds!)</p>
            
            <img id="pet-cat-img" src="${bellyImage}" 
                 style="width: 250px; height: 250px; object-fit: contain; cursor: grab; transition: transform 0.1s;">
            
            <div id="purr-wrapper" style="width: 80%; height: 30px; background: #333; border: 2px solid white; margin: 20px auto; position: relative; border-radius: 15px; overflow: hidden;">
                <div style="position: absolute; left: 80%; width: 19%; height: 100%; background: rgba(255,255,255,0.3); border-left: 2px dashed white; border-right: 2px dashed white;"></div>
                <div id="purr-bar" style="width: 0%; height: 100%; background: #4ecca3; transition: width 0.05s linear;"></div>
            </div>
            
            <h2 id="pet-timer" style="height: 30px; color: #4ecca3;"></h2>
        </div>
    `;

    // Selectors
    const catImg = document.getElementById('pet-cat-img');
    const bar = document.getElementById('purr-bar');
    const timerText = document.getElementById('pet-timer');
    const contentDiv = document.querySelector('.meow-content');

    // Game State
    let purrLevel = 0;
    let holdTime = 0;
    let isBiting = false;
    let gameLoop = null;

    // --- GAME LOGIC (BALANCED) ---
    catImg.addEventListener('mousemove', () => {
        if (isBiting) return;
        purrLevel += 0.8; // Sensitivity
        if (purrLevel > 105) purrLevel = 105;
        render();
    });

    gameLoop = setInterval(() => {
        if (isBiting) return;

        // Decay
        if (purrLevel > 0) purrLevel -= 0.5;
        if (purrLevel < 0) purrLevel = 0;

        // Rules
        if (purrLevel >= 100) {
            triggerBite();
        } else if (purrLevel >= 80 && purrLevel < 100) {
            holdTime += 50;
            const secondsLeft = (2.0 - (holdTime / 1000)).toFixed(1);
            timerText.innerText = `HOLD IT... ${secondsLeft}s`;
            
            if (holdTime >= 2000) {
                gameWon();
            }
        } else {
            holdTime = 0;
            timerText.innerText = "";
        }
        render();
    }, 50);

    function render() {
        bar.style.width = Math.min(purrLevel, 100) + '%';
        if (purrLevel > 90) bar.style.background = "#ff4757";
        else if (purrLevel > 80) bar.style.background = "#ffa502";
        else bar.style.background = "#4ecca3";
    }

    function triggerBite() {
        isBiting = true;
        catImg.src = attackImage;
        contentDiv.classList.add('shake-animation'); // Reuses your CSS class!
        timerText.innerText = "IT BIT YOU!";
        timerText.style.color = "red";

        setTimeout(() => {
            purrLevel = 0;
            holdTime = 0;
            isBiting = false;
            catImg.src = bellyImage;
            contentDiv.classList.remove('shake-animation');
            timerText.innerText = "";
            timerText.style.color = "#4ecca3";
            render();
        }, 1500);
    }

    // WIN: Go back to counting, but keep the attempt count!
    function gameWon() {
        clearInterval(gameLoop);
        
        overlayContainer.innerHTML = `
            <div class="meow-content" style="text-align:center;">
                <h1 style="color: #4ecca3;">CAT SATISFIED.</h1>
                <img src="${happyImage}" style="width:200px;">
                <p>Back to counting...</p>
            </div>
        `;

        setTimeout(() => {
            overlayContainer.remove();
            // RESTART Main Game, passing '3' as current attempts
            showMeowPopup(currentAttempts);
        }, 2000);
    }
}

/**
 * MINI-GAME: EXPLODING KITTENS (Attempt 10)
 * Now with 10 Unique Innocent Cats
 */
function startExplodingKittens(overlayContainer, currentAttempts) {
    // --- ASSETS ---
    const dynamiteCat = chrome.runtime.getURL('assets/dynamitecat.png'); 
    const explosionGif = chrome.runtime.getURL('assets/explosion.gif');
    const sikeCat = chrome.runtime.getURL('assets/sikecat.png');

    // 1. GENERATE THE 10 INNOCENT CAT URLS
    // This creates a list: [url_to_innocent1.png, url_to_innocent2.png, ...]
    const innocentCats = [];
    for (let i = 1; i <= 10; i++) {
        innocentCats.push(chrome.runtime.getURL(`assets/innocent${i}.png`));
    }

    // 2. SETUP THE GRID
    function renderGame() {
        const safeIndex = Math.floor(Math.random() * 10); 
        console.log("Debug: Safe Cat is #" + safeIndex + " (innocent" + (safeIndex+1) + ")");

        overlayContainer.innerHTML = `
            <div class="meow-content" style="max-width: 600px;">
                <h1 style="color: #ff6b9d;">EXPLODING KITTENS</h1>
                <p>Pick the safe cat. The others are rigged.</p>
                <div class="kitten-grid">
                    </div>
            </div>
        `;

        const grid = overlayContainer.querySelector('.kitten-grid');

        // Loop 0 to 9 to create the cards
        for (let i = 0; i < 10; i++) {
            const catItem = document.createElement('div');
            catItem.className = "kitten-card";
            
            // USE THE SPECIFIC CAT IMAGE FOR THIS SLOT
            // innocentCats[0] is innocent1.png, etc.
            catItem.innerHTML = `<img src="${innocentCats[i]}">`;
            
            catItem.onclick = () => {
                const isSafe = (i === safeIndex);
                runTensionLoading(overlayContainer, isSafe);
            };
            grid.appendChild(catItem);
        }
    }

    // 3. TENSION LOADING (5s Wait)
    function runTensionLoading(container, isSafe) {
        const taunts = [
            "Consulting the Council of Cats...",
            "Sniffing for fear...",
            "Calculating explosion probability...",
            "Judging your life choices...",
            "Did you really pick that one?",
            "Loading disappointment...",
            "Buffering destiny..."
        ];

        let secondsLeft = 5;
        
        container.innerHTML = `
            <div class="meow-content" style="text-align: center;">
                <div class="cat-spinner"></div>
                <h2 id="taunt-text" style="color: #ffd93d; margin-top: 20px;">Processing...</h2>
                <p style="font-size: 0.9rem; opacity: 0.7;">Please wait...</p>
            </div>
        `;

        const textElement = document.getElementById('taunt-text');

        const loadingInterval = setInterval(() => {
            secondsLeft--;
            const randomTaunt = taunts[Math.floor(Math.random() * taunts.length)];
            textElement.innerText = randomTaunt;

            if (secondsLeft <= 0) {
                clearInterval(loadingInterval);
                if (isSafe) {
                    runFakeSuccess(container); 
                } else {
                    triggerExplosionSequence(container);
                }
            }
        }, 1000);
    }

    // 4. FAKE SUCCESS -> SIKE -> PET GAME
    function runFakeSuccess(container) {
        container.innerHTML = `
            <div class="meow-content" style="text-align: center;">
                <h1 style="color: #4ecca3;">SAFE!</h1>
                <p>Bomb defused successfully.</p>
                <p>Bringing you back to your tab...</p>
                <div class="cat-spinner" style="border-top-color: #4ecca3;"></div> 
            </div>
        `;

        setTimeout(() => {
            container.innerHTML = `
                <div class="meow-content" style="text-align: center;">
                    <h1 style="color: #ff6b9d; font-size: 5rem; margin: 0;">SIKE!</h1>
                    <img src="${sikeCat}" style="width: 300px; height: 300px; object-fit:contain;">
                    <p style="font-size: 1.5rem; margin-top: 10px;">YOU THOUGHT??</p>
                </div>
            `;
            setTimeout(() => {
                startPettingGame(container, currentAttempts);
            }, 2000);
        }, 3000);
    }

    // 5. BOMB LOGIC
    function triggerExplosionSequence(container) {
        container.innerHTML = `
            <div class="meow-content" style="text-align: center;">
                <h1 style="color: red; font-size: 3rem;">RUN!</h1>
                <img src="${dynamiteCat}" style="width: 250px; height: 250px;">
                <p>IT WAS A BOMB!</p>
                <h2 id="bomb-timer" style="font-size: 4rem; color: yellow;">3</h2>
            </div>
        `;

        let timeLeft = 3;
        const timerElement = document.getElementById('bomb-timer');

        const countdown = setInterval(() => {
            timeLeft--;
            timerElement.innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(countdown);
                showExplosion(container);
            }
        }, 1000);
    }

    // 6. EXPLOSION & RESET
    function showExplosion(container) {
        container.innerHTML = `
            <div style="display:flex; justify-content:center; align-items:center; height:100vh; background:black; width:100%;">
                <img src="${explosionGif}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
        `;
        setTimeout(() => {
            renderGame(); // Restart with new random safe cat
        }, 1500);
    }

    renderGame();
}

showMeowPopup(0);
