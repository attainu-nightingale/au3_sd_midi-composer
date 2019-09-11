function comp(event) {
    $('#alertTool').empty()
    var password = $('#password').val();
    var confirmPassword = $('#confirmPassword').val();
    var message = "Passwords don't Match"
    if (confirmPassword !== password) {
        $('#alertTool').append('<button type="button" class="btn btn-sm  btn-danger" data-toggle="tooltip" data-placement="right" title="Different Password Alert">' + message + '</button>')
    }
    else ($('#alertTool').empty())
}