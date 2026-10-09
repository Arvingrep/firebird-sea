var history_search = 'index_history_search';
$(function () {

    var loadMoreLock = false, page = 1, isend = false;

    //点击搜索按钮
    $('.btn-go').click(function () {
        var keywords = $('#keywords').val()
        $('.textIn-box ').submit();
    });

    //点击搜索记录时搜索
    $('.search-history,.search-hot').delegate('li', 'click', function () {
        var keywords = $(this).find('a').text();
        $('#keywords').val(keywords);
        //		alert($('#keywords').val())
        $('.textIn-box ').submit();
    })

    //切换导航
    $('.slideNav a').click(function () {
        $(this).addClass('slide-on').siblings().removeClass('slide-on');
        $('#action').val($('.slide-on').attr('data-action'));
    });
    $('.slideNav a').first().click();

    //加载历史记录
    var hlist = [];
    var history = utils.getStorage(history_search);
    if (history) {
        history.reverse();
        for (var i = 0; i < history.length; i++) {
            hlist.push('<li><a href="javascript:;">' + history[i] + '</a></li>');
        }
        $('.search-history ul').html(hlist.join(''));
        $('.all_shan, .search-history').show();
    }

    //清空
    $('.all_shan').bind('click', function () {
        utils.removeStorage(history_search);
        $('.all_shan, .search-history').hide();
        $('.search-history ul').html('');
    });

    $('.textIn-box').submit(function (e) {
        var keywords = $('#keywords').val();
        //记录搜索历史
        var history = utils.getStorage(history_search);
        history = history ? history : [];
        if (history && history.length >= 10 && $.inArray(keywords, history) < 0) {
            history = history.slice(1);
        }
        // 判断是否已经搜过
        if ($.inArray(keywords, history) > -1) {
            for (var i = 0; i < history.length; i++) {
                if (history[i] === keywords) {
                    history.splice(i, 1);
                    break;
                }
            }
        }
        history.push(keywords);
        var hlist = [];
        for (var i = 0; i < history.length; i++) {
            hlist.push('<li><a href="javascript:;">' + history[i] + '</a></li>');
        }
        $('.search-history ul').html(hlist.join(''));
        $('.all_shan, .search-history').show();
    
        utils.setStorage(history_search, JSON.stringify(history));
    })

})