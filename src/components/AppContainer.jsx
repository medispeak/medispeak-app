export default function AppContainer({ children }) {
    return (
        <div className="tw-h-[30rem] md:t-h-[32rem] tw-bg-white tw-shadow-xl tw-rounded-lg tw-border tw-relative tw-w-full tw-text-gray-800">
            <div className="tw-flex tw-flex-col tw-h-full tw-justify-end">
                {children}
            </div>
        </div>
    );
}