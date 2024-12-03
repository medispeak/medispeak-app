import { useRoute } from "../pages/AppRouter";
import { useAtom } from "jotai";
import { notificationAtom } from "../store/notifications";
import { Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";

export default function AppContainer({ currentRoute, children }) {
  const { navigate } = useRoute();
  const [notifications, setNotifications] = useAtom(notificationAtom);

  const tabs = [
    { name: "Home", route: "home" },
    { name: "History", route: "transcriptions" },
    { name: "Settings", route: "settings" },
  ].map((tab) => ({
    ...tab,
    current: tab.route === currentRoute,
  }));

  return (
    <div className="tw-h-[30rem] md:t-h-[32rem] tw-bg-white tw-shadow-xl tw-rounded-lg tw-border tw-relative tw-w-full tw-text-gray-800">
      <div className="tw-flex tw-flex-col tw-h-full tw-justify-end">
        <div className="tw-flex tw-gap-4 tw-px-2">
          <div className="tw-border-b tw-border-gray-200 tw-w-full">
            <nav className="-tw-mb-px tw-flex tw-space-x-4" aria-label="Tabs">
              {tabs.map((tab) => (
                <a
                  key={tab.name}
                  href={tab.href}
                  className={
                    (tab.current
                      ? "tw-border-indigo-500 tw-text-indigo-600"
                      : "tw-border-transparent tw-text-gray-500 tw-hover:border-gray-300 tw-hover:text-gray-700") +
                    " tw-whitespace-nowrap tw-border-b-2 tw-py-2 tw-px-1 tw-text-sm tw-font-medium tw-cursor-pointer"
                  }
                  aria-current={tab.current ? "page" : undefined}
                  onClick={() => navigate(tab.route)}
                >
                  {tab.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
        <div className="tw-w-full">
          {/* Notification Banner */}
          {notifications.map((notification, index) => (
            <Transition
              key={index}
              show={true}
              enter="tw-transform tw-ease-out tw-duration-300 tw-transition"
              enterFrom="tw-translate-y-[-100%]"
              enterTo="tw-translate-y-0"
              leave="tw-transition tw-ease-in tw-duration-100"
              leaveFrom="tw-opacity-100"
              leaveTo="tw-opacity-0"
            >
              <div
                className={`tw-shadow-md ${getBannerColor(notification.type)}`}
              >
                <div className="tw-px-3 tw-py-2 tw-flex tw-items-center tw-justify-between">
                  <div className="tw-flex tw-items-center">
                    <p className="tw-text-sm tw-font-medium tw-text-white">
                      {notification.title}
                      {notification.message && (
                        <span className="tw-ml-2 tw-text-white tw-opacity-90">
                          {notification.message}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="tw-flex tw-rounded-md tw-p-1.5 hover:tw-bg-black/10"
                    onClick={() =>
                      setNotifications((currentNotifications) =>
                        currentNotifications.filter((n) => n !== notification)
                      )
                    }
                  >
                    <XMarkIcon className="tw-h-5 tw-w-5 tw-text-white" />
                  </button>
                </div>
              </div>
            </Transition>
          ))}
        </div>
        <div className="tw-flex-1 tw-overflow-auto">{children}</div>
      </div>
    </div>
  );
}

function getBannerColor(type) {
  switch (type) {
    case "success":
      return "tw-bg-green-500";
    case "error":
      return "tw-bg-red-500";
    case "info":
    default:
      return "tw-bg-blue-500";
  }
}
