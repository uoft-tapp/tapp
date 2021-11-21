import React from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { FaComment, FaRegComment } from "react-icons/fa";
import { EditFieldDialog } from "./edit-field-widgets";

const VARIAN_SEQUENCE: Record<string, string[]> = {
    null: ["outline", "outline", "outline", "outline"],
    "-1": ["outline", "outline", "outline", "danger"],
    "0": ["outline", "outline", "secondary", "outline"],
    "1": ["outline", "primary", "outline", "outline"],
    "2": ["success", "success", "outline", "outline"],
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

function ApplicantComment({
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

export function ApplicantRatingAndComment() {
    const [rating, setRating] = React.useState<null | number>(null);
    const [comment, setComment] = React.useState<null | string>(null);
    const [editDialogShow, setEditDialogShow] = React.useState(false);

    return (
        <div className="applicant-rating-container">
            <ApplicantRating rating={rating} onChange={setRating} />
            <ApplicantComment
                comment={comment}
                onClick={() => setEditDialogShow(true)}
            />{" "}
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
                type={"text"}
            />
        </div>
    );
}
