import { atom, useAtomValue, useSetAtom } from "jotai";
import Home from "./Home";
import AppContainer from "../components/AppContainer";
import { useEffect, useState } from "react";
import Settings from "./Settings";
import { authAtom, useAuthActions } from "../store/AuthStore";
import Transcriptions from "./Transcriptions";

const publicRoutes = (props) => ({
    settings: () => <Settings {...props} />,
    "": () => <Settings {...props} />
})

const routes = (props) => ({
    home: () => <Home {...props} />,
    settings: () => <Settings {...props} />,
    transcriptions: () => <Transcriptions {...props} />,
    // default
    "": () => <Home {...props} />
})

const computeRoute = (route, allowedRoutes, props) => {
    const computedAllowedRoutes = allowedRoutes(props);
    const matchedRoute = computedAllowedRoutes[route];
    if (matchedRoute) {
        return matchedRoute();
    }

    const defaultRoute = allowedRoutes(props)[""];

    return defaultRoute();
}

export const routeAtom = atom("home");

export const useRoute = () => {
    const setRoute = useSetAtom(routeAtom);
    return {
        navigate: (route) => setRoute(route)
    }
}

export default function AppRouter({ onHide }) {

    const auth = useAtomValue(authAtom);
    const route = useAtomValue(routeAtom)

    const { refresh } = useAuthActions();

    useEffect(() => {
        refresh();
    }, []);

    const isAuthenticated = auth.user !== null;

    const allowedRoutes = isAuthenticated ? routes : publicRoutes;

    return (
        <AppContainer currentRoute={route}>
            {computeRoute(route, allowedRoutes, { onHide })}
        </AppContainer>
    )
}

