const MIN_INTERVAL_MINUTES = 0.1; // Currently set to 6 seconds for testing!
const MAX_INTERVAL_MINUTES = 1;   // Change these to higher numbers (e.g., 10, 60) for real use.

chrome.runtime.onInstalled.addListener(() => {
  console.log("Meow-ware installed. The clock is ticking...");
  scheduleNextJumpscare();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "jumpscare_timer") {
    triggerJumpscare();
    scheduleNextJumpscare();
  }
});

function scheduleNextJumpscare() {
  const delayMinutes = Math.random() * (MAX_INTERVAL_MINUTES - MIN_INTERVAL_MINUTES) + MIN_INTERVAL_MINUTES;
  console.log(`Next meow scheduled in ${delayMinutes.toFixed(2)} minutes.`);
  
  chrome.alarms.create("jumpscare_timer", {
    delayInMinutes: delayMinutes
  });
}

function triggerJumpscare() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    const activeTab = tabs[0];
    if (activeTab.url && !activeTab.url.startsWith('chrome://')) {
      chrome.tabs.sendMessage(activeTab.id, { action: "LAUNCH_JUMPSCARE" })
        .catch(err => console.log("Tab wasn't ready:", err));
    }
  });
}