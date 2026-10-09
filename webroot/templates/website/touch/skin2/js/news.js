$(function(){
    var page = 1, isload = false, container = $('#container'), loading = $('.loading');

    // 异步获取动态
    function getList(){
        loading.removeClass('vh');
        isload = true;
        $.ajax({
            url: masterDomain + '/include/website.inc.php?action=articleList&page='+page+'&pageSize=10&projectid='+id+'&jsoncallback=?',
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.code == 0){
                    var html = [];
                    for(var i = 0; i < data.data.length; i++){
                        var d = data.data[i];
                        html.push('<li >')
                        html.push('    <a href="'+websiteUrl+'/newsd.html?sid='+d.id+'" class="fn-clear">')
                        html.push('        <div class="left"></div>')
                        html.push('        <div class="right">')
                        html.push('            <h4>'+d.title+'</h4>')
                        html.push('            <p>'+d.addtime.split(' ')[0].replace(/-/g, '.')+'</p>')
                        html.push('        </div>')
                        html.push('    </a>')
                        html.push('</li>')
                    }
                    
                    $('#container ul').append(html.join(''));
                    if(page < data.totalPage){
                        isload = false;
                        loading.addClass('vh');
                    }else{
                        loading.removeClass('vh').html('已加载完全部数据');
                    }
                }else{
                    loading.removeClass('vh').html(page == 1 ? '暂无相关数据！' : '已加载完全部数据');
                }
            }
        })
    }
    getList();

    $(window).scroll(function(){
        var sct = $(window).scrollTop(), oft = loading.offset().top, winh = $(window).height();
        if(!isload && oft - sct <= winh){
            page++;
            getList();
        }
    })

});