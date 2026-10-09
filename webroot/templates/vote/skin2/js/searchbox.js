$(function () {
    $('.header .searchbox .searchkey').bind('focus',function () {
        $(this).closest('.searchbox').addClass('focus');
    });

    $('.header .searchbox .searchkey').bind('blur',function () {
        $(this).closest('.searchbox').removeClass('focus');
    });



    $('.searchbox form').submit(function(e){
        var val = $.trim($('.searchkey').val());
        if(val == ''){
            e.preventDefault();
        }
    });

    $('.isearch').bind('click', function () {
        $(this).closest('form').submit();
    })
});