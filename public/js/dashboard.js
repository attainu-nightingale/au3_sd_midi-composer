var url;
function playThis(event) {
    url = $(event.target).attr("value")
    console.log(url)
    $('audio').attr('src', url)
    // $.ajax({
    //     url: '/dashboard/albumArt/?url=' + url,
    //     type: 'GET',
    //     success: function (data) {
    //         $('#playerAlbumArt').attr('src', data[0].albumArt)
    //     }
    // })
}
