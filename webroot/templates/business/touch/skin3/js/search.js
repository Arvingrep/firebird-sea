$(function () {
    //APP端取消下拉刷新
    toggleDragRefresh('off');
    $('#keyword').on('click',function(){
       
      $('#keyword').focus();
    })
    $('#keyword').click();

    $('.search-time ul li').click(function () {
        var t = $(this);
        t.toggleClass('active').siblings().removeClass('active');
        if(t.hasClass('active')){
            $('#seach_date').val(t.attr('date-time'));
        }else{
            $('#seach_date').val('');
        }
    });


    $('.textIn-box').submit(function(e){
        var keywords = $('#keyword').val();
        // e.preventDefault();
    })
    //点击搜索按钮
    $('.search-btn').click(function(){
        $('.textIn-box').submit();
    });
    $('.search-history').hide();

    //点击搜索记录时搜索
    $('.search-history,.search-hot').delegate('li','click',function(){
        var keywords= $(this).find('a').text();
        $('#keyword').val(keywords);
        $('.textIn-box').submit();

    })

    //加载历史记录
    var hlist = [];
    var history = utils.getStorage(history_search);
    if(history){
        history.reverse();
        for(var i = 0; i < history.length; i++){
            hlist.push('<li><a href="javascript:;">'+history[i]+'</a></li>');
        }
        $('.search-history ul').html(hlist.join(''));
        $('.search-history').show();
    }
    
    // 清除历史记录
    $('.btn-del').click(function () {
        utils.removeStorage(history_search);
        $('.search-history').hide();
        $('.history-box').html(' ');
    });


});


var history_search = 'index_history_search';

$('.textIn-box').submit(function(e){
    var keywords = $('#keyword').val();
    //记录搜索历史
    var history = utils.getStorage(history_search);
    history = history ? history : [];
    if(history && history.length >= 10 && $.inArray(keywords, history) < 0){
        history = history.slice(1);
    }
    // 判断是否已经搜过
    if($.inArray(keywords, history) > -1){
        for (var i = 0; i < history.length; i++) {
            if (history[i] === keywords) {
                history.splice(i, 1);
                break;
            }
        }
    }
    history.push(keywords);
    var hlist = [];
    for(var i = 0; i < history.length; i++){
        hlist.push('<li><a href="javascript:;">'+history[i]+'</a></li>');
    }
    $('.search-history ul').html(hlist.join(''));
    $('.search-history').show();

    utils.setStorage(history_search, JSON.stringify(history));
})