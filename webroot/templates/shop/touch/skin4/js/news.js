$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');

	//更多导航栏展开，关闭
    $('.more_nav').click(function () {
        $('.mask').fadeIn();
        setTimeout(function(){
            $('.nav_all').animate({
                'top': '0',
            }, 100);
        },100)
        setTimeout(function(){
            $('.nav_box').css('z-index','100000');
        },200)
        $('html').addClass('noscroll');
        $(".nav_all .nav_on").removeClass('nav_on'); 
        
    });
    $('.close_btn,.cancel,.mask').click(function () {      
       $('.nav_all').animate({
            'top': '-100%',
        }, 100);
        
        $('.mask').fadeOut();
        $('.nav_box').css('z-index','100001'); 
        $('html').removeClass('noscroll');
    });
    var isload = false,atpage=1;
    //左右导航切换
    var tabsSwiper = new Swiper('#tabs-container', {
        speed: 350,
        touchAngle: 35,
        observer: true,
        observeParents: true,
        freeMode: false,
        longSwipesRatio: 0.1,
        autoHeight: true,
        on: {
            init: function () {
                getList($(".item:eq("+this.activeIndex+")").attr('data-id'));
            },
            slideChangeTransitionEnd: function () {
 
                $(".nav_box .active").removeClass('active');
                $(".nav_box li").eq(this.activeIndex).addClass('active');     
                var end = $('.active').offset().left + $('.active').width() / 2 - $('body').width() /2;
                var star = $(".nav_box .f_nav").scrollLeft();
                $('.f_nav').scrollLeft(end + star);
                var hasload =  $('.item').eq(this.activeIndex).attr('data-type');
                var len = $('.channel_'+this.activeIndex).children('li').length;

                if(hasload==0 && len==0){//第一次加载
                    $(window).scrollTop(0);
                    atpage=1;                   
                    var acId =$(".item:eq("+(this.activeIndex*1)+")").attr('data-id') 
                    $('.channel_'+acId).find('ul').html('');
                    getList(acId);
                    tabsSwiper.updateAutoHeight(100)
                }else{//已经滑动加载过
                    tabsSwiper.updateAutoHeight(100)
                }
                            
                

            }
        },

    });
    $(".nav_box .f_nav li").on('click', function (e) {
        e.preventDefault();
        $(".f_nav .active").removeClass('active');
        $(this).addClass('active');
        tabsSwiper.slideTo($(this).index());
        
    });
    //全部导航点击
    $('.nav_all').delegate('li', 'click', function (e) {
        var p = $(this).parents('ul'),t = $(this);        
        $(this).addClass('nav_on').siblings().removeClass('nav_on');
        var iname = $(this).attr('data-id');
        $('.nav_box li[data-id="'+iname+'"]').click();
        $('.nav_all').animate({
            'top': '-100%'
        }, 200);
        $('.nav_box').fadeIn();
        $('.mask').hide();
        $('html').removeClass('noscroll');
    });

    var newsTime = {

        //转换PHP时间戳
        transTimes: function(timestamp, n){
        
            const dateFormatter = huoniao.dateFormatter(timestamp);
            const year = dateFormatter.year;
            const month = dateFormatter.month;
            const day = dateFormatter.day;
            const hour = dateFormatter.hour;
            const minute = dateFormatter.minute;
            const second = dateFormatter.second;
            
            if(n == 1){
                return (year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second);
            }else if(n == 2){
                return (year+'/'+month+'/'+day);
            }else if(n == 3){
                return (month+'/'+day);
            }else{
                return 0;
            }
        }
    }
    

    $(window).scroll(function(){ 

        if($(window).scrollTop()>($('.header').height())){
            $('.nav_box').addClass('topfixed');
            $('.nav_all').addClass('top0');
        }else{
            $('.nav_box').removeClass('topfixed');
            $('.nav_all').removeClass('top0');
        }    
        var id = $('.f_nav li.active').attr('data-id');
        var hasload =  $('.f_nav li.active').attr('data-type');
        var sh = $('.container li').height();
        var allh = $('body').height();
        var w = $(window).height();
        var s_scroll = allh - sh - w;
        if ($(window).scrollTop() > s_scroll && !isload &&(hasload==0)) {
            atpage++
            getList(id);
        }

    })
    // getList()
    function getList(id){
        $('.item'+id).attr('data-type',1);
        isload = true;
        if(atpage!=1){
            $('.channel_'+id).find('ul').append('<div class="loading"><img src="'+templets_skin+'images/loading.png"></div>')
        }
        var typeid =$('.f_nav li.active').attr('data-id');
        $.ajax({
          url: "/include/ajax.php?service=shop&action=news&typeid="+typeid+"&page="+atpage+"&pageSize=6",
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
            $('.channel_'+id).find('.loading').remove();
            if(data.state == 100){               
                var list = data.info.list,html=[];
                if(list.length > 0){
                    for(var i = 0; i < list.length; i++){
                      html.push('<li class="fn-clear">');
                      html.push('<a href="'+list[i].url+'">');
                      if (list[i].litpic != "") {
                      html.push('<div class="news_r">')
                      html.push('<img src="'+list[i].litpic+'" alt="">')
                      html.push('</div>')
                      }
                      html.push('<div class="news_l">')
                      html.push('<h2>'+list[i].title+'</h2>')
                      html.push('<div class="newsInfo">')
                      if(list[i].click > 500){//浏览量大于500 时 为hot
                        if(list[i].click >= 10000){
                           list[i].click = (list[i].click/10000).toFixed(1) + '万';
                        }
                        html.push('<i class="hot"></i>');
                      }
                      var time = list[i].pubdate;
                      var pubTime = newsTime.transTimes(time,2)
                      html.push('<em class="pub-time">'+pubTime+'</em><i class="see"></i><em class="see_num">'+list[i].click+'</em>')
                      html.push('</div>')
                      html.push('</div>')

                      html.push('</a>')
                      html.push('</li>')
                      
                    }
                        $('.channel_'+id).find('ul').append(html.join(''));
                        $('.item'+id).attr('data-type',0);
                        isload = false;
                        //最后一页                        
                        if(atpage >= data.info.pageInfo.totalPage){
                            isload = true;
                            $('.item'+id).attr('data-type',1);
                            $('.channel_'+id).find('ul').append('<div class="loading nomore">'+langData['shop'][6][35]+'</div>');//没有更多了~
                        }
                        tabsSwiper.updateAutoHeight(100);
                }
                

            }else{
                isload = false;
               $('.channel_'+id).find('ul').append('<div class="loading nomore">'+data.info+'</div>');  
            }
          },
          error: function(){
            isload = false;
            $('.channel_'+id).find('ul').append(langData['siteConfig'][20][227]); //网络错误，加载失败！
          }
        });

    }
})