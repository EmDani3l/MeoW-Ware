// background.js
const MIN_INTERVAL_MINUTES = 0.5; // Prank runs every 30 seconds (Change to 10 for real use)

chrome.runtime.onInstalled.addListener(() => {
  console.log("Meow-ware installed.");
  scheduleNextJumpscare();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "jumpscare_timer") {
    triggerJumpscare();
    scheduleNextJumpscare();
  }
});

function scheduleNextJumpscare() {
  chrome.alarms.create("jumpscare_timer", {
    delayInMinutes: MIN_INTERVAL_MINUTES
  });
}

function triggerJumpscare() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    const activeTab = tabs[0];
    if (activeTab.url && !activeTab.url.startsWith('chrome://')) {
      chrome.tabs.sendMessage(activeTab.id, { action: "LAUNCH_JUMPSCARE" })
        .catch(() => { /* Tab not ready */ });
    }
  });
}