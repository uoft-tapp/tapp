import {
    FETCH_ONE_OFFER_SUCCESS,
    SET_OFFER_ACCEPTED_SUCCESS,
    SET_OFFER_REJECTED_SUCCESS,
    OFFER_CREATE_SUCCESS,
    OFFER_EMAIL_SUCCESS,
    OFFER_NAG_SUCCESS,
    OFFER_WITHDRAW_SUCCESS,
} from "../constants";
import { fetchError } from "./errors";
import { actionFactory, HasId, validatedApiDispatcher } from "./utils";
import { apiGET, apiPOST } from "../../libs/api-utils";
import { fetchAssignment } from "./assignments";
import { activeRoleSelector } from "./users";
import { Assignment, RawOffer } from "../defs/types";

// actions
// XXX These actions don't actually do anything ATM; They're here in case we want to incorporate
// this information into the reducer at some point.
export const fetchOfferSuccess = actionFactory<RawOffer>(
    FETCH_ONE_OFFER_SUCCESS
);
export const setOfferAcceptedSuccess = actionFactory<RawOffer>(
    SET_OFFER_ACCEPTED_SUCCESS
);
export const setOfferRejectedSuccess = actionFactory<RawOffer>(
    SET_OFFER_REJECTED_SUCCESS
);
export const offerCreateSuccess = actionFactory<RawOffer>(OFFER_CREATE_SUCCESS);
export const offerEmailSuccess = actionFactory<RawOffer>(OFFER_EMAIL_SUCCESS);
export const offerNagSuccess = actionFactory<RawOffer>(OFFER_NAG_SUCCESS);
export const offerWithdrawSuccess = actionFactory<RawOffer>(
    OFFER_WITHDRAW_SUCCESS
);

// dispatchers
export const fetchActiveOfferForAssignment = validatedApiDispatcher({
    name: "fetchActiveOfferForAssignment",
    description: "Fetch an offer associated with an assignment",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiGET(
            `/${role}/assignments/${payload.id}/active_offer`
        )) as RawOffer;
        dispatch(fetchOfferSuccess(data));
        return data;
    },
});

export const setOfferForAssignmentAccepted = validatedApiDispatcher({
    name: "setOfferForAssignmentAccepted",
    description: "Set an offer as accepted",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (assignment: Assignment) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiPOST(
            `/${role}/assignments/${assignment.id}/active_offer/accept`
        );
        dispatch(setOfferAcceptedSuccess(data));
        // After we update an offer, we should refetch the assignment to make sure
        // there isn't stale data
        await dispatch(fetchAssignment(assignment));
    },
});

export const setOfferForAssignmentRejected = validatedApiDispatcher({
    name: "setOfferForAssignmentRejected",
    description: "Set an offer as rejected",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (assignment: Assignment) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiPOST(
            `/${role}/assignments/${assignment.id}/active_offer/reject`
        );
        dispatch(setOfferRejectedSuccess(data));
        // After we update an offer, we should refetch the assignment to make sure
        // there isn't stale data
        await dispatch(fetchAssignment(assignment));
    },
});

export const offerForAssignmentWithdraw = validatedApiDispatcher({
    name: "offerForAssignmentWithdraw",
    description: "Withdraw an offer",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (assignment: Assignment) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiPOST(
            `/${role}/assignments/${assignment.id}/active_offer/withdraw`
        );
        dispatch(offerWithdrawSuccess(data));
        // After we update an offer, we should refetch the assignment to make sure
        // there isn't stale data
        await dispatch(fetchAssignment(assignment));
    },
});

export const offerForAssignmentCreate = validatedApiDispatcher({
    name: "offerForAssignmentCreate",
    description: "Create an offer",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (assignment: Assignment) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiPOST(
            `/${role}/assignments/${assignment.id}/active_offer/create`
        );
        dispatch(offerCreateSuccess(data));
        // After we update an offer, we should refetch the assignment to make sure
        // there isn't stale data
        await dispatch(fetchAssignment(assignment));
    },
});

export const offerForAssignmentEmail = validatedApiDispatcher({
    name: "offerForAssignmentEmail",
    description: "Email an offer",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (assignment: Assignment) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiPOST(
            `/${role}/assignments/${assignment.id}/active_offer/email`
        );
        dispatch(offerEmailSuccess(data));
        // After we update an offer, we should refetch the assignment to make sure
        // there isn't stale data
        await dispatch(fetchAssignment(assignment));
    },
});

export const offerForAssignmentNag = validatedApiDispatcher({
    name: "offerForAssignmentNag",
    description: "Send a nag email for an offer",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (assignment: Assignment) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiPOST(
            `/${role}/assignments/${assignment.id}/active_offer/nag`
        );
        dispatch(offerNagSuccess(data));
        // After we update an offer, we should refetch the assignment to make sure
        // there isn't stale data
        await dispatch(fetchAssignment(assignment));
    },
});
