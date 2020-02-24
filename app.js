const { desktopCapturer } = require('electron');

let desktopSharing = false;
let localStream;

function refresh() {
    $('select').imagepicker({
        hide_select: true
    });
}

function addSource(source) {
    console.log("HEHEHEHE")
    $('select').append($('<option>', {
        value: source.id.replace(":", ""),
        text: source.name
    }));
    $('select option[value="' + source.id.replace(":", "") + '"]').attr('data-img-src', source.thumbnail.toDataURL());
    refresh();
}

function showSources() {
    console.log("Hello");
    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        for (let source of sources) {
            console.log("Name: " + source.name);
            addSource(source);
        }
    });
}

function toggle() {
    if (!desktopSharing) {
        var id = ($('select').val()).replace(/window|screen/g, function(match) { return match + ":"; });
        onAccessApproved(id);
    } else {
        desktopSharing = false;

        if (localStream)
            localStream.getTracks()[0].stop();
        localStream = null;

        document.querySelector('button').innerHTML = "Enable Capture";

        $('select').empty();
        showSources();
        refresh();
    }
}

function onAccessApproved(desktop_id) {
    if (!desktop_id) {
        console.log('Desktop Capture access rejected.');
        return;
    }
    desktopSharing = true;
    document.querySelector('button').innerHTML = "Disable Capture";
    console.log("Desktop sharing started.. desktop_id:" + desktop_id);
    navigator.webkitGetUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: desktop_id,
                minWidth: 1280,
                maxWidth: 1280,
                minHeight: 720,
                maxHeight: 720
            }
        }
    }, gotStream, getUserMediaError);

    function gotStream(stream) {
        localStream = stream;

        document.querySelector('video').srcObject = localStream;
        stream.onended = function() {
            if (desktopSharing) {
                toggle();
            }
        };
    }

    function getUserMediaError(e) {
        console.log('getUserMediaError: ' + JSON.stringify(e, null, '---'));
    }
}

$(document).ready(function() {
    showSources();
    refresh();
});

document.querySelector('button').addEventListener('click', function() {
    toggle();
});