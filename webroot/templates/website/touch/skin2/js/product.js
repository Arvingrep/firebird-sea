$(function(){
    var page = 1, isload = false, container = $('#container'), loading = $('.loading');

    function auto_data_size(){
        $("figure a").each(function() {
            var t = $(this);
            var imgs = new Image();
            imgs.src = t.attr("href");

            if (imgs.complete) {
                t.attr("data-size","").attr("data-size",imgs.width+"x"+imgs.height);
            } else {
                imgs.onload = function () {
                    t.attr("data-size","").attr("data-size",imgs.width+"x"+imgs.height);
                    imgs.onload = null;
                };
            };

        })
    };

    // 异步获取产品
    function getList(){
        loading.removeClass('vh');
        isload = true;
        $.ajax({
            url: masterDomain + '/include/ajax.php?service=website&action=productList&page='+page+'&pageSize=10&id='+id,
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                    var html = [];
                    for(var i = 0; i < data.info.list.length; i++){
                        var d = data.info.list[i];
                        html.push('<figure itemprop="associatedMedia" itemscope="" itemtype="" class="swiper-slide">');
                        html.push('    <a href="'+d.image+'" itemprop="contentUrl" data-size="800x800" class="picarr" id="pic0">');
                        html.push('         <img src="'+d.image+'" itemprop="thumbnail" alt="Image description">');
                        html.push('         <p>'+d.title+'</p>');
                        html.push('    </a>');
                        html.push('</figure>');
                    }

                    container.append(html.join(''));
                    auto_data_size();
                    if(page < data.info.pageInfo.totalPage){
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
