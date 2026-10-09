$(function(){
    $('.appMapBtn').attr('href', OpenMap_URL);

    // 焦点图
    $("#slideBox2").slide({mainCell:".bd ul",autoPage:true,});
    
    // 地图API功能
    if(site_map == 'baidu'){//百度地图
        var map = new BMap.Map("storeMap");
        var point = new BMap.Point(pageData.lng,pageData.lat);
        var marker = new BMap.Marker(point);  // 创建标注
        map.addOverlay(marker);              // 将标注添加到地图中
        map.centerAndZoom(point, 15);
    }else if(site_map == 'google'){//谷歌地图
        // 初始化地图
        init();

    }else if(site_map == 'amap'){//高德地图
        
        var map = new AMap.Map('storeMap', {
                center: [pageData.lng, pageData.lat],
                zoom: 15,
            });
        AMap.plugin('AMap.ToolBar', function() { //异步加载插件
            var toolbar = new AMap.ToolBar();
            map.addControl(toolbar);
        });
        // 构造点标记
        var marker = new AMap.Marker({
            icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
            position: [pageData.lng, pageData.lat]
        });
        map.add(marker);

    }else if(site_map == 'tmap'){//天地图
        var map = new T.Map("storeMap");
        var point = new T.LngLat(pageData.lng,pageData.lat);
        var marker = new T.Marker(point);  // 创建标注
        map.addOverLay(marker);              // 将标注添加到地图中
        map.centerAndZoom(point, 15);
            
    }
    function init(){
        centerPoint = new google.maps.LatLng(parseFloat(pageData.lat), parseFloat(pageData.lng));

        map = new google.maps.Map(document.getElementById('storeMap'), {
            zoom: 14,
            center: centerPoint,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL
            }
        });
        addcenMarker();
    }
    // 添加中心点
    function addcenMarker() {
        var marker = new google.maps.Marker({
            position: centerPoint,
            map: map,
            icon: '',
        });
    }

    //查看店铺电话
    $('.go_call').delegate('a','click',function(){
        var h3 = $(this).find('h3');
        var realCall = h3.attr('data-call');
        $(this).find('p').addClass('out')
        h3.text(realCall);

    })
    // 基本参数超过五个隐藏
    var liLen = $('.param li').length;
    if(liLen > 5){
        $('.param li').each(function(){
            if($(this).index() >4){
                $(this).hide();
            }
        })
    }else{
        $('.seeAll').hide();
    }

    //查看全部参数
    $('.seeAll').click(function(){
        $('.param li').show();
        $(this).hide();
    })

    // 导航栏置顶
    var Ggoffset = $('.car_tab').offset().top - 150;      

   var h=$(window).height();
          
    $(window).bind("scroll",function(){
        var d = $(document).scrollTop();   
        var th =d + h;
        if(Ggoffset < d){
            $('.carTabWrap').addClass('fixed');
        }else{
            $('.carTabWrap').removeClass('fixed');
        }
     
    });
    //家教详情切换
    var isClick = 0;
    //左侧导航点击
    $(".car_tab a").bind("click", function(){

        isClick = 1; //关闭滚动监听
        var t = $(this), parent = t.parent(), index = parent.index(), theadTop = $(".car_con:eq("+index+")").offset().top - 260;
        parent.addClass("active").siblings("li").removeClass("active");
        $('html, body').animate({
            scrollTop: theadTop
        }, 500, function(){
            isClick = 0; //开启滚动监听
        });
    });
    //滚动监听
    $(window).scroll(function() {
        var scroH = $(this).scrollTop();  
        if(isClick) return false;//点击切换时关闭滚动监听
        
        var theadLength = $(".car_con").length;
        $(".car_tab li").removeClass("active");

        $(".car_con").each(function(index, element) {
            var offsetTop = $(this).offset().top;
            if (index != theadLength - 1) {
                var offsetNextTop = $(".car_con:eq(" + (index + 1) + ")").offset().top - 280;
                if (scroH < offsetNextTop) {
                    $(".car_tab li:eq(" + index + ")").addClass("active");
                    return false;
                }
            } else {
                $(".car_tab li:last").addClass("active");
                return false;
            }
        });

        
    });
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

        $.post("/include/ajax.php?service=member&action=collect&module=marry&temp=hotel-detail&type="+type+"&id="+id);
    });
    //案例弹出
    $('.place .seeDetail').click(function(){
        var src = $(this).closest('li').attr('data-id');
        showBigImg(src)
    })
    
    function showBigImg(imgid) {
        thisdiv = $('#' + id);
        var prevId = thisdiv.prev().attr('id');
        var nextId = thisdiv.next().attr('id');
        $('.slide-box').remove();
        var slide=[],html=[];
        $.ajax({
             url: "/include/ajax.php?service=marry&action=hotelfieldDetail&page=1&pageSize=999&id="+imgid,
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    var info = data.info;
                    var list = data.info.pics;
                    var title = data.info.title;
                    var pubdate = data.info.pubdate;
                    var pub = huoniao.transTimes(pubdate,2)
                    for (var i = 0; i < list.length; i++) {

                        var pic = list[i].path != "" && list[i].path != undefined ? huoniao.changeFileSize(list[i].path, "small") : "/static/images/404.jpg";
                        
                        
                        slide.push('<a href="javascript:;" data-bigpic="'+pic+'" data-title="'+title+'">');                        
                        slide.push('<img src="'+pic+'" alt="'+title+'">');                        
                                               
                                               
                        slide.push('</a>');  
                        var slide2 = slide.join("");
                                                               
                    }
                                                 

                    html.push('<div class="slide-box">');
                    html.push('<div class="slide">');

                    html.push('<a class="close" href="javascript:;"><img src="'+templets_skin+'images/closealert.png"></a>');
                     


                    html.push('<div id="slide_big">');                   
                    html.push('<div class="page-div"">'); 
                    html.push('<span class="atpage" id="atpage">1</span>/<span class="tpage" id="tpage">'+list.length+'</span>');                        
                    html.push('</div>');
                    html.push('<a href="javascript:;" class="prev" id="slidebtn_prev"><s></s></a>');
                    html.push('<a href="javascript:;" class="next" id="slidebtn_next"><s></s></a>'); 
                    html.push('</div>');
                    
                    
                    html.push('<div id="slide_small">');
                    html.push('<div class="spbox">');
                    html.push('<div class="picsmall fn-clear">');
                    html.push(slide2);                    
                    html.push('</div>');
                    html.push('</div>');
                    html.push('<a href="javascript:;" class="prev disabled" id="slidebtn2_prev"><s></s></a>');
                    html.push('<a href="javascript:;" class="next" id="slidebtn2_next"><s></s></a>');
                    html.push('</div>');
                    html.push('<div class="slideinfo">'); 
                    html.push('<h3>'+title+'</h3>'); 
                    html.push('<div class="pub">'); 
                    html.push('<span>面积 '+info.area+echoCurrency('areasymbol')+'</span>');                     
                    html.push('<span>形状 '+info.fieldsname+'</span>');                     
                    html.push('<span>最大桌数 '+info.maxtable+'桌</span>');                     
                    html.push('<span>层高 '+info.floorheight+'m</span>');                     
                    html.push('<span>立柱 '+info.columnname+'</span>');                     
                    //html.push('<span>最佳桌数 '+info.length+'桌</span>');                     
                    html.push('</div>'); 
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

        var data = $('#subForm').serialize()+'&comtype=1';

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





})
