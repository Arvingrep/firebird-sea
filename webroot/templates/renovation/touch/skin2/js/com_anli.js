$(function(){

     // //左右导航切换(装修案例 装修效果图 )
    // //导航内容切换
     
    $('.anli_tab li').click(function(){       
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        h = $('.tabs_container .reno_anli').eq(i).height();
        $('.tabs_container .reno_anli').eq(i).addClass('anli_show').siblings().removeClass('anli_show');
        getList();
    });

    // 下拉加载
        // 下拉加载
    var loadMoreLock = false;
    var pageSize=5;
    var page=1;
    $(window).scroll(function() {
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - 60 - w;
        if ($(window).scrollTop() > scroll && !loadMoreLock) {
            var page = parseInt($('.anli_tab .active').attr('data-page')),
                totalPage = parseInt($('.anli_tab .active').attr('data-totalPage'));
            if (page < totalPage) {
                ++page;
                loadMoreLock = true;
                $('.anli_tab .active').attr('data-page', page);
                getList();
            }
            
           
        };
    });

    getList();
    //获取信息列表
    function getList(){
        var active = $('.anli_tab .active'), action = active.attr('data-id'), url;
        var page = active.attr('data-page');
        $('.loading').remove();
        if (action == 1) {           
            $(".anli_content").append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...           
            url =  "/include/ajax.php?service=renovation&action=diary&page="+page+"&pageSize=10&company="+detailId;
          
        }else if(action == 2){            
            $(".design_content").append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
            url = "/include/ajax.php?service=renovation&action=rcase&page="+page+"&pageSize=10&company="+detailId;
        }
        loadMoreLock = true;
        
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    var html = [], html2=[], list = data.info.list, pageinfo = data.info.pageInfo;
                    var totalpage = pageinfo.totalPage;
                    active.attr('data-totalPage', totalpage);
                    for (var i = 0; i < list.length; i++) {
                        if(action == 1){
                            $(".anli_content .loading").remove();
                            if(i%2 == 0){
                                
                                html.push('<li class="fn-clear">');
                                html.push('<a href="'+list[i].url+'">');
                                var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                                html.push('<div class="top_b">');                        
                                html.push('<img src="'+pic+'" alt="">');
                                html.push('</div>');
                                html.push('<div class="bottom_b">');
                                html.push('<p class="anli_title">'+list[i].title+'</p>');
                                html.push('<div class="anli_info fn-clear">');                 
                                html.push('<div class="anli_l"><img src="'+pic+'" alt=""></div>'); 
                                html.push('<p class="anli_r">'+list[i].area+'m² | '+list[i].style+' | '+list[i].price+langData['renovation'][9][22]+'</p>');//万                 
                                html.push('</div>');                                     
                                html.push('</div>');                 
                                html.push('</a>');
                                html.push('</li>');
                            }else{
                                html2.push('<li class="fn-clear">');
                                html2.push('<a href="'+list[i].url+'">');
                                var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                                html2.push('<div class="top_b">');                        
                                html2.push('<img src="'+pic+'" alt="">');
                                html2.push('</div>');
                                html2.push('<div class="bottom_b">');
                                html2.push('<p class="anli_title">'+list[i].title+'</p>');
                                html2.push('<div class="anli_info fn-clear">');                 
                                html2.push('<div class="anli_l"><img src="'+pic+'" alt=""></div>'); 
                                html2.push('<p class="anli_r">'+list[i].area+'m² | '+list[i].style+' | '+list[i].price+langData['renovation'][9][22]+'</p>');//万                  
                                html2.push('</div>');                                     
                                html2.push('</div>');                 
                                html2.push('</a>');
                                html2.push('</li>');
                            } 
                        }else{
                            $(".design_content .loading").remove();
                            if(i%2 == 0){

                                html.push('<li class="fn-clear imgLi bigs-'+i+'">');
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
                                html2.push('<li class="fn-clear imgLi bigs-'+i+'">');
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
                                              

                    }
                    if (action == 1) {
                        if(page == 1){
                            $(".anli_content ul.box1").html(html.join(""));
                            $(".anli_content ul.box2").html(html2.join(""));
                        }else{
                            $(".anli_content ul.box1").append(html.join(""));
                            $(".anli_content ul.box2").append(html2.join(""));
                        }
                        
                        
                    }else if(action == 2){      
                        if(page == 1){
                          $(".design_content ul.box1").html(html.join(""));
                          $(".design_content ul.box2").html(html2.join(""));
                        }else{
                          $(".design_content ul.box1").append(html.join(""));
                          $(".design_content ul.box2").append(html2.join(""));
                        }
                        
                    }
                    //放大图片
                  $.fn.bigImage({
                    artMainCon:".imgLi",  //图片所在的列表标签
                  });
                       
                    loadMoreLock = false;
                    if(page >= pageinfo.totalPage){
                        loadMoreLock = true;
                        if (action == 1) {
                            $(".anli_content").append('<div class="loading">'+langData['renovation'][15][1]+'</div>');//没有更多啦~
                        }else if(action == 2){
                            $(".design_content").append('<div class="loading">'+langData['renovation'][15][1]+'</div>');//没有更多啦~
                        }
                    }

                }else{
                    loadMoreLock = true;
                    if (action == 1) {
                        $(".anli_content .loading").html(data.info);//没有更多啦~
                    }else if(action == 2){
                        $(".design_content .loading").html(data.info);
                    }
                }
            },
            error: function(){
                loadMoreLock = false;
                if (action == 1) {
                    $(".anli_content .loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
                }else if(action == 2){
                    $(".design_content .loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
                }
            }
        });

    }




})