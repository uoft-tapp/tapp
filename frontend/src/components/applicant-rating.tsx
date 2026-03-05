import React from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { FaComment, FaRegComment } from "react-icons/fa";
import { InstructorPreference } from "../api/defs/types";
import { EditFieldDialog } from "./edit-field-widgets";

const VARIAN_SEQUENCE: Record<string, string[]> = {
    null: ["outline", "outline", "outline", "outline"],
    "-1": ["outline", "outline", "outline", "danger"],
    "0": ["outline", "outline", "secondary", "outline"],
    "1": ["outline", "primary", "outline", "outline"],
    "2": ["success", "success", "outline", "outline"],
};

const RATING_TO_BG_COLOR: Record<string, string> = {
    null: "bg-light",
    "-1": "bg-danger",
    "0": "bg-secondary",
    "1": "bg-primary",
    "2": "bg-success",
};

const RATING_TO_DESCRIPTION: Record<string, string> = {
    null: "Unknown",
    "-1": "Not Suitable",
    "0": "Unknown",
    "1": "Suitable",
    "2": "Strongly Preferred",
};

export function ApplicantRating({
    rating,
    onChange,
}: {
    rating: number | null;
    onChange?: Function;
}) {
    const clampedRating =
        rating == null ? null : Math.max(Math.min(rating, 2), -1);
    const variants = VARIAN_SEQUENCE["" + clampedRating];
    const setRating = React.useCallback(
        (newRating: number) => {
            if (onChange) {
                onChange(newRating);
            }
        },
        [onChange]
    );

    return (
        <ButtonGroup
            aria-label="Applicant Rating"
            className="applicant-rating-buttons"
        >
            <Button
                variant={variants[0]}
                onClick={() => {
                    setRating(2);
                }}
                title="This applicant would make an outstanding TA for the position."
            >
                +
            </Button>
            <Button
                variant={variants[1]}
                onClick={() => {
                    setRating(1);
                }}
                title="This applicant would make a good TA for the position."
            >
                +
            </Button>
            <Button
                variant={variants[2]}
                onClick={() => {
                    setRating(0);
                }}
                title="Neutral or do not have enough information to rate."
            >
                ?
            </Button>
            <Button
                variant={variants[3]}
                onClick={() => {
                    setRating(-1);
                }}
                title="This applicant is not suitable for the position."
            >
                -
            </Button>
        </ButtonGroup>
    );
}

export function ApplicantComment({
    comment,
    onClick: _onClick,
}: {
    comment: null | string;
    onClick?: Function;
}) {
    const onClick = React.useCallback(() => {
        if (_onClick) {
            _onClick();
        }
    }, [_onClick]);

    if (comment == null) {
        return (
            <Button
                onClick={onClick}
                variant="outline"
                className="add-comment no-comment"
                title="Add comment"
            >
                <div className="comment-icon">
                    <FaRegComment />
                </div>
            </Button>
        );
    }
    return (
        <Button
            variant="outline"
            className="add-comment"
            title="Edit comment"
            onClick={onClick}
        >
            <div className="comment-container">{comment}</div>
            <div className="comment-icon full">
                <FaComment />
            </div>
        </Button>
    );
}

