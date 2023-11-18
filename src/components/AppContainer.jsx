import { useRoute } from "../pages/AppRouter";

const tabs = [
    { name: "Home", route: "home" },
    { name: "History", route: "transcriptions" },
    { name: "Settings", route: "settings" },
];

export default function AppContainer({ currentRoute, children }) {
    const { navigate } = useRoute();

    const tabs = [
        { name: "Home", route: "home" },
        { name: "History", route: "transcriptions" },
        { name: "Settings", route: "settings" },
    ].map((tab) => ({
        ...tab,
        current: tab.route === currentRoute,
    }));

    return (
        <div className="tw-h-[30rem] md:t-h-[32rem] tw-bg-white tw-shadow-xl tw-rounded-lg tw-border tw-relative tw-w-full tw-text-gray-800" >
            <div className="tw-flex tw-flex-col tw-h-full tw-justify-end">
                <div className="tw-flex tw-gap-4 tw-px-2">
                    <div className="tw-border-b tw-border-gray-200 tw-w-full">
                        <nav className="-tw-mb-px tw-flex tw-space-x-4" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <a
                                    key={tab.name}
                                    href={tab.href}
                                    className={(
                                        (tab.current
                                            ? 'tw-border-indigo-500 tw-text-indigo-600'
                                            : 'tw-border-transparent tw-text-gray-500 tw-hover:border-gray-300 tw-hover:text-gray-700') +
                                        ' tw-whitespace-nowrap tw-border-b-2 tw-py-2 tw-px-1 tw-text-sm tw-font-medium tw-cursor-pointer'
                                    )}
                                    aria-current={tab.current ? 'page' : undefined}
                                    onClick={() => navigate(tab.route)}
                                >
                                    {tab.name}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>
                <div className="tw-flex-1 tw-overflow-auto">{children}</div>
            </div>
        </div >
    );
}