$(function () {

// //导航内容切换
    $('.order_header li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.wrap .order_content').eq(i).addClass('order_show').siblings().removeClass('order_show');
        getList();
    });

    var page = 1;
    var loadMoreLock = false;
    var objId = $('.free_design .cont_ul');
    var objId2 = $('.online_price0 .cont_ul');
    var objId3 = $('.vill_site .site_ul');
    var objId4 = $('.smart_custom .cont_ul');
    var objId5 = $('.online_price1 .cont_ul');

      //加载
    $(window).scroll(function() {      
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - 60;
        if ($(window).scrollTop() >= scroll && !loadMoreLock) {
            var page = parseInt($('.order_header .active').attr('data-page')),
                totalPage = parseInt($('.order_header .active').attr('data-totalPage'));
            if (page < totalPage) {
                ++page;
                loadMoreLock = true;
                $('.order_header .active').attr('data-page', page);
                getList();
            }
        };
    });

    getList();
    function getList() {
        var active = $('.order_header .active'), action = active.attr('data-id'), url;
        var page = active.attr('data-page');
        $('.loading').remove();
        if(typeof Identity=='string'){
            Identity=JSON.parse(Identity);
        }
        if (action == 1) {
            
            objId.append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...           
            url =  "/include/ajax.php?service=renovation&action=entrust&page="+page+"&pageSize=5";
          
        }else if(action == 2){
            
            objId2.append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
            url = "/include/ajax.php?service=renovation&action=rese&resetype=1&company="+Identity.store.id+"&type=0&page="+page+"&pageSize=5";
        }else if(action == 3){
            
            objId3.append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
            url = "/include/ajax.php?service=renovation&action=construction&company="+Identity.store.id+"&page="+page+"&pageSize=5";
        }else if(action == 4){
            
            objId4.append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
            url = "/include/ajax.php?service=renovation&action=rese&is_smart=1&company="+Identity.store.id+"&type=0&page="+page+"&pageSize=3";
          
        }else if(action == 5){
            
            objId5.append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
            url = "/include/ajax.php?service=renovation&action=rese&resetype=0&company="+Identity.store.id+"&type=0&page="+page+"&pageSize=5";
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
                        html.push('<li class="tutor fn-clear">');
                        html.push('    <div class="top fn-clear">');
                        // 如果是已联系 <div class="left_b_on">已联系</div>
                        var his = list[i].his;
                        var hisArr = his.split(':');
                        html.push('        <div class="left_b"><span>'+list[i].md+'</span><span>'+hisArr[0]+':'+hisArr[1]+'</span></div>');
                        html.push('        <div class="middle_b">');
                        html.push('            <h2 class="person_name">'+list[i].people+'</h2>');
                        html.push('            <p>'+list[i].contact+'</p>');
                        html.push('        </div>');
                        html.push('        <div class="right_b">');
                        html.push('            <a href="tel:'+list[i].contact+'"><img src="'+templateSkin+'images/renovation/call.png" alt=""></a>');
                        html.push('        </div>');
                        html.push('    </div>');
                        html.push('    <div class="bottom">');
                        if (action == 1) {                        
                        html.push('        <h3 class="village">'+langData['renovation'][4][5]+'：<span>'+list[i].address+'-'+list[i].community+'</span></h3>');//小区
                        }else if(action == 2){
                        html.push('        <ul class="line_ul">');
                        html.push('            <li>');
                        html.push('                <p class="fir_p special"><span>'+list[i].are+'</span>'+echoCurrency('areasymbol')+'</p>');
                        html.push('                <p class="sec_p">'+langData['renovation'][0][14]+'</p>');//房屋面积
                        html.push('            </li>');
                        html.push('            <li>');
                        html.push('                <p class="fir_p">'+list[i].units+'</p>');
                        html.push('                <p class="sec_p">'+langData['renovation'][10][2]+'</p>');//房屋户型
                        html.push('            </li>');
                        html.push('            <li>');
                        html.push('                <p class="fir_p">'+list[i].address+'</p>');
                        html.push('                <p class="sec_p">'+langData['renovation'][2][16]+'</p>');//所在区域
                        html.push('            </li>');
                        html.push('        </ul>');
                        }else if(action == 3){

                        html.push('        <h3 class="site_name">'+langData['renovation'][10][3]+'：<span>'+list[i].constructionetail.title+'</span></h3>');//工地名称

                        }else if(action == 4){

                        html.push('        <ul class="line_ul">');
                        html.push('            <li>');
                        html.push('                <p class="fir_p">'+list[i].units+'</p>');
                        html.push('                <p class="sec_p">'+langData['renovation'][2][4]+'</p>');//户型
                        html.push('            </li>');
                        html.push('            <li>');
                        html.push('                <p class="fir_p">'+list[i].stype+'</p>');
                        html.push('                <p class="sec_p">'+langData['renovation'][10][4]+'</p>');//客户要进行的
                        html.push('            </li>');
                        html.push('            <li>');
                        html.push('               <p class="fir_p">'+list[i].style+'</p>');
                        html.push('                <p class="sec_p">'+langData['renovation'][10][5]+'</p>');//客户注重的
                        html.push('            </li>');
                        html.push('        </ul>');
                        html.push('        <div class="info_bottom"><img src="'+templateSkin+'images/renovation/place.png" alt=""><span class="info">'+list[i].address+'</span></div>');
                        }else if(action == 5){
                        html.push('        <ul class="line_ul">');
                        html.push('            <li>');
                        html.push('                <p class="fir_p special"><span>'+list[i].community+'</span></p>');
                        html.push('                <p class="sec_p">'+langData['renovation'][4][5]+'</p>');//小区
                        html.push('            </li>');
                        html.push('            <li>');
                        html.push('                <p class="fir_p">'+list[i].address+'</p>');
                        html.push('                <p class="sec_p">'+langData['renovation'][2][16]+'</p>');//所在区域
                        html.push('            </li>');
                        html.push('        </ul>');

                        }
                        html.push('        </div>');
                        html.push('    </li>');
                    }
                    if (action == 1) {
                        objId.find('.loading').remove();
                        if(page == 1){
                            objId.html(html.join(""));
                        }else{
                            objId.append(html.join(""));
                        }
                    }else if(action == 2){
                        objId2.find('.loading').remove();
                        if(page == 1){
                            objId2.html(html.join(""));
                        }else{
                            objId2.append(html.join(""));
                        }
                    }else if(action == 3){
                        objId3.find('.loading').remove();
                        if(page == 1){
                            objId3.html(html.join(""));
                        }else{
                            objId3.append(html.join(""));
                        }
                    }else if(action == 4){
                        objId4.find('.loading').remove();
                        if(page == 1){
                            objId4.html(html.join(""));
                        }else{
                            objId4.append(html.join(""));
                        }
                    }else if(action == 5){
                        objId5.find('.loading').remove();
                        if(page == 1){
                            objId5.html(html.join(""));
                        }else{
                            objId5.append(html.join(""));
                        }
                    }


                    loadMoreLock = false;
                    if(page >= pageinfo.totalPage){
                        loadMoreLock = true;
                        if (action == 1) {
                            objId.append('<div class="loading">'+langData['renovation'][15][1]+'</div>');//没有更多啦~
                        }else if(action == 2){
                            objId2.append('<div class="loading">'+langData['renovation'][15][1]+'</div>');//没有更多啦~
                        }else if(action == 3){
                            objId3.append('<div class="loading">'+langData['renovation'][15][1]+'</div>');//没有更多啦~
                        }else if(action == 4){
                            objId4.append('<div class="loading">'+langData['renovation'][15][1]+'</div>');//没有更多啦~
                        }else if(action == 5){
                            objId5.append('<div class="loading">'+langData['renovation'][15][1]+'</div>');//没有更多啦~
                        }
                    }
                }else {
                    loadMoreLock = false;
                    if(action == 1) {
                        objId.find('.loading').html(data.info);
                    }else if(action == 2){
                        objId2.find('.loading').html(data.info);
                    }else if(action == 3){
                        objId3.find('.loading').html(data.info);
                    }else if(action == 4){
                        objId4.find('.loading').html(data.info);
                    }else if(action == 5){
                        objId5.find('.loading').html(data.info);
                    }
                }
            },
            error: function(){
                loadMoreLock = false;
                if (action == 1) {
                    objId.find('.loading').html(langData['renovation'][2][29]);//网络错误，加载失败...
                }else if(action == 2){
                    objId2.find('.loading').html(langData['renovation'][2][29]);//网络错误，加载失败...
                }else if(action == 3){
                    objId3.find('.loading').html(langData['renovation'][2][29]);//网络错误，加载失败...
                }else if(action == 4){
                    objId4.find('.loading').html(langData['renovation'][2][29]);//网络错误，加载失败...
                }else if(action == 5){
                    objId5.find('.loading').html(langData['renovation'][2][29]);//网络错误，加载失败...
                }
            }
        })
    }




});