export function ApplicantRatingAndComment({
    instructorPreference,
    setInstructorPreference,
    compact = true,
}: {
    instructorPreference: InstructorPreference | null;
    setInstructorPreference?: Function;
    compact?: boolean;
}) {
    const rating = instructorPreference?.preference_level ?? null;
    const comment = instructorPreference?.comment || null;
    const setRating = React.useCallback(
        (rating: number) => {
            if (setInstructorPreference) {
                return setInstructorPreference({
                    ...(instructorPreference || {}),
                    preference_level: rating,
                });
            }
        },
        [setInstructorPreference, instructorPreference]
    );
    const setComment = React.useCallback(
        (comment: string | null) => {
            const trimmedComment =
                comment != null ? comment.trim() || null : null;
            if (setInstructorPreference) {
                return setInstructorPreference({
                    ...(instructorPreference || {}),
                    comment: trimmedComment,
                });
            }
        },
        [setInstructorPreference, instructorPreference]
    );
    const [editDialogShow, setEditDialogShow] = React.useState(false);

    let widget = null;
    if (compact) {
        widget = (
            <React.Fragment>
                <ApplicantRating rating={rating} onChange={setRating} />
                <ApplicantComment
                    comment={comment}
                    onClick={() => setEditDialogShow(true)}
                />
            </React.Fragment>
        );
    } else {
        widget = (
            <React.Fragment>
                <div>
                    <ButtonGroup vertical>
                        <LargeRatingButton
                            rating={2}
                            activeRating={rating}
                            onClick={() => setRating(2)}
                        />
                        <LargeRatingButton
                            rating={1}
                            activeRating={rating}
                            onClick={() => setRating(1)}
                        />
                        <LargeRatingButton
                            rating={0}
                            activeRating={rating}
                            onClick={() => setRating(0)}
                        />
                        <LargeRatingButton
                            rating={-1}
                            activeRating={rating}
                            onClick={() => setRating(-1)}
                        />
                    </ButtonGroup>
                </div>
                <div>
                    <Button
                        variant="light"
                        onClick={() => setEditDialogShow(true)}
                    >
                        <FaRegComment className="mb-1" /> Edit Comment
                    </Button>
                    <div>
                        {comment && <b className="me-2">Comment:</b>}
                        {comment || <i>No Comment</i>}
                    </div>
                </div>
            </React.Fragment>
        );
    }

    return (
        <div
            className={`applicant-rating-container ${
                compact ? "compact" : "expanded"
            }`}
        >
            {widget}
            <EditFieldDialog
                title="Comment"
                value={comment || ""}
                onChange={(c: string) => {
                    if (c) {
                        setComment(c);
                    } else {
                        setComment(null);
                    }
                }}
                show={editDialogShow}
                onHide={() => setEditDialogShow(false)}
                type="paragraph"
            />
        </div>
    );
}

function LargeRatingButton({
    onClick,
    rating,
    activeRating,
}: {
    rating: number | null;
    activeRating: number | null;
    onClick?: Function;
}) {
    const clampedRating =
        activeRating == null ? null : Math.max(Math.min(activeRating, 2), -1);
    return (
        <Button
            className={`py-0 ps-0 large-rating-button`}
            variant={clampedRating === rating ? "primary" : "light"}
            onClick={() => (onClick ? onClick() : undefined)}
        >
            <div>
                <DisplayRating rating={rating} />
            </div>
            <div>{RATING_TO_DESCRIPTION["" + rating]}</div>
        </Button>
    );
}

/**
 * Display the rating icon but not as a button.
 */
export function DisplayRating({ rating }: { rating: number | null }) {
    const clampedRating =
        rating == null ? null : Math.max(Math.min(rating, 2), -1);
    const bgColor = RATING_TO_BG_COLOR["" + rating];

    let inner = <span className={`display-rating ${bgColor}`}>?</span>;
    if (clampedRating === -1) {
        inner = (
            <span className={`display-rating ${bgColor} text-white`}>-</span>
        );
    }
    if (clampedRating === 0) {
        inner = (
            <span className={`display-rating ${bgColor} text-white`}>?</span>
        );
    }
    if (clampedRating === 1) {
        inner = (
            <span className={`display-rating ${bgColor} text-white`}>+</span>
        );
    }
    if (clampedRating === 2) {
        inner = (
            <React.Fragment>
                <span className={`display-rating ${bgColor} text-white`}>
                    +
                </span>
                <span className={`display-rating ${bgColor} text-white`}>
                    +
                </span>
            </React.Fragment>
        );
    }

    return <span className="display-rating-container">{inner}</span>;
}
