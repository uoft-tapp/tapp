import React from "react"

const DisplayInstructors = ({ original: { instructors } }) => {
    return (
        <span>
            {instructors
                .map(({ first_name, last_name }) => `${first_name} ${last_name}`)
                .join(", ")}
        </span>
    )
}

export default DisplayInstructors
