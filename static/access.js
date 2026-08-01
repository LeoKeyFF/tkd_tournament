function checkAccess(role) {
    $.ajax({
        url: "/api/auth/status",
        method: "GET",
        dataType: "json",
        data: {
            role: role
        },
        success: function (response) {
            if (response.success) {
                $("#access_role").text(response.role);
            } else {
                window.location.replace(response.redirect);
            }
        }
    });
}

function logIn(){
    var password = $('#password_to_log_in').val();
    var role = $('#choose_role').val();
    if (password === ""){
        return
    }
    const dataToSend = { 
        password: password,
        role: role
    };
    $.ajax({
        type: "POST",
        url: '/api/auth/login',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dataToSend),
        success: function (response, status, jqXHR) {
            if (response.success) {
                window.location.replace(response.redirect);
            }
            else {
                $('#login_error').text('Eggog')
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
        },
        complete: function (jqXHR, textStatus) {
        }
    });
}

function logOut(){
    $.ajax({
        type: "POST",
        url: '/api/auth/logout',
        success: function (response, status, jqXHR) {
            if (response.success) {
                window.location.replace(response.redirect);
            }
            else {
                $('#login_error').text('Eggog')
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
        },
        complete: function (jqXHR, textStatus) {
        }
    });
}