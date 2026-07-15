function addDoYang(){

    var text = $('#DoYangInput').val();
    $('#DoYangInput').val("");

    const dataToSend = { 
        name: text
    };

    $.ajax({
        type: "POST",
        url: '/add_doyang',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dataToSend),
        dataType: 'json',
        success: function (response, status, jqXHR) {
            
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Error handling
        },
        complete: function (jqXHR, textStatus) {
            
        }
    });
}