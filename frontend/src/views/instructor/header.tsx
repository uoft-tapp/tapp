import React from "react";
import { useSelector } from "react-redux";
import { positionsSelector } from "../../api/actions/positions";
import { Header } from "../../components/header";
import {
    ConnectedActiveSessionDisplay,
    ConnectedActiveUserDisplay,
} from "../common/header-components";

/**
 * Header showing the routes that a user with `role=instructor`
 * can see.
 *
 * @returns
 */
export function InstructorHeader() {
    const positions = useSelector(positionsSelector);
    const routes = positions.map((position) => ({
        route: `/${position.id}`,
        name:
            `${position.position_code} ${position.position_title}` ||
            `Position #${position.id}`,
        description: `View information about position ${position.position_code} ${position.position_title}`,
        subroutes: [
            {
                route: `/assignments`,
                name: `TA Information`,
                description: `View information about your TAs`,
            },
            {
                route: `/ddahs`,
                name: `DDAHs`,
                description: `Manage your TAs' DDAH forms`,
            },
        ],
    }));

    return (
        <Header
            routes={routes}
            infoComponents={[
                <ConnectedActiveSessionDisplay key={0} />,
                <ConnectedActiveUserDisplay key={1} />,
            ]}
        />
    );
}
