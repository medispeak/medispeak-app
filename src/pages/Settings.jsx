import { useEffect, useState } from "react";
import { ExitIcon } from "../components/common/AppIcons";
import { useRoute } from "./AppRouter";
import { useAuthActions } from "../store/AuthStore";

// Save Access Key to `localStorage`
const saveAccessKey = (accessKey, callback) => {
    localStorage.setItem("access_token", accessKey);
    callback();
}

export default function Settings() {

    const { navigate } = useRoute();
    const { refresh } = useAuthActions();

    // State for Access Key
    const [accessKey, setAccessKey] = useState("");

    useEffect(() => {
        // Get Access Key from `localStorage`
        const localAccessKey = localStorage?.getItem("access_token");
        if (localAccessKey) {
            setAccessKey(localAccessKey);
        }
    }, []);

    // Settings Page to set "Access Key"; To be prefilled from `localStorage`; Show a hint to Sign Up at https://medispeak.in to get the Access Key
    return (
        <div className="tw-flex tw-h-full tw-flex-col">
            {/* Title & Page Title*/}

            <div className="tw-flex tw-justify-between tw-items-center tw-mx-4 tw-my-2">
                <span className="tw-text-base tw-font-bold tw-blue-800">Settings</span>
                <span className="tw-text-sm tw-font-semibold tw-flex tw-gap-2 tw-items-center">
                    MediSpeak
                    <button onClick={() => navigate('home')}>
                        <ExitIcon className="tw-h-4 tw-w-4 tw-flex-none tw-rounded-xl tw-cursor-pointer" />
                    </button>
                </span>
            </div>

            {/* Settings Form */}
            <div className="tw-flex tw-flex-col tw-gap-4 tw-mx-4 tw-my-2">
                <div className="tw-flex tw-flex-col tw-gap-2">
                    <label className="tw-text-sm tw-font-semibold tw-text-gray-800">Access Key</label>
                    <input
                        className="tw-rounded-lg tw-border tw-border-gray-300 tw-py-2 tw-px-4 tw-text-gray-800 tw-placeholder-gray-400 tw-text-sm tw-font-semibold"
                        placeholder="Enter Access Key"
                        value={accessKey}
                        onChange={(e) => setAccessKey(e.target.value)}
                    />
                </div>

                {/* Hint */}
                <div className="tw-flex tw-flex-col tw-gap-1 tw-mx-1 tw-my-2">
                    <span className="tw-text-xs tw-font-semibold tw-text-gray-800">Access Key is required to use MediSpeak</span>
                    <br />
                    <span className="tw-text-sm tw-font-semibold tw-text-gray-800">Don't have an Access Key?</span>
                    <span className="tw-text-xs tw-font-semibold tw-text-gray-600">
                        Sign Up at{" "}
                        <a href="https://medispeak.in" target="_blank" rel="noreferrer" className="tw-text-blue-600 tw-underline">https://medispeak.in</a>
                        {" "}to get the Access Key
                    </span>
                </div>
            </div>
            <div className="tw-flex tw-justify-center tw-items-center tw-mx-4 tw-my-2">
                <button
                    onClick={() => saveAccessKey(accessKey, refresh)}
                    className="tw-bg-blue-600 tw-text-white tw-rounded-lg tw-py-2 tw-px-4 tw-text-sm tw-font-semibold">
                    Save
                </button>
            </div>
        </div>

    )
}