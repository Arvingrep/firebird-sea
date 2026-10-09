


$(function() {
    var bodyheight = $(window).height(),flag=0;
    var isload  = false;
    //筛选弹窗显示
    function showNav() {
        $('body').css({
            overflow: 'hidden',
            height: bodyheight
        })
        $('.nav-container').addClass('active');
        $('.nav-mask').addClass('active');
    }
    //筛选弹窗关闭
    function closeNav() {
        $('.nav-container').removeClass('active');
            $('.nav-mask').removeClass('active');
            $('body').css({
                overflow: 'auto',
                height: 'auto'
        })
        if(flag == 1){
            
            if($('.nav-content li.active').size()>0){
                $('.filter').addClass('active')
                $('.reno_tab li').removeClass('active');
                isload = false;
                getList(1);
            }  
        }
    }
    $('.filter').click(function(){
        showNav();
    })

    //筛选弹窗

    $('.nav-mask').click(function () {
        flag = 0;
        closeNav()
    })
    $('.nav-second>li').click(function () {
        $(this).toggleClass('active').siblings().removeClass('active');
        var id = $(this).attr('data-id');
        var par = $(this).closest('.common-chose');
        var chose = par.find('.type_p').attr('data-type');
        if(chose == 'type'){
            if(id == '1'){//工装
                $('.space_choose,.part_choose,.area_choose').hide();
                $('.lei_choose').show();
            }else{
                $('.space_choose,.part_choose,.area_choose').show();
                $('.lei_choose').hide();

            }
        }

    })
    $('.nav-content .type_p').click(function () {
        var t=$(this).siblings('.nav-second');
        t.toggleClass('active');
    })

    $('.sure').click(function () {
        flag = 1;
        closeNav();
        
    })
    $('.reset').click(function () {
        $('.nav-second>li').removeClass('active');
        $('.reno_tab li.command').click()
    })
    
   

    // //左右导航切换(推荐 中式 美式)
    // //导航内容切换
     var page=1,pageSize = 10;

    $('.reno_tab li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        isload = false;
        getList(1);
    });

    // 下拉加载   
    $(window).scroll(function() {
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - 60 - w;
        if ($(window).scrollTop() > scroll && !isload) {
            page++;
            getList();
        };
    });

    getList();
    //获取信息列表
    function getList(tr){

        if(isload) return false;
        if(tr){
            page=1;
            $('.content ul').html('')
        }
        $(".loading").remove();
        $('.reno_anli').append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);

        var keywords = $('.reno_form #keywords').val();
        if(keywords !=''){
            data.push("title="+keywords);
        }

        
        if($('.reno_tab li.active').size()>0){
            var active = $('.reno_tab li.active');
            var acType = active.attr("data-type");
            if(acType){
                data.push(active.attr("data-type") + "=" + active.attr("data-id"));
            }
            
        }

        //获取字段
        var item = [];
        $(".nav-content li.active").each(function(index){
            var t = $(this), type = t.closest('.common-chose').find('.type_p').attr("data-type"), id = t.attr("data-id");
            if(id){
                item.push(type+"="+id)
            }
        })
        data.push(item.join("&"))
        isload = true;
        
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=rcase&"+data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    $(".loading").remove();
                    var html = [], html2=[],list = data.info.list, pageinfo = data.info.pageInfo;
                    if(list.length > 0){
                        for (var i = 0; i < list.length; i++) {
                            if(i%2 == 0){

                                html.push('<li class="fn-clear imgLi">');
                                html.push('<a href="javascript:;">');
                                var pic = list[i].litpic != "" && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg";
                                var picarr = list[i].picarr;
                                html.push('<div class="top_b">'); 
                                var imgarr=[];
                              	if(picarr.length > 0){                                 
                                  for (var j = 0; j < picarr.length; j++) {
                                    var imgCla='';
                                    if(j>=1) imgCla='fn-hide';
                                    imgarr.push('<img src="'+picarr[j].picpath+'" alt=""class="'+imgCla+'">')
                                  }
                                  html.push(imgarr.join(''));
                                }else{
                                  html.push('<img src="'+pic+'" alt="">');
                                }
                                
                                html.push('</div>');
                                html.push('<div class="bottom_b">');
                                html.push('<p class="anli_title">'+list[i].title+'</p>');
                                                               
                                html.push('</div>');                 
                                html.push('</a>');
                                html.push('</li>');
                            }else{
                                html2.push('<li class="fn-clear imgLi">');
                                html2.push('<a href="javascript:;">');
                                var pic = list[i].litpic != "" && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg";
                              	var picarr = list[i].picarr;
                                html2.push('<div class="top_b">');                        
                                var imgarr=[];
                              	if(picarr.length > 0){                                 
                                  for (var j = 0; j < picarr.length; j++) {
                                    var imgCla='';
                                    if(j>=1) imgCla='fn-hide';
                                    imgarr.push('<img src="'+picarr[j].picpath+'" alt=""class="'+imgCla+'">')
                                  }
                                   html2.push(imgarr.join(''));
                                }else{
                                   html2.push('<img src="'+pic+'" alt="">');
                                }
                               
                                html2.push('</div>');
                                html2.push('<div class="bottom_b">');
                                html2.push('<p class="anli_title">'+list[i].title+'</p>');
                                                                
                                html2.push('</div>');                 
                                html2.push('</a>');
                                html2.push('</li>');
                            }                       

                        }
                        $(".reno_anli .box1").append(html.join(""));
                        $(".reno_anli .box2").append(html2.join(""));
                      //放大图片
                      $.fn.bigImage({
                          artMainCon:".imgLi",  //图片所在的列表标签
                      });
                        
                        isload = false;

                        if(page >= pageinfo.totalPage){
                            isload = true;                       
                            $(".reno_anli").append('<div class="loading">'+langData['renovation'][2][28]+'</div>');//到底了...
                            
                        }
                    }else{
                        $(".reno_anli .loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }                 
                     
                    

                }else{
                    $(".reno_anli .loading").html(data.info);
                }
            },
            error: function(){
                isload = false;
                $(".reno_anli .loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
            }
        });
      

    }
   
  

})
