import React, { useEffect, useState } from "react";
import { ExitIcon, RecordIcon } from "../components/common/AppIcons";
import { getTanscriptions } from "../api/Api";
import InfiniteScroll from 'react-infinite-scroll-component';

const fetchTranscriptions = (page, callback) => {
    getTanscriptions(page)
        .then(result => {
            console.log(result);
            if (callback) callback(result);
        }).catch(error => callback(null));
}

const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes ? `${minutes}m ` : ''}${seconds}s`;
}

const relativeTime = (date) => {
    const today = new Date();
    const refDate = new Date(date);
    const diff = today.getTime() - refDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor(diff / (1000));

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    else if (seconds > 0) {
        return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    }
    else {
        return 'Just now';
    }
}

/**
 * Renders a page displaying a list of transcriptions.
 * @returns {JSX.Element} Transcriptions page component.
 */
import { PlayIcon, PauseIcon } from "../components/common/AppIcons";
import Home from "./Home";

export default function Transcriptions() {
    const [transcriptions, setTranscriptions] = useState({});
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [selectedTranscription, setSelectedTranscription] = useState();

    useEffect(() => {
        console.log("Fetching Transcriptions for page", page)
        fetchTranscriptions(page, (result) => {
            setTranscriptions(prevTranscriptions => ({
                ...prevTranscriptions,
                [page]: result.transcriptions
            }));
            setHasMore(result.pagy.page_count > page);
        });
    }, [page]);

    const loadMore = () => {
        setPage(page => page + 1);
    }

    const flatTranscriptions = Object.values(transcriptions).flat();

    if (selectedTranscription)
        return (<Home transcriptionRecord={selectedTranscription} />);

    return (
        <div className="tw-flex tw-h-full tw-flex-col tw-justify-between">
            <div className="tw-h-full tw-flex tw-flex-col">
                {/* Your Transcriptions */}
                <div className="tw-flex tw-flex-col tw-p-2 tw-gap-4 tw-overflow-auto">
                    {/* Title */}
                    <div className="tw-flex tw-items-center tw-justify-between tw-text-gray-600">
                        <div className=" tw-font-medium">Your Transcriptions</div>
                    </div>
                    <div>
                        {flatTranscriptions.map((transcription) => (
                            <div key={transcription.id} className="tw-flex tw-mb-2 tw-items-center tw-justify-between tw-p-4 tw-bg-white tw-rounded-lg tw-shadow-md">
                                <div className="tw-flex tw-items-center tw-gap-4">
                                    <div onClick={() => setSelectedTranscription(transcription)}>
                                        <PlayIcon className="tw-h-6 tw-w-6 tw-text-gray-400" />
                                    </div>
                                    <div className="tw-flex tw-flex-col">
                                        <div className="tw-text-sm tw-font-medium tw-text-gray-900">{transcription.title}</div>
                                        <div className="tw-text-sm tw-text-gray-500" title={transcription.created_at}>{relativeTime(transcription.created_at)}</div>
                                    </div>
                                </div>
                                <div className="tw-text-sm tw-text-gray-500">{formatDuration(transcription.duration)}</div>
                            </div>
                        ))}
                        <span className="tw-text-sm tw-text-gray-500">{flatTranscriptions.length} Items in Page {page}</span>
                        {hasMore ? (
                            <div className="tw-flex tw-justify-center tw-mx-4">
                                <div onClick={loadMore} className=" tw-my-4 tw-text-sm tw-text-gray-500 tw-font-medium tw-py-2 tw-px-4 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-bg-white hover:tw-bg-gray-50 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-indigo-500">
                                    More
                                </div>
                            </div>
                        ) : (
                            <div className="tw-text-sm tw-text-gray-500">No more transcriptions</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const Loader = () => (
    <div className="tw-flex tw-justify-center tw-mt-4">
        <div className="tw-loader tw-border-t-4 tw-border-b-4 tw-border-gray-400 tw-rounded-full tw-w-12 tw-h-12 tw-mr-2"></div>
    </div>
)
