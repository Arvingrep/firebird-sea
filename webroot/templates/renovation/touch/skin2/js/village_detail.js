$(function(){


    //地图跳转
    $('.appMapBtn').attr('url',OpenMap_URL)
    //轮播图
    new Swiper('.topSwiper .swiper-container', {pagination: {el: '.topSwiper .swiper-pagination',} ,loop: false,grabCursor: true,paginationClickable: true,
        
    });


    //如果是安卓腾讯X5内核浏览器，使用腾讯TCPlayer播放器
    var player = document.getElementById('video'), videoWidth = 0, videoHeight = 0, videoCover = '', videoSrc = '', isTcPlayer = false;
    if(device.indexOf('MQQBrowser') > -1 && device.indexOf('Android') > -1 && player){
        videoSrc = player.getAttribute('src');
        videoCover = player.getAttribute('poster');
        var vid = player.getAttribute('id');

        videoWidth = $('#' + vid).width();
        videoHeight = $('#' + vid).height();

        $('#' + vid).after('<div id="tcPlayer"></div>');
        $('#' + vid).remove();
        document.head.appendChild(document.createElement('script')).src = '//imgcache.qq.com/open/qcloud/video/vcplayer/TcPlayer-2.2.2.js';
        isTcPlayer = true;
    }


    // 图片放大
    var videoSwiper = new Swiper('.videoModal .swiper-container', {pagination: {el:'.videoModal .swiper-pagination',type: 'fraction',},loop: false})
    $(".topSwiper").delegate('.swiper-slide', 'click', function() {
        var imgBox = $('.topSwiper .swiper-slide');
        var i = $(this).index();
        $(".videoModal").addClass('vshow');
        $('.markBox').toggleClass('show');
        videoSwiper.slideTo(i, 0, false);

        //安卓腾讯X5兼容
        if(player && isTcPlayer){
            new TcPlayer('tcPlayer', {
                "mp4": videoSrc, //请替换成实际可用的播放地址
                "autoplay" : false,  //iOS下safari浏览器，以及大部分移动端浏览器是不开放视频自动播放这个能力的
                "coverpic" : videoCover,
                "width" :  videoWidth,  //视频的显示宽度，请尽量使用视频分辨率宽度
                "height" : videoHeight  //视频的显示高度，请尽量使用视频分辨率高度
            });
        }

        return false;
    });

    $(".videoModal").delegate('.vClose', 'click', function() {
        var video = $('.videoModal').find('video').attr('id');
        if(player && isTcPlayer){
            $('#tcPlayer').html('');
        }else{
            $(video).trigger('pause');
        }

        $(this).closest('.videoModal').removeClass('vshow');
        $('.videoModal').removeClass('vshow');
        $('.markBox').removeClass('show');
        return false;
    });


// //导航内容切换
    $('.vill_tab li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.vill_container .vill_content').eq(i).addClass('vill_show').siblings().removeClass('vill_show');
        $('.vill_container').show();
        $('.build_container,.build_foot').hide();
    });

     $(".vill_layout ul li:nth-child(2n)").css("margin-right","0");
     $(".vill_true ul li:nth-child(2n)").css("margin-right","0");

     //放大图片
    $.fn.bigImage({
        artMainCon:".vill_img",  //图片所在的列表标签
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
    // 预约参观 表单验证
    $('.free').click(function(){

        var f = $(this);        
        var name = $('#order_name').val(), 
            tel = $('#order_phone').val(),
            siteType = $('.site_type').text(),
            siteArea = $('.site_area').text(),
            siteId = f.attr('data-id');
        var txt = f.text();
        if(f.hasClass("disabled")) return false;
        var par = f.closest('.formCommon');
        var areaCodev = $.trim(par.find('.areaCodeinp').val());

        if (!name) {

            $('.name-1').show();
            setTimeout(function(){$('.name-1').hide()},1000);

        }else if (!tel) {

            $('.phone-1').show();
            setTimeout(function(){$('.phone-1').hide()},1000);

        }else {

            f.addClass("disabled").text(langData['renovation'][14][58]);//预约中...
            var data = [];
            data.push("siteType="+siteType);
            data.push("siteArea="+siteArea);
            data.push("people="+name);
            data.push("areaCode="+areaCodev);
            data.push("contact="+tel);
            data.push("conid="+siteId);

            $.ajax({
                url: "/include/ajax.php?service=renovation&action=sendConstruction",
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
     $('.order_mask2 .t3').click(function(){
        $('.order_mask2').hide();
   
     })



    var page = 1;
    var isload = false;
    $(window).scroll(function() {
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - 60;
        if ($(window).scrollTop() >= scroll && !isload) {
            page++;
            getList();
                  
        };
    });
    getList();
    function getList() {
        isload=true
        $('.vill_site ul').append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=constructionList&communityid="+detaiId+"&page="+page +"&pageSize=10",
            type: "GET",
            dataType: "json",
            success: function (data) {
                isload = false;
                
                if(data.state == 100){
                    var list = data.info.list,totalpage = data.info.pageInfo.totalPage,html=[];
                    if(list.length > 0){
                        $('.loading').remove();
                        for(var i=0;i<list.length;i++){
                            var pic = list[i].litpic != "" && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg";
                            html.push('<li data-id="'+list[i].id+'">');
                            html.push('<div class="left_img">');                            
                            html.push('<img src="'+pic+'" alt="">');
                            html.push('</div>');
                            html.push('<div class="r_content">');
                            html.push('<h3 class="vill_title">'+list[i].title+'</h3>');
                            html.push('<p class="vill_info2"><span class="area">'+list[i].area+'</span>M²/<span class="roomType">'+list[i].budget+'</span>/'+list[i].style+'</p>');
                            html.push('<p class="visit" data-id="'+list[i].id+'">'+langData['renovation'][0][29]+'</p>');//预约参观
                            html.push('</div>');
                            html.push('</li>');
                        }
                        isload = false;
                        $('.vill_site ul').append(html.join(''));
                        if(page >= totalpage){
                            isload = true;
                            if(page != 1){
                                $(".vill_site ul").append('<div class="loading">'+langData['renovation'][2][28]+'</div>');//到底了...
                            }
                        }
                        
                    }else{
                        $(".vill_site ul .loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }                   
                }else {
                    $(".vill_site ul .loading").html(data.info);
                }
            },
            error: function(){
                 isload = false;
                $(".vill_site ul .loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
            }
        })
    }
    //返回工地列表
    $('.fan_a').click(function(){
    	$('.vill_container').show();
        $('.build_container,.build_foot').hide();
    })

	//查看工地详情
    $('.vill_site ').delegate('li','click',function(e){
        var t=$(this);
      	if(e.target == t.find('.visit')[0]){
          var id = t.attr('data-id');
          $('.free').attr('data-id',id);
          //参观工地
          var vill_title=t.find('.vill_title').text();

          //建筑面积
          var area=t.find('.area').html();
          var roomType = t.find('.roomType').text();
          $('.site_view').text(vill_title);//工地名称
          $('.site_area').text(area);//建筑面积
          $('.site_type').text(roomType);//房屋类型
          $('.order_mask').show();
          return false;
        }else{
          $('.vill_container').hide();
          $('.build_container,.build_foot').show();       
          var id = t.attr('data-id'); 
          $('.build_foot .order_see').attr('data-id',id);    
          siteDetail(id);
        }
      

    })
  	//预约参观
    $('.build_foot').delegate(".order_see", "click", function(){
        var tid= $(this).data('id');
      	$('.vill_site li[data-id="'+tid+'"]').find('.visit').click()

    })
  	//首页点击进入工地详情
  	function getUrlParam(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if ( r != null ){
         return decodeURI(r[2]);
      }else{
         return null;
      }
    }
  	var indexSid = decodeURI(getUrlParam('siteid'));
   	if(indexSid){
      setTimeout(function(){
        $('.vill_site li[data-id="'+indexSid+'"]').click()
      },200)
      
    }
  
    function siteDetail(id){
     	$(".build_container article").html('');
        var url ="/include/ajax.php?service=renovation&action=constructionDetail&page=1&id="+id;
        $.ajax({
          url: url,
          type: "GET",
          dataType: "json",
          success: function (data) {           
            if(data && data.state == 100){
              var list      = data.info;
              var list      = data.info;
              var stagearr  = list.stagearr;
              var html=[];
              if(stagearr.length > 0){
                for(var i=0;i<stagearr.length;i++){
                  html.push('<section class="section1">');
                  var pic = stagearr[i].listpicarr[0].path != "" && stagearr[i].listpicarr[0].path  != undefined ? stagearr[i].listpicarr[0].path  : "/static/images/404.jpg";
                  html.push('<h3 class="titile">'+stagearr[i].stageName+'</h3>');
                  html.push('<figure>')
                  html.push('<p>'+stagearr[i].description+'</p>');
                  html.push('<ul>');

                  var listpicarr = stagearr[i].listpicarr;
                  for ( var a = 0; a < listpicarr.length; a++){

                      html.push('<li><img src="'+listpicarr[a].path+'" alt=""></li>');
                  }
                  html.push('</ul>');               
                  html.push('</figure> ');                                 
                  html.push('</section> ');                                 
                }
                $(".build_container article").html(html.join(""));   
                }             
              
            }
          }
         
      })
    }


})