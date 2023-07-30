import React, { useState, useEffect } from 'react';
import { useAudioRecorder } from 'react-audio-voice-recorder';
import { RecordIcon, StopIcon, TranscribeIcon } from './common/AppIcons';
import Player from './Player';
import { triggerScan, triggerUpdateFields } from '../utils/ScanUtils';


const uploadAudio = (audioFile, callback) => {
    const formData = new FormData();
    formData.append('transcription[audio_file]', audioFile);

    // Add Auth Token
    const headers = new Headers();
    const authToken = "Bearer Zakpzw9JjgjZXrTh5ePpgqnk"
    headers.append("Authorization", authToken);

    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: formData,
        redirect: 'follow'
    };

    fetch("https://www.medispeak.in/api/v1/pages/4/transcriptions", requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log(result);
            if (callback) callback(result.transcription_text);
        })
        .catch(error => console.log('error', error));
}

const populateFields = (fields, transcription) => {
    console.log("Populating fields", fields, transcription)
    const namedFields = fields.filter(field => field.identifier || field.id);
    const fieldsToFill = namedFields.filter(field => transcription.includes(field.identifier));
    console.log("Fields to fill", fieldsToFill)

    const updatedFields = fieldsToFill.map((field, _index, _fields) => {
        console.log("Updating field", field, _index, _fields)
        const fieldTextPostFix = transcription.split(field.identifier)[1];
        console.log("Field text postfix", fieldTextPostFix)
        // Find the first hit of another field name in the transcription
        const filter = _fields
            .filter(f => f !== field)
        console.log("Filter", filter)
        const map = filter
            .map(f => ({ identifier: f.identifier, index: fieldTextPostFix.indexOf(f.identifier) }))
        console.log("Map", map)
        // Remove the -1 index | No match
        const filter2 = map
            .filter(f => f.index !== -1)
        const sort = filter2
            .sort((a, b) => a.index - b.index);
        console.log("Sort", sort)
        const postfixField = sort[0]?.identifier || '';
        console.log("Postfix field", postfixField)
        const fieldText =
            postfixField === '' ? fieldTextPostFix : fieldTextPostFix.split(postfixField)[0];
        console.log("Field text", fieldText)
        return {
            ...field,
            value: fieldText
        }
    });

    triggerUpdateFields(updatedFields);

    return updatedFields;
}

export default function PopOver() {

    const [recording, setRecording] = useState(false);
    const [transcription, setTranscription] = useState(null);
    const [fields, setFields] = useState([]);

    useEffect(() => {
        triggerScan(setFields);
    }, []);

    useEffect(() => {
        console.log("Transcription", transcription);
        if (transcription) {
            setFields(fields =>
                populateFields(
                    fields.map(field => ({ ...field, value: '', name: field.identifier.toLowerCase() })),
                    transcription.toLowerCase()
                )
            );
        }
    }, [transcription]);

    return (
        <div className="tw-h-[30rem] md:t-h-[32rem] tw-bg-white tw-shadow-xl tw-rounded-lg tw-border tw-relative tw-w-full tw-text-gray-800">
            <div className="tw-flex tw-flex-col tw-h-full tw-justify-end">
                <div className="tw-flex tw-h-full tw-flex-col tw-justify-between">
                    <div className="tw-flex tw-flex-col tw-start tw-h-1/2 tw-my-4 tw-overflow-auto">
                        <span className='tw-w-full tw-text-center'>MediSpeak</span>
                        {/* Listing the Identified Fields */}
                        <span className="tw-text-gray-500 tw-text-sm tw-mb-2">Identified Fields</span>
                        {
                            fields.length > 0 ? (
                                <ul className="tw-flex tw-flex-col tw-space-y-2 tw-text-sm">
                                    {
                                        fields.map(field => (
                                            <li className="tw-flex tw-space-x-2">
                                                <span className="tw-text-gray-500">{field.identifier}</span>
                                                <span className="tw-text-gray-500">{field.value}</span>
                                            </li>
                                        ))
                                    }
                                </ul>
                            ) : (
                                <span className="tw-text-gray-500">No fields found</span>
                            )
                        }
                    </div>
                    {/* Transcription Controls */}
                    <div className='tw-flex tw-flex-col'>
                        {/* Preview Transcription in a textarea */}
                        {
                            transcription ? (
                                <div className="tw-flex tw-flex-col tw-justify-center tw-items-center tw-h-1/2 tw-my-2 tw-gap-1 tw-text-sm">
                                    <span> Transcription Preview </span>
                                    <textarea
                                        className="tw-w-full tw-h-full tw-p-2 tw-border-0 tw-text-sm"
                                        value={transcription}
                                        readOnly
                                    />
                                    {/* Retry */}
                                    <button
                                        onClick={() => {
                                            triggerUpdateFields(fields);
                                        }}
                                        className="tw-flex tw-items-center tw-space-x-4 tw-px-2 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-xl tw-cursor-pointer hover:tw-bg-blue-700"
                                    >
                                        <TranscribeIcon className="tw-h-6 tw-w-6 tw-flex-none tw-rounded-xl tw-cursor-pointer" />
                                        Retry
                                    </button>
                                </div>
                            ) : recording ? (
                                <div className="tw-flex tw-justify-center tw-items-center tw-h-1/2 tw-my-2 tw-gap-1">
                                    <span>
                                        Ready to transcribe
                                    </span>
                                    <button
                                        onClick={() => {
                                            uploadAudio(recording, setTranscription);
                                        }}
                                        className="tw-flex tw-items-center tw-space-x-4 tw-px-2 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-xl tw-cursor-pointer hover:tw-bg-blue-700"
                                    >
                                        <TranscribeIcon className="tw-h-6 tw-w-6 tw-flex-none tw-rounded-xl tw-cursor-pointer" />
                                        Start
                                    </button>
                                </div>
                            ) : (
                                <div className="tw-flex tw-justify-center tw-items-start tw-h-1/2 tw-p-4">
                                    <span>
                                        Record your voice note to get started
                                    </span>
                                </div>
                            )
                        }
                        {/* Recording Controls */}
                        <Player
                            onRecordingReady={(recordingBlob) => {
                                const recordingFile = new File([recordingBlob], 'recording.wav', { type: 'audio/wav' });
                                setRecording(recordingFile);
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}