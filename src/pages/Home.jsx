import React, { useState, useEffect } from 'react';
import { useAudioRecorder } from 'react-audio-voice-recorder';
import { RecordIcon, RetryIcon, SettingsIcon, StopIcon, TranscribeIcon } from '../components/common/AppIcons';
import Player from '../components/Player';
import { triggerScan, triggerUpdateFields } from '../utils/ScanUtils';

import { transcribeAudio, getCompletion, getPageInfo, findTemplate } from '../api/Api';
import { useRoute } from './AppRouter';

import Lottie from 'lottie-react';
import animationData from '../components/common/animation.json'

const properText = (text) =>
    text.split("_").map(word => word[0].toUpperCase() + word.slice(1)).join(" ");


const uploadAudio = (recording, pageId, callback) => {
    const page = pageId;
    transcribeAudio([
        { name: "transcription[audio_file]", value: recording.file },
        { name: "transcription[duration]", value: recording.duration }
    ], page)
        .then(result => {
            console.log(result);
            if (callback) callback(result);
        })
        .catch(error => console.log('error', error));
}


const populateFields = (transcription, callback) => {
    getCompletion(transcription)
        .then(result => {
            console.log(result);
            if (callback) callback(result.ai_response);
        }).catch(error => console.log('error', error));
}

const fetchPages = (callback) => {
    findTemplate()
        .then(result => {
            console.log(result);
            if (callback) callback(result);
        }).catch(error => console.log('error', error));
}

const fetchPageInfo = (page, callback) => {
    getPageInfo(page)
        .then(result => {
            console.log(result);
            if (result) {
                const currentPage = result.pages?.find(page => true);
                if (callback) callback(currentPage);
            }
        }).catch(error => console.log('error', error));
}


const populateFieldsOnPage = (autofillData, autofillFields) => {
    console.log("Populating fields", autofillData, "in fields", autofillFields);
    triggerUpdateFields(
        autofillFields
            .map(field => ({ ...field, value: autofillData[field.title] }))
            .filter(field => field.value)
    );
}

