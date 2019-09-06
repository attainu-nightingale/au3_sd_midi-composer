

function playThis(event) {
    var url = $(event.target).attr("value")
    console.log(url)
    $('audio').attr('src', url)
}


function deleteCreation(event) {
    var url = '/creations/delete/' + $(event.target).attr("value")
    $.ajax({
        url: url,
        type: 'delete'
    })
    window.location.replace('/dashboard')
}