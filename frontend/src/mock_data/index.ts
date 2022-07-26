import { RawUser } from "../api/defs/types";
import applicants from "./applicants.json";
import assignments from "./assignments.json";
import contractTemplates from "./contract_templates.json";
import instructors from "./instructors.json";
import positions from "./positions.json";
import sessions from "./sessions.json";
import users from "./users.json";
import applications from "./applications.json";

export const seedData = {
    applicants,
    assignments,
    contractTemplates,
    instructors,
    positions,
    sessions,
    applications,
    users: users as Omit<RawUser, "id">[],
};
