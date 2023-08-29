import { atom, useAtomValue, useSetAtom } from "jotai";
import Home from "./Home";
import AppContainer from "../components/AppContainer";
import { useEffect, useState } from "react";
import Settings from "./Settings";
import { authAtom, useAuthActions } from "../store/AuthStore";

const publicRoutes = {
    settings: () => <Settings />,
    "": () => <Settings />
}

const routes = {
    home: () => <Home />,
    settings: () => <Settings />,
    // default
    "": () => <Home />
}

const computeRoute = (route, allowedRoutes) => {
    const matchedRoute = allowedRoutes[route];
    if (matchedRoute) {
        return matchedRoute();
    }

    const defaultRoute = allowedRoutes[""];

    return defaultRoute();
}

export const routeAtom = atom("home");

export const useRoute = () => {
    const setRoute = useSetAtom(routeAtom);
    return {
        navigate: (route) => setRoute(route)
    }
}

export default function AppRouter() {

    const auth = useAtomValue(authAtom);
    const route = useAtomValue(routeAtom)

    const { refresh } = useAuthActions();

    useEffect(() => {
        refresh();
    }, []);

    const isAuthenticated = auth.user !== null;

    const allowedRoutes = isAuthenticated ? routes : publicRoutes;

    return (
        <AppContainer>
            {computeRoute(route, allowedRoutes)}
        </AppContainer>
    )
}

