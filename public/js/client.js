window.onload = function () {
    $('button').click(function() {
        var url = document.URL + 'button/' + $(this).attr('value') + '/press';
        console.log('Pressing button: ' + url);

        $.getJSON(url, function (data) {
            console.log('API response received: ' + JSON.stringify(data));
        });
    } );


}; //onload