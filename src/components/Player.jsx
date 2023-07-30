import React, { useState, useEffect } from 'react';
import { useAudioRecorder } from 'react-audio-voice-recorder';
import { PauseIcon, PlayIcon, RecordIcon, StopIcon } from './common/AppIcons';

const secondsToTimeText = (seconds) => {
    if (!seconds) return '00:00';

    const duration = seconds;
    const hours = duration / 3600;
    const hoursFormatted = hours < 10 ? `0${Math.floor(hours)}` : Math.floor(hours);
    const hoursString = hoursFormatted === '00' ? '' : `${hoursFormatted}:`;

    const minutes = (duration % 3600) / 60;
    const minutesFormatted = minutes < 10 ? `0${Math.floor(minutes)}` : Math.floor(minutes);

    const secs = duration % 60;
    const secsFormatted = secs < 10 ? `0${Math.floor(secs)}` : Math.floor(secs);

    return `${hoursString}${minutesFormatted}:${secsFormatted}`;
}

export default function Player({ onRecordingReady }) {

    const [audioSrc, setAudioSrc] = useState(null);

    const {
        startRecording,
        stopRecording,
        togglePauseResume,
        recordingBlob,
        isRecording,
        isPaused,
        recordingTime,
        mediaRecorder
    } = useAudioRecorder();


    useEffect(() => {
        if (!recordingBlob) return;
        onRecordingReady(recordingBlob);
        // recordingBlob will be present at this point after 'stopRecording' has been called
        const audioSrc = URL.createObjectURL(recordingBlob);
        setAudioSrc(audioSrc);
    }, [recordingBlob])

    const status = isRecording ? 'Recording' : isPaused ? 'Paused' : recordingBlob ? 'Done' : 'Ready';

    const previewPlayerRef = React.useRef(null);

    return (
        <div className="tw-relative tw-z-10">
            <div className="tw-flex w-full tw-bg-white tw-ring-1 tw-ring-slate-700/10">
                <button
                    onClick={() => {
                        if (isRecording) {
                            stopRecording();
                        } else {
                            startRecording();
                        }
                    }}
                    className="tw-button tw-flex tw-items-center tw-space-x-4 tw-pr-2 tw-pl-4 tw-py-2"
                >
                    {
                        isRecording ? (
                            <StopIcon className="tw-h-6 tw-w-6 tw-flex-none tw-text-gray-600 tw-rounded-xl tw-cursor-pointer hover:tw-text-gray-800" />
                        ) : (
                            <RecordIcon className="tw-h-6 tw-w-6 tw-flex-none tw-text-red-600 tw-rounded-xl tw-cursor-pointer hover:tw-text-red-800" />
                        )
                    }
                </button>
                <button
                    onClick={togglePauseResume}
                    className="tw-button tw-flex tw-items-center tw-space-x-4 tw-px-2 tw-py-2"
                >
                    {
                        isPaused ? (
                            <RecordIcon className="tw-h-6 tw-w-6 tw-flex-none tw-text-red-600 tw-rounded-xl tw-cursor-pointer hover:tw-text-red-800" />
                        ) : (
                            <PauseIcon className="tw-h-6 tw-w-6 tw-flex-none tw-text-gray-600 tw-rounded-xl tw-cursor-pointer hover:tw-text-gray-800" />
                        )
                    }
                </button>
                <button
                    onClick={() => {
                        if (audioSrc) {
                            previewPlayerRef.current.play();
                        }
                    }}
                    className="tw-button tw-flex tw-items-center tw-space-x-4 tw-px-2 tw-py-2"
                >
                    <PlayIcon className={
                        audioSrc
                            ? "tw-h-6 tw-w-6 tw-flex-none tw-text-gray-600 tw-rounded-xl tw-cursor-pointer hover:tw-text-gray-800"
                            : "tw-h-6 tw-w-6 tw-flex-none tw-text-gray-600 tw-rounded-xl tw-cursor-not-allowed tw-opacity-50"
                    } />
                </button>
                <audio
                    ref={previewPlayerRef}
                    src={audioSrc}
                    className="tw-hidden"
                    controls
                />
                <div className="tw-flex tw-flex-auto tw-items-center tw-border-l border-slate-200/60 tw-pl-6 tw-pr-4 tw-text-[0.8125rem] tw-leading-5 tw-text-slate-700">
                    <div>{secondsToTimeText(recordingTime)}</div>
                    <div className="tw-ml-4 tw-flex tw-flex-auto tw-rounded-full bg-slate-100">
                        {status}
                    </div>
                    <svg className="tw-ml-6 tw-h-6 tw-w-6 tw-flex-none" fill="none">
                        <path d="M12 8v1a1 1 0 0 0 1-1h-1Zm0 0h-1a1 1 0 0 0 1 1V8Zm0 0V7a1 1 0 0 0-1 1h1Zm0 0h1a1 1 0 0 0-1-1v1ZM12 12v1a1 1 0 0 0 1-1h-1Zm0 0h-1a1 1 0 0 0 1 1v-1Zm0 0v-1a1 1 0 0 0-1 1h1Zm0 0h1a1 1 0 0 0-1-1v1ZM12 16v1a1 1 0 0 0 1-1h-1Zm0 0h-1a1 1 0 0 0 1 1v-1Zm0 0v-1a1 1 0 0 0-1 1h1Zm0 0h1a1 1 0 0 0-1-1v1Z" fill="#64748B">
                        </path>
                    </svg>
                </div>
            </div>
        </div>
    )
}