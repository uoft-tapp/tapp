import { useDispatch } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "../rootReducer";

/**
 * A properly typed version of `useDispatch` for use with TypeScript.
 * The types of the `dispatch` function returned by `useDispatch` don't
 * recognize when the dispatched object is an asynchronous thunk.
 * This means that the linter will claim that the `await` keyword is unneeded,
 * even though it is. This properly typed version fixes that issue.
 */
export const useThunkDispatch = useDispatch as () => ThunkDispatch<
    RootState,
    void,
    AnyAction
>;
