import { useState, useEffect, useRef } from "react";
import { useAudioRecorder } from "react-audio-voice-recorder";
import {
  MediSpeakIcon,
  PauseIcon,
  PlayIcon,
  RecordIcon,
  RetryIcon,
  StopIcon,
  TranscribeIcon,
} from "./common/AppIcons";
import Lottie from "lottie-react";
import animationData from "./common/animation.json";

const secondsToTimeText = (seconds) => {
  if (!seconds) return "00:00";

  const duration = seconds;
  const hours = duration / 3600;
  const hoursFormatted =
    hours < 10 ? `0${Math.floor(hours)}` : Math.floor(hours);
  const hoursString = hoursFormatted === "00" ? "" : `${hoursFormatted}:`;

  const minutes = (duration % 3600) / 60;
  const minutesFormatted =
    minutes < 10 ? `0${Math.floor(minutes)}` : Math.floor(minutes);

  const secs = duration % 60;
  const secsFormatted = secs < 10 ? `0${Math.floor(secs)}` : Math.floor(secs);

  return `${hoursString}${minutesFormatted}:${secsFormatted}`;
};

export default function Player({
  onRecordingReadyCB,
  recordOnTab,
  controlledState,
}) {
  const [audioSrc, setAudioSrc] = useState(null);
  const [tabRecordingState, setTabRecordingState] = useState();

  // Temp Variable to store duration of recording when returning recordingBlob
  const [recordingDuration, setRecordingDuration] = useState(0);

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

  const onPauseResume = () => {
    if (tabRecordingState) {
      console.log(
        "Sending Pause/Resume Message to Tab",
        tabRecordingState.tabId
      );
      chrome.runtime.sendMessage({
        command: "medispeak.playerControls",
        data: {
          action: "pauseResume",
          tabId: tabRecordingState.tabId,
        },
      });
    } else {
      togglePauseResume();
    }
  };

  const onStopRecording = () => {
    if (tabRecordingState) {
      console.log("Sending Stop Message to Tab", tabRecordingState.tabId);
      chrome.runtime.sendMessage({
        command: "medispeak.playerControls",
        data: {
          action: "stop",
          tabId: tabRecordingState.tabId,
          sessionToken: sessionStorage.getItem("access_token"),
        },
      });
    } else {
      stopRecording();
    }
  };

  const onRecordingReady = (recordingBlob, recordingDuration) => {
    onRecordingReadyCB(recordingBlob, recordingDuration);
    // recordingBlob will be present at this point after 'stopRecording' has been called
    const audioSrc = URL.createObjectURL(recordingBlob);
    setAudioSrc(audioSrc);
  };

  useEffect(() => {
    if (recordingBlob && recordingDuration !== 0) {
      onRecordingReady(recordingBlob, recordingDuration);
    }
  }, [recordingBlob]);

  useEffect(() => {
    if (controlledState === "Retry") {
      setAudioSrc(null);
    }
  }, [controlledState]);

  const localStatus = isPaused
    ? "Paused"
    : isRecording
    ? "Recording"
    : audioSrc
    ? "Done"
    : "Ready";

  const status = tabRecordingState
    ? tabRecordingState.isPaused
      ? "Paused"
      : tabRecordingState.isRecording
      ? "Recording"
      : audioSrc
      ? "Done"
      : "Ready"
    : localStatus;

  const recordingTimeState = tabRecordingState
    ? tabRecordingState.recordingTime
    : recordingTime;

  useEffect(() => {
    const onMessageListener = (request, sender, sendResponse) => {
      console.log("Content Script Received Message", request);
      switch (request.command) {
        case "medispeak.recordingLive":
          console.log("Tab Recording Status Update", request.data);
          setTabRecordingState({
            ...request.data,
            tabId: request.recordingTabId,
          });
          break;
        case "medispeak.recordingReady":
          console.log("Trigger: Tab Recording Ready", request.data);
          // Compute recordingBlog from recordingUri
          const recordingBlob = new Blob([request.data.recordingUri], {
            type: "audio/webm",
          });
          onRecordingReady(recordingBlob, request.data.recordingTime);
          break;
        case "medispeak.transcriptReady":
          const transcriptResponse = request.data;
          setAudioSrc(transcriptResponse.audio_file_url);
        default:
          console.log("Content Script skipping ", request.command);
          break;
      }
    };
    if (localStatus === "Recording")
      setTimeout(() => {
        if (mediaRecorder) {
          console.log(mediaRecorder.state);
        } else {
          console.log("Media Recorder not found");
          recordOnTab(onMessageListener);
        }
      }, 1200);
  }, [localStatus]);

  const previewPlayerRef = useRef(null);

  const animationRef = useRef(null);

  // Need to merge this with onPauseResume
  const togglePauseResumeHook = () => {
    if (status === "Recording")
      animationRef && animationRef.current && animationRef.current.pause();
    else animationRef && animationRef.current && animationRef.current.play();
    onPauseResume();
  };

  const renderforStatus = (status) => {
    switch (status) {
      case "Recording":
      case "Paused":
        return (
          <div className="tw-flex tw-flex-col tw-justify-center tw-items-center my-2">
            <span className="tw-text-gray-900">
              {secondsToTimeText(recordingTimeState)}
            </span>
            <Lottie animationData={animationData} lottieRef={animationRef} />
            {status === "Recording" ? (
              <div
                onClick={togglePauseResumeHook}
                className="tw-bg-blue-700 tw-rounded-full tw-p-2 tw-flex tw-items-center"
              >
                <PauseIcon className="tw-h-6 tw-w-6 tw-flex-none tw-text-white tw-rounded-xl tw-cursor-pointer hover:tw-text-gray-100" />
              </div>
            ) : (
              <div className="tw-flex tw-justify-center tw-gap-2 tw-text-sm tw-text-white tw-flex-wrap">
                <div
                  onClick={() => {
                    setRecordingDuration(0);
                    setAudioSrc(null);
                    onStopRecording();
                  }}
                  className="tw-flex tw-rounded-full tw-bg-red-100 tw-text-red-600 tw-p-2 tw-px-3 tw-text-sm tw-justify-center tw-items-center"
                >
                  <RetryIcon className="h-4 w-4 mr-1" />
                  Restart
                </div>
                <div
                  onClick={togglePauseResumeHook}
                  className="tw-bg-blue-700 tw-rounded-full tw-p-2 tw-px-3"
                >
                  Resume
                </div>
                <div
                  onClick={() => {
                    onStopRecording();
                    setRecordingDuration(recordingTimeState);
                  }}
                  className="tw-flex tw-items-center tw-bg-blue-100 tw-rounded-full tw-p-2 tw-px-3 tw-text-blue-700"
                >
                  <TranscribeIcon className="h-4 w-4 mr-1" />
                  Transcribe
                </div>
              </div>
            )}
          </div>
        );
      case "Done":
        return "";
      default:
        return (
          <div className="tw-flex tw-flex-col tw-justify-center tw-items-center">
            <div
              onClick={startRecording}
              className="tw-flex tw-cursor-pointer tw-rounded-full tw-bg-blue-700 tw-p-2 tw-text-white tw-text-sm tw-justify-center tw-items-center tw-border-0"
            >
              <MediSpeakIcon /> <span className="pr-1">Start Recording</span>
            </div>
          </div>
        );
    }
  };

  return <div className="tw-relative tw-z-10">{renderforStatus(status)}</div>;
}
