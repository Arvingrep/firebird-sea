$(function(){

    //焦点图
    $(".slideBox1").cycle({pager: '#slidebtn',pause: true,timeout: 3000});
    // 判断浏览器是否是ie8
    if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.ser_project .pro_ul li:nth-child(2n)').css('margin-right','0')
    }
    $('.appMapBtn').attr('href', OpenMap_URL);
    //查看电话
    $('.top_wrap').delegate('.see_phone','click',function(){
        var tel = $(this).data('tel');
        $(this).text(tel);
        return false;
        e.stopPropagation();
    })
    // 点击收藏
    $('.btn_group .store-btn').click(function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = masterDomain + '/login.html';
            return false;
        }

        var t = $(this), type = '';
        if(t.hasClass('curr')){
            t.removeClass('curr');
            t.find('span').text(langData['homemaking'][0][10]);//收藏
            type = 'del';
        }else{
            t.addClass('curr');
            t.find('span').text(langData['homemaking'][8][84]);//已收藏
            type = 'add';
        }
        $.post("/include/ajax.php?service=member&action=collect&module=homemaking&temp=store-detail&type="+type+"&id="+id);
    });

    //服务项目 服务人员切换
    $(".detail_tab li").on('click',function(e){
        e.preventDefault();
        $(".detail_tab .active").removeClass('active');
        $(this).addClass('active');
        var i = $(this).index();
        $('.detail_con').eq(i).addClass('show').siblings('.detail_con').removeClass('show')
    });

     var fload = 1; // 是否第一次加载第一页
     var fload2 = 1; // 是否第一次加载第一页
    //初始加载
     getProject();
     getPeople();


    //服务项目 数据列表   
    function getProject(tr){
        isload = true;
        if( fload != 1){
            $(".pro_ul").html('<div class="loading"><span>'+langData['education'][9][17]+'</span></div>'); //加载中
        }
        $.ajax({
            url: "/include/ajax.php?service=homemaking&action=hList&page="+subpage+"&pageSize="+pageSize1+"&store="+store,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data){
                    if(data.state == 100){
                        $(".pro_ul .loading").remove();
                        var list = data.info.list, html = [],totalCount = data.info.pageInfo.totalCount;

                        if(list.length > 0){
                            
                            if(fload != 1){
                            
                                for(var i = 0; i < list.length; i++){      
                                    html.push('<li>');
                                    html.push('   <a href="'+list[i].url+'" target="_blank">');
                                    if(list[i].rec == 1){
                                         html.push('   <span class="tui-icon">推荐</span>');
                                    }
                                    html.push('     <div class="left_b">');
                                    var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                                    html.push('             <img src="'+pic+'" alt="">');
                                    html.push('     </div>');
                                    html.push('     <div class="right_b">');
                                    html.push('         <div class="con_top"><h2>'+list[i].title+'</h2> </div>');
                                    html.push('         <div class="sale_after"> ');
                                    //售后保障 随心退
                                    for(var m=0;m<list[i].store.flagArr.length;m++){
                                      html.push('<span>');
                                       if(list[i].store.flagArr[m].litpic){
                                         html.push('<img src="'+list[i].store.flagArr[m].litpic+'" alt="">');
                                       }                              
                                       html.push('<em>'+list[i].store.flagArr[m].val+'</em></span>');
                                    }
                                    html.push('     </div> ');
                                    //今日可达
                                    html.push('     <div class="flag">');
                                    for(var m=0;m<list[i].flagAll.jc.length;m++){
                                        html.push('     <span class="flag_span">'+list[i].flagAll.jc[m]+'</span>');
                                    }                                    
                                    var service_order = '';
                                    if(list[i].homemakingtype==0){
                                        service_order = langData['homemaking'][8][59];//预约金
                                    }else if(list[i].homemakingtype==1){
                                        service_order = langData['homemaking'][8][60];//实价
                                    }else if(list[i].homemakingtype==2){
                                        service_order = langData['homemaking'][8][61];//免费预约
                                    }
                                    html.push('         <span class="hot_order">'+service_order+'</span>');
                                    html.push('     </div> ');
                                    html.push('     <div class="hot_store">  ');
                                    html.push('     <span class="hot_price">');
                                    if(list[i].price > 0){
                                        html.push(   echoCurrency('symbol')+'<strong>'+list[i].price+'</strong></span>');
                                    }else{
                                        html.push('     <strong>面议</strong></span>')
                                    }   
                                    html.push('     <em class="fn-right">'+langData['homemaking'][2][2]+list[i].sale+'</em>');//已售
                                    html.push('     </div> ');
                                    html.push('     </div> ');
                                    html.push('  </a>');
                                    html.push('</li>');
                                }
                            
                                 $(".pro_ul").append(html.join(""));                               
                            }
                            
                           
                            showPageInfo(totalCount);
                            isload = false;


                        //没有数据
                        }else{
                          isload = true;
                          $(".pro_ul").append('<div class="loading_all">'+langData['education'][9][19]+'</div>');//暂无相关信息
                        }

                    //请求失败
                    }else{
                        $(".pro_ul .loading").remove();
                        $(".pro_ul .loading_all").html(data.info);
                    }

                //加载失败
                }else{
                    $(".pro_ul .loading").remove();
                    $(".pro_ul").append('<div class="loading_all">'+langData['education'][9][20]+'</div>');//加载失败
                }
            },
            error: function(){
                isload = false;
                $(".pro_ul .loading").remove();
                $(".pro_ul").append('<div class="loading_all">'+langData['education'][4][0]+'</div>');//网络错误，加载失败！
            }
        });
    }

    //服务人员 数据列表
    function getPeople(tr){
        if( fload2 != 1){
            $(".peo_ul").html('<div class="loading"><span>'+langData['education'][9][17]+'</span></div>')  //加载中
        }
       
        isend = true;
        
        $.ajax({
            url: "/include/ajax.php?service=homemaking&action=nannyList&page="+teapage+"&pageSize="+pageSize2+"&store="+store,
            type: "POST",
            async: false,
            dataType: "json",
            success: function (data) {
                if(data){
                    if(data.state == 100){
                        $(".peo_ul .loading").remove();
                        var list = data.info.list, html = [],totalCount = data.info.pageInfo.totalCount;
                        if(list.length > 0){
                            if( fload2 != 1){
                                for(var i = 0; i < list.length; i++){                                        

                                    html.push('<li>');
                                    html.push('   <a href="'+list[i].url+'" class="teac_a" target="_blank">');
                                    if(list[i].tag.indexOf('1')>-1){
                                        html.push('<span class="tui-icon">推荐</span>');
                                    }
                                    html.push('     <div class="peo_img">');
                                    var photo = list[i].photo != "" && list[i].photo != undefined ? huoniao.changeFileSize(list[i].photo, "small") : "/static/images/404.jpg";
                                    html.push('             <img src="'+photo+'" alt="">');
                                    if(list[i].naturedescname!=''){
                                        html.push('<p class="bm_type">');
                                        for(var m=0;m<list[i].naturedescname.length;m++){
                                            if(m>2) break;
                                            html.push('<span>'+list[i].naturedescname[m]+'</span>');
                                        }
                                        html.push('</p>');
                                    }
                                    html.push('     </div>');

                                    html.push('     <div class="peoInfo">');
                                    html.push('         <div class="con_top"><h2>'+list[i].username+'</h2></div>');
                                    var age='',edu='',salary='';

                                    if(list[i].age == 0){//年龄
                                        age='未知'
                                    }else{
                                        age=list[i].age+langData['homemaking'][8][82];//岁
                                    }
                                    if(list[i].educationname){//文化程度
                                        edu=list[i].educationname;
                                    }else{
                                        edu='未知'
                                    }
                                    if(list[i].salaryname > 0){
                                        salary = langData['homemaking'][8][95]+'<strong>'+list[i].salaryname+'</strong>'+langData['homemaking'][8][96];//约   元/月
                                    }else{
                                        salary = '<strong>面议</strong>';
                                    }

                                    html.push('        <p class="peo_detail">'+age+'<em>･</em>'+list[i].placename+'<em>･</em>'+edu+'</p> ');//岁
                                    html.push('        <p class="bm_salary">'+salary+'</p>');
                                    html.push('        <div class="peo_store fn-clear"> ');
                                    html.push('        <div class="left_img"> ');
                                    var storepic = list[i].store.pics[0].path != "" && list[i].store.pics[0].path != undefined ? huoniao.changeFileSize(list[i].store.pics[0].path, "small") : "/static/images/404.jpg";
                                    html.push('             <img src="'+storepic+'" alt="">');

                                    html.push('        </div> ');
                                    html.push('         <div class="right_b">'+list[i].store.title+'</div> ');
                                    html.push('         </div>');
                                    html.push('     </div>');
                                    html.push('    </a>');
                                    html.push('</li>');
                                    
                                }

                                $(".peo_ul").append(html.join(""));

                            }
                            
                            showPageInfo2(totalCount);
                             isend = false;

                        //没有数据
                        }else{
                          isend = true;
                          $(".peo_ul").append('<div class="loading_all">'+langData['education'][9][19]+'</div>');//暂无相关信息
                        }

                      //请求失败
                    }else{
                        $(".peo_ul .loading").remove();
                        $(".peo_ul .loading_all").html(data.info);
                    }

                //加载失败
                }else{
                    $(".peo_ul .loading").remove();
                    $(".peo_ul").append('<div class="loading_all">'+langData['education'][9][20]+'</div>');//加载失败
                }
            },
            error: function(){
                isend = false;
                $(".peo_ul .loading").remove();
                $(".peo_ul").append('<div class="loading_all">'+langData['education'][4][0]+'</div>');//网络错误，加载失败！
            }
        });
    }    


    //服务项目分页
    function showPageInfo(totalCount) {
        fload++;
        var info = $(".pagination");
        var nowPageNum = subpage;
        var totalCount=totalCount
        var allPageNum = Math.ceil(totalCount / pageSize1);
        var pageArr = [];

        info.html("").hide();


        var pages = document.createElement("div");
        pages.className = "pagination-pages";
        info.append(pages);

        //拼接所有分页
        if (allPageNum > 1) {

            //上一页
            if (nowPageNum > 1) {
                var prev = document.createElement("a");
                prev.className = "prev";
                prev.innerHTML = '上一页';
                prev.setAttribute('href','#');
                prev.onclick = function () {
                    subpage = nowPageNum - 1;
                    getProject();
                }
            } else {
                var prev = document.createElement("span");
                prev.className = "prev disabled";
                prev.innerHTML = '上一页';
            }
            info.find(".pagination-pages").append(prev);

            //分页列表
            if (allPageNum - 2 < 1) {
                for (var i = 1; i <= allPageNum; i++) {
                    if (nowPageNum == i) {
                        var page = document.createElement("span");
                        page.className = "curr";
                        page.innerHTML = i;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','#');
                        page.onclick = function () {
                            subpage = Number($(this).text());
                            getProject();
                        }
                    }
                    info.find(".pagination-pages").append(page);
                }
            } else {
                for (var i = 1; i <= 2; i++) {
                    if (nowPageNum == i) {
                        var page = document.createElement("span");
                        page.className = "curr";
                        page.innerHTML = i;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','#');
                        page.onclick = function () {
                            subpage = Number($(this).text());
                            getProject();
                        }
                    }
                    info.find(".pagination-pages").append(page);
                }
                var addNum = nowPageNum - 4;
                if (addNum > 0) {
                    var em = document.createElement("span");
                    em.className = "interim";
                    em.innerHTML = "...";
                    info.find(".pagination-pages").append(em);
                }
                for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
                    if (i > allPageNum) {
                        break;
                    } else {
                        if (i <= 2) {
                            continue;
                        } else {
                            if (nowPageNum == i) {
                                var page = document.createElement("span");
                                page.className = "curr";
                                page.innerHTML = i;
                            } else {
                                var page = document.createElement("a");
                                page.innerHTML = i;
                                page.setAttribute('href','#');
                                page.onclick = function () {
                                    subpage = Number($(this).text());
                                    getProject();
                                }
                            }
                            info.find(".pagination-pages").append(page);
                        }
                    }
                }
                var addNum = nowPageNum + 2;
                if (addNum < allPageNum - 1) {
                    var em = document.createElement("span");
                    em.className = "interim";
                    em.innerHTML = "...";
                    info.find(".pagination-pages").append(em);
                }
                for (var i = allPageNum - 1; i <= allPageNum; i++) {
                    if (i <= nowPageNum + 1) {
                        continue;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','#');
                        page.onclick = function () {
                            subpage = Number($(this).text());
                            getProject();
                        }
                        info.find(".pagination-pages").append(page);
                    }
                }
            }

            //下一页
            if (nowPageNum < allPageNum) {
                var next = document.createElement("a");
                next.className = "next";
                next.innerHTML = '下一页';
                next.setAttribute('href','#');
                next.onclick = function () {
                    subpage = nowPageNum + 1;
                    getProject();
                }
            } else {
                var next = document.createElement("span");
                next.className = "next disabled";
                next.innerHTML = '下一页';
            }
            info.find(".pagination-pages").append(next);

            info.show();

        } else {
            info.hide();
        }
    }
    //服务人员分页
    function showPageInfo2(totalCount) {
        fload2++;
        var info = $(".pagination2");
        var nowPageNum = teapage;
        var totalCount=totalCount
        var allPageNum = Math.ceil(totalCount / pageSize2);
        var pageArr = [];

        info.html("").hide();


        var pages = document.createElement("div");
        pages.className = "pagination-pages";
        info.append(pages);

        //拼接所有分页
        if (allPageNum > 1) {

            //上一页
            if (nowPageNum > 1) {
                var prev = document.createElement("a");
                prev.className = "prev";
                prev.innerHTML = '上一页';
                prev.setAttribute('href','#');
                prev.onclick = function () {
                    teapage = nowPageNum - 1;
                    getPeople();
                }
            } else {
                var prev = document.createElement("span");
                prev.className = "prev disabled";
                prev.innerHTML = '上一页';
            }
            info.find(".pagination-pages").append(prev);

            //分页列表
            if (allPageNum - 2 < 1) {
                for (var i = 1; i <= allPageNum; i++) {
                    if (nowPageNum == i) {
                        var page = document.createElement("span");
                        page.className = "curr";
                        page.innerHTML = i;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','#');
                        page.onclick = function () {
                            teapage = Number($(this).text());
                            getPeople();
                        }
                    }
                    info.find(".pagination-pages").append(page);
                }
            } else {
                for (var i = 1; i <= 2; i++) {
                    if (nowPageNum == i) {
                        var page = document.createElement("span");
                        page.className = "curr";
                        page.innerHTML = i;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','#');
                        page.onclick = function () {
                            teapage = Number($(this).text());
                            getPeople();
                        }
                    }
                    info.find(".pagination-pages").append(page);
                }
                var addNum = nowPageNum - 4;
                if (addNum > 0) {
                    var em = document.createElement("span");
                    em.className = "interim";
                    em.innerHTML = "...";
                    info.find(".pagination-pages").append(em);
                }
                for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
                    if (i > allPageNum) {
                        break;
                    } else {
                        if (i <= 2) {
                            continue;
                        } else {
                            if (nowPageNum == i) {
                                var page = document.createElement("span");
                                page.className = "curr";
                                page.innerHTML = i;
                            } else {
                                var page = document.createElement("a");
                                page.innerHTML = i;
                                page.setAttribute('href','#');
                                page.onclick = function () {
                                    teapage = Number($(this).text());
                                    getPeople();
                                }
                            }
                            info.find(".pagination-pages").append(page);
                        }
                    }
                }
                var addNum = nowPageNum + 2;
                if (addNum < allPageNum - 1) {
                    var em = document.createElement("span");
                    em.className = "interim";
                    em.innerHTML = "...";
                    info.find(".pagination-pages").append(em);
                }
                for (var i = allPageNum - 1; i <= allPageNum; i++) {
                    if (i <= nowPageNum + 1) {
                        continue;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','#');
                        page.onclick = function () {
                            teapage = Number($(this).text());
                            getPeople();
                        }
                        info.find(".pagination-pages").append(page);
                    }
                }
            }

            //下一页
            if (nowPageNum < allPageNum) {
                var next = document.createElement("a");
                next.className = "next";
                next.innerHTML = '下一页';
                next.setAttribute('href','#');
                next.onclick = function () {
                    teapage = nowPageNum + 1;
                    getPeople();
                }
            } else {
                var next = document.createElement("span");
                next.className = "next disabled";
                next.innerHTML = '下一页';
            }
            info.find(".pagination-pages").append(next);

            info.show();

        } else {
            info.hide();
        }
    }

    $('.ser_project .pro_ul li:nth-child(2n)').css('margin-right','0');
    $('.ser_people ul.peo_ul li:nth-child(5n)').css('margin-right','0');

})