export default function Home() {

    // Current URL
    const url = window.location.href;
    const fqdn = url.split("/")[2];
    // fqdn Override
    // const fqdn = "care.ohc.network";

    const [recording, setRecording] = useState(false);
    const [transcription, setTranscription] = useState();

    const [pages, setPages] = useState();
    const [pageData, setPageData] = useState();
    const [autofillData, setAutofillData] = useState();
    const [playerState, setPlayerState] = useState("Ready");

    const { navigate } = useRoute();

    useEffect(() => {
        const shortlistPage = (template) => {
            if (template) {
                if (template.pages.length === 1) {
                    setPageData(template.pages[0]);
                } else {
                    setPages(template.pages);
                }
            } else {
                console.log("No page found for", fqdn);
                setPages(null);
            }
        }
        fetchPages(shortlistPage);
    }, []);

    useEffect(() => {
        if (recording) {
            uploadAudio(recording, pageData.id, setTranscription);
        }
    }, [recording]);

    useEffect(() => {
        console.log("Transcription", transcription);
        if (transcription && transcription.id) {
            populateFields(
                transcription.id,
                setAutofillData
            )
        }
    }, [transcription]);


    const title = pageData ? pageData.title : "Select Page";

    return (
        <div className="tw-flex tw-h-full tw-flex-col tw-justify-between">
            <div>
                {/* Title & Page Title*/}
                <div className="tw-flex tw-justify-between tw-items-center tw-mx-4 tw-my-2">
                    <div className="tw-text-sm tw-font-semibold tw-flex tw-gap-2 tw-items-center">
                        Medispeak <span className="tw-text-xs tw-italic tw-text-gray-600">v0.2.2</span>
                    </div>
                    <button
                        className="tw-flex tw-gap-1 tw-items-center text-blue-700"
                        onClick={() => navigate('settings')}
                    >
                        <SettingsIcon className="tw-h-6 tw-w-6 tw-flex-none tw-rounded-xl tw-cursor-pointer" /> Settings
                    </button>
                </div>

                {/* Divider */}
                <div className="tw-bg-gray-800 tw-mx-4 tw-my-2 tw-h-1"></div>
                {/* When a Page is not yet selected, Show the List of Pages Available in the WebApp */}
                {!pageData ? (
                    pages === null ? (
                        // When the WebApp is not yet setup in the MediSpeak account
                        <div className="tw-flex tw-flex-col tw-gap-4 tw-justify-center tw-items-center tw-h-1/2 tw-p-4">
                            <span>
                                This WebApp is not yet setup in your MediSpeak account
                            </span>
                            <span>
                                You can setup {fqdn} as a WebApp at <a href="https://medispeak.in" target="_blank" rel="noreferrer" className="tw-text-blue-600 tw-underline">https://medispeak.in</a>
                            </span>
                        </div>
                    ) : pages ? (
                        // When the WebApp is setup in the MediSpeak account but no Pages are setup
                        pages.length === 0 ? (
                            <div className="tw-flex tw-flex-col tw-gap-4 tw-justify-center tw-items-center tw-h-1/2 tw-p-4">
                                <span>
                                    No Pages found for this WebApp
                                </span>
                                <p>
                                    You can setup <span className="tw-font-semibold">Pages</span> for the WebApp {fqdn} at <a href="https://medispeak.in" target="_blank" rel="noreferrer" className="tw-text-blue-600 tw-underline">https://medispeak.in</a>
                                </p>
                            </div>
                        ) : (
                            // When the WebApp is setup in the MediSpeak account and Pages are setup
                            // Select a Page to continue
                            <div className="tw-flex tw-flex-col tw-gap-4 tw-mx-4 tw-my-2">
                                <div className="tw-flex tw-flex-col tw-gap-2">
                                    <span className="tw-text-sm tw-font-semibold tw-text-gray-800">Select Page</span>
                                    {/* List of Pages */}
                                    <div className="tw-flex tw-flex-col tw-gap-2">
                                        {
                                            pages?.map(page => (
                                                <span
                                                    key={page.id}
                                                    onClick={() => setPageData(page)}
                                                    className="tw-p-4 tw-border tw-border-gray-600 tw-text-xs tw-font-semibold tw-text-gray-800 tw-cursor-pointer hover:tw-text-blue-600"
                                                >
                                                    {page.name}
                                                </span>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        // pages === undefined || Loading Data from your MediSpeak Account
                        <div className="tw-flex tw-justify-center tw-items-center tw-h-1/2 tw-p-4">
                            <span>
                                Loading Data from your MediSpeak Account
                            </span>
                        </div>
                    )
                ) :
                    (
                        // When a Page is Selected, Show the Autofilled Fields
                        <>
                            {/* Page Title */}
                            <h5 className="tw-text-sm tw-font-normal tw-px-4 tw-my-2 tw-text-gray-400">
                                Auto-filled Fields
                            </h5>
                            {/* Autofilled Fields */}
                            <div className="tw-px-4 tw-flex tw-flex-wrap tw-flex-shrink tw-gap-2 tw-items-start tw-max-h-48 tw-overflow-auto">
                                {
                                    pageData?.form_fields?.map(field => (
                                        <Badge key={field.title} text={properText(field.title)} />
                                    )) || <span className="tw-text-sm tw-font-semibold tw-mx-4 tw-my-2 tw-text-gray-800">No fields found</span>
                                }
                            </div>
                        </>
                    )
                }
            </div>

            {/* Transcription Controls */}
            <div className='tw-flex tw-flex-col'>
                {/* Preview Transcription in a textarea */}
                {transcription && (
                    <>
                        <span className='tw-ml-2 tw-text-gray-400 font-normal '>Preview Transcription and Edit </span>
                        <textarea
                            className="tw-w-full tw-h-full tw-p-2 tw-border-0 tw-text-sm focus:tw-outline-none tw-bg-gray-100 tw-text-gray-700 tw-rounded-none tw-resize-none"
                            value={transcription.transcription_text}
                            rows={8}
                            readOnly
                        />
                    </>)
                }
                <div className='tw-flex tw-justify-between tw-items-center tw-mx-4 tw-my-2'>
                    {
                        transcription ? (
                            <div
                                onClick={() => {
                                    setRecording(false);
                                    setTranscription();
                                    setAutofillData();
                                    setPlayerState("Retry")
                                }}
                                className="tw-button tw-flex tw-gap-1 tw-items-center tw-space-x-4 tw-px-2 tw-py-2 tw-bg-blue-100 tw-text-blue-700 tw-rounded-xl tw-cursor-pointer"
                            >
                                <RetryIcon className="tw-h-6 tw-w-6 tw-flex-none tw-rounded-xl tw-cursor-pointer" />
                                Retry
                            </div>
                        ) : recording ? (
                            <div className="tw-flex tw-flex-col">
                                <Lottie animationData={animationData} />
                                <div className="tw-flex tw-flex-col tw-text-sm tw-text-gray-700">
                                    <span>
                                        Transcribing your audio... </span>  <span>
                                        Please wait, it might take a minute or two
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <></>
                        )
                    }

                    {autofillData && <div
                        onClick={() => {
                            populateFieldsOnPage(autofillData, pageData.form_fields);
                        }}
                        className="tw-button tw-rounded-full tw-flex tw-items-center tw-space-x-4 tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-cursor-pointer hover:tw-bg-blue-700"
                    >
                        Auto-Fill Form Fields
                    </div>}
                </div>
                {/* Recording Controls */}
                <Player
                    controlledState={playerState}
                    onRecordingReady={(recordingBlob, duration) => {
                        const recordingFile = new File([recordingBlob], 'recording.wav', { type: 'audio/wav' });
                        setRecording({
                            file: recordingFile,
                            duration: duration
                        });
                    }}
                />
                {!recording && <div className="tw-flex tw-justify-center tw-items-start tw-h-1/2 tw-p-4 tw-text-sm tw-text-gray-700">
                    <span>
                        Record your voice note to get started
                    </span>
                </div>}
            </div>
        </div >
    )
}

const Badge = ({ text }) => (
    <span className="tw-bg-gray-100 tw-rounded-lg tw-text-gray-600 tw-text-sm tw-font-normal tw-px-2 tw-py-1">
        {text}
    </span>
);