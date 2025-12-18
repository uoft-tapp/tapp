import { DragAndDropInterface } from "./drag-and-drop-interface";

import "./draft-matching.css";

/**
 * Matching view for drafting assignments. This is mainly used by the Math department.
 */
export function AdminDraftMatchingView() {
    return (
        <div className="page-body matching">
            <div className="matching-body">
                <DragAndDropInterface />
            </div>
            <div className="matching-footer page-actions">
                yy
                <div className="footer-button-separator" />
                zz
            </div>
        </div>
    );
}
