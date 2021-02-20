import PropTypes from "prop-types";
import {
    checkPropTypes,
    offerTemplateMinimalPropTypes,
    offerTemplatePropTypes,
    errorPropTypes,
    expect,
    it,
    beforeAll,
} from "./utils";
import fs from "fs";
import { databaseSeeder } from "./setup";
import { base64ToBytes, bytesToBase64 } from "../api/mockAPI/utils";
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
export function templatesTests(api, callback) {
    const { apiGET, apiPOST } = api;
    let session = null,
        testTemplates = null;

    const newTemplateData1 = {
        template_file: "this_is_a_test_template.html",
        template_name: "OTO",
    };
    const newTemplateData2 = {
        template_file: "this_is_a_test_template.html",
        template_name: "Invigilate",
    };
    // set up a session to be available before tests run

    beforeAll(async () => {
        await databaseSeeder.seed(api);
        session = databaseSeeder.seededData.session;
    }, 30000);

    it("fetch available templates", async () => {
        const resp = await apiGET("/admin/available_contract_templates");

        expect(resp).toHaveStatus("success");
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
        expect(resp1).toHaveStatus("success");

        checkPropTypes(
            PropTypes.arrayOf(offerTemplatePropTypes),
            resp1.payload
        );

        // add the new offer template
        const resp2 = await apiPOST(
            `/admin/sessions/${session.id}/contract_templates`,
            newTemplateData1
        );

        expect(resp2).toHaveStatus("success");
        checkPropTypes(offerTemplatePropTypes, resp2.payload);
        expect(resp2.payload).toMatchObject(newTemplateData1);

        // another one
        const resp3 = await apiPOST(
            `/admin/sessions/${session.id}/contract_templates`,
            newTemplateData2
        );
        expect(resp3).toHaveStatus("success");

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
        const templateToUpdate = testTemplates.filter((t) => {
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
            template_name: "Standard",
        };
        const resp1 = await apiPOST(
            `/admin/sessions/${session.id}/contract_templates`,
            updateData
        );

        expect(resp1).toHaveStatus("success");
        expect(resp1.payload).toMatchObject(updateData);

        // make sure the template before update is gone
        const resp2 = await apiGET(
            `/admin/sessions/${session.id}/contract_templates`
        );

        expect(resp2.payload).toContainObject(updateData);
    });

    // Backend API not checking empty props. Comment out the test case for now
    it("throw error when `template_file` or `template_name` is empty", async () => {
        const newTemplateData1 = {
            template_file: "",
            template_name: "Standard",
        };
        const newTemplateData2 = {
            template_file: "this_is_a_test_template.html",
            template_name: "",
        };

        // expected an error to crete new template with empty template_file
        const resp1 = await apiPOST(
            `/admin/sessions/${session.id}/contract_templates`,
            newTemplateData1
        );
        expect(resp1).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp1);

        // expected an error to crete new template with empty template_name
        const resp2 = await apiPOST(
            `/admin/sessions/${session.id}/contract_templates`,
            newTemplateData2
        );
        expect(resp2).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp2);

        // fetching the templates list and make sure it does not contain the above templates
        const resp3 = await apiGET(
            `/admin/sessions/${session.id}/contract_templates`
        );
        expect(resp3.payload).not.toContainObject(newTemplateData1);
        expect(resp3.payload).not.toContainObject(newTemplateData2);
    });

    it("Preview/download a template", async () => {
        // Because previewing a template involves reading a real file off the harddrive,
        // we need to first create a template corresponding to a real file.
        const resp = await apiGET("/admin/available_contract_templates");
        expect(resp).toHaveStatus("success");

        if (resp.payload.length === 0) {
            // XXX Fix: We should always have a contract template available for testing
            console.warn(
                "No contract templates available, so cannot test preview/download of contract templates"
            );
            return;
        }

        const { template_file } = resp.payload[0];

        const resp2 = await apiPOST(
            `/admin/sessions/${session.id}/contract_templates`,
            {
                template_file,
                template_name: "Example Template",
            }
        );
        expect(resp2).toHaveStatus("success");
        const newTemplate = resp2.payload;

        // Now we can try to download this template
        const resp3 = await apiGET(
            `/admin/contract_templates/${newTemplate.id}/view`
        );
        expect(resp3).toHaveStatus("success");
        expect(typeof resp3.payload).toBe("string");

        // Try to download the template
        const resp4 = await apiGET(
            `/admin/contract_templates/${newTemplate.id}/download`
        );
        expect(resp4).toHaveStatus("success");
        const downloadedTemplate = resp4.payload;
        expect(downloadedTemplate.file_name).toBe(template_file);
        expect(typeof downloadedTemplate.mime_type).toBe("string");
        // Make sure that we can decode the Base64 encoded file contents
        expect(base64ToBytes(downloadedTemplate.content)).toEqual(
            expect.anything()
        );
    });

    // An error will be thrown if a template with the same file name already exists.
    // Since we don't want to pollute the filesystem by creating random names, when
    // you implement this test, use node.js commands to detect and delete an existing
    // file
    it("upload a template", async () => {
        let template = {
            content: "Contents of the file",
            file_name: "TestTemplate.html",
        };

        template.content = bytesToBase64(template.content);
        checkPropTypes(offerTemplatePropTypes, template);

        const resp2 = await apiPOST(
            `/admin/contract_templates/upload`,
            template
        );
        expect(resp2).toHaveStatus("success");

        // Testing to ensure that duplicate file names are not added (need to fix mock API)
        const resp3 = await apiPOST(
            `/admin/contract_templates/upload`,
            template
        );
        expect(resp3).toHaveStatus("error");
        callback();
    });
}
