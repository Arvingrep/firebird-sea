var history_search = 'history_search_shop';
var tjPage = 1, tjLoad = false; //推荐数据
  var userLng = userLat = '';
$(function(){
    checkLeft();
    function checkLeft() {
        var offL = $('.headbox li.curr:not(.fn-hide)').offset().left;
        var wL = $('.headbox li.curr:not(.fn-hide)').width() / 2;
        var sl = $(".headbox s").width() / 2;
        $(".headbox s").css('left',(offL + wL - sl))
        
    }

    //获取url中的参数
    function getUrlParam(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if ( r != null ){
         return decodeURI(r[2]);
      }else{
         return null;
      }
    }


   
    var nowkeywords = decodeURI(getUrlParam('keywords'));
    if(nowkeywords && nowkeywords != 'null'){
        $('#keywords').val(nowkeywords);
        $('.cancelSear').show();

        if(nowkeywords){
            var history = utils.getStorage(history_search);
            history = history ? history : [];
            if(history && history.length >= 10 && $.inArray(nowkeywords, history) < 0){
                history = history.slice(1);
            }

            // 判断是否已经搜过
            if($.inArray(nowkeywords, history) > -1){
                for (var i = 0; i < history.length; i++) {
                    if (history[i] === nowkeywords) {
                        history.splice(i, 1);
                        break;
                    }
                }
            }
            history.push(nowkeywords);
            utils.setStorage(history_search, JSON.stringify(history));
        }
    }


    //搜索提交
    $('#keywords').keydown(function(e){
        if(e.keyCode==13){
            var keywords = $('#keywords').val();
            //记录搜索历史
            if(keywords){
                var history = utils.getStorage(history_search);
                history = history ? history : [];
                if(history && history.length >= 10 && $.inArray(keywords, history) < 0){
                    history = history.slice(1);
                }

                // 判断是否已经搜过
                if($.inArray(keywords, history) > -1){
                    for (var i = 0; i < history.length; i++) {
                        if (history[i] === keywords) {
                            history.splice(i, 1);
                            break;
                        }
                    }
                }
                history.push(keywords);
                utils.setStorage(history_search, JSON.stringify(history));
            }
            
        }
    })

    //监听input
    $("#keywords").bind('input propertychange', function() {
        var tVal = $(this).val();
        if(tVal !=""){
            $('.cancelSear').show();
        }else{
            $('.cancelSear').hide();
        }
    })


    //取消
    $('.cancelSear').click(function(){
        $(this).hide();
        $('#keywords').val("");
    })
    //搜索关键字
    // $('.form_search').submit(function(){
    //     isload = false;
    //     getList(1);
    //     return false;
    // })

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
            slideChangeTransitionStart:function() {
                // body...
                $(".headbox .curr").removeClass('curr');
                $(".headbox li:not(.fn-hide)").eq(tabsSwiper.activeIndex).addClass('curr');
                checkLeft();
                $('.filterBox .comfilter').eq($(".headbox li:not(.fn-hide)").eq(tabsSwiper.activeIndex).index()).addClass('comshow').siblings('.comfilter').removeClass('comshow');
            },
            slideChangeTransitionEnd: function() {
                // $("#tabs-container .swiper-slide-active").removeClass('noData')
                $(".headbox .curr").removeClass('curr');
                $(".headbox li:not(.fn-hide)").eq(tabsSwiper.activeIndex).addClass('curr');
                checkLeft();
                $('.filterBox .comfilter').eq($(".headbox li:not(.fn-hide)").eq(tabsSwiper.activeIndex).index()).addClass('comshow').siblings('.comfilter').removeClass('comshow');
                isload = false;
                getList(1);
                pinpai();
                
                
            },
        },
    })

    //区域展开
    $('.comfilter .quyu').click(function(){
        $('.comfilter .shaixuan').removeClass('curr');
        if(!$(this).hasClass('curr')){
            $(this).addClass('curr').siblings('a').removeClass('curr');
            $('html').addClass('noscroll')
            $('.mask').show();
            $('.filterBot').addClass('show');
            $('.filterBot .filerAlert,.filterBot .sxAlert').removeClass('show');
            $('.filterBot .quyuAlert').addClass('show');
        }else{
            $(this).removeClass('curr');
            $('html').removeClass('noscroll')
            $('.mask').hide();
            $('.filterBot').removeClass('show');
            $('.filterBot .quyuAlert').removeClass('show');
        }
        
    })
    // 二级地域切换
    $('.quyuAlert .chooseLeft a').click(function(){
        var par = $(this).closest('li');
        par.addClass('curr').siblings('li').removeClass('curr');
        var i = $(this).index();
        var id = $(this).attr('data-id'), typename = $(this).text();
        var lower = $(this).attr('data-lower');
        if(lower == 0){
            $('.comfilter.comshow .quyu span').text(typename);
            $('.comfilter.comshow .quyu').attr('data-id',id);
            hideFilter();
            isload = false;
            getList(1);
            $('.quyuAlert').removeClass('active');
            $(".quyuAlert .chooseRight ul").html('');
        }else{
            $('.quyuAlert').addClass('active');
            $.ajax({
                url: "/include/ajax.php?service=shop&action=addr&type="+id,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    if(data && data.state == 100){
                        var html = [], list = data.info;
                        html.push('<li class="all"><a href="javascript:;" data-id="'+id+'" data-name="'+typename+'">全部</a></li>');
                        for (var i = 0; i < list.length; i++) {
                            var curr = (typeid == list[i].id || parentid == list[i].id)? 'curr' :''
                            html.push('<li class="'+curr+'"><a href="javascript:;" data-id="'+list[i].id+'" data-name="'+list[i].typename+'">'+list[i].typename+'</a></li>');
                        }
                        $(".quyuAlert .chooseRight ul").html(html.join(""));
                    }else if(data.state == 102){
                        $(".quyuAlert .chooseRight ul").html('<li class="all"><a href="javascript:;" data-id="'+id+'"data-name="'+typename+'">全部</a></li>');
                    }else{
                        $(".quyuAlert .chooseRight ul").html('<li class="load">'+data.info+'</li>');
                    }
                },
                error: function(){
                    $(".quyuAlert .chooseRight ul").html('<li class="load">'+langData['info'][1][29]+'</li>');
                }
            });
        }
        

    });
    //选择二级
    $('.quyuAlert .chooseRight').delegate('a','click',function(){
        var par = $(this).closest('li');
        par.addClass('curr').siblings('li').removeClass('curr');
        var id = $(this).attr('data-id'), typename = $(this).attr('data-name');
        // $('.comfilter.comshow .quyu span').text(typename);
        // $('.comfilter.comshow .quyu').attr('data-id',id);
        $('.comfilter .quyu span').text(typename);
        $('.comfilter .quyu').attr('data-id',id);
        hideFilter();
        isload = false;
        getList(1);

    }); 

    //排序--展开
    $('.comfilter .orderby').click(function(){
        $('.comfilter .shaixuan').removeClass('curr');
        var t= $(this);
        var par = t.closest('.comfilter');
        var parIndex = par.index(); 
        if(stype == 'shop'){
            parIndex = 2;
        }
        if(!$(this).hasClass('curr')){
            //var sibA = 
            $(this).addClass('curr').siblings('a:not(.special)').removeClass('curr');
            $('html').addClass('noscroll')
            $('.mask').show();
            $('.filterBot').addClass('show');
            $('.filterBot .filerAlert,.filterBot .sxAlert').removeClass('show');
            if(parIndex == 0){//到店优惠
                $('.filterBot .pxAlert[data-type="daodian"]').addClass('show');
            }else if(parIndex == 1){//送到家
                $('.filterBot .pxAlert[data-type="tohome"]').addClass('show');
            }else{
                $('.filterBot .pxAlert[data-type="business"]').addClass('show');
            }
        }else{
            $(this).removeClass('curr');
            $('html').removeClass('noscroll')
            $('.mask').hide();
            $('.filterBot').removeClass('show');
            $('.filterBot .pxAlert').removeClass('show');
        }
            
        
    })
    //选择排序
    $('.pxAlert').delegate('a','click',function(){
        var par = $(this).closest('li');
        par.addClass('curr').siblings('li').removeClass('curr');
        var id = $(this).attr('data-id'), typename = $(this).text();
        $('.comfilter.comshow .orderby span').text(typename);
        $('.comfilter.comshow .orderby').attr('data-id',id);
        hideFilter();
        isload = false;
        getList(1);
        pinpai();
    });


    //分类--展开
    $('.comfilter .fenlei').click(function(){
        $('.comfilter .shaixuan').removeClass('curr');
        var t= $(this);  
        if(!$(this).hasClass('curr')){
            $(this).addClass('curr').siblings('a:not(.special)').removeClass('curr');
            $('html').addClass('noscroll')
            $('.mask').show();
            $('.filterBot').addClass('show');
            $('.filterBot .filerAlert,.filterBot .sxAlert').removeClass('show');
            $('.filterBot .fenleiAlert').addClass('show');
            
        }else{
            $(this).removeClass('curr');
            $('html').removeClass('noscroll')
            $('.mask').hide();
            $('.filterBot').removeClass('show');
            $('.filterBot .fenleiAlert').removeClass('show');
        }
            
        
    })

    // 二级分类切换
    $('.fenleiAlert .chooseLeft a').click(function(){
        console.log('222')
        var par = $(this).closest('li');
        par.addClass('curr').siblings('li').removeClass('curr');
        var i = $(this).index();
        var id = $(this).attr('data-id'), typename = $(this).text();
        var lower = $(this).attr('data-lower');
        if(lower == 0 || $('.comfilter.comshow').index() == 2){//商家的时候 只有一级分类
            $('.comfilter .fenlei span').text(typename);
            $('.comfilter .fenlei').attr('data-id',id);
            hideFilter();
            isload = false;
            getList(1);
            $('.fenleiAlert').removeClass('active');
            $(".fenleiAlert .chooseRight ul").html('');
        }else{
            $('.fenleiAlert').addClass('active');
            $.ajax({
                url: "/include/ajax.php?service=shop&action=type&type="+id,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    if(data && data.state == 100){
                        var html = [], list = data.info;
                        html.push('<li class="all"><a href="javascript:;" data-id="'+id+'">全部'+typename+'</a></li>');
                        for (var i = 0; i < list.length; i++) {
                            html.push('<li><a href="javascript:;" data-id="'+list[i].id+'" data-lower="'+list[i].lower+'">'+list[i].typename+'</a></li>');
                        }
                        $(".fenleiAlert .chooseRight ul").html(html.join(""));
                    }else if(data.state == 102){
                        $(".fenleiAlert .chooseRight ul").html('<li class="all"><a href="javascript:;" data-id="'+id+'">全部'+typename+'</a></li>');
                    }else{
                        $(".fenleiAlert .chooseRight ul").html('<li class="load">'+data.info+'</li>');
                    }
                    
                },
                error: function(){
                    $(".fenleiAlert .chooseRight ul").html('<li class="load">'+langData['info'][1][29]+'</li>');
                }
            });
        }
        

    });

   

    //选择分类
    $('.fenleiAlert .chooseRight').delegate('a','click',function(){
        var par = $(this).closest('li');
        par.addClass('curr').siblings('li').removeClass('curr');
        var id = $(this).attr('data-id'), typename = $(this).text();
        var lower = $(this).attr('data-lower');
        if(lower > 0){
            $('.fenleiAlert .lowerBox').addClass('show');
            setTimeout(function(){
                $('.fenleiAlert .lowerBox .lower_con').addClass('slideShow');
            },100)
            $.ajax({
                url: "/include/ajax.php?service=shop&action=type&type="+id,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    if(data && data.state == 100){
                        var html = [], list = data.info;
                        html.push('<li class="all"><a href="javascript:;" data-id="'+id+'">全部'+typename+'</a></li>');
                        for (var i = 0; i < list.length; i++) {
                            html.push('<li><a href="javascript:;" data-id="'+list[i].id+'">'+list[i].typename+'</a></li>');
                        }
                        $(".fenleiAlert .lowerBox ul").html(html.join(""));
                    }else if(data.state == 102){
                        $(".fenleiAlert .lowerBox ul").html('<li class="all"><a href="javascript:;" data-id="'+id+'">全部'+typename+'</a></li>');
                    }else{
                        $(".fenleiAlert .lowerBox ul").html('<li class="load">'+data.info+'</li>');
                    }
                    
                },
                error: function(){
                    $(".fenleiAlert .lowerBox ul").html('<li class="load">'+langData['info'][1][29]+'</li>');
                }
            });
        }else{
            
            $('.fenleiAlert .lowerBox').removeClass('show');
            $('.fenleiAlert .lowerBox .lower_con').removeClass('slideShow')
            $('.comfilter .fenlei span').text(typename);
            $('.comfilter .fenlei').attr('data-id',id);
            hideFilter();
            isload = false;
            getList(1);
            $('.fenleiAlert').removeClass('active');
            $(".fenleiAlert .chooseRight ul").html('');
        }
        // $('.comfilter .fenlei span').text(typename);
        // $('.comfilter .fenlei').attr('data-id',id);
        // hideFilter();
        // isload = false;
        // getList(1);
        // pinpai();
    });

    $(".lower_mask").click(function(){
        $('.fenleiAlert .lowerBox .lower_con').removeClass('slideShow')
        setTimeout(() => {
            $('.fenleiAlert .lowerBox').removeClass('show');
        }, 300);
    })
    
    // //选择分类
    $('.fenleiAlert .lowerBox .lower_con').delegate('a','click',function(){
        var par = $(this).closest('li');
        par.addClass('curr').siblings('li').removeClass('curr');
        var id = $(this).attr('data-id'), typename = $(this).text();
        $('.comfilter .fenlei span').text(typename);
        $('.comfilter .fenlei').attr('data-id',id);
        hideFilter();
        isload = false;
        getList(1);
        pinpai();
    });

    //筛选
    $('.comfilter .shaixuan').click(function(){
        var t= $(this);
        var par = t.closest('.comfilter');
        var parIndex = parseInt(par.attr('data-id')); 
        if(stype == 'shop'){
            parIndex = 3;
        }
        if(!$(this).hasClass('curr')){
            $('.comfilter a:not(.special)').removeClass('curr');
            $(this).addClass('curr');
            $('html').addClass('noscroll')
            $('.mask').show();
            $('.filterBot').addClass('show');
            $('.filterBot .filerAlert,.filterBot .sxAlert').removeClass('show');
            if(parIndex == 1){//到店优惠
                $('.filterBot .sxAlert[data-type="daodian"]').addClass('show');
            }else if(parIndex == 2){//送到家
                $('.filterBot .sxAlert[data-type="tohome"]').addClass('show');
            }else{
                $('.filterBot .sxAlert[data-type="business"]').addClass('show');
            }
        }else{
            $(this).removeClass('curr');
            $('html').removeClass('noscroll')
            $('.mask').hide();
            $('.filterBot').removeClass('show');
            $('.filterBot .sxAlert').removeClass('show');
        }        
    })

    //筛选框
    $('.sxTop').delegate('a','click',function(){
        var comdl = $(this).closest('.comdl'), param = comdl.attr('data-chose');
        if(param == 'opentime'){
            $(this).toggleClass('active').siblings('a').removeClass('active');
            if($(this).attr('data-id') == '1'){
                $(".yingye ").addClass('curr')
            }else{
                 $(".yingye ").removeClass('curr')
            }
        }else{
             $(this).toggleClass('active')
        }

       
        var sxCount = $(".sxAlert.show .comdl .active").length;
        if(sxCount > 0){
            $(".sxAlert.show .sure .sxNum").text('('+sxCount+')')
        }else{
            $(".sxAlert.show .sure .sxNum").text('')
        }
        
    })

    //筛选--确定
    $('.sxAlert .sure').click(function(){
        var sxArr = [];
        var par = $(this).closest('.sxAlert');
        var partype = par.attr('data-type');
        var comdl = par.find('.sxTop .comdl');
        var sxCount = 0
        comdl.each(function(){
            var t = $(this);
            var ttype = t.attr('data-chose');
            var ttidArr = []
            
            t.find('a.active').each(function(){
                sxCount++;
                var ttid = $(this).attr('data-id');
                ttidArr.push(ttid)
            })
            
            sxArr.push(ttype+'='+ttidArr.join(','));
        });
        if(sxCount > 0){
            $('.comfilter.comshow .shaixuan .sx_num').text('('+sxCount+')');
            $('.comfilter.comshow .shaixuan').addClass('red')
        }else{
            $('.comfilter.comshow .shaixuan .sx_num').text('')
            $('.comfilter.comshow .shaixuan').removeClass('red')
        }
        
        if(partype != 'business'){
            var minprice = par.find('#min_price').val();
            var maxprice = par.find('#high_price').val();
            if (minprice!='' || maxprice !='') {

                sxArr.push('price='+minprice+','+maxprice);
            }
        }else{//商家有快捷筛选
            // if($('.sxAlert .comdl[data-chose="discount"]').find('a.active').size() > 0){
            //     $('.busfilter .istuan').removeClass('curr');
            // }

            // if($('.sxAlert .comdl[data-chose="opentime"]').find('a.active').size() > 0){
            //     $('.busfilter .yingye').removeClass('curr');
            // }
        }
        $('.comfilter.comshow .shaixuan').attr('data-id',sxArr.join('&'))
        hideFilter();
        isload = false;
        getList(1);
    })
    //筛选--重置
    $('.sxAlert .reset').click(function(){
        var sxArr = [];
        var par = $(this).closest('.sxAlert');
        var partype = par.attr('data-type');
        var comdl = par.find('.sxTop .comdl');
        comdl.find('a').removeClass('active');
        if(partype != 'business'){
            par.find('#min_price').val('');
            par.find('#high_price').val('');
        }
        $('.comfilter.comshow .shaixuan .sx_num').text('')
        $('.comfilter.comshow .shaixuan').removeClass('red')
        $(".sxAlert.show .sure .sxNum").text('');

        $(".fn-right .sure").click()
    })

    //筛选 -- 品牌
    $('.brand dd a').each(function(){
        if($(this).index() > 3){
            $(this).hide();
        }
    })
    //筛选 -- 品牌展开
    $('.sxAlert .moreInfo').click(function(){
        if(!$(this).hasClass('hst')){
            $(this).addClass('hst');
            $('.brand dd a').show();
        }else{
            $(this).removeClass('hst');
            $('.brand dd a:gt(3)').hide();
        }

    })

    //选择时间--展开
    $('.sxAlert .choseTime').click(function(){
        $('.sxTop dl.bidl dd a.ttime').css('display','inline-block');
    })

    //同城购
    $('.tcfilter .tcg').click(function(){
        hideFilter();
        $('.comfilter .shaixuan').removeClass('curr');
        $(this).toggleClass('curr').siblings('a').removeClass('curr');
        isload = false;
        getList(1);
        pinpai();
    })

    //商家--快捷筛选 营业中
    $('.busfilter .yingye').click(function(){
        if(!$(this).hasClass('curr')){
            $(this).addClass('curr');
            // $('.sxAlert[data-type="business"] .comdl[data-chose="opentime"] a').removeClass('active');
            $('.sxAlert[data-type="business"] .comdl[data-chose="opentime"] a[data-id="1"]').addClass('active');
            // if($('.istuan').hasClass('curr')){//选择了团购
            //     $('.comfilter.comshow .shaixuan').attr('data-id','opentime=1&discount=2')
            // }else{//没选择团购 --看筛选里面选了什么
            //     var ttid = $('.sxAlert[data-type="business"] .comdl[data-chose="discount"]').find('a.active').attr('data-id');
            //     ttid = ttid?ttid:'';
            //     $('.comfilter.comshow .shaixuan').attr('data-id','opentime=1&discount='+ttid);
            // }
        }else{
            $(this).removeClass('curr');
            $('.sxAlert[data-type="business"] .comdl[data-chose="opentime"] a[data-id="1"]').removeClass('active');
            // if($('.istuan').hasClass('curr')){//选择了团购
            //     $('.comfilter.comshow .shaixuan').attr('data-id','opentime=&discount=2')
            // }else{//没选择团购 --看筛选里面选了什么
            //     var ttid = $('.sxAlert[data-type="business"] .comdl[data-chose="discount"]').find('a.active').attr('data-id');
            //     ttid = ttid?ttid:'';
            //     $('.comfilter.comshow .shaixuan').attr('data-id','opentime=&discount='+ttid);
            // }
        }
        // hideFilter(1);

        // $('.comfilter .shaixuan').removeClass('curr');
        // isload = false;
        // getList(1);
        $(".sxAlert[data-type='business'] .sure").click()
        
    })

    //商家--快捷筛选 团购
    $('.busfilter .istuan').click(function(){
        if(!$(this).hasClass('curr')){
            $(this).addClass('curr');
            // $('.sxAlert[data-type="business"] .comdl[data-chose="discount"] a').removeClass('active');
            $('.sxAlert[data-type="business"] .comdl[data-chose="discount"] a[data-id="2"]').addClass('active');
            // if($('.yingye').hasClass('curr')){//选择了营业中
            //     $('.comfilter.comshow .shaixuan').attr('data-id','discount=2&opentime=1')
            // }else{//没选择营业中 --看筛选里面选了什么

            //     var ttid = $('.sxAlert[data-type="business"] .comdl[data-chose="opentime"]').find('a.active').attr('data-id');
            //     ttid = ttid?ttid:'';
            //     $('.comfilter.comshow .shaixuan').attr('data-id','discount=2&opentime='+ttid);
            // }
        }else{

            $('.sxAlert[data-type="business"] .comdl[data-chose="discount"] a[data-id="2"]').removeClass('active');
            $(this).removeClass('curr');
            // if($('.yingye').hasClass('curr')){//选择了营业中
            //     $('.comfilter.comshow .shaixuan').attr('data-id','discount=&opentime=1')
            // }else{//没选择营业中 --看筛选里面选了什么
            //     var ttid = $('.sxAlert[data-type="business"] .comdl[data-chose="opentime"]').find('a.active').attr('data-id');
            //     ttid = ttid?ttid:'';
            //     $('.comfilter.comshow .shaixuan').attr('data-id','discount=&opentime='+ttid);
            // }
        }
        // hideFilter(1);
        // $('.comfilter .shaixuan').removeClass('curr');
        // isload = false;
        // getList(1);

        $(".sxAlert[data-type='business'] .sure").click()


    })

    //商家 -- 筛选同城商家
    $('.sameCity').click(function(){
        $(this).toggleClass('active');
        $('.busfilter .quyu').toggleClass('busquyu');
        isload = false;
        getList(1);
    })


    //关闭弹窗
    function hideFilter(sr){
        $('html').removeClass('noscroll')
        $('.mask').hide();
        if(!sr){
            $('.comfilter a:not(.special)').removeClass('curr');
        }        
        $('.comfilter .shaixuan').removeClass('curr');
        $('.filerAlert').removeClass('show');
        $('.filterBot').removeClass('show');
    }
    $('.mask').click(function(){
        hideFilter();
    })
  
    // 下拉加载
    var isload = false,atpage = 1,pageSize = 20;    
    $(window).scroll(function(){

        var allh = $('body').height();
        var w = $(window).height();
        var s_scroll = allh  - w;
        if(!$('#tabs-container .swiper-slide-active').hasClass('noData')){
            if ($(window).scrollTop()+50 > s_scroll && !isload) {
                atpage++;
                getList();
            };
        }
            

    })
    
    $('.headbox li').click(function() {
        var i = $(this).index();
        if($(this).prev('li.fn-hide').length > 0){
            i = i - $(this).prev('li.fn-hide').length
        }
        if (!$(this).hasClass('curr')) {
            tabsSwiper.slideTo(i);   
             hideFilter();  
            $('.filterBox .comfilter').eq(i).addClass('comshow').siblings('.comfilter').removeClass('comshow');
            $(this).addClass('curr').siblings().removeClass('curr');
            if(i == 2){
                if( $(".fenleiAlert  .chooseRight ul li.curr").length){
                    // $(".fenleiAlert  .chooseLeft li.curr").click()
                    $('.comfilter.comshow .fenlei').attr('data-id',$(".fenleiAlert  .chooseLeft li.curr a").attr('data-id'))
                    $('.comfilter.comshow .fenlei span').text($(".fenleiAlert  .chooseLeft li.curr a").text())
                }
                $(".fenleiAlert  .chooseRight ul").html('')
                $(".fenleiAlert  ").removeClass('active')
            }   		
           checkLeft();
        }

    })
    //从商家的搜本店过来的
    if(from == '1'){
       $('.headbox li:last-child').click() 
    }

    
    // 定位
    HN_Location.init(function(data){
        if (data == undefined ||  data.lat == "" || data.lng == "") {
            showErrAlert(langData['siteConfig'][27][136]);
             getList();
            //初始加载
            // if(typeid){
            //     $('.comfilter.comshow .fenlei').attr('data-id',typeid)
            //     // $('.fenleiAlert .chooseLeft a[data-id="'+typeid+'"]').click()
            //     getList();
            // }else{
            //     getList();
            // } 
        }else{
            userLng = data.lng;
            userLat = data.lat;
             getList();
            // if(typeid){
            //     $('.comfilter.comshow .fenlei').attr('data-id',typeid)
            //     // $('.fenleiAlert .chooseLeft a[data-id="'+typeid+'"]').click()
            // }else{
            //     getList();
            // }
        }
    })
    // var localData = utils.getStorage('user_local');
    // if(localData){
    //     userLat = localData.lat;
    //     userLng = localData.lng;
    //     //初始加载
    //      getList();
    //     // if(typeid){
    //     //     $('.comfilter.comshow .fenlei').attr('data-id',typeid)
    //     //     // $('.fenleiAlert .chooseLeft a[data-id="'+typeid+'"]').click()
    //     // }else{
    //     //     getList();
    //     // }
        
    // }else{
    //     HN_Location.init(function(data){
    //         if (data == undefined ||  data.lat == "" || data.lng == "") {
    //             showErrAlert(langData['siteConfig'][27][136]);
    //              getList();
    //             //初始加载
    //             // if(typeid){
    //             //     $('.comfilter.comshow .fenlei').attr('data-id',typeid)
    //             //     // $('.fenleiAlert .chooseLeft a[data-id="'+typeid+'"]').click()
    //             //     getList();
    //             // }else{
    //             //     getList();
    //             // } 
    //         }else{
    //             userLng = data.lng;
    //             userLat = data.lat;
    //              getList();
    //             // if(typeid){
    //             //     $('.comfilter.comshow .fenlei').attr('data-id',typeid)
    //             //     // $('.fenleiAlert .chooseLeft a[data-id="'+typeid+'"]').click()
    //             // }else{
    //             //     getList();
    //             // }
    //         }
    //     })
    // }
    /*品牌*/
    function pinpai(){
        var tindex = $('.headbox li.curr').index();
        if (tindex == 1) {

            data = [];
            var skeyword  = $('#keywords').val();
            var orderbyId = $('.comfilter.comshow .orderby').attr('data-id');
            var fenleiId  = $('.comfilter.comshow .fenlei').attr('data-id');
            var objId     = $('#pinpaihtml dd');
            data.push("title="+skeyword);
            if($('.comfilter .tcg').hasClass('curr')){
                data.push("cityid="+cityid);
            }
            data.push("orderby="+orderbyId);
            data.push("typeid="+fenleiId);
            data.push("moduletype=4");

            if (hottuan != '0' && hottuan != undefined) {
                data.push("hottuan="+hottuan);
            }

            var nowdata = data.join("&");
            url = "/include/ajax.php?service=shop&action=probrand"
            $.ajax({
                url: url,
                data: nowdata,
                type: "GET",
                dataType: "jsonp",
                async: false,
                success: function (data) {
                    if (data && data.state == 100) {
                        var list = data.info.list, pageinfo = data.info.pageInfo,totalPage = pageinfo.totalPage, lr;
                        var html = [];
                        for(var i = 0; i < list.length; i++) {
                            html.push('<a href="javascript:;" data-id="'+list[i].id+'">'+list[i].title+'</a>');
                        }
                        objId.html(html.join(""));
                    }
                }
            })
        }
    }



  //数据列表
  function getList(tr){

    if (isload) return false;
    isload = true;
    if(tr){
        atpage = 1;
        $('#tabs-container .swiper-slide-active .comList').find('ul').html('');
    }


    var tindex = $('.headbox li.curr').attr('data-id');
    var objId = $('#tabs-container .swiper-slide-active .comList')
    objId.find('.loading').remove();
    objId.append('<div class="loading">加载中</div>');
    //请求数据
    var data = [];
    data.push("pageSize="+pageSize);
    data.push("page="+atpage);
    data.push("pagetype="+pagetype);
    var quyuId = $('.comfilter.comshow .quyu').attr('data-id');
    var orderbyId = $('.comfilter.comshow .orderby').attr('data-id');
    var fenleiId = $('.comfilter.comshow .fenlei').attr('data-id');
    var sxId = $('.comfilter.comshow .shaixuan').attr('data-id');
    if(tindex == 1){//到店优惠
        data.push("addrid="+quyuId);
        data.push("moduletype=3");
        data.push("userlng="+userLng);
        data.push("userlat="+userLat);

    }else if(tindex == 2){//送到家
        if($('.comfilter .tcg').hasClass('curr')){
            data.push("tc=1");
        }
        data.push("moduletype=4");
    }else{//商家
        if($('.sameCity').hasClass('active')){
            data.push("tc=1");
            data.push("area="+quyuId);
        }
        data.push("lng="+userLng);
        data.push("lat="+userLat);
    }

    // if (tr == 1) {
    //     data.push("cityid="+cityid);
    // }
    data.push("cityid="+cityid);
    data.push("orderby="+orderbyId);

    if (tindex == 3) {
        data.push("industry="+fenleiId);
    } else {

        data.push("typeid="+fenleiId);
    }
    var skeyword = $('#keywords').val();
    data.push("title="+skeyword);

    if (hottuan != '0' && hottuan != undefined) {
        data.push("hottuan="+hottuan);
    }
    var nowdata = data.join("&")+'&'+sxId

    var url="";
    if(tindex == 3){//商家
        url= "/include/ajax.php?service=shop&action=store"
    }else{//
        url = "/include/ajax.php?service=shop&action=slist&flag="
    }
    $.ajax({
      url: url,
      data: nowdata,
      type: "GET",
      dataType: "jsonp",
    //   async:false,
      success: function (data) {   
        if(data && data.state == 100){
          var list = data.info.list, pageinfo = data.info.pageInfo,totalPage = pageinfo.totalPage, lr;
          var html1 = [], html2=[];
          if(list.length > 0){
            objId.find('.loading').remove()
            for(var i = 0; i < list.length; i++){
                var html = [];
                lr = list[i];
                var pic = lr.litpic == false || lr.litpic == '' ? '/static/images/404.jpg' : lr.litpic;
                var detailurl = detailUrl.replace('%id%',list[i].id);
                 detailurl = detailurl + (detailurl.indexOf('?') > -1 ? ('&pagetype='+pagetype) : ('?pagetype='+pagetype))
                var storedetailUrl = stdetailurl.replace('%id%',list[i].id);
                 storedetailUrl = storedetailUrl + (storedetailUrl.indexOf('?') > -1 ? ('&pagetype='+pagetype) : ('?pagetype='+pagetype))
                if(tindex == 1){//到店优惠
                  html.push('<li><a href="'+detailurl+'">');
                  html.push('  <div class="goodImg">');
                  html.push('  <img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';"></div>');
                  html.push('  <div class="goodInfo"> ');                                                 
                  html.push('    <h2 class="goodTitle">'+lr.title+'</h2>');
                    html.push('    <div class="goodSale">');
                    html.push('      <span>消费'+lr.sales+'</span>');
                    html.push('      <em></em>');
                    html.push('      <span>'+(lr.julishop > 1 ? (parseFloat(lr.julishop.toFixed(2)) +"km") : (lr.julishop * 1000 +"m"))+'</span>');
                    html.push('    </div>');
                    html.push('    <div class="goodPrice">');
                    var priArr = parseFloat(lr.price).toString().split('.');
                    var smallPoint = priArr.length >　1 ?　'<em>.'+priArr[1]+'</em>' : ''
                    html.push('      <span class="newPrice">'+echoCurrency('symbol')+'<strong>'+priArr[0]+'</strong>'+smallPoint+'</span>');
                    html.push('      <span class="oldPrice">'+echoCurrency('symbol')+'<em>'+parseFloat(lr.mprice)+'</em></span>');
                    html.push('    </div>  ');   
                    html.push('  </div>');
                    html.push('  <div class="goodStore">'+lr.storeTitle+'</div>');
                  
                  html.push('</a></li>');
                    if(i%2 == 0){
                        html1.push(html.join(""))  
                    }else{
                        html2.push(html.join(""))
                    }
                }else if(tindex == 2){//送到家
                
                  html.push('<li class="comLi"><a href="'+detailurl+'">');
                  html.push('  <div class="goodImg"><img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';"></div>');
                  html.push('  <div class="goodInfo">');  
                                    
                  html.push('    <h2 class="goodTitle">'+lr.title+'</h2>');
                  html.push('    <div class="choicePrice">');

                    var priArr = parseFloat(lr.price).toString().split('.');
                    var smallPoint = priArr.length >　1 ?　'<em>.'+priArr[1]+'</em>' : '';
                    var hasSale = lr.sales > 0 ? '<span class="hasSale">'+lr.sales+'件已售</span>' : ''
                    html.push('      <span class="newPrice">'+echoCurrency('symbol')+'<strong>'+priArr[0]+'</strong>'+smallPoint+'</span>' + hasSale);
                    
                                    
                  html.push('   </div>');

                  html.push('    <div class="choiceSale">');

                    if(lr.huodongarr==1){//准点抢购特有
                        html.push('<span class="xianshi">限时抢</span>');
                    }if(lr.huodongarr==4){//拼团
                        html.push('<span class="ptuan">拼团</span>');
                    } 
                    if(lr.quanhave >1){
                      html.push('<span class="quanspan comspan">券</span>');
                    }
                    if (lr.typesalesarr.indexOf('2') > -1 || lr.typesalesarr.indexOf('3')  > -1  ) {

                        html.push('<span class="tcs comspan">同城送</span>');
                    }
                    // html.push('<span class="by comspan">包邮</span>');

                    // if (lr.quanhave > 0) {
                    //
                    //     html.push('<span class="by comspan">优惠券</span>');
                    // }
                  html.push('      ');
                  html.push('    </div>');
                  html.push('  </div>');
                  html.push('</a>');
                  html.push('    <a class="choiceStore" href="'+lr.storeurl+'">');
                  html.push('  <span>'+lr.storeTitle+'</span><em>进店<s></s></em>');
                  html.push('</a></li>');
                    if(i%2 == 0){
                        html1.push(html.join(""))
                    }else{
                        html2.push(html.join(""))
                    }
                }else{//商家
                    var recStore = lr.rec == '1' ? '<span class="toptag">推荐</span>' : '';
                    var html3 = [];
                    var logo = lr.logo == '' ? staticPath+'images/404.jpg' : huoniao.changeFileSize(lr.logo, "large");
                        
                    html1.push('<li>');
                    html1.push('    <div class="storeTop"><a href="'+storedetailUrl+'">');
                    html1.push('        <div class="storeImg"><img src="'+logo+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/bus_default.png\';"></div>');
                    html1.push('        <div class="storeInfo">');

                    var tuanstr = '';
                    if (lr.shoptype == 1) {
                        tuanstr = "<em>团</em>";
                    }
                    html1.push('            <h2 class="storeTit"><strong>'+lr.title+'</strong>'+tuanstr+recStore+'</h2>');
                    html1.push('            <div>');
                    var rateArr = lr.rating.split('%');
                    var rating =  ((rateArr[0]/20).toFixed(1))>0?((rateArr[0]/20).toFixed(1)):'<em style="font-size:.22rem; color:#999;">暂无评分</em>';
                    html1.push('                <p class="haoping"><i></i><span>'+rating+'</span></p>');
                    html1.push('                <span class="storeType">'+lr.industry+'</span>');
                    var adrtxt = '';
                    if(lr.address != '' && lr.shoptype == '1'){
                       adrtxt = lr.address; 
                    }else{
                        if(lr.shoptype != '1'){
                            adrtxt = (lr.addr[0]+' '+lr.addr[1])
                        }else{

                         adrtxt = (lr.addr[lr.addr.length-2]?lr.addr[lr.addr.length-2]:'')+(lr.addr[lr.addr.length-1]?lr.addr[lr.addr.length-1]:'')
                        }
                    }

                    var collectText = '';
                    if(lr.quanhave){
                        collectText = '优惠券'
                    }else if(lr.dealShop >= 50){
                        collectText = lr.dealShop + '人已下单'
                    }else if(lr.collectnum){
                        collectText = lr.collectnum + '人已关注'
                    }
                    html1.push('                <span class="storeAdr">'+adrtxt+'</span>');

                    var disText = '';
                    if(lr.shoptype == '1'){
                        disText = lr.distance
                    }else{
                        disText = lr.minlogistic >= 0 ? '运费'+lr.minlogistic + echoCurrency("short") +'起' : '全店包邮'
                    }

                    html1.push('                <span class="storeJuli">'+disText+'</span>');
                    html1.push('            </div>');
                    if(collectText != ''){
                        html1.push('            <p class="storeCollect ">'+collectText+'</p>');
                    }
                    
                    html1.push('         </div>');
                    html1.push('    </a></div>');
                    html1.push('    <div class="storeBot fn-clear">');

                    var xiaoliang =  lr.xiaoliangarr;

                    for(var a = 0; a < xiaoliang.length; a++){
                        var myurl = detailUrl.replace('%id%',xiaoliang[a].id);
                          var photo = (xiaoliang[a].litpicpath == "" || xiaoliang[a].litpicpath == undefined) ? staticPath+'images/404.jpg' : xiaoliang[a].litpicpath ;
                          html3.push('        <dl><a href="'+myurl+'">');
                            var daodainstr = '';

                            if (xiaoliang[a].daodian == 1) {
                                daodainstr = '<span class="daod">到店</span>'
                            }
                          html3.push('            <dt><img src="'+photo+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';"><span class="daod">'+daodainstr+'</span></dt>');
                          html3.push('            <dd>');
                          html3.push('                <h2>'+xiaoliang[a].title+'</h2>');
                          var priceArr = xiaoliang[a].price.split('.');
                          html3.push('                <p><strong>'+echoCurrency('symbol')+'</strong><span>'+priceArr[0]+'</span></p>');
                          html3.push('            </dd>');
                          html3.push('        </a></dl>');
                    }
                    html1.push(html3.join(''));
                    html1.push('    </div>');
                    html1.push('</li>');
                }
              
            }
            $('#tabs-container .swiper-slide-active').removeClass('noData');
            // $('.emptyData,.command-list').hide();
            if(atpage == 1){
                if(tindex == 3){
                    objId.find('ul').html(html1.join(""));
                }else{
                    objId.find('.list_ul1').html(html1.join(""));
                    objId.find('.list_ul2').html(html2.join(""));
                }
              
            }else{
                if(tindex == 3){
                    objId.find('ul').append(html1.join(""));
                }else{
                    objId.find('.list_ul1').append(html1.join(""));
                    objId.find('.list_ul2').append(html2.join(""));
                }
              
            }

            
            isload = false;
            if(atpage >= pageinfo.totalPage){
                isload = true;
                objId.append('<div class="loading">没有更多了</div>');//没有更多了
            }

          //没有数据
          }else{
            isload = true;
            $('#tabs-container .swiper-slide-active').addClass('noData');
            objId.find('.loading').remove()
            tabsSwiper.updateAutoHeight(1);
            setTimeout(function(){
                tjList(1,tindex);
            },50)
          }

        //请求失败
        }else{
            isload = true;
            $('#tabs-container .swiper-slide-active').addClass('noData');
            objId.find('.loading').remove()
            tabsSwiper.updateAutoHeight(1);
            setTimeout(function(){
                tjList(1,tindex);
            },50)
            // $('.emptyData,.command-list').show();
          //objId.find('.loading').html('<div class="empty"></div><p>'+data.info+'</p>');
        }
        tabsSwiper.updateAutoHeight(100);
        
      },
      error: function(){
        isload = false;
        //网络错误，加载失败
        //objId.find('.loading').html('网络错误，加载失败'); // 网络错误，加载失败       
        $('#tabs-container .swiper-slide-active').addClass('noData');
        // $('.emptyData,.command-list').show();
        $('.emptyData p').html('网络错误，加载失败');
      }
     });
  }
  
    //推荐列表
    function tjList(tr,type){
        if(tr == 1){
            tjPage = 1;
            tjLoad = false;
        }
        if(tjLoad) return false;
        $(".swiper-slide-active .command-list.loading").html(langData['siteConfig'][20][184]);
        var moduletype = type == 1 ? '3' : '4';
        var url = "/include/ajax.php?service=shop&action=slist&flag=&page="+tjPage+"&pageSize=10&moduletype="+moduletype;
        if(type == 2){
            url = "/include/ajax.php?service=shop&action=store&page="+tjPage+"&pageSize=10"
        }

        var arrData = []
         arrData.push("userlng="+userLng);
         arrData.push("userlat="+userLat);
       
        //请求数据
        $.ajax({
          url: url,
          type: "GET",
          dataType: "jsonp",
          data:arrData.join('&'),
          success: function (data) {
            if(data){
              if(data.state == 100){
                var list = data.info.list, lr, html = [];
                if(list.length > 0){
                  $(".swiper-slide-active .command-list.loading").html('');
                  var html1 = [], html2 = [];
                  for(var i = 0; i < list.length; i++){
                    lr = list[i];
                    if(type == 0){
                        if(i%2 == 0){
                            html1.push('<li class="tuanPro"><a href="'+list[i].url+'" class="proLink">');
                            html1.push('<div class="pro_img"><img src="'+list[i].litpic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
                            html1.push('<div class="pro_info">');
                            html1.push('<h4>'+list[i].title+'</h4>');
                            html1.push('<p class="sale_info">');
                            if(list[i].sales >　0){
                                html1.push('<span>已售'+list[i].sales+'</span><em>|</em>');
                            }
                            html1.push('<span>'+(list[i].julishop > 1 ? (parseFloat(list[i].julishop.toFixed(2)) +"km") : (list[i].julishop * 1000 +"m"))+'</span></p>');
                            var price = list[i].price ? list[i].price : '';
                            var priceArr = price.split('.')
                            html1.push('<p class="pro_price"><span class="symbol">'+echoCurrency("symbol")+'</span><span class="num">'+priceArr[0]+'<em>'+(priceArr.length > 1 ? "." + priceArr[1] : "")+'</em></span></p>');
                            html1.push('</div></a></li>');
                        }else{
                            html2.push('<li class="tuanPro"><a href="'+list[i].url+'" class="proLink">');
                            html2.push('<div class="pro_img"><img src="'+list[i].litpic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
                            html2.push('<div class="pro_info">');
                            html2.push('<h4>'+list[i].title+'</h4>');
                            html2.push('<p class="sale_info">');
                            if(list[i].sales >　0){
                                html2.push('<span>已售'+list[i].sales+'</span><em>|</em>');
                            }
                             html2.push('<span>'+(list[i].julishop > 1 ? (parseFloat(list[i].julishop.toFixed(2)) +"km") : (list[i].julishop * 1000 +"m"))+'</span></p>');
                            var price = list[i].price ? list[i].price : '';
                            var priceArr = price.split('.')
                            html2.push('<p class="pro_price"><span class="symbol">'+echoCurrency("symbol")+'</span><span class="num">'+priceArr[0]+'<em>'+(priceArr.length > 1 ? "." + priceArr[1] : "")+'</em></span></p>');
                            html2.push('</div></a></li>');
                        }

                    }else if(type == 1){
                        var tcs = '';
                            if(list[i].typesalesarr.indexOf('2') > -1|| list[i].typesalesarr.indexOf('3')  > -1 || list[i].typesalesarr.indexOf('4') > -1) {
                                tcs = "<span>同城送</span>";
                            }
                        if(i%2 == 0){
                            html1.push('<li class="shopPro"><a href="'+list[i].url+'" class="proLink">');
                            html1.push('<div class="pro_img"><img src="'+list[i].litpic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
                            html1.push('<div class="pro_info">');
                            html1.push('<h4>'+list[i].title+'</h4>');
                            // html1.push('<p class="sale_info"><span>已售'+list[i].sales+'</span><em>|</em><span>2.5km</span></p>');
                            var price = list[i].price ? list[i].price : '';
                            var priceArr = price.split('.')
                            html1.push('<div class="pro_price">');
                            html1.push('<div class="price"><span class="symbol">'+echoCurrency("symbol")+'</span><span class="num">'+priceArr[0]+'<em>'+(priceArr.length > 1 ? "." + priceArr[1] : "")+'</em></span></div>');
                             if(list[i].sales > 0){
                                html1.push('<span class="sale">'+list[i].sales+'件已售</span>');
                            }
                            html1.push('</div>');
                            html1.push('<p class="sale_lab">'+tcs+(list[i].youhave?"<span>包邮</span>":"")+'</p>');
                            html1.push('</div></a></li>');
                        }else{
                            html2.push('<li class="shopPro"><a href="'+list[i].url+'" class="proLink">');
                            html2.push('<div class="pro_img"><img src="'+list[i].litpic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
                            html2.push('<div class="pro_info">');
                            html2.push('<h4>'+list[i].title+'</h4>');
                            // html2.push('<p class="sale_info"><span>已售'+list[i].sales+'</span><em>|</em><span>2.5km</span></p>');
                            
                            var price = list[i].price ? list[i].price : '';
                            var priceArr = price.split('.')
                            html2.push('<div class="pro_price">');
                            html2.push('<div class="price"><span class="symbol">'+echoCurrency("symbol")+'</span><span class="num">'+priceArr[0]+'<em>'+(priceArr.length > 1 ? "." + priceArr[1] : "")+'</em></span></div>');
                            if(list[i].sales > 0){
                                html2.push('<span class="sale">'+list[i].sales+'件已售</span>');
                            }
                            html2.push('</div>');
                            html2.push('<p class="sale_lab">'+tcs+(list[i].youhave?"<span>包邮</span>":"")+'</p>');
                            html2.push('</div></a></li>');
                        }
                    }else{
                        html1.push('<li class="store">');
                        html1.push('<a href="'+list[i].url+'" class="storeLink">');
                        html1.push('<div class="store_logo"><img src="'+list[i].logo+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
                        html1.push('<div class="store_info">');
                        html1.push('<h4>'+list[i].title+'</h4>');
                        var rateArr = lr.rating.split('%');
                        var rating =  ((rateArr[0]/20).toFixed(1))>0?((rateArr[0]/20).toFixed(1)):'5.0';
                        var collectText = list[i].dealShop > 50 ? '最近有'+list[i].dealShop+'人下单' : (lr.collectnum ? lr.collectnum + '人已关注' : '')
                        html1.push('<p class="store_star"><span class="star">'+(list[i].score1?(list[i].score1 * 1).toFixed(1):'5.0')+'</span><span class="xiadan">'+collectText+'</span></p>');
                        var address = '';
                        if(list[i].address && list[i].shoptype == 1){
                            address = list[i].address
                        }else{
                            // address = list[i].addr[0] +' '+ list[i].addr[1] 
                            address =  list[i].addr[1] 
                        }
                        html1.push('<p class="store_label"><span>'+list[i].industry+'</span><span>'+address+'</span></p>');
                        html1.push('</div></a> </li>');
                    }
                  
                  }
                  if(tjPage == 1){
                    $(".swiper-slide-active .goodlist").html('')
                  }
                  if($(".swiper-slide-active .goodlist").length > 1){
                      $(".swiper-slide-active .goodlist").eq(0).append(html1.join(""));
                      $(".swiper-slide-active .goodlist").eq(1).append(html2.join(""));
                  }else{
                    $(".swiper-slide-active .goodlist").eq(0).append(html1.join(""));
                  }
                  $(".swiper-slide-active .command-list  .loading").html('下拉加载更多');
                  tjPage++;
                  tjLoad = false;
                  if(tjPage > data.info.pageInfo.totalPage){
                    tjLoad = true;
                    $(".swiper-slide-active .command-list  .loading").html('没有更多了');
                  }
                //没有数据
                }else{
                  $(".swiper-slide-active .command-list  .loading").html(langData['siteConfig'][20][126]);
                }

              //请求失败
              }else{
                $(".swiper-slide-active .command-list .loading").html(data.info);
              }
            //加载失败
            }else{
              $(".swiper-slide-active .command-list .loading").html(langData['siteConfig'][20][462]);
            }
          },
          error: function(){
            $(".swiper-slide-active .command-list .loading").html(langData['siteConfig'][20][227]);
          }
        });
    }





})
