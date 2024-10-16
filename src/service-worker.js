// background.js

setTimeout(() => {
  console.log("Medispeak Background Script is running");
}, 1000);

let mediaRecorder;
let recordedChunks = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.command) {
    case "medispeak.startTabRecording":
      chrome.tabs.create({ url: `tab.html?pageId=${request.data}`, pinned: true, active: false });
      break;
    case "medispeak.playerControls":
      // Forward the request to the Tab that was created
      chrome.tabs.query({ active: false }, (tabs) => {
        chrome.tabs.query({}, (tabs) => {
          const recordingTab = tabs.find(
            (tab) => tab.id === request.recordingTabId
          );
          chrome.tabs.sendMessage(recordingTab.id, request, (response) => {
            console.log("Tab Response", response);
          });
        });
      });
      break;
    default:
      console.log("Service Worker Skipping ", request.command, request);
      // Forward the Request to the Content Script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const requestWithTabId = {
          ...request,
          recordingTabId: sender.tab.id,
          from: "service-worker",
        };
        chrome.tabs.sendMessage(tabs[0].id, requestWithTabId, (response) => {
          console.log("ContentScript Response", response);
        });
      });
      break;
  }
});
