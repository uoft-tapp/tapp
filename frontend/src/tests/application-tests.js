import { it, beforeAll } from "./utils";
import { databaseSeeder } from "./setup";

export function applicationsTests({ apiGET, apiPOST }) {
    beforeAll(async () => {
        await databaseSeeder.seed({ apiGET, apiPOST });
    }, 30000);

    it.todo("Get survey.js posting data through public route");
    it.todo(
        "Survey.js posting data is pre-filled based on prior applicant/application data"
    );
    it.todo("Can submit survey.js data via the public postings route");
    it.todo(
        "When submitting survey.js data an applicant and application are automatically created they don't exist"
    );
    it.todo(
        "When submitting survey.js data an applicant and application are updated if they already exist"
    );
    it.todo(
        "Even if a different utorid is submitted via survey.js data the active_user's utorid is used"
    );
    it.todo(
        "When submitting survey.js data cannot add a position_preference for a position not listed in the posting"
    );
    it.todo(
        "When submitting survey.js data attached files are stored on disk rather than as base64 strings in the database"
    );
}
