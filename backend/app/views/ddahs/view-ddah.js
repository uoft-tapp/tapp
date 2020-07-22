function fetchHelper(url, init, action) {
    fetch(url, init)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            action(response);
        });
}

function postHelper(url, data, action) {
    var init = {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json; charset=utf-8"
        },
        method: "POST",
        body: JSON.stringify(data),
        credentials: "include" // This line is crucial in any fetch because it is needed to work with Shibboleth in production
    };
    fetchHelper(url, init, action);
}

function getFormData() {
    var ret = {
        decision: null,
        signature: null
    };
    if (document.querySelector("#radio-accept").checked) {
        ret.decision = "accept";
    }
    var sig = document.querySelector("#signature_name").value.trim();
    if (sig) {
        ret.signature = sig;
    }
    return ret;
}

function submitDecision() {
    var data = getFormData();
    if (data.decision === null) {
        alert(
            "You must choose to accept or reject the offer before submitting."
        );
        return;
    }
    if (data.decision === "accept" && data.signature === null) {
        alert("You must sign your name before submitting.");
        return;
    }
    // at this point, ask the user to confirm
    var confirmation = confirm(
        "Are you sure you want to acknowledge this DDAH?"
    );
    if (!confirmation) {
        return;
    }
    postHelper(
        "/public/ddahs/" + URL_TOKEN + "/" + data.decision,
        data,
        function() {
            window.location.reload(true);
        }
    );
}
