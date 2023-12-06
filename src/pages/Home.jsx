import React, { useState, useEffect, useRef } from 'react';
import { useAudioRecorder } from 'react-audio-voice-recorder';
import { RecordIcon, RetryIcon, SettingsIcon, StopIcon, TranscribeIcon } from '../components/common/AppIcons';
import Player from '../components/Player';
import { triggerUpdateFields } from '../utils/ScanUtils';

import { transcribeAudio, getCompletion, getPageInfo, findTemplate, getTanscriptions } from '../api/Api';
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
        }).catch(error => callback(null));
}

const populateFieldsOnPage = (autofillData, autofillFields) => {
    console.log("Populating fields", autofillData, "in fields", autofillFields);
    triggerUpdateFields(
        autofillFields
            .map(field => ({ ...field, value: autofillData[field.title] }))
            .filter(field => field.value)
    );
}

export default function Home({ onHide, transcriptionRecord }) {

    // Current URL
    const url = window.location.href;
    const fqdn = url.split("/")[2];
    // fqdn Override
    // const fqdn = "care.ohc.network";

    const [recordingObj, setRecordingObj] = useState(false);
    const [recordingUri, setRecordingUri] = useState();
    const [transcription, setTranscription] = useState();

    const [pages, setPages] = useState();
    const [pageData, setPageData] = useState();
    const [autofillData, setAutofillData] = useState();
    const [playerState, setPlayerState] = useState("Ready");

    const autofillRef = useRef(null);

    const { navigate } = useRoute();

    const autofillCB = (data) => {
        setAutofillData(data)
        // Scroll to Auto-Fill Button
        setTimeout(() => {
            autofillRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 1000);
    }

    useEffect(() => {
        const shortlistPage = (template) => {
            if (template) {
                if (transcriptionRecord) {
                    setPageData(template.pages.find(page => page.id === transcriptionRecord.page_id));
                }
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
        if (transcriptionRecord) {
            setTranscription(transcriptionRecord);
            setAutofillData(transcriptionRecord.ai_response);
            setRecordingUri(transcriptionRecord.audio_file_url);
        }
    }, []);

    useEffect(() => {
        if (recordingObj) {
            uploadAudio(recordingObj, pageData.id, setTranscription);
        }
    }, [recordingObj]);

    useEffect(() => {
        console.log("Transcription", transcription);
        if (transcription && transcription.id && !autofillData) {
            populateFields(
                transcription.id,
                autofillCB
            )
        }
    }, [transcription]);

    const onRetry = () => {
        setRecordingObj(false);
        setTranscription();
        setAutofillData();
        setPlayerState("Retry")
        setRecordingUri();
    }

    const title = pageData ? pageData.title : "Select Page";

    const selectedTab = "Home";

    return (
        <div className="tw-flex tw-h-full tw-flex-col tw-justify-between">
            <div className="tw-h-full tw-flex tw-flex-col">
                {/* Tab Container div */}
                {/* Tabs */}


                {/* When a Page is not yet selected, Show the List of Pages Available in the WebApp */}
                {!pageData ? (
                    pages === null ? (
                        // When the WebApp is not yet setup in the MediSpeak account
                        <div className="tw-flex tw-flex-col tw-gap-4 tw-justify-center tw-items-center tw-p-4">
                            <span>
                                This WebApp is not yet setup in your MediSpeak account
                            </span>
                            <span>
                                You can setup {fqdn} as a WebApp at <a href="https://app.medispeak.in" target="_blank" rel="noreferrer" className="tw-text-blue-600 tw-underline">https://app.medispeak.in</a>
                            </span>
                        </div>
                    ) : pages ? (
                        // When the WebApp is setup in the MediSpeak account but no Pages are setup
                        pages.length === 0 ? (
                            <div className="tw-flex tw-flex-col tw-gap-4 tw-justify-center tw-items-center tw-p-4">
                                <span>
                                    No Pages found for this WebApp
                                </span>
                                <p>
                                    You can setup <span className="tw-font-semibold">Pages</span> for the WebApp {fqdn} at <a href="https://app.medispeak.in" target="_blank" rel="noreferrer" className="tw-text-blue-600 tw-underline">https://app.medispeak.in</a>
                                </p>
                            </div>
                        ) : (
                            // When the WebApp is setup in the MediSpeak account and Pages are setup
                            // Select a Page to continue
                            <div className="tw-flex tw-flex-col tw-gap-4 tw-mx-4 tw-my-2 tw-flex-1">
                                <div className="tw-flex tw-flex-col tw-gap-2 tw-justify-between tw-h-full">
                                    <div className="tw-flex tw-flex-col tw-gap-2 tw-h-full">
                                        <span className="tw-text-sm tw-font-semibold tw-text-gray-800">Select Page</span>
                                        {/* List of Pages */}
                                        <div className="tw-flex tw-flex-col tw-gap-2">
                                            {
                                                pages?.map(page => (
                                                    <span
                                                        key={page.id}
                                                        onClick={() => setPageData(page)}
                                                        className="tw-p-4 tw-border tw-border-gray-100 tw-text-xs tw-font-semibold tw-text-gray-700 tw-cursor-pointer tw-rounded-lg hover:tw-text-blue-800 hover:tw-border-blue-100"
                                                    >
                                                        {page.name}
                                                    </span>
                                                ))
                                            }
                                        </div>
                                    </div>
                                    <MyTranscriptionsButton navigate={navigate} />
                                </div>
                            </div>
                        )
                    ) : (
                        // pages === undefined || Loading Data from your MediSpeak Account
                        <div className="tw-flex tw-justify-center tw-items-center tw-p-4">
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
                                        <Badge key={field.title}>
                                            {properText(field.title)}
                                        </Badge>
                                    )) || <span className="tw-text-sm tw-font-semibold tw-mx-4 tw-my-2 tw-text-gray-800">No fields found</span>
                                }
                            </div>
                        </>
                    )
                }
            </div>

            {/* Transcription Controls */}
            <div className='tw-flex tw-flex-col'>
                {/* Preview Audio Recording */}
                {recordingUri && (
                    <>
                        <span className='tw-ml-2 tw-mt-2 tw-text-gray-400 tw-text-sm '>Preview Recording </span>
                        <audio src={recordingUri} controls className="tw-w-full tw-p-2 tw-border-0 tw-text-sm focus:tw-outline-none tw-text-gray-700 tw-rounded-none tw-resize-none" />
                    </>
                )
                }
                {/* Preview Transcription in a textarea */}
                {transcription && (
                    <>
                        <span className='tw-ml-2 tw-mt-2 tw-text-gray-400 tw-text-sm '>Preview Transcription </span>
                        <p
                            className="tw-w-full tw-p-2 tw-border-0 tw-text-sm focus:tw-outline-none tw-bg-gray-50 tw-text-gray-700 tw-rounded-none tw-resize-none">
                            {transcription.transcription_text}
                        </p>
                    </>)
                }
                {autofillData && (
                    <>
                        <div className='tw-flex tw-justify-between tw-items-center tw-mx-4 tw-my-2'>
                            <span className='tw-ml-2 tw-mt-2 tw-text-gray-400 tw-text-sm '>Autofill Preview:</span>
                            <button
                                onClick={() => {
                                    setAutofillData();
                                    populateFields(
                                        transcription.id,
                                        autofillCB
                                    )
                                }}
                                className="tw-button tw-flex tw-gap-1 tw-items-center tw-space-x-4 tw-px-2 tw-py-2 tw-bg-blue-100 tw-text-blue-700 tw-rounded-xl tw-cursor-pointer"
                            >
                                <RetryIcon className="tw-h-6 tw-w-6 tw-flex-none tw-rounded-xl tw-cursor-pointer" />
                                Retry
                            </button>
                        </div>
                        <div className="tw-flex tw-flex-col tw-gap-2 tw-px-4 tw-my-2">
                            {
                                Object.keys(autofillData).map(key => (
                                    <Badge key={key}>
                                        <span className="tw-font-bold">{properText(key)}:</span> {autofillData[key]}
                                    </Badge>
                                ))
                            }
                        </div>
                    </>
                )}
                <div className='tw-flex tw-justify-between tw-items-center tw-mx-4 tw-my-2' ref={autofillRef}>
                    {
                        transcription && (!transcriptionRecord) ? (
                            <div
                                onClick={onRetry}
                                className="tw-button tw-flex tw-gap-1 tw-items-center tw-space-x-4 tw-px-2 tw-py-2 tw-bg-blue-100 tw-text-blue-700 tw-rounded-xl tw-cursor-pointer"
                            >
                                <RetryIcon className="tw-h-6 tw-w-6 tw-flex-none tw-rounded-xl tw-cursor-pointer" />
                                Retry
                            </div>
                        ) : recordingObj ? (
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

                    {transcription &&
                        (autofillData ?
                            <div
                                onClick={() => {
                                    populateFieldsOnPage(autofillData, pageData.form_fields);
                                    onHide();
                                }}
                                className="tw-button tw-rounded-full tw-flex tw-items-center tw-space-x-4 tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-cursor-pointer hover:tw-bg-blue-700"
                            >
                                Auto-Fill Form Fields
                            </div>
                            // Else: Loading State for Auto-Fill Button
                            : <div className="tw-button tw-rounded-full tw-flex tw-items-center tw-space-x-4 tw-px-4 tw-py-2 tw-bg-gray-100 tw-text-gray-700 tw-cursor-wait">
                                <svg className="tw-animate-spin -tw-ml-1 tw-mr-3 tw-h-5 tw-w-5 tw-text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="tw-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="tw-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Auto-Fill Form Fields
                            </div>
                        )
                    }
                </div>
                {/* Recording Controls */}
                {pageData && !recordingUri &&
                    <>
                        <Player
                            controlledState={playerState}
                            onRecordingReady={(recordingBlob, duration) => {
                                setRecordingUri(URL.createObjectURL(recordingBlob));
                                const recordingFile = new File([recordingBlob], 'recording.wav', { type: 'audio/wav' });
                                setRecordingObj({
                                    file: recordingFile,
                                    duration: duration
                                });
                            }}
                        />
                        {!recordingObj && <div className="tw-flex tw-justify-center tw-items-start tw-h-1/2 tw-p-4 tw-text-sm tw-text-gray-700">
                            <span>
                                Record your voice note to get started
                            </span>
                        </div>}
                    </>
                }

            </div>
        </div >
    )
}

const Badge = ({ children }) => (
    <span className="tw-bg-gray-50 tw-rounded-lg tw-text-gray-600 tw-text-sm tw-font-normal tw-px-2 tw-py-1">
        {children}
    </span>
);

const MyTranscriptionsButton = (
    { navigate }
) => {
    return (
        <div className="tw-flex tw-justify-end tw-items-center">
            <button
                className="tw-flex tw-gap-px tw-items-center text-gray-700 tw-text-sm tw-w-full tw-bg-white hover:tw-bg-gray-100"
                onClick={() => navigate('transcriptions')}
            >
                <span className="tw-p-1 tw-rounded-full tw-bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="tw-h-4 tw-w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 0a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18.75a8.75 8.75 0 1 1 0-17.5 8.75 8.75 0 0 1 0 17.5zm-.625-5.625h1.25v-5h-1.25v5z" clipRule="evenodd" />
                    </svg>
                </span>
                My Transcriptions
            </button>
        </div>)
}