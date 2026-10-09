$(function(){
    var page = 1, isload = false;

    getMypaiList();


    $('.tab li').click(function(){
        $('.tab li').removeClass('curr');
        $(this).addClass('curr');
        isload = false;
        page = 1;
        getMypaiList();
    })


    // 结束拍卖

    var options = {
        btnSure : '确定',
        title:'确认结束该拍卖？',
        // btnTrggle:true,
        isShow:true,
    }
    $("body").delegate(".end", "click", function(){
        var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
        if(id){
            confirmPop(options,function(){
                // 点击确认按钮
                $.ajax({
                    url: "/include/ajax.php?service=paimai&action=offShelf&ids="+id,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data.state == 100){
                            showErrAlert(data.info)
                            isload = false;
                            page = 1;
                            getMypaiList()
                        }else{
                            showErrAlert(data.info)
                        }
                    },
                    error: function(){
                        showErrAlert(data.info)
                    }
                })
            })

            
        }
    })
    $("body").delegate(".del", "click", function(){
        var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
        if(id){
            confirmPop(options,function(){
                // 点击确认按钮
                $.ajax({
                    url: "/include/ajax.php?service=paimai&action=offShelf&ids="+id,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data.state == 100){
                            showErrAlert(data.info)
                            isload = false;
                            page = 1;
                            getMypaiList()
                        }else{
                            showErrAlert(data.info)
                        }
                    },
                    error: function(){
                        showErrAlert(data.info)
                    }
                })
            })

            
        }
    })

    $(window).scroll(function(){
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - 20;
        if ($(window).scrollTop() >= scroll && !isload) {
            atpage++;
            getMypaiList();
        };
    })

    function getMypaiList(){
        if(isload) return false;
        isload = true;
        var arcrank = $(".tab li.curr").attr('data-id');
        var url = '/include/ajax.php?service=paimai&action=getList&u=1' ;
        var obj = $("#list");
        if(page == 1) {
            obj.html('')
        }
        obj.find('.loading').remove();
        obj.append('<div class="loading">加载中...</div>');
        $.ajax({
            url: url,
            data: {page:page,arcrank:arcrank},
            type: 'get',
            dataType: 'json',
            success: function(data){
                if(data.state == 100){
                    var list = data.info.list, html = [];
                    if(list.length == 0){
                        obj.find('.loading').html('暂无相关信息！');
                    }else{
                        for(var i = 0; i < list.length; i++){
                            var item = list[i];
                            html.push('<div class="item fn-clear" data-id="'+item.id+'">');
                            html.push('<div class="item-img">');
                            html.push('<a href="'+item.url+'">');
                            html.push('<img src="'+huoniao.changeFileSize(item.litpic,360,360)+'">');
                            html.push('</a>');
                            html.push('</div>');
                            html.push('<div class="item-txt">');
                            html.push('<a href="'+item.url+'" class="item-tit">'+item.title+'</a>');
                            html.push('<p class="hding"></p>');
                            html.push('<p class="price">'+echoCurrency("symbol")+'<em>'+item.cur_mon_start+'</em></p>');
                            html.push('<p class="operate"><span>保证金 '+echoCurrency("symbol")+item.amount+'</span><span>已售'+item.sale_num+'</span><span>库存'+item.maxnum+'</span></p>');
                            html.push('</div>');
                            html.push('<p class="opWrap fn-clear">');
                            if(new Date(item.startdate.replace(/-/g,'/')).getTime() <= new Date().getTime() && new Date(item.enddate.replace(/-/g,'/')).getTime() >= new Date().getTime()){
                                html.push('<a href="javascript:;" class="offShelf end"><i></i>结束拍卖</a>');
                            }else if(item.arcrank == 0){
                            	html.push('<a href="javascript:;" class="offShelf">待审核</a>');
                            }else if(item.arcrank == 2){
                            	html.push('<a href="javascript:;" class="offShelf">审核拒绝</a>');
                            }else if(item.arcrank == 1){
                                html.push('<a href="javascript:;" class="offShelf del"><i></i>结束拍卖</a>');
                            }else{
                                html.push('<a href="javascript:;" class="offShelf">已结束</a>');
                            }
                            if(item.arcrank == 0 || item.arcrank == 2 ){
                                html.push('<a href="'+editUrl+'?do=edit&id='+item.id+'" class="edit"><i></i>编辑</a> ');
                            }
                            html.push('</p> </div>');
                        }
                        obj.find('.loading').remove();
                        obj.append(html.join(""));
                        page++;
                        isload = false;
                        obj.append('<div class="loading">下拉加载更多</div>');
                        if(page > data.info.pageInfo.totalPage){
                            isload = false;
                            obj.find('loading').html('没有更多了')
                        }

                    }
                }else{
                    obj.find('loading').html(data.info)
                }
            },
            error: function(){
                isload = false;
                obj.find('loading').html('网络错误，请重试！')
            }
        });
    }

})