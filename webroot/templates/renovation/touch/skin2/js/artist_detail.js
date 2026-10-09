$(function(){
    // //导航内容切换
    $('.art_tab li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.art_container .art_content').eq(i).addClass('art_show').siblings().removeClass('art_show');
        getList();
    });
    //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').hide();
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.layer_list ul').append(phoneList.join(''));
                }else{
                   $('.layer_list ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.layer_list ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer_code').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        var par = $('.formCommon')
        var arcode = par.find('.areacode_span')
        arcode.find("label").text(txt);
        par.find(".areaCodeinp").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })
        //立即预约
    //预约弹窗弹出
    $('.content').delegate(".order", "click", function(){
        var com_type=$(this).parents('.content').find('.com_type');
        var peo_name=com_type.html();
        $('.order_mask').show();
        $('.peo_name').text(peo_name)
        return false;

    })
    // 立即预约 表单验证
    $('.free').click(function(){
        var f = $(this);
        var txt = f.text();        
        var name = $('#order_name').val(), 
            tel = $('#order_phone').val();
        if(f.hasClass("disabled")) return false;
        var par = f.closest('.formCommon');
        var areaCodev = par.find('.areaCodeinp').val();
        if (!name) {

            $('.name-1').show();
            setTimeout(function(){$('.name-1').hide()},1000);

        }else if (!tel) {

            $('.phone-1').show();
            setTimeout(function(){$('.phone-1').hide()},1000);

        }else {

            f.addClass("disabled").text(langData['renovation'][14][58]);//预约中...
            var data = [];
            data.push("bid="+detailId);//设计师id
            data.push("people="+name);
            data.push("type=2");
            data.push("areaCode="+areaCodev);
            data.push("contact="+tel);
          
            $.ajax({
                url: "/include/ajax.php?service=renovation&action=sendRese",
                data: data.join("&"),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);//
                    if(data && data.state == 100){
                        $('.order_mask').hide();
                        $('.order_mask2').show();
                        
                    }else{
                        alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['renovation'][14][90]);//预约失败，请重试！
                    f.removeClass("disabled").text(txt);//
                }
            });
        }
    })

    // 立即预约关闭
    $('.order_mask .work_close').click(function(){
        $('.order_mask').hide();
   
    })
    //预约成功关闭
    $('.order_mask2 .t3').click(function(){
        $('.order_mask2').hide();
   
    })

    //加载
    var loadMoreLock = false;
    $(window).scroll(function() {
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - 50;
        if ($(window).scrollTop() >= scroll && !loadMoreLock) {
            var page = parseInt($('.art_tab .active').attr('data-page')),
                totalPage = parseInt($('.art_tab .active').attr('data-totalPage'));
            if (page < totalPage) {
                ++page;
                loadMoreLock = true;
                $('.art_tab .active').attr('data-page', page);
                getList();
            }
            
        };
    });
getList();
    function getList() {
        var active = $('.art_tab .active'), action = active.attr('data-id'), url;
        var page = active.attr('data-page');
        $('.loading').remove();
        if (action == 1) {
            
            $(".art_anli ul").append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...           
            url =  "/include/ajax.php?service=renovation&action=diary&ftype=2&page="+page+"&pageSize=5&designer="+detailId;
          
        }else if(action == 2){
            
            $(".art_article ul").append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
            url = "/include/ajax.php?service=renovation&action=article&type=2&page="+page+"&pageSize=5&fid="+detailId;
        }
        loadMoreLock = true;

        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                var list = data.info.list;
                if(data && data.state == 100){
                    var html = [];
                    var pageinfo = data.info.pageInfo,totalpage = pageinfo.totalPage;
                    active.attr('data-totalPage', totalpage);
                    for(var i=0;i<list.length;i++){

                        if (action == 1) {
                            $(".art_anli .loading").remove();
                            var d = list[i];
                            html.push('<li>');
                            html.push('<a href="'+d.url+'">');                            
                            html.push('<div class="top_img"><img src="'+d.litpic+'" alt="'+d.title+'"  onerror="this.src=\'/static/images/404.jpg\'"/></div>')
                            
                            html.push('<h3 class="art_title">'+d.title+'</h3>');
                            html.push('<p class="art_info2">'+d.area+'m² | '+d.style+' | '+d.price+langData['renovation'][9][22]+' | '+d.btype+'</p>');//万

                            html.push('</a></li>');
                        }else{
                            $(".art_article .loading").remove();
                            var lr = list[i];

                            html.push('<li>');
                            html.push('<a href="'+lr.url+'">');
                            if(lr.litpic !=''){
                                html.push('<div class="right_b">');
                                html.push('<img src="'+lr.litpic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"/>');
                                html.push('</div>');
                            }
                            
                            html.push('<div class="left_b">');
                            html.push('<h2 class="arti_title">'+lr.title+'</h2>');
                            if(lr.note !=''){                                         
                            	html.push('<div class="arti_info">'+lr.note+'</div>');
                            }
                            html.push('</div>');                            
                            html.push('</a>');
                            html.push('</li>');

                        }
                    }
                    if (action == 1) {
                        if(page == 1){
                            $(".art_anli ul").html(html.join(""));
                        }else{
                            $(".art_anli ul").append(html.join(""));
                        }
                    }else if(action == 2){
                        if(page == 1){
                            $(".art_article ul").html(html.join(""));
                        }else{
                            $(".art_article ul").append(html.join(""));
                        }
                    }

                    loadMoreLock = false;

                    if(page >= pageinfo.totalPage){
                        loadMoreLock = true;
                        if (action == 1) {
                            $(".art_anli").append('<div class="loading">'+langData['renovation'][15][1]+'</div>');//没有更多啦~
                        }else if(action == 2){
                            $(".art_article").append('<div class="loading">'+langData['renovation'][15][1]+'</div>');//没有更多啦~
                        }
                    }
                }else {
                    loadMoreLock = false;
                    if (action == 1) {
                        $(".art_anli .loading").html(data.info);
                    }else if(action == 2){
                        $(".art_article .loading").html(data.info);
                    }

                }
            },
            error: function(){
                loadMoreLock = false;
                if (action == 1) {
                    $(".art_anli .loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
                }else if(action == 2){
                    $(".art_article .loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
                }

            }
        })
    }

})