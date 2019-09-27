var edit = function (event) {
    $('input').removeAttr('disabled');
    $('select').removeAttr('disabled');
    $('#saveButton').empty();
    $('#saveButton').append('<button type="button" id="save" class=" mt-3 mb-5 ml-auto btn btn-success px-3 py-2">Confirm & Save</button>')
    $('#save').click(function save() {
        var obj = {
            "firstname": $('#firstname').val().toString(),
            "lastname": $('#lastname').val().toString(),
            "gender": $('#gender').val().toString(),
            "email": $('#email').val().toString(),
        }
        $.ajax({
            url: '/profile/update',
            type: 'put',
            data: obj,
            success: function () {
                $('#alert').append('<div class="alert alert-success" role="alert">Profile Updated Successfully !!</div>');
            }
        })
    })
}