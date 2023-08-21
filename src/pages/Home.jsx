import React, { useState, useEffect } from 'react';
import { useAudioRecorder } from 'react-audio-voice-recorder';
import { RecordIcon, SettingsIcon, StopIcon, TranscribeIcon } from '../components/common/AppIcons';
import Player from '../components/Player';
import { triggerScan, triggerUpdateFields } from '../utils/ScanUtils';

import { transcribeAudio, getCompletion, getPageInfo, getPages } from '../api/Api';
import { useRoute } from './AppRouter';

const BAHMNI_APP_ID = 3;

const BHAMNI_PAGE = 4;

const uploadAudio = (audioFile, callback) => {
    const page = BHAMNI_PAGE;
    transcribeAudio([{ name: "transcription[audio_file]", value: audioFile }], page)
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


const populateFieldsOnPage = (autofillData, fields, autofillFields) => {
    console.log("Populating fields", autofillData, fields, autofillFields);
    const updatedFields = fields
        .filter(field => autofillFields.find(autofillField => autofillField.title === field.identifier))
        .map(field => {
            const matchingDataField = autofillData[field.identifier];
            if (matchingDataField) {
                console.log("Matching Data Field", field.identifier, matchingDataField)
                return { ...field, value: matchingDataField };
            }
            console.log("No Matching Data Field", field.identifier)
            return field;
        })
    triggerUpdateFields(updatedFields);
}

export default function Home() {

    // Current URL
    const url = window.location.href;

    const [recording, setRecording] = useState(false);
    const [transcription, setTranscription] = useState(null);
    const [fields, setFields] = useState([]);
    const [pageData, setPageData] = useState();
    const [autofillData, setAutofillData] = useState();

    const { navigate } = useRoute();

    useEffect(() => {
        fetchPageInfo(BAHMNI_APP_ID, setPageData);
        triggerScan(setFields);
    }, []);

    useEffect(() => {
        console.log("Transcription", transcription);
        if (transcription) {
            populateFields(
                transcription.id,
                setAutofillData
            )
        }
    }, [transcription]);

    return (
        <div className="tw-flex tw-h-full tw-flex-col tw-justify-between">
            <div>
                {/* Title & Page Title*/}
                <div className="tw-flex tw-justify-between tw-items-center tw-mx-4 tw-my-2">
                    <span className="tw-text-base tw-font-bold tw-blue-800">Create Patient</span>
                    <span className="tw-text-sm tw-font-semibold tw-flex tw-gap-2 tw-items-center">
                        MediSpeak
                        <button
                            onClick={() => navigate('settings')}
                        >
                            <SettingsIcon className="tw-h-4 tw-w-4 tw-flex-none tw-rounded-xl tw-cursor-pointer" />
                        </button>
                    </span>
                </div>

                {/* Divider */}
                <div className="tw-bg-gray-800 tw-mx-4 tw-my-2 tw-h-1"></div>

                {/* Page Title */}
                <h5 className="tw-text-sm tw-font-semibold tw-mx-4 tw-my-2 tw-text-gray-800">
                    Auto-filled Fields
                </h5>
                {/* Autofilled Fields */}
                <div className="tw-px-4 tw-flex tw-flex-wrap tw-flex-shrink tw-gap-y-1 tw-items-start tw-max-h-48 tw-overflow-auto">
                    {
                        pageData?.form_fields?.map(field => (
                            <Badge key={field.title} text={field.title} />
                        )) || <span className="tw-text-sm tw-font-semibold tw-mx-4 tw-my-2 tw-text-gray-800">No fields found</span>
                    }
                </div>
            </div>

            {/* Transcription Controls */}
            <div className='tw-flex tw-flex-col'>
                {/* Preview Transcription in a textarea */}
                {transcription && (
                    <>
                        <span> Transcription Preview </span>
                        <textarea
                            className="tw-w-full tw-h-full tw-p-2 tw-border-0 tw-text-sm"
                            value={transcription.transcription_text}
                            readOnly
                        />
                    </>)
                }
                <div className='tw-flex tw-justify-between tw-items-center tw-mx-4 tw-my-2'>
                    {
                        transcription ? (
                            <div
                                onClick={() => {
                                    setRecording(null);
                                    setTranscription(null);
                                }}
                                className="tw-button tw-flex tw-items-center tw-space-x-4 tw-px-2 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-xl tw-cursor-pointer hover:tw-bg-blue-700"
                            >
                                <TranscribeIcon className="tw-h-6 tw-w-6 tw-flex-none tw-rounded-xl tw-cursor-pointer" />
                                Retry
                            </div>
                        ) : recording ? (
                            <div className="tw-flex tw-justify-center tw-items-center tw-h-1/2 tw-my-2 tw-gap-1">
                                <span>
                                    Ready to transcribe
                                </span>
                                <div
                                    onClick={() => {
                                        uploadAudio(recording, setTranscription);
                                    }}
                                    className="tw-button tw-flex tw-items-center tw-space-x-4 tw-px-2 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-xl tw-cursor-pointer hover:tw-bg-blue-700"
                                >
                                    <TranscribeIcon className="tw-h-6 tw-w-6 tw-flex-none tw-rounded-xl tw-cursor-pointer" />
                                    Start
                                </div>
                            </div>
                        ) : (
                            <div className="tw-flex tw-justify-center tw-items-start tw-h-1/2 tw-p-4">
                                <span>
                                    Record your voice note to get started
                                </span>
                            </div>
                        )
                    }

                    {autofillData && <div
                        onClick={() => {
                            populateFieldsOnPage(autofillData, fields, pageData.form_fields);
                        }}
                        className="tw-button tw-flex tw-items-center tw-space-x-4 tw-px-2 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-xl tw-cursor-pointer hover:tw-bg-blue-700"
                    >
                        Continue
                    </div>}
                </div>
                {/* Recording Controls */}
                <Player
                    onRecordingReady={(recordingBlob) => {
                        const recordingFile = new File([recordingBlob], 'recording.wav', { type: 'audio/wav' });
                        setRecording(recordingFile);
                    }}
                />
            </div>
        </div >
    )
}

const Badge = ({ text }) => (
    <span className="tw-bg-blue-600 tw-text-white tw-rounded-full tw-px-2 tw-py-1 tw-text-xs tw-font-semibold tw-mx-1">
        {text}
    </span>
);