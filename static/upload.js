function uploadFile() {
    const file = $('#file_input')[0].files[0];
    if (!file) {
        $('#status').text('Выберите файл');
        return;
    }
    const formData = new FormData();
    formData.append('file', file);

    $.ajax({
        type: "POST",
        url: '/upload',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response, status, jqXHR) {
            window.location.href = response.redirect;
        },
        error: function (jqXHR, textStatus, errorThrown) {
        },
        complete: function (jqXHR, textStatus) {
        }
    });
}