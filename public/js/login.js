function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function alert() {
    if (window.location.href !== window.location.host + window.location.pathname) {
        var errorMessage = getUrlParameter('error')
        var message = '<div class="alert alert-danger" role = "alert">' + errorMessage + '</div>'
    }

    $('#alertFail').append(message)
}

alert()

