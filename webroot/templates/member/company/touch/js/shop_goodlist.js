$(function(){
    var chosegoods = utils.getStorage('chosegoods');
    console.log(chosegoods)
    var ttype = '';
    if(chosegoods){
        ttype = chosegoods.type;
        
    }
    
    //搜索
    $('.searchDiv div').click(function(){
        $(this).css('padding-left','.2rem');
        $('#serKey').focus();
    })
    $('.searchDiv form').submit(function(){      
        getList(1);
        return false;
    })
    
    var isload = false,page=1,pageSize=10,combox = $('.container ul');;

    //滚动加载
    $(window).scroll(function(){
        var allh = $('body').height();
        var w = $(window).height();
        var s_scroll = allh - w - 100;
        if ($(window).scrollTop() > s_scroll && !isload) {
            page++;
            getList();

        }
    })
    //选择商品
    combox.delegate('li','click',function(){
        var tid = $(this).find('a').attr('data-id');
        $(this).addClass('curr').siblings('li').removeClass('curr')
        var sArr = {'id': tid, 'type': ttype}
        utils.setStorage('chosegoods', JSON.stringify(sArr));
        window.location.href = thref.replace('%type%',ttype);
    })


    // 列表
    getList();
    function getList(tr){
        isload = true;
        if(tr){
            page = 1;
            combox.html('');
        }
        $('.loading').remove();
        var skeyword = $('#serKey').val();
        combox.append('<div class="loading">加载中...</div>');
        var data = [];
        data.push('title='+skeyword);
        data.push('page='+page);
        data.push('pageSize='+pageSize);
        var gettype = '';
        if(ttype == 'bargain'){
            gettype = 'kjhuodong';
        }
        $.ajax({
            url: "/include/ajax.php?service=shop&action=slist&gettype="+gettype+"&u=1&state=1",//&pageSize=8
            data : data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    
                    var list = data.info.list,pageinfo = data.info.pageInfo,page = pageinfo.page,html = [];
                    if(list.length > 0){
                        $('.loading').remove();
                        if(ttype == 'bargain'){//砍价特有
                            $('.bargainTip').show()
                        }
                        for(var i = 0; i < list.length; i++){
                            var cla = '';
                            if(chosegoods != '' && chosegoods.id == list[i].id){
                                cla = 'curr';
                            }
                            //砍价特有 -- 不要多规格商品                     
                            html.push('<li class="fn-clear '+cla+'">');                       
                            html.push('<a href="javascript:;" data-id="'+list[i].id+'">');
                            var litpic = list[i].litpic == "" ? staticPath+'images/noPhoto_40.jpg' : list[i].litpic;
                            html.push('<div class="goodImg"><img src="'+litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
                            html.push('<div class="goodInfo">');
                            html.push('<h4>'+list[i].title+'</h4>');
                            html.push('<p class="nPrice">'+echoCurrency('symbol')+'<span>'+list[i].price+'</span></p>');
                            html.push('</div>');
                                    html.push('</a>');
                            html.push('</li>');
                            
                            
                        }

                        combox.append(html.join(""));
                        
                        isload = false;
                        //最后一页
                        if(page >= data.info.pageInfo.totalPage){
                            isload = true;                      
                            combox.append('<div class="loading">没有更多了</div>');
                        }
                    }else{
                        if(page == 1){
                            if(ttype == 'bargain'){
                                $('.container ul .loading').html('<div class="emptyImg"></div><h2>暂无合适的商品</h2><p>砍价活动暂不支持多规格商品参加！</p>')
                            }else{
                                $('.container ul .loading').html('<div class="emptyImg"></div><h2>暂无合适的商品</h2>');
                            }  
                        }else{
                            $('.container ul .loading').html('没有更多了');
                        }
                        
                    }
                    

                }else {

                    if(page == 1){
                        if(ttype == 'bargain'){
                            $('.container ul .loading').html('<div class="emptyImg"></div><h2>暂无合适的商品</h2><p>砍价活动暂不支持多规格商品参加！</p>')
                        }else{
                            $('.container ul .loading').html('<div class="emptyImg"></div><h2>暂无合适的商品</h2>');
                        }  
                    }else{
                        $('.container ul .loading').html('没有更多了');
                    }
                }
            },
            error: function(){
                isload = false;
                $('.container ul .loading').html(langData['siteConfig'][20][227]);
            }
        })
    }


})
