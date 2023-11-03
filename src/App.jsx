import React, { useState, useEffect } from "react";
import { MediSpeakIcon } from "./components/common/AppIcons";
import AppRouter from "./pages/AppRouter";

import AudioRecorder from 'audio-recorder-polyfill'
window.MediaRecorder = AudioRecorder

function App() {
  const [showPopOver, setShowPopOver] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    if (showPopOver)
      setFirstLoad(false);
  }, [showPopOver]);

  const widthClasses = showPopOver ? "tw-w-full tw-max-w-sm" : "tw-w-24";

  return (
    <div className={`tw-container tw-fixed tw-bottom-0 tw-right-0 tw-flex tw-flex-col tw-px-2 tw-z-40 tw-font-sans ${widthClasses}`}>
      {/* Based on showPopOver, hide/show the AppRouter */}
      <div className={`tw-flex tw-justify-end tw-items-center tw-mt-2 tw-mb-4 ${showPopOver ? "" : "tw-hidden"}`}>
        <AppRouter onHide={() => setShowPopOver(false)} />
      </div>

      <div className="tw-flex tw-justify-end">
        <div
          className="tw-button tw-bg-blue-600 tw-relative tw-rounded-full tw-transition tw-w-14 tw-h-14 md:t-w-16 md:t-h-16 tw-my-2 md:t-my-3 tw-mx-2 tw-flex tw-items-center tw-justify-center tw-cursor-pointer tw-shadow-xl tw-text-white "
          onClick={() => setShowPopOver(!showPopOver)}
        >
          <span
            className={"tw-absolute tw-inline-flex tw-h-full tw-w-full tw-rounded-full tw-bg-primary tw-opacity-20 md:t-opacity-50 tw-z-10 " +
              (firstLoad ? "tw-animate-ping" : "")}
          ></span>
          <MediSpeakIcon className="tw-w-8 tw-h-8" />
        </div>
      </div>
    </div>
  );
}

export default App;
