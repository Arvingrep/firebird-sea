$(function(){

    //焦点图
    $(".slideBox1").cycle({pager: '#slidebtn',pause: true,timeout: 3000});
	if(site_map == 'baidu'){
      // 百度地图API功能
      var map = new BMap.Map("allmap");
      //获取坐标
      var eduLng = pageData.lng;
      var eduLat = pageData.lat;
      var point = new BMap.Point(eduLng, eduLat);
      map.centerAndZoom(point, 15);

      //创建个人图标
      var myIcon = new BMap.Icon(templatePath+"/images/mapIcon.png", new BMap.Size(34,38));
      var marker2 = new BMap.Marker(point,{icon:myIcon});  // 创建标注
      map.addOverlay(marker2);     // 将标注添加到地图中

    }else if(site_map == 'amap'){//高德地图
        var amap = new AMap.Map('allmap', {
            center: [pageData.lng, pageData.lat],
            zoom: 14,
        });

        // 构造点标记
        var marker = new AMap.Marker({
          	map:amap,
        
            position: [pageData.lng, pageData.lat]
        });
        amap.add(marker);
    }else if(site_map == "google"){
            var marker,
			   mapOptions = {
			     zoom: 14,
			     center: new google.maps.LatLng(pageData.lng, pageData.lat),
			     zoomControl: false,
			     mapTypeControl: false,
			     streetViewControl: false,
			     fullscreenControl: false
			   }
			 	
			 mapPath = new google.maps.Map(document.getElementById('allmap'), mapOptions);
			 	
			 // 店铺坐标
			 marker = new google.maps.Marker({
			   position: new google.maps.LatLng(pageData.lng, pageData.lat),
			   map: mapPath,
			 });

    }else if(site_map == 'tmap'){//天地图
        // 百度地图API功能
        var map = new T.Map("allmap");
        //获取坐标
        var eduLng = pageData.lng;
        var eduLat = pageData.lat;
        var point = new T.LngLat(eduLng, eduLat);
        map.centerAndZoom(point, 15);

        //创建个人图标
        var myIcon = new T.Icon({
            "iconUrl": templatePath+"images/mapIcon.png",
            "iconSize": new T.Point(34, 38),
            "iconAnchor": new T.Point(17, 30)
        });
        var marker2 = new T.Marker(point,{icon:myIcon});  // 创建标注
        map.addOverLay(marker2);     // 将标注添加到地图中
    }
    //查看地图链接
    $('.appMapBtn').attr('href', OpenMap_URL);

    
    // $('.senior_con ul li:nth-child(2n)').css('margin-right','0');
    // $('.senior_con ul li:nth-child(2n)').css('margin-right','0');

    //所有教师动画
    $('.teach_con .senior_con').delegate('.arrow','mouseenter',function(){
        //stop()方法来停止重复动画
        $(this).parents('li').children(".senior_info").stop(true,false).slideDown();
    })
    $('.teach_con .senior_con').delegate('li','mouseleave',function(){
        //stop()方法来停止重复动画
         $(this).children(".senior_info").stop(true,false).slideUp();
    })
    //
    $('.pro_l li').each(function(){
        var index=$(this).index();
        if(index==0||index==1){
            $(this).append('<span class="see_img">'+langData['education'][8][43]+'</span>')//点击查看所有图片
        }else if(index==2){
            $(this).append('<p class="img_num"><strong></strong>+</p><span class="see_img">'+langData['education'][8][43]+'</span>')
        }
    })
    $(".pro_l li").filter(":gt(2)").hide();
    var img_num=$('.pro_l li').size()-1;
    $('.pro_l li .img_num strong').text(img_num)

    $('.pro_l li a').abigimage();

    //收藏
    $(".store-btn").bind("click", function(){
        var t = $(this), type = "add", oper = "+1", txt = "已收藏";

        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }

        if(!t.hasClass("curr")){
            t.addClass("curr");
        }else{
            type = "del";
            t.removeClass("curr");
            oper = "-1";
            txt = "收藏";
        }

        var $i = $("<b>").text(oper);
        var x = t.offset().left, y = t.offset().top;
        $i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
        $("body").append($i);
        $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
            $i.remove();
        });

        t.children('button').html("<em></em><span>"+txt+"</span>");

        $.post("/include/ajax.php?service=member&action=collect&module=education&temp=store-detail&type="+type+"&id="+eduData.id);

    });
    

    

    
    //切换
    $(".org_tab li").bind("click", function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i=$(this).index();
        $(".org_wrap2 .org_con").eq(i).addClass('org_show').siblings().removeClass('org_show')
        
     })
    $(".see_cla").bind("click", function(){
        $(".org_tab li").removeClass('active');
        $('#subject').addClass('active');
        $(".org_wrap2 .subject_con").addClass('org_show').siblings().removeClass('org_show');
    })
    $(".see_senior").bind("click", function(){
        $(".org_tab li").removeClass('active');
        $('#teacher').addClass('active');
        $(".org_wrap2 .teach_con").addClass('org_show').siblings().removeClass('org_show');
        $('body,html').animate({scrollTop:100},400);
    })
    //开设课程加载
     var fload = 1; // 是否第一次加载第一页
     var fload2 = 1; // 是否第一次加载第一页
    //初始加载
     getSubject();
     getTeacher();

    //数据列表
    
    function getSubject(tr){
        isload = true;
        if( fload != 1){
            $(".class_ul").html('<div class="loading"><span>'+langData['education'][9][17]+'</span></div>'); //加载中
        }
        $.ajax({
            url: "/include/ajax.php?service=education&action=coursesList&page="+subpage+"&pageSize="+pageSize+"&store="+id+"",
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data){
                    if(data.state == 100){
                        $(".class_ul .loading").remove();
                        var list = data.info.list, html = [],totalCount = data.info.pageInfo.totalCount;

                        if(list.length > 0){
                            
                            if(fload != 1){
                            
                                for(var i = 0; i < list.length; i++){      
                                    html.push('<li>');
                                    html.push('   <a href="'+list[i].url+'" target="_blank">');
                                    html.push('     <div class="top_img">');
                                    var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                                    html.push('             <img src="'+pic+'" alt="">');
                                    html.push('     </div>');
                                    html.push('     <div class="class_info">');
                                    html.push('         <p class="tit fn-clear"><span>'+list[i].title+'</span> </p>');
                                    html.push('         <p class="info2 fn-clear"> ');
                                    var price=parseInt(list[i].price);
                                    html.push('             <span class="pr_span"><strong>'+price+'</strong>'+langData['education'][9][58].replace('1','')+'</span><span class="num_span"><em>'+list[i].sale+'</em>'+langData['education'][9][61].replace('1','')+'</span> ');// 元起   人报名
                                    html.push('         </p>');
                                    html.push('     </div> ');
                                    html.push('  </a>');
                                    html.push('</li>');
                                }
                            
                                 $(".class_ul").append(html.join(""));
                                 $('.comm_con ul li:nth-child(4n)').css('margin-right','0');
                                
                            }
                            
                           
                            showPageInfo(totalCount);
                            isload = false;


                        //没有数据
                        }else{
                          isload = true;
                          $(".class_ul").append('<div class="loading_all">'+langData['education'][9][19]+'</div>');//暂无相关信息
                        }

                    //请求失败
                    }else{
                        $(".class_ul .loading").remove();
                        $(".class_ul .loading_all").html(data.info);
                    }

                //加载失败
                }else{
                    $(".class_ul .loading").remove();
                    $(".class_ul").append('<div class="loading_all">'+langData['education'][9][20]+'</div>');//加载失败
                }
            },
            error: function(){
                isload = false;
                $(".class_ul .loading").remove();
                $(".class_ul").append('<div class="loading_all">'+langData['education'][4][0]+'</div>');//网络错误，加载失败！
            }
        });
    }

    //数据列表
    function getTeacher(tr){
        if( fload2 != 1){
            $(".senior_con").append('<div class="loading"><span>'+langData['education'][9][17]+'</span></div>')  //加载中
            $(".senior_con .senior_ul1").html('');
            $(".senior_con .senior_ul2").html('');
        }
       
        isend = true;
        
        $.ajax({
            url: "/include/ajax.php?service=education&action=teacherList&page="+teapage+"&pageSize="+pageSize+"&store="+id+"",
            type: "POST",
            async: false,
            dataType: "json",
            success: function (data) {
                if(data){
                    if(data.state == 100){
                        $(".senior_con .loading").remove();
                        var list = data.info.list, html = [],html2 = [],totalCount = data.info.pageInfo.totalCount;
                        if(list.length > 0){
                            if( fload2 != 1){
                                for(var i = 0; i < list.length; i++){  
                                        
                                    if(i%2 == 0){
                                        var html4,html3 = [];
                                        html.push('<li>');
                                        html.push('   <a href="'+list[i].url+'" class="teac_a" target="_blank">');
                                        html.push('    <div class="top_b fn-clear"> ');
                                        html.push('     <div class="left_img">');
                                        var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                                        html.push('             <img src="'+pic+'" alt="">');
                                        html.push('     </div>');
                                        html.push('     <div class="right_info fn-clear">');
                                        var sex = list[i].sex==1 ? 'class="sex_nan"' : 'class="sex_nv"';
                                        html.push('         <h2 class="tutor_name">'+list[i].name+'<i '+sex+'></i></h2>');
                                        html.push('         <p class="senior_det">'+langData['education'][7][39]+'：'+list[i].courses+'</p> ');//主授课程
                                        html.push('         <p class="prove">');
                                        html.push('             <span class="identity">'+langData['education'][7][29]+'</span><span class="edu">'+langData['education'][7][30]+'</span></p> ');//身份认证  学历认证
                                        html.push('      </div>');
                                        html.push('         <span class=arrow></span>');
                                        html.push('      </div> ');
                                        html.push('    </a>');
                                        $.ajax({

                                            url: "/include/ajax.php?service=education&action=coursesList&page=1&pageSize=1&teacherid="+list[i].id+"",
                                            type: "POST",
                                            async: false,
                                            dataType: "json",
                                            success: function (data) {
                                                if(data && data.state == 100){                                                   
                                                    var list2 = data.info.list;
                                                    for(var j = 0; j < list2.length; j++){ 
                                                        
                                                        html3.push('     <div class="senior_info fn-clear">');
                                                        html3.push('         <div class="senior_l">');
                                                        html3.push('             <p class="senior_title">');
                                                        html3.push('                 <a href="'+list2[j].url+'" target="_blank">'+list2[j].title+'</a>');
                                                        html3.push('             </p>');
                                                        html3.push('             <p class="info2 fn-clear">');
                                                        var price=parseInt(list2[j].price);
                                                        var time=list2[j].openStart,openStart;
                                                        openStart=huoniao.transTimes(time, 2);

                                                        html3.push('                 <span class="pr_span"><strong>'+price+'</strong>'+langData['education'][9][58].replace('1','')+'</span></p>');//元起
                                                        html3.push('             <p class="senior_time"><span>'+openStart+'</span>'+langData['education'][8][41]+'</p>');//开课
                                                        html3.push('         </div>');
                                                        html3.push('         <div class="senior_r">');
                                                        html3.push('             <a href="" target="_blank"><img src="'+list2[j].litpic+'" alt=""></a>');
                                                        html3.push('         </div>');
                                                        html3.push('     </div>');
                                                        
                                                    }
                                                    
                                                    html4=html3.join(""); 
                                                }
                                            }
                                        })
                                        
                                                                                          
                                        html.push(html4)
                                        html.push('</li>');

                                    }else{
                                        var html4,html3 = [];
                                        html2.push('<li>');
                                        html2.push('   <a href="'+list[i].url+'" class="teac_a" target="_blank">');
                                        html2.push('    <div class="top_b fn-clear"> ');
                                        html2.push('     <div class="left_img">');
                                        var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                                        html2.push('             <img src="'+pic+'" alt="">');
                                        html2.push('     </div>');
                                        html2.push('     <div class="right_info fn-clear">');
                                        var sex = list[i].sex==1 ? 'class="sex_nan"' : 'class="sex_nv"';
                                        html2.push('         <h2 class="tutor_name">'+list[i].name+'<i '+sex+'></i></h2>');
                                        html2.push('         <p class="senior_det">'+langData['education'][7][39]+'：'+list[i].courses+'</p> ');//主授课程
                                        html2.push('         <p class="prove">');
                                        html2.push('             <span class="identity">'+langData['education'][7][29]+'</span><span class="edu">'+langData['education'][7][30]+'</span></p> ');//身份认证  学历认证
                                        html2.push('      </div>');
                                        html2.push('         <span class=arrow></span>');
                                        html2.push('      </div> ');
                                        html2.push('    </a>');
                                        
                                        $.ajax({
                                            url: "/include/ajax.php?service=education&action=coursesList&page=1&pageSize=1&teacherid="+list[i].id+"",
                                            type: "POST",
                                            async: false,
                                            dataType: "json",
                                            success: function (data) {
                                                if(data && data.state == 100){
                                                    var list2 = data.info.list;
                                                    for(var j = 0; j < list2.length; j++){ 
                                                        
                                                        html3.push('     <div class="senior_info fn-clear">');
                                                        html3.push('         <div class="senior_l">');
                                                        html3.push('             <p class="senior_title">');
                                                        html3.push('                 <a href="'+list2[j].url+'" target="_blank">'+list2[j].title+'</a>');
                                                        html3.push('             </p>');
                                                        html3.push('             <p class="info2 fn-clear">');
                                                        var price=parseInt(list2[j].price);
                                                        var time=list2[j].openStart;
                                                        openStart=huoniao.transTimes(time, 2);

                                                        html3.push('                 <span class="pr_span"><strong>'+price+'</strong>'+langData['education'][9][58].replace('1','')+'</span></p>');//元起
                                                        html3.push('             <p class="senior_time"><span>'+openStart+'</span>'+langData['education'][8][41]+'</p>');//开课
                                                        html3.push('         </div>');
                                                        html3.push('         <div class="senior_r">');
                                                        html3.push('             <a href="'+list2[j].url+'"><img src="'+list2[j].litpic+'" alt=""></a>');
                                                        html3.push('         </div>');
                                                        html3.push('     </div>');
                                                    }
                                                    html4=html3.join(""); 
                                                }
                                            }
                                        })
                                        html2.push(html4);
                                        html2.push('</li>');
                                    }                                       
                                }

                                $(".senior_con .senior_ul1").append(html.join(""));
                                $(".senior_con .senior_ul2").append(html2.join(""));
                                isend = false;

                            }
                            
                            showPageInfo2(totalCount);

                        //没有数据
                        }else{
                          isend = true;
                          $(".senior_con").append('<div class="loading_all">'+langData['education'][9][19]+'</div>');//暂无相关信息
                        }

                      //请求失败
                    }else{
                        $(".senior_con .loading").remove();
                        $(".senior_con .loading_all").html(data.info);
                    }

                //加载失败
                }else{
                    $(".senior_con .loading").remove();
                    $(".senior_con").append('<div class="loading_all">'+langData['education'][9][20]+'</div>');//加载失败
                }
            },
            error: function(){
                isend = false;
                $(".senior_con .loading").remove();
                $(".senior_con").append('<div class="loading_all">'+langData['education'][4][0]+'</div>');//网络错误，加载失败！
            }
        });
    }


    //打印分页1
    function showPageInfo(totalCount) {
        fload++;
        var info = $(".pagination");
        var nowPageNum = subpage;
        var totalCount=totalCount
        var allPageNum = Math.ceil(totalCount / pageSize);
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
                    getSubject();
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
                            getSubject();
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
                            getSubject();
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
                                    getSubject();
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
                            getSubject();
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
                    getSubject();
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
    //打印分页2
    function showPageInfo2(totalCount) {
        fload2++;
        var info = $(".pagination2");
        var nowPageNum = teapage;
        var totalCount=totalCount
        var allPageNum = Math.ceil(totalCount / pageSize);
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
                    getTeacher();
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
                            getTeacher();
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
                            getTeacher();
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
                                    getTeacher();
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
                            getTeacher();
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
                    getTeacher();
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


    $('.senior_con ul li:nth-child(2n)').css('margin-right','0');
    $('.comm_con ul li:nth-child(4n)').css('margin-right','0');

})