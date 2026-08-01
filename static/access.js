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
    var login = $('#login_to_log_in').val();
    if (password === ""){
        return
    }
    if (role != 'admin'){
        if (login === ''){
            return
        }
    }
    const dataToSend = { 
        password: password,
        role: role,
        login: login
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

function roleToName(role){
    if (role == "admin"){
        return "Админ"
    }
    else if (role == "pj"){
        return "Президент площадки"
    }
    else if (role == "judge"){
        return "Судья"
    }
    else if (role == "referee"){
        return "Рефери"
    }
}

function rolesLoginToChoose($element){
    $element.empty();
    $element.append(
        $('<option>',{
            value: 'admin',
            text: roleToName("admin")
        })
    )
    $element.append(
        $('<option>',{
            value: 'judge',
            text: roleToName("judge")
        })
    )
}
