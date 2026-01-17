const MIN_INTERVAL_MINUTES = 0.1; // 6 seconds for testing

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
  // Simple fixed timer for testing, or use random math for real pranks
  chrome.alarms.create("jumpscare_timer", {
    delayInMinutes: MIN_INTERVAL_MINUTES
  });
}

function triggerJumpscare() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    const activeTab = tabs[0];
    
    // Safety check: Don't run on chrome:// settings pages
    if (activeTab.url && !activeTab.url.startsWith('chrome://')) {
      chrome.tabs.sendMessage(activeTab.id, { action: "LAUNCH_JUMPSCARE" })
        .catch(() => { /* Tab wasn't ready, ignore */ });
    }
  });
}