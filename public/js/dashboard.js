var url;
function playThis(event) {
    url = $(event.target).attr("value")
    console.log(url)
    $('audio').attr('src', url);
}