let url;
function playThis(event) {
    url = $(event.target).attr("value")
    $('audio').attr('src', url);
}