import React, { useState } from "react";

// This is the Chrome Extension Popup
const Popup = () => {
  const [recording, setRecording] = useState(false);
  const [audioSource, setAudioSource] = useState("system");
  const [status, setStatus] = useState("Stopped");

  const handleRecording = () => {
    setRecording(!recording);
    setStatus(recording ? "Stopped" : "Recording...");
    chrome.runtime.sendMessage({
      command: recording ? "stopRecording" : "startRecording",
    });
  };

  const handleAudioSourceChange = (event) => {
    setAudioSource(event.target.value);
  };

  const handleSave = () => {
    // Implement save functionality
  };

  return (
    <div className="tw-container tw-mx-auto tw-p-4" style={{ width: "400px" }}>
      <div className="tw-flex tw-items-center tw-justify-between">
        <div
          className={`tw-bg-blue-500 hover:tw-bg-blue-700 tw-text-white tw-font-bold tw-py-2 tw-px-4 tw-rounded`}
          onClick={() =>
            chrome.tabs.create({ url: "tab.html", pinned: true, active: false })
          }
        >
          Open Tab for Permissions
        </div>
        <select
          value={audioSource}
          onChange={handleAudioSourceChange}
          className="tw-ml-4"
        >
          <option value="system">System Audio</option>
          <option value="microphone">Microphone</option>
          <option value="both">Both</option>
        </select>
      </div>
      <p className="tw-mt-4">Status: {status}</p>
      <div
        className="tw-bg-green-500 hover:tw-bg-green-700 tw-text-white tw-font-bold tw-py-2 tw-px-4 tw-rounded tw-mt-4"
        onClick={handleSave}
      >
        Save Recording
      </div>
      <div className="tw-mt-4">
        {/* Visual Feedback */}
        {recording ? (
          <div className="tw-h-2 tw-w-full tw-bg-green-500"></div>
        ) : (
          <div className="tw-h-2 tw-w-full tw-bg-red-500"></div>
        )}
      </div>
    </div>
  );
};

export default Popup;
