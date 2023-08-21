import { atom, useAtomValue, useSetAtom } from "jotai";
import Home from "./Home";
import AppContainer from "../components/AppContainer";
import { useState } from "react";
import Settings from "./Settings";

const routes = {
    home: () => <Home />,
    settings: () => <Settings />,
    // default
    "": () => <Home />
}

const computeRoute = (route) => {
    const matchedRoute = routes[route];
    if (matchedRoute) {
        return matchedRoute();
    }

    const defaultRoute = routes[""];

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

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const route = useAtomValue(routeAtom)

    return (
        <AppContainer>
            {computeRoute(route)}
        </AppContainer>
    )
}

