export function setGlobals(globals = {}, location = window.location) {
    const searchParams = new URLSearchParams();
    for (let [key, val] of Object.entries(globals)) {
        searchParams.append(key, JSON.stringify(val));
    }
    if (window.history.pushState && ("" + searchParams).length > 0) {
        const newurl =
            location.protocol +
            "//" +
            location.host +
            location.pathname +
            "?" +
            searchParams +
            location.hash;
        if (newurl !== "" + location) {
            window.history.pushState({ path: newurl }, "", newurl);
        }
    }
    return { type: "SET_GLOBALS", payload: globals };
}
