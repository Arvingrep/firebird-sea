$(function () {
    toggleDragRefresh('off');
    //年月日
    $('.demo-test-date').scroller(
        $.extend({preset: 'date', dateFormat: 'yy-mm-dd'})
    );
    //年检时间
    $('.yearly-time').scroller(
        $.extend({preset: 'date', dateFormat: 'yy-mm-dd'})
    );

    //时间控件 修改结束时间
    var currYear = (new Date()).getFullYear();
    //交强险到期时间
    $('.compulsory-time').scroller(
        $.extend({preset: 'date', dateFormat: 'yy-mm-dd',endYear: currYear + 20})
    );
    //商业险到期时间
    $('.commercial-time').scroller(
        $.extend({preset: 'date', dateFormat: 'yy-mm-dd',endYear: currYear + 20})
    );
    // 首付比例
    var ratioArr = [0.2,0.3,0.5,0.6,0.8]
    var RenovationSelect = new MobileSelect({
        trigger: '.payments',

        wheels: [
            {data: ratioArr}
        ],

        position:[0, 0],
        callback:function(indexArr, data){
            for(var i=0; i<data.length; i++){
                $('#payments-text').val(data[i]);
                $('.payments .choose span').hide();
                var pay = $('#price_text').val()*data[i];
                $('.pay_price i').html(pay.toFixed(2));
            }
        }
        ,triggerDisplayData:false
    });
    // 图片参考
    $('.img_box h3 i').click(function () {
        $('.refer-img-bg').addClass('show');
    });
    $('.refer-img-bg .refer-img-box .close').on('click',function () {
        $('.refer-img-bg').removeClass('show');
    });

    // 分期
    $('.info-box li.stages').click(function () {
        $(this).toggleClass('chose_btn');
        if(!$(this).hasClass('chose_btn')){
            $("#staging").val(0);
            $('.info-box li.payments').hide();
        }else{
            $("#staging").val(1);
            $('.info-box li.payments').show();
        }
    });

    // 选择所在地
    // $('.area').on('click',function () {
    //     $('.mask_car').removeClass('mask-hide');
    //     $('.block-area').addClass('show');
    // });
    $('.block-area .nav-final .back').on('click',function () {
        $('.mask_car').addClass('mask-hide');
        $('.block-area').removeClass('show');
    });
    // 城市
    $('.block-area .list-line li').on('click',function () {
        $('.block-area-sub').addClass('show');
    });
    $('.block-area-sub .nav-final .back').on('click',function () {
        $('.block-area-sub').removeClass('show');
    });

    $('.block-area-sub .list-line li').on('click',function () {
        var t = $(this).find('span').html();
        var s = $('.block-area-sub .nav-final p').html();
        $('#area-text').val(s+'-'+t);
        $('.mask_car').addClass('mask-hide');
        $('.aside').removeClass('show');
        $('.area .choose span').hide();
    });

    //分类品牌
    $('.brand').on('click',function () {
        $('.mask_car').removeClass('mask-hide');
        //初始化已选择的品牌
        $('.block-brand .aside-main li').removeClass('has');
        $('.block-cartype li').removeClass('has-two');

        $('.block-brand').addClass('show');
    });
    $('.block-brand .nav-final .back').on('click',function () {
        $('.mask_car').addClass('mask-hide');
        $('.block-brand').removeClass('show');
    });

    //分类车系
    $('.block-brand .aside-main li').on('click',function () {
        var t = $(this), id = t.data('id'), title = t.find('.bread_text').text();
         $('.block-brand .aside-main li').removeClass('has');
         t.addClass('has');
        if(id!=''){
            $("#brand").val(id);
            $.ajax({
                url: '/include/ajax.php?service=car&action=typeList&page=1&pageSize=9999&orderby=3&chidren=1&type=' + id,
                type: 'get',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        var html = [], list = data.info.list;
                        html.push('<nav class="nav-final"><p>'+title+'</p><a class="back"></a></nav>');
                        html.push('<div class="aside-main">');
                        for(var i = 0; i < list.length; i++){
                            html.push('<h3 class="tt">'+list[i].typename+'</h3>');
                            if(list[i]['lower'] != null){
                                html.push('<ul class="list-line">');
                                for(var j = 0; j < list[i]['lower'].length; j++){
                                    html.push('<li data-id="'+list[i]['lower'][j].id+'">'+list[i]['lower'][j].typename+'</li>');
                                }
                                html.push('</ul>');
                            }
                        }
                        html.push('</div>');
                        $('.block-cartype').html(html.join(''));
                        $('.block-cartype').addClass('show');
                        $('.aside .aside-main').scrollTop(0);
                    }else{
                        getModel(id, title);
                        //alert(langData['car'][6][49]);
                    }
                },
                error: function(){
                }
            })
        }
    });

    //$('.block-cartype .nav-final .back').on('click',function () {
    $(".block-cartype").delegate(".back","click",function(){
        $('.block-cartype').removeClass('show');
    });

    // 车型分类
    //$('.block-cartype .aside-main li').on('click',function () {
    $(".block-cartype").delegate("li","click",function(){
        var t = $(this), id = t.data('id'), title = t.text();
        $('.block-cartype li').removeClass('has-two');
         t.addClass('has-two');
         //已选择的品牌
        var hasOneTxt = $('.block-brand .aside-main li.has').find('.bread_text').text();
        title = hasOneTxt+' '+title;
        if(id!=''){
            $("#brand").val(id);
            getModel(id, title);
        }
    });

    //获取型号
    function getModel(id, title){
        if(id!=''){
            title = title ? title : '';
            $.ajax({
                url: '/include/ajax.php?service=car&action=carmodel&page=1&pageSize=9999&orderby=3&brand=' + id,
                type: 'get',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        var html = [], list = data.info.list;
                        html.push('<nav class="nav-final"><p>'+title+'</p><a class="back"></a></nav>');
                        html.push('<div class="aside-main">');
                        var tempYear = '';
                        for(var i = 0; i < list.length; i++){
                            if(tempYear == list[i]['prodate']){
                                html.push('<li data-id="'+list[i]['id']+'">'+list[i]['title']+'</li>');
                            }else{
                                html.push('</ul>');
                                tempYear = list[i]['prodate'];
                                html.push('<h3 class="tt">'+list[i]['prodate']+langData['car'][6][50]+' <i></i></h3>');
                                html.push('<ul class="list-line">');
                                html.push('<li data-id="'+list[i]['id']+'">'+list[i]['title']+'</li>');
                            }
                        }
                        html.push('</div>');
                        $('.cartype-sub').html(html.join(''));
                        $('.cartype-sub').addClass('show');
                        $('.cartype-sub .aside-main').scrollTop(0);
                    }else{
                        $("#brand").val(id);
                        $("#model").val(0);
                        $("#brand-text").val(title);
                        $("#title-text").val(title);

                        $('.brand .choose span').hide();
                        $('.aside').removeClass('show');
                        $('.mask_car').addClass('mask-hide');
                        //alert(langData['car'][6][49]);
                    }
                },
                error: function(){
                }
            });
        }
    }

    //$('.cartype-sub .nav-final .back').on('click',function () {
    $(".cartype-sub").delegate(".back","click",function(){
        $('.mask_car').addClass('mask-hide');
        $('.aside').removeClass('show');
    });
    //$('.cartype-sub .tt').click(function(){
    $(".cartype-sub").delegate(".tt","click",function(){
        $(this).toggleClass('curr');
        $(this).parent().find('.list-line').toggleClass('hide');
    });

    //$('.cartype-sub .list-line li').on('click',function () {
    $(".cartype-sub").delegate("li","click",function(){
        var t = $(this).html(), id = $(this).data('id');
        if(id!=''){
            $("#model").val(id);
        }
        //已选择的品牌
        var hasTxt='',hasTwo='';
        if($('.block-brand .aside-main li').hasClass('has')){
            hasTxt = $('.block-brand .aside-main li.has').find('.bread_text').text();
        }

        //已选择的车系
        if($('.block-cartype li').hasClass('has-two')){
            hasTwo = $('.block-cartype li.has-two').text()
        }

        $('#brand-text').val(hasTxt+' '+hasTwo+' '+t);
        $('#title-text').val(hasTxt+' '+hasTwo+' '+t);
        $('.brand .choose span').hide();
        $('.aside').removeClass('show');
        $('.mask_car').addClass('mask-hide');
    });

    //点击背景
    $('.mask_car').on('click',function () {
        $('.mask_car').addClass('mask-hide');
        $('.block-brand').removeClass('show');
        $('.block-area').removeClass('show');
        $('.cartype-sub').removeClass('show');
        $('.block-cartype').removeClass('show');
    });

    // $('.block-brand .aside-main ul li').click(function () {
    //     var t = $(this).find('.bread_text').html();
    //     $('#brand-text').val(t);
    //     $('.brand .choose span').hide();
    //     $('.mask_car').addClass('mask-hide');
    //     $('.block-brand').removeClass('show');
    // });

    // 选择颜色
    $('.color').on('click',function () {
        $('.color-select').fadeIn();
        $('.color-select .content').addClass('fire-in');
    });
    $('.color-select .graybg ').click(function () {
        $('.color-select').fadeOut();
    });
    $('.color-select .content .btnBar .cancel').click(function () {
        $('.color-select').fadeOut();
    });

    $('.color-select .panel ul li').click(function () {
        $(this).addClass('select').siblings('.select').removeClass('select');
        var t = $(this).find('p').html();
        $('#color-text').val(t);
        $('.color .choose span').hide();
        $('.color-select').fadeOut();
    });

    // 汽车性质
    $('.property .ppty-box span').click(function () {
        $(this).addClass('active').siblings('.active').removeClass('active');
        var ids = [];
        $('.property .ppty-box span').each(function(){
            if($(this).hasClass('active')){
                ids.push($(this).data('id'));
            }
        })
        $('#propertyture').val(ids.join(","));
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
                        $('.areacode_span').closest('li').hide();
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
        $(".areacode_span label").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })


    // 信息提示框
    $('.maskbg .msg-box .btn-close').click(function () {
        $('.maskbg').hide();
    });
    //表单验证
    function isPhoneNo(p) {
        var areaCode = parseInt($("#areaCode").val());
        if(areaCode == 86){
            var pattern = /^1[23456789]\d{9}$/;
            return pattern.test(p);
        }
        return true;
    }

    $('.fabu_btn .btn').on('click',function () {
        var t = $(this);
        var brand = $('#brand-text').val();
        var color = $('#color-text').val();
        //var area = $('#addrid').val();
        var cardtime = $('#card-time').val();
        var trip = $('#trip').val();
        var propertyture = $('#propertyture').val();
        var price = $('#price_text').val();
        var explain = $('#explain').val();
        var contact = $('#contactname').val();
        var phone = $('#contact').val();
        var code = $('#code').val();
        var payments = $('#payments-text').val();
        var addrid = 0, cityid = 0, r = true;

        var guohu =$('#guohu_text').val();
        var yearly = $('#yearly-time').val();
        var compulsory = $('#compulsory-time').val();
        var commercial = $('#commercial-time').val();
        var areaCode   = $('#areaCode').val();
        //$('.class').css('display')=='none';
        var codenone = $('.code').css('display');


       if($('.img_box .imgshow_box').length == 0){
           r = false;
           $('.maskbg').show();
           $('.maskbg .msg-box .msg').html(langData['car'][4][0]);
       }else if(!brand){
           r = false;
           $('.maskbg').show();
           $('.maskbg .msg-box .msg').html(langData['car'][4][1]);
       }else if(!color){
           r = false;
           $('.maskbg').show();
           $('.maskbg .msg-box .msg').html(langData['car'][4][2]);
       //}else if(!area){
           //r = false;
           //$('.maskbg').show();
           //$('.maskbg .msg-box .msg').html(langData['car'][4][3]);
       }else if(!cardtime){
           r = false;
           $('.maskbg').show();
           $('.maskbg .msg-box .msg').html(langData['car'][4][4]);
       }else if(!trip){
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(langData['car'][4][5]); //请输入行程
        }else if(!guohu){
           r = false;
           $('.maskbg').show();
           $('.maskbg .msg-box .msg').html(langData['car'][7][57]); //请填写过户次数
       }else if(!yearly){
           r = false;
           $('.maskbg').show();
           $('.maskbg .msg-box .msg').html(langData['car'][7][58]); //请选择年检时间
       }else if(!compulsory){
           r = false;
           $('.maskbg').show();
           $('.maskbg .msg-box .msg').html(langData['car'][7][59]); //请选择交强险到期时间
       }else if(!commercial){
           r = false;
           $('.maskbg').show();
           $('.maskbg .msg-box .msg').html(langData['car'][7][60]); //请选择商业险到期时间
       }else if(!propertyture){
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(langData['car'][4][6]);
        }else if(!price){
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(langData['car'][4][7]);
        }else if(!explain){
           r = false;
           $('.maskbg').show();
           $('.maskbg .msg-box .msg').html(langData['car'][4][8]);
        }else if(!contact){
           r = false;
           $('.maskbg').show();
           $('.maskbg .msg-box .msg').html(langData['car'][4][13]);
        }else if(!phone){
           r = false;
           $('.maskbg').show();
           $('.maskbg .msg-box .msg').html(langData['car'][4][9]);
        }else if (isPhoneNo($.trim($('#contact').val())) == false  && areaCode == 86) {
           r = false;
           $('.maskbg').show();
           $('.maskbg .msg-box .msg').html(langData['car'][4][10]);
       }else if(!code && codenone!='none'){
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(langData['car'][4][11]);
        }else if($('.stages').hasClass('chose_btn')){
           if(!payments){
               r = false;
               $('.maskbg').show();
               $('.maskbg .msg-box .msg').html(langData['car'][4][12]);
           }
       }

        var ids = $('.gz-addr-seladdr').attr("data-ids");
        if(ids != undefined && ids != ''){
            addrid = $('.gz-addr-seladdr').attr("data-id");
            ids = ids.split(' ');
            cityid = ids[0];
        }else{
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(langData['car'][6][48]);
        }
        $('#addrid').val(addrid);
        $('#cityid').val(cityid);
        $('#location').val(cityid);

        var pics = [];
        $("#fileList").find('.thumbnail').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#pics").val(pics.join(','));

        if(!r){
            return;
        }

       var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
		data = form.serialize();

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");  //提交中

		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					fabuPay.check(data, url, t);
				}else{
                    $('.maskbg').show();
                    $('.maskbg .msg-box .msg').html(data.info);
					//$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['car'][3][21]);   //立即投稿
					//$("#verifycode").click();
				}
			},
			error: function(){
                $('.maskbg').show();
                $('.maskbg .msg-box .msg').html(langData['siteConfig'][20][183]);
				//$.dialog.alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
				t.removeClass("disabled").html(langData['car'][3][21]); //立即投稿
				//$("#verifycode").click();
			}
		});




    });

    $('.info-box li.price input').live('input propertychange',function () {
        $('.info-box li.price em').addClass('dack');
    });
    $('.info-box li.trip input').live('input propertychange',function () {
        $('.info-box li.trip em').addClass('dack');
    });

    var phone_ = $('#contact').val();
    $('#contact').live('input propertychange', function() {
        var phone = $('#contact').val();
        if (phone != phone_) {
            $('.info-box li.code').show();
            $('.info-box li.codemsg').show();
        }else{
            $('.info-box li.code').hide();
            $('.info-box li.codemsg').hide();
        }
    });


    // 侧边栏点击字幕条状
    var navBar = $(".navbar");
    navBar.on("touchstart", function (e) {
        $(this).addClass("active");
        $('.letter').html($(e.target).html()).show();


        var width = navBar.find("li").width();
        var height = navBar.find("li").height();
        var touch = e.touches[0];
        var pos = {"x": touch.pageX, "y": touch.pageY};
        var x = pos.x, y = pos.y;
        $(this).find("li").each(function (i, item) {
            var offset = $(item).offset();
            var left = offset.left, top = offset.top;
            if (x > left && x < (left + width) && y > top && y < (top + height)) {
                var id = $(item).find('a').attr('data-id');
                var cityHeight = $('#'+id).offset().top + $('.aside .aside-main').scrollTop();
                if(cityHeight>45){
                    $('.aside .aside-main').scrollTop(cityHeight-45);
                    $('.letter').html($(item).html()).show();
                }

            }
        });
    });

    navBar.on("touchmove", function (e) {
        e.preventDefault();
        var width = navBar.find("li").width();
        var height = navBar.find("li").height();
        var touch = e.touches[0];
        var pos = {"x": touch.pageX, "y": touch.pageY};
        var x = pos.x, y = pos.y;
        $(this).find("li").each(function (i, item) {
            var offset = $(item).offset();
            var left = offset.left, top = offset.top;
            if (x > left && x < (left + width) && y > top && y < (top + height)) {
                var id = $(item).find('a').attr('data-id');
                var cityHeight = $('#'+id).offset().top + $('.aside .aside-main').scrollTop();
                if(cityHeight>45) {
                    $('.aside .aside-main').scrollTop(cityHeight - 45);
                    $('.letter').html($(item).html()).show();
                }
            }
        });
    });


    navBar.on("touchend", function () {
        $(this).removeClass("active");
        $(".letter").hide();
    })




});
