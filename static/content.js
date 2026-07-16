function doYangsContent(ids, names){
    $('#doyangs_list').empty();
    for (let i = 0; i < ids.length; i++){
        doyangButton = $('<button>', {
            class: 'doyang-button',
            text: names[i],
            onclick: function() {
                console.log(current_doyang);
                current_doyang = ids[i]
            }
        });
        $('#doyangs_list').append(doyangButton);
    }
}

function categoriesContent(ids, names, doyangs){
    $('#categories_list').empty();
    for (let i = 0; i < ids.length; i++){
        categoryButton = $('<button>', {
            class: 'category-button',
            text: names[i],
            onclick: function() {
                current_category = ids[i]
            }
        });
        $('#categories_list').append(categoryButton);
    }
}