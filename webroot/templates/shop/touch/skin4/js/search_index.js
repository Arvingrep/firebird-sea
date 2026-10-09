var history_search = 'index_history_search';
$(function(){
    //加载历史记录
    var hlist = [];
    var history = utils.getStorage(history_search);
    if(history){
        history.reverse();
        for(var i = 0; i < history.length; i++){
          if(history[i]){
            hlist.push('<li>'+history[i]+'</li>');
          }
        }
        $('.search_result ul').html(hlist.join(''));
        $('.search_result').show();
    }
    //搜索提交
    $('#keywords').keydown(function(e){
        if(e.keyCode==13){
            var keywords = $('#keywords').val();
            if(!keywords){
                return false;
            }
            //记录搜索历史
            var history = utils.getStorage(history_search);
            history = history ? history : [];
            if(history && history.length >= 10 && $.inArray(keywords, history) < 0){
                history = history.slice(1);
            }
            if(keywords!='' &&keywords!=' '){
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
            }

            var hlist = [];
            for(var i = 0; i < history.length; i++){
                hlist.push('<li>'+history[i]+'</li>');
            }
            $('.search_result ul').html(hlist.join(''));
            $('.search_result').show();
            utils.setStorage(history_search, JSON.stringify(history));
        }
    })
    //监听input
    $("#keywords").bind('input propertychange', function() {
        var tVal = $(this).val();
        if(tVal !=""){
            $('.cancelSear').show();
        }else{
            $('.cancelSear').hide();
        }
    })

    //取消
    $('.cancelSear').click(function(){
        $(this).hide();
        $('#keywords').val("");
    })

    $('.cancel_btn').click(function(){
        //window.location.href = liveUrl;
        $('.header .goBack').click();
    })

    //清空搜索历史
    $('.deletHis').click(function(){
        $('.mask').show();
        $('.orderAlert').addClass('show');

    })
    $('.mask,.orderAlert li.giveup').on('click', function() {
        $('.mask').hide();
        $('.orderAlert').removeClass('show');
    })
    //确认清空
    $('.orderAlert li.continue').on('click', function() {
        $('.mask').hide();
        $('.orderAlert').removeClass('show');
        utils.removeStorage('shop_live_search');
        $('.search_result').hide();
    })


    //搜索历史
    $('.search_result').delegate('li','click',function(){
        var t =$(this); txt = t.text();
        $('#keywords').val(txt);
        $('.form_search').submit();
    });

})
