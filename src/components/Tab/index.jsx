import React, { useEffect } from "react";
import { MediSpeakIcon } from "../common/AppIcons";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { prepareRecording, uploadAudio } from "../../api/Api";

const dispatchTranscript = (transcript) => {
  console.log("Transcript Ready", transcript);
  chrome.runtime.sendMessage({
    command: "medispeak.transcriptReady",
    data: transcript,
  });
};

const MedispeakPage = () => {
  const checkPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone and System Audio permission granted");
      // Do something if permission is granted
    } catch (error) {
      console.log("Microphone and System Audio permission denied");
      // Do something if permission is denied
    }
  };

  const [events, setEvents] = React.useState([]);
  const [sessionToken, setSessionToken] = React.useState();

  const {
    startRecording,
    stopRecording,
    togglePauseResume,
    recordingBlob,
    isRecording,
    isPaused,
    recordingTime,
    mediaRecorder,
  } = useAudioRecorder();

  useEffect(() => {
    if (recordingBlob) {
      const data = {
        recordingBlob,
        recordingTime,
        isPaused,
        isRecording,
        recordingUri: URL.createObjectURL(recordingBlob),
      };
      console.log("Recording Blob Ready", data);
      //   chrome.runtime.sendMessage({
      //     command: "medispeak.recordingReady",
      //     data,
      //   });
      // Sending the Blob/URL to the Main Tab is failing. Therefore posting the Blob to the Server directly
      const recordingObj = prepareRecording(recordingBlob, recordingTime);
      // pageId is available as a query parameter
      const pageId = new URLSearchParams(window.location.search).get("pageId");
      uploadAudio(recordingObj, pageId, dispatchTranscript, sessionToken);
    }
  }, [recordingBlob]);

  useEffect(() => {
    // Toggle Remote Events based on Events State
    if (events.length > 0) {
      const lastEvent = events[events.length - 1];
      switch (lastEvent.type) {
        case "pauseResume|remote":
          togglePauseResume();
          break;
        case "stop|remote":
          stopRecording();
          break;
        default:
          console.log("Skipping Local Event", lastEvent);
          break;
      }
    }
  }, [events]);

  useEffect(() => {
    setEvents((prevEvents) => [...prevEvents, { type: "start" }]);
    startRecording();
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.command) {
        case "medispeak.playerControls":
          if (request.data && request.data.action) {
            switch (request.data.action) {
              case "pauseResume":
                setEvents((prevEvents) => [
                  ...prevEvents,
                  { type: "pauseResume|remote" },
                ]);
                // togglePauseResume();
                break;
              case "stop":
                // Update Session Token from request.data, if available
                if (request.data.sessionToken) {
                  setSessionToken(request.data.sessionToken);
                  console.log(
                    "Session Token Updated",
                    request.data.sessionToken
                  );
                }
                setEvents((prevEvents) => [
                  ...prevEvents,
                  { type: "stop|remote" },
                ]);
                // stopRecording();
                break;
              default:
                setEvents((prevEvents) => [
                  ...prevEvents,
                  { type: "unknown|remote" },
                ]);
                console.log(
                  "Unknown Player Controls Action",
                  request.data.action
                );
                break;
            }
          }
          break;
        case "medispeak.stopTabRecording":
          console.log("Stopping Recording");
          setEvents((prevEvents) => [
            ...prevEvents,
            { type: "stopRecording|remote" },
          ]);
          stopRecording();
          break;
        case "medispeak.recordingLive":
        case "medispeak.recordingReady":
          // Skipping irrelavant known commands
          break;
        default:
          console.log("Tab Skipping ", request.command);
          setEvents((prevEvents) => [
            ...prevEvents,
            { type: "unknownCommand|remote" },
          ]);
          break;
      }
    });
  }, []);

  useEffect(() => {
    const reportToActiveTab = () => {
      console.log("Reporting Recording Status", {
        recordingTime,
        isPaused,
        isRecording,
      });
      chrome.runtime.sendMessage({
        command: "medispeak.recordingLive",
        data: {
          recordingTime,
          isPaused,
          isRecording,
        },
      });
    };
    reportToActiveTab();
  }, [recordingTime, isPaused, isRecording]);

  return (
    <div className="tw-flex tw-flex-col tw-justify-center tw-items-center tw-h-screen">
      <MediSpeakIcon className="tw-w-48 tw-h-48 tw-bg-primary tw-rounded-full" />
      <div className="text-center mt-4">
        <p className="tw-text-gray-700 tw-text-2xl">
          Please keep this page open so that we can record your audio.
        </p>
      </div>
      {/* Recording Status */}
      <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-mt-4">
        <div className="tw-flex tw-flex-row tw-items-center tw-justify-center">
          <p className="tw-text-gray-700 tw-text-2xl tw-mr-2">
            Recording Status:
          </p>
          <p className="tw-text-gray-700 tw-text-2xl">
            {isRecording ? "Recording" : "Not Recording"}
          </p>
        </div>
        <div className="tw-flex tw-flex-row tw-items-center tw-justify-center">
          <p className="tw-text-gray-700 tw-text-2xl tw-mr-2">
            Recording Time:
          </p>
          <p className="tw-text-gray-700 tw-text-2xl">{recordingTime}</p>
        </div>
        <div className="tw-flex tw-flex-row tw-items-center tw-justify-center">
          <p className="tw-text-gray-700 tw-text-2xl tw-mr-2">
            Recording Paused:
          </p>
          <p className="tw-text-gray-700 tw-text-2xl">
            {isPaused ? "Paused" : "Not Paused"}
          </p>
        </div>
      </div>
      {/* Recording Controls */}
      <div className="tw-flex tw-flex-row tw-items-center tw-justify-center tw-mt-4">
        <button
          className="tw-bg-primary tw-text-white tw-py-2 tw-px-4 tw-mr-2 tw-rounded"
          onClick={() => {
            if (isRecording) {
              setEvents((prevEvents) => [
                ...prevEvents,
                { type: "stop|local" },
              ]);
              stopRecording();
            } else {
              setEvents((prevEvents) => [
                ...prevEvents,
                { type: "start|local" },
              ]);
              startRecording();
            }
          }}
        >
          {isRecording ? "Stop" : "Start"}
        </button>
        <button
          className="tw-bg-primary tw-text-white tw-py-2 tw-px-4 tw-mr-2 tw-rounded"
          onClick={() => {
            setEvents((prevEvents) => [
              ...prevEvents,
              { type: "pauseResume|local" },
            ]);
            togglePauseResume();
          }}
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>
      {/* Recording Events */}
      <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-mt-4 tw-max-h-96 tw-overflow-y-scroll">
        <p className="tw-text-gray-700 tw-text-2xl">Events</p>
        <div className="tw-flex tw-flex-col tw-items-center tw-justify-center">
          {events.map((event, index) => (
            <p key={index} className="tw-text-gray-700 tw-text-2xl">
              {event.type}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedispeakPage;
