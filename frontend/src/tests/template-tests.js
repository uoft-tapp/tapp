import PropTypes from "prop-types";
import {
    checkPropTypes,
    offerTemplateMinimalPropTypes,
    offerTemplatePropTypes,
    errorPropTypes,
    expect,
    it,
    beforeAll,
    checkResponseSuccess
} from "./utils";
import { databaseSeeder } from "./setup";
/**
 * Tests for the API. These are encapsulated in a function so that
 * different `apiGET` and `apiPOST` functions can be passed in. For example,
 * they may be functions that make actual requests via http or they may
 * be from the mock API.
 *
 * @param {object} api
 * @param {Function} api.apiGET A function that when passed a route will return the get response
 * @param {Function} api.apiPOST A function that when passed a route and data, will return the post response
 */
export function templatesTests(api) {
    const { apiGET, apiPOST } = api;
    let session = null,
        testTemplates = null;

    const newTemplateData1 = {
        template_file: "this_is_a_test_template.html",
        template_name: "OTO"
    };
    const newTemplateData2 = {
        template_file: "this_is_a_test_template.html",
        template_name: "Invigilate"
    };
    // set up a session to be available before tests run

    beforeAll(async () => {
        await apiPOST("/debug/restore_snapshot");
        session = databaseSeeder.seededData.session;
    }, 30000);

    it("fetch available templates", async () => {
        const resp = await apiGET("/admin/available_contract_templates");

        checkResponseSuccess(resp);
        checkPropTypes(
            PropTypes.arrayOf(offerTemplateMinimalPropTypes),
            resp.payload
        );
    });

    it("add template to session", async () => {
        // grab the contract_templates of the new session. They may have
        // pre-populated.
        const resp1 = await apiGET(
            `/admin/sessions/${session.id}/contract_templates`
        );
        checkResponseSuccess(resp1);

        checkPropTypes(
            PropTypes.arrayOf(offerTemplatePropTypes),
            resp1.payload
        );

        // add the new offer template
        const resp2 = await apiPOST(
            `/admin/sessions/${session.id}/contract_templates`,
            newTemplateData1
        );

        checkResponseSuccess(resp2);
        checkPropTypes(offerTemplatePropTypes, resp2.payload);
        expect(resp2.payload).toMatchObject(newTemplateData1);

        // another one
        const resp3 = await apiPOST(
            `/admin/sessions/${session.id}/contract_templates`,
            newTemplateData2
        );
        checkResponseSuccess(resp3);

        // fetch all templates us the templates we just created
        const resp4 = await apiGET(
            `/admin/sessions/${session.id}/contract_templates`
        );

        expect(resp4.payload).toContainObject(newTemplateData1);
        expect(resp4.payload).toContainObject(newTemplateData2);

        testTemplates = resp4.payload;
    });

    it("update a template", async () => {
        // create template had been tested
        const templateToUpdate = testTemplates.filter(t => {
            return (
                t.template_file === newTemplateData2.template_file &&
                t.template_name === newTemplateData2.template_name
            );
        });

        expect(templateToUpdate.length).toBe(1);

        // update new template
        const updateData = {
            ...templateToUpdate[0],
            id: templateToUpdate[0].id,
            contract_name: "Standard"
        };
        const resp1 = await apiPOST(
            `/sessions/${session.id}/contract_templates`,
            updateData
        );

        checkResponseSuccess(resp1);
        expect(resp1.payload).toMatchObject(updateData);

        // make sure the template before update is gone
        const resp2 = await apiGET(
            `/sessions/${session.id}/contract_templates`
        );

        expect(resp2.payload).toContainObject(updateData);
    });

    // Backend API not checking empty props. Comment out the test case for now
    it("throw error when `template_file` or `template_name` is empty", async () => {
        const newTemplateData1 = {
            template_file: "",
            template_name: "Standard"
        };
        const newTemplateData2 = {
            template_file: "this_is_a_test_template.html",
            template_name: ""
        };

        // expected an error to crete new template with empty template_file
        const resp1 = await apiPOST(
            `/sessions/${session.id}/contract_templates`,
            newTemplateData1
        );
        expect(resp1).toMatchObject({ status: "error" });
        checkPropTypes(errorPropTypes, resp1);

        // expected an error to crete new template with empty template_name
        const resp2 = await apiPOST(
            `/sessions/${session.id}/contract_templates`,
            newTemplateData2
        );
        expect(resp2).toMatchObject({ status: "error" });
        checkPropTypes(errorPropTypes, resp2);

        // fetching the templates list and make sure it does not contain the above templates
        const resp3 = await apiGET(
            `/sessions/${session.id}/contract_templates`
        );
        expect(resp3.payload).not.toContainObject(newTemplateData1);
        expect(resp3.payload).not.toContainObject(newTemplateData2);
    });
}
