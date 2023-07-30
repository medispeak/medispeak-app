import React, { useState, useEffect } from "react";
import PopOver from "./components/PopOver";
import { MediSpeakIcon } from "./components/common/AppIcons";


function App() {
  const [showPopOver, setShowPopOver] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    if (showPopOver)
      setFirstLoad(false);
  }, [showPopOver]);

  return (
    <>
      {showPopOver && (
        <PopOver></PopOver>
      )}
      <div className="tw-flex tw-justify-end">
        <button
          className="tw-button tw-bg-blue-600 tw-relative tw-rounded-full tw-transition tw-w-14 tw-h-14 md:t-w-16 md:t-h-16 tw-my-2 md:t-my-3 tw-mx-2 tw-flex tw-items-center tw-justify-center tw-cursor-pointer tw-shadow-xl tw-text-white "
          onClick={() => setShowPopOver(!showPopOver)}
        >
          <span
            className={"tw-absolute tw-inline-flex tw-h-full tw-w-full tw-rounded-full tw-bg-blue-400 tw-z-10 " +
              (firstLoad ? "" : "")}
          ></span>
          <MediSpeakIcon className="text-white h-6 w-6" />
        </button>
      </div>
    </>
  );
}

export default App;
