export const readFile = (component, loadDataFunc) => {
    let files = component.files;
    if (files.length > 0) {
        const reader = new FileReader();
        let importFunc = importChoices(files[0].name, loadDataFunc);
        reader.readAsText(files[0]);
        reader.onload = (event) => importFunc(event.target.result);
    }
    component.value = "";
};

export const downloadFile = async (route, loadMessage) => {
    try {
        const res = await fetch(route);
        if (res.status === 200) {
            const blob = await res.blob();
            let filename = getFilename(res);
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(blob, filename); //special case for Edge & IE
            } else {
                let url = URL.createObjectURL(blob),
                    a = document.createElement("a");
                a.href = url;
                a.download = filename;
                a.target = "_self"; //required in FF
                a.style.display = "none";
                document.body.appendChild(a); //required in FF
                a.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(a); //required in FF
            }
            loadMessage(optSuccess(true, null));
        } else {
            const err = await res.json();
            loadMessage(optSuccess(false, err));
        }
    } catch (err) {
        loadMessage(optSuccess(false, err));
    }
};

const optSuccess = (success, content) => {
    return {
        success: success,
        content: content,
    };
};

const getFilename = (res) => {
    try {
        return res.headers
            .get("Content-Disposition")
            .match(/filename="(.*)"/)[1];
    } catch (err) {
        return "Untitled";
    }
};

const importChoices = (file, loadDataFunc) => {
    switch (getExtension(file)) {
        case ".json":
            return (data) => {
                try {
                    loadDataFunc(optSuccess(true, JSON.parse(data)));
                } catch (err) {
                    loadDataFunc(optSuccess(false, err));
                }
            };
        default:
            return (data) => {
                loadDataFunc(optSuccess(true, data));
            };
    }
};

const getExtension = (file) => {
    let extension = file.match(/\.\w+$/g);
    if (extension.length > 0) return extension[0];
    else return null;
};
