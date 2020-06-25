import { it } from "./utils";

// TODO: Remove eslint disable
// eslint-disable-next-line
export function offersTests({ apiGET, apiPOST }) {
    // maybe we don't need this in the API?
    it.todo("get offers for session");
    // maybe we don't need this in the API?
    it.todo("get offers for position");

    it.todo("get offer for assignment");
    it.todo("create an offer from an assignment");
    it.todo("error when attempting to create an offer for an assignment that has an active offer that is accepted/rejected/pending");
    it.todo("create an offer for an assignment that has an active offer that is withdrawn/preliminary");
    it.todo("accept/reject/withdraw offer");
    it.todo("increment nag count");
    it.todo("error when attempting to update a frozen field");
}
