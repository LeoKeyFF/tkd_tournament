function uploadFile() {
    const file = $('#file_input')[0].files[0];
    if (!file) {
        $('#status').text('Выберите файл');
        return;
    }
    const year = parseInt($('#year_input').val());
    if (Number.isNaN(year)) {
        $('#status').text('Укажите год');
        return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('year', year);

    $.ajax({
        type: "POST",
        url: '/upload',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response, status, jqXHR) {
            window.location.replace(response.redirect);
            // window.location.href = response.redirect;
        },
        error: function (jqXHR, textStatus, errorThrown) {
        },
        complete: function (jqXHR, textStatus) {
        }
    });
}