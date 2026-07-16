function doYangsContent(ids, names){
    $('#doyangs_list').empty();
    for (let i = 0; i < ids.length; i++){
        doyangButton = $('<button>', {
            class: 'doyang-button',
            text: names[i]
        }).on('click', function() {
            $(this).toggleClass('active');
            current_doyang = ids[i]
            current_category = 0
            updateDinamicContent()
        });
        $('#doyangs_list').append(doyangButton);
    }
}

function categoriesContent(ids, names, doyangs){
    $('#categories_list').empty();
    for (let i = 0; i < ids.length; i++){
        if (doyangs[i] == current_doyang){
            categoryButton = $('<button>', {
                class: 'category-button',
                text: names[i]
            }).on('click', function() {
                $(this).toggleClass('active');
                current_category = ids[i]
                updateDinamicContent()
            });
            $('#categories_list').append(categoryButton);
        }
    }
}

function competitorsContent(ids, names, clubs, categories){
    $('#competitors_list').empty();
    for (let i = 0; i < ids.length; i++){
        if (categories[i] == current_category){
            competitorDiv = $('<div>', {
                class: 'competitor-div',
                text: names[i]
            });
            $('#competitors_list').append(competitorDiv);
        }
    }
}