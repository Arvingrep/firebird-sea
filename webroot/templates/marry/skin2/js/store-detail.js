$(function(){
    //查看地图
    $('.appMapBtn').attr('href', OpenMap_URL);
    //查看店铺电话
    $('.go_call').delegate('a','click',function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            top.location.href = masterDomain + '/login.html';
            return false;
        }
        var h3 = $(this).find('h3');
        var realCall = h3.attr('data-call');
        var hideP = $(this).find('p').fadeOut(300)
        h3.text(realCall);
        h3.animate({"paddingTop":'24px'},300);
    })

        //收藏
    $(".store-other .soucan").bind("click", function(){
        var t = $(this), type = "add", oper = "+1", txt = langData['siteConfig'][44][0];   //"已收藏"

        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            top.location.href = masterDomain + '/login.html';
            return false;
        }
        if(!t.hasClass("curr")){
            t.addClass("curr");
        }else{
            type = "del";
            t.removeClass("curr");
            oper = "-1";
            txt = langData['siteConfig'][19][240];  //收藏
        }

        var $i = $("<b>").text(oper);
        var x = t.offset().left, y = t.offset().top;
        $i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
        $("body").append($i);
        $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
            $i.remove();
        });

        t.find('span').html(txt);
        
        var temp = '';
        if(fromType == 'store'){
            temp = 'store-detail' + '|' + istype + '|' + typeid;
        }
        $.post("/include/ajax.php?service=member&action=collect&module=marry&temp="+temp+"&type="+type+"&id="+id);


    });

    //国际手机号获取
      getNationalPhone();
      function getNationalPhone(){
          $.ajax({
                  url: "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
                  type: 'get',
                  dataType: 'JSONP',
                  success: function(data){
                      if(data && data.state == 100){
                         var phoneList = [], list = data.info;
                         for(var i=0; i<list.length; i++){
                              phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
                         }
                         $('.areaCode_wrap ul').append(phoneList.join(''));
                      }else{
                         $('.areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
                        }
                  },
                  error: function(){
                              $('.areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
                          }

          })
      }
      //显示区号
      $('.areaCode').bind('click', function(){
        var par = $(this).closest('form');
        var areaWrap =par.find('.areaCode_wrap');
        if(areaWrap.is(':visible')){
          areaWrap.fadeOut(300)
        }else{
          areaWrap.fadeIn(300);
          return false;
        }
      });
      //选择区号
      $('.areaCode_wrap').delegate('li', 'click', function(){
        var t = $(this), code = t.attr('data-code');
        var par = t.closest('form');
        var areaIcode = par.find(".areaCode");
        areaIcode.find('i').html('+' + code);
        par.find('.areaCodeinp').val(code);
      });

      $('body').bind('click', function(){
        $('.areaCode_wrap').fadeOut(300);
      });
    // 咨询套餐弹出
    $('.zixun').click(function(){
        $('.team_mask').show();
    })
    //表单验证
    $(".team_mask .team_submit").bind("click", function(){
        var f = $(this);
        var txt = f.text();
        var str = '',r = true;
        if(f.hasClass("disabled")) return false;
        var par = f.closest('.formCommon').find('form');
        var areaCodev = $.trim(par.find('.areaCodeinp').val());
        // 称呼
        var team_name = $('#team_name');
        var team_namev = $.trim(team_name.val());
        if(team_namev == '') {
            if (r) {
                team_name.focus();
                errmsg(team_name, langData['renovation'][14][45]);//请填写您的称呼
            }
            r = false;
        }
        // 手机号
        var team_phone = $('#team_phone')
        var team_phonev = $.trim(team_phone.val());
        if(team_phonev == '') {
            if (r) {
                team_phone.focus();
                errmsg(team_phone, langData['renovation'][12][0]);// 请输入手机号码
            }
            r = false;
        }

        

        if(!r) {
            return false;
        }       
        
        f.addClass("disabled").text(langData['siteConfig'][6][35]+"...");//提交中...

        var data = $('#subForm').serialize()+'&comtype=2';

        $.ajax({
            url: "/include/ajax.php?service=marry&action=sendRese",
            data: data,
            type: "POST",
            dataType: "jsonp",
            success: function (data) {
                f.removeClass("disabled").text(txt);//立即预约免费设计
                if(data && data.state == 100){
                    $('.team_mask').hide()
                    $('.team_mask2').show()
                    
                }else{
                    f.removeClass("disabled").text(txt);
                    alert(data.info);
                }
            },
            error: function(){
                alert(langData['siteConfig'][20][180]);//提交失败，请重试！
                f.removeClass("disabled").text(txt);
            }
        });

    })
    $('.team_mask .close_alert').click(function(){
        $('.team_mask').hide();
    })
    $('.team_mask2 .close_alert').click(function(){
        $('.team_mask2').hide();
    })
    $('.team_mask2 .t3').click(function(){
        $('.team_mask2').hide();
    })
    //数量错误提示
    var errmsgtime;
    function errmsg(div,str){
        $('#errmsg').remove();
        clearTimeout(errmsgtime);
        var top = div.offset().top - 33;
        var left = div.offset().left;

        var msgbox = '<div id="errmsg" style="position:absolute;top:' + top + 'px;left:' + left + 'px;height:30px;line-height:30px;text-align:center;color:#f76120;font-size:14px;display:none;z-index:99999;background:#fff;">' + str + '</div>';
        $('body').append(msgbox);
        $('#errmsg').fadeIn(300);
        errmsgtime = setTimeout(function(){
            $('#errmsg').fadeOut(300, function(){
                $('#errmsg').remove()
            });
        },2000);
    };

    // 导航栏置顶
    var Ggoffset = $('.store_nav').offset().top -20;
    var h=$(window).height();          
    $(window).bind("scroll",function(){
        var d = $(document).scrollTop();   
        if(Ggoffset < d){
            $('.store_nav').addClass('fixed').slideDown();
        }else{
            $('.store_nav').removeClass('fixed');

        }
     
    });
    // 首页 套餐 案例等切换
    $('.store_nav li').bind("click", function(){
        $(this).addClass('curr').siblings().removeClass('curr');
        if($(this).hasClass('myh')){
            var aHref = $(this).find('a').attr('data-url');
            window.location.href = aHref;
            return false;
        }
        var i = $(this).index();
        $('.wrap .public-wrap').eq(i).addClass('show-wrap').siblings('.public-wrap').removeClass('show-wrap');
    })
    // 查看更多评论
    $(".more-a").click(function(){
        var par = $(this).closest('.store_con');
        var i = par.index();
        console.log(i)
        $('.store_nav li').eq(i+1).click();
    });


    // 婚礼策划导航切换
    $(".meal-wrap .comm-nav li").bind("click", function(){
        $(this).addClass('active').siblings().removeClass('active');
        getMeal(1)
    })
    $(".case-wrap .comm-nav li").bind("click", function(){
        $(this).addClass('active').siblings().removeClass('active');
        getCase(1)
    })

    //加载
     var fload = 1; // 是否第一次加载第一页
     var fload2 = 1; // 是否第一次加载第一页
    //初始加载
     getMeal();//套餐列表
     getCase();//案例列表

    //数据列表
    function getMeal(tr){
        if(tr){
            fload = 2;
            $('.meal-list .pagination').html('')
        }
        if( fload != 1){
            $(".meal_ul").html('<div class="loading">'+langData['siteConfig'][38][8]+'</div>'); //加载中...
        }
        var typeid = $('.meal-wrap .comm-nav li.active').attr('data-typeid')
        var url = "/include/ajax.php?service=marry&action=planmealList&orderby=1&typeid="+typeid+"&page="+subpage+"&pageSize=15&detailid="+id;
        if(typeid == 7){
            url = "/include/ajax.php?service=marry&action=marryhostList&orderby=1&type="+typeid+"&page="+subpage+"&pageSize=15&detailid="+id;
        }
        $.ajax({
            url: url,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data){
                    if(data.state == 100){
                        $(".meal_ul .loading").remove();
                        var list = data.info.list, html = [],totalCount = data.info.pageInfo.totalCount;

                        if(list.length > 0){

                            if(fload != 1){
                                for(var i = 0; i < list.length; i++){
                                    html.push('<li>');
                                    html.push('   <a href="'+list[i].url+'" target="_blank">');
                                    html.push('     <div class="img-box">');
                                    var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                                    html.push('             <img src="'+pic+'" alt="">');
                                    html.push('     </div>');
                                    html.push('     <div class="info">');
                                    html.push('         <p class="name">'+list[i].title+'</p>');
                                    html.push('         <p class="price">'+echoCurrency('symbol')+'<strong>'+list[i].price+'</strong>');
                                    html.push('         </p>');
                                    html.push('     </div> ');
                                    html.push('  </a>');
                                    html.push('</li>');
                                }

                                 $(".meal_ul").append(html.join(""));
                                 $('.meal_ul li:nth-child(3n)').css('margin-right','0');
                            }
                            showPageInfo(totalCount);
                        //没有数据
                        }else{
                          $(".meal_ul").append('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');//暂无相关信息
                        }

                    //请求失败
                    }else{
                        $(".meal_ul .loading").remove();
                        $(".meal_ul").append('<div class="loading">'+data.info+'</div>');//加载失败
                    }

                //加载失败
                }else{
                    $(".meal_ul .loading").remove();
                    $(".meal_ul").append('<div class="loading">'+langData['siteConfig'][20][462]+'</div>');//加载失败
                }
            },
            error: function(){
                $(".meal_ul .loading").remove();
                $(".meal_ul").append('<div class="loading">'+langData['siteConfig'][20][227]+'</div>');//网络错误，加载失败！
            }
        });
    }

    //数据列表
    function getCase(tr){
        if(tr){
            fload2 = 2;
            $('.case-list .pagination2').html('')
        }
        if( fload2 != 1){
            $(".case_ul").html('<div class="loading">'+langData['siteConfig'][38][8]+'</div>'); //加载中...  
        }
        var typeid = $('.case-wrap .comm-nav li.active').attr('data-typeid')

        $.ajax({
            url: "/include/ajax.php?service=marry&action=plancaseList&orderby=1&typeid="+typeid+"&page="+teapage+"&pageSize=16&store="+id+"",
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data){
                    if(data.state == 100){
                        $(".case_ul .loading").remove();
                        var list = data.info.list, html = [],html2 = [],totalCount = data.info.pageInfo.totalCount;
                        if(list.length > 0){
                            if( fload2 != 1){
                                for(var i = 0; i < list.length; i++){
                                    html.push('<li data-id="'+list[i].id+'">');
                                    html.push('   <a href="javascript:;">');
                                    html.push('     <div class="img-box">');
                                    var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                                    html.push('             <img src="'+pic+'" alt="">');
                                    html.push('     </div>');
                                    html.push('     <div class="info">');
                                    html.push('         <p class="name">'+list[i].title+'</p>');
                                    html.push('         <p class="time">'+list[i].holdingtimeSource1+'&nbsp;</p>');
                                    html.push('     </div> ');
                                    html.push('  </a>');
                                    html.push('</li>');
                                    
                                }
                                $(".case_ul").append(html.join(""));
                                $('.case_ul li:nth-child(4n)').css('margin-right','0');
                            }

                            showPageInfo2(totalCount);

                        //没有数据
                        }else{
                          $(".case_ul").append('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');//暂无相关信息
                        }

                      //请求失败
                    }else{
                        $(".case_ul .loading").remove();
                        $(".case_ul").append('<div class="loading">'+data.info+'</div>');
                    }

                //加载失败
                }else{
                    $(".case_ul .loading").remove();
                    $(".case_ul").append('<div class="loading">'+langData['siteConfig'][20][462]+'</div>');//加载失败
                }
            },
            error: function(){
                $(".case_ul .loading").remove();
                $(".case_ul").append('<div class="loading">'+langData['siteConfig'][20][227]+'</div>');//网络错误，加载失败！
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
                    getMeal();
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
                            getMeal();
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
                            getMeal();
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
                                    getMeal();
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
                            getMeal();
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
                    getMeal();
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
                    getCase();
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
                            getCase();
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
                            getCase();
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
                                    getCase();
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
                            getCase();
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
                    getCase();
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


    //案例弹出
    $('.case-list').delegate('li', "click", function(){
        var src = $(this).attr('data-id');
        showBigImg(src)
    })
    
    function showBigImg(imgid) {
        thisdiv = $('#' + id);
        var prevId = thisdiv.prev().attr('id');
        var nextId = thisdiv.next().attr('id');
        $('.slide-box').remove();
        var slide=[],html=[];
        $.ajax({
             url: "/include/ajax.php?service=marry&action=plancaseDetail&page=1&pageSize=999&id="+imgid,
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    var list = data.info.pics;
                    var title = data.info.title;
                    var pubdate = data.info.pubdate;
                    var pub = huoniao.transTimes(pubdate,2)
                    for (var i = 0; i < list.length; i++) {

                        var pic = list[i].path != "" && list[i].path != undefined ? huoniao.changeFileSize(list[i].path, "small") : "/static/images/404.jpg";
                        
                        
                        slide.push('<a href="javascript:;" data-bigpic="'+list[i].path+'" data-title="'+title+'">');                        
                        slide.push('<img src="'+pic+'" alt="'+title+'">');                        
                                               
                                               
                        slide.push('</a>');  
                        var slide2 = slide.join("");
                                                               
                    }
                                                 

                    html.push('<div class="slide-box">');
                    html.push('<div class="slide">');

                    html.push('<a class="close" href="javascript:;"><img src="'+templatePath+'images/close.png"></a>');
                    html.push('<div class="slideinfo">'); 
                    html.push('<h3>'+title+'</h3>'); 
                    html.push('<p class="pub">'+pub+'</h3>'); 
                    html.push('<div class="btn_group fn-clear">');                     
                    html.push('<div class="share-btn ">'); 
                    html.push('<a href="javascript:;" class="newBtn_share" data-title="{#$detail_title#}" data-pic="{#$detail_pics[0].path#}"></a><em></em><span>分享</span>'); 
                    html.push('</div>');
                    html.push('<a href="javascript:;" class="store-btn soucan"><button><em></em><span>收藏</span></button></a>'); 
                    html.push('</div>');
                    html.push('</div>'); 


                    html.push('<div id="slide_big">');                   
                    html.push('<div class="page-div"">'); 
                    html.push('<span class="atpage" id="atpage">1</span>/<span class="tpage" id="tpage">'+list.length+'</span>');                        
                    html.push('</div>'); 
                    html.push('</div>');
                    
                    html.push('<a href="javascript:;" class="prev" id="slidebtn_prev"><s></s></a>');
                    html.push('<a href="javascript:;" class="next" id="slidebtn_next"><s></s></a>');
                    html.push('<div id="slide_small">');
                    html.push('<div class="spbox">');
                    html.push('<div class="picsmall fn-clear">');
                    html.push(slide2);                    
                    html.push('</div>');
                    html.push('</div>');
                    html.push('<a href="javascript:;" class="prev disabled" id="slidebtn2_prev"><s></s></a>');
                    html.push('<a href="javascript:;" class="next" id="slidebtn2_next"><s></s></a>');
                    html.push('</div>');
                    html.push('</div>');
                    html.push('</div>');

                     $('body').append(html.join(""));  

                    $('.slide-box').show();
                    //幻灯
                    $('.slide').picScroll();


                }
            },
            error: function(){

            }
        })
      
    }
    $('body').on('click', '.close', function() {
            $('.slide-box').hide();
    })
        

})
