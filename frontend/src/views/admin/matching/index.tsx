import React from "react";
import { ContentArea } from "../../../components/layout";
import { useSelector } from "react-redux";
import { activeSessionSelector, fetchPostings } from "../../../api/actions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { GroupedOverview } from "./grouped-overview";

export function AdminMatchingView() {
    const activeSession = useSelector(activeSessionSelector);
    const dispatch = useThunkDispatch();

    // We don't load postings by default, so we load them dynamically whenever
    // we view this page.
    React.useEffect(() => {
        async function fetchResources() {
            return await dispatch(fetchPostings());
        }

        if (activeSession) {
            fetchResources();
        }
    }, [activeSession, dispatch]);

    return (
        <div className="page-body">
            <ContentArea>
                <h4>Assignments Summary</h4>
                <GroupedOverview />
            </ContentArea>
        </div>
    );
}
