import { it, apiGET, apiPOST, toMatchObjectDebug } from "./utils";

export function unknownRouteTests(api = { apiGET, apiPOST }) {
    const { apiGET } = api;

    it("should fail GET request with unknown '/api' routes", async () => {
        const resp = await apiGET("/some_string");
        toMatchObjectDebug(resp, { status: "error" });
    });
}
