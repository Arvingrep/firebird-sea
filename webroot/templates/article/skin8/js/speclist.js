$(function () {
    if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.listBox ul li:nth-child(3n)').css('margin-right','0');
    }
    $('.filter .fil span').click(function(){
        $(this).addClass('curr').siblings().removeClass('curr');
    });
});