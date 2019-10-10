$('#password, #confirmPassword').on('keyup', function(){
    $('#alertTool').empty()
    let password = $('#password').val();
    let confirmPassword = $('#confirmPassword').val();
    let message = "Passwords don't Match"
    if ((confirmPassword !== password) || password.length==0) {
        $('#alertTool').append('<button type="button" class="btn btn-sm  btn-danger mb-2" data-toggle="tooltip" data-placement="right" title="Different Password Alert">' + message + '</button>')
        $(".sub-btn").prop("disabled", true);
    }
    else
    {
        $(".sub-btn").prop("disabled", false);
        $('#alertTool').empty();
    }
});
