function confirmProtocol(){
    $.ajax({
        type: "POST",
        url: '/api/confirm_protocol',
        contentType: 'application/json; charset=utf-8',
        success: function (response, status, jqXHR) {
            window.location.replace(response.redirect);
        },
        error: function (jqXHR, textStatus, errorThrown) {
        },
        complete: function (jqXHR, textStatus) {
        }
    });
}

function rejectProtocol(){
    $.ajax({
        type: "POST",
        url: 'api/delete_tournament',
        contentType: 'application/json; charset=utf-8',
        success: function (response, status, jqXHR) {
            window.location.replace(response.redirect);
        },
        error: function (jqXHR, textStatus, errorThrown) {
        },
        complete: function (jqXHR, textStatus) {
        }
    });
}