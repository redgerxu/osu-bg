const loadBtn = document.getElementById("load");

loadBtn.addEventListener("click", async () => {
    const stuff = await getData();

    if (stuff == {}) {
        alert("No backgrounds were found (please report an error)");
        return;
    }

    const { regular, x2 } = stuff;

    chrome.tabs.create({ url: regular });
    chrome.tabs.create({ url: x2 });
});

async function getData() {
    const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
    });

    if (tab) {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                return document.documentElement.outerHTML;
            },
        });

        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else {
            const html = document.createElement("html");
            html.innerHTML = results[0].result;

            const backgroundElement = html.getElementsByClassName(
                "beatmapset-cover beatmapset-cover--full"
            );

            if (isOsu(tab.url)) {
                return links(
                    backgroundElement[0].getAttribute("style").toString()
                );
            }
        }
    }

    return {};
}

/**
 * `download` creates a download prompt for the background of the beatmap
 * @param {string} styleContent
 */
function links(styleContent) {
    // let segments = url.split("/");

    // segments = segments.slice(segments.length - 2);

    // segments[0] = segments[0].slice(0, segments[0].indexOf("#"));

    // const [setId] = segments;

    const regular = styleContent.match(
        /https:\/\/assets\.ppy\.sh\/beatmaps\/[0-9]+\/covers\/[a-z]+\.[a-z]+/
    )[0];

    const x2 = styleContent.match(
        /https:\/\/assets\.ppy\.sh\/beatmaps\/[0-9]+\/covers\/[a-z]+@2x\.[a-z]+/
    )[0];

    return {
        regular: regular,
        x2: x2,
    };
}

/**
 * `isOsu` returns whether the url matches an osu! beatmap page link
 * @param {string} url
 * @returns whether the url matches an osu! beatmap page link
 */
function isOsu(url) {
    return (
        url.match(
            /https:\/\/osu\.ppy\.sh\/beatmapsets\/[0-9]+#[a-z]+\/[0-9]+/
        )[0] == url
    );
}
