import { expect, it, apiGET, apiPOST } from "./utils";

export function unknownRouteTests(api = { apiGET, apiPOST }) {
    const { apiGET } = api;

    it("should fail GET request with unknown '/api' routes", async () => {
        const resp = await apiGET("/some_string");
        expect(resp).toMatchObject({ status: "error" });
    });
}
