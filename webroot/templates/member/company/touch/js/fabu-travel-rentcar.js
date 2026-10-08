 //分类品牌
    /* $('.type_car').on('click',function () {
        $('.mask_car').removeClass('mask-hide');
        $('.block-brand').addClass('show');
    }); */
    $('.block-brand .nav-final .back').on('click',function () {
        $('.mask_car').addClass('mask-hide');
        $('.block-brand').removeClass('show');
    });

    //分类车系
    $('.block-brand .aside-main li').on('click',function () {
        $('.block-cartype').addClass('show');
        $('.aside .aside-main').scrollTop(0);
    });
    $('.block-cartype .nav-final .back').on('click',function () {
        $('.block-cartype').removeClass('show');
    });
    // 车型分类
    $('.block-cartype .aside-main li').on('click',function () {
        $('.cartype-sub').addClass('show');
        $('.cartype-sub .aside-main').scrollTop(0);
    });
    $('.cartype-sub .nav-final .back').on('click',function () {
//      $('.mask_car').addClass('mask-hide');
        $('.cartype-sub').removeClass('show');
    });
    $('.cartype-sub .tt').click(function(){
        $(this).toggleClass('curr');
        $(this).parent().find('.list-line').toggleClass('hide');
    });

    $('.cartype-sub .list-line li').on('click',function () {
        var t = $(this).html();
        $('#brand-text').val(t);
        $('.brand .choose span').hide();
        $('.aside').removeClass('show');
        $('.mask_car').addClass('mask-hide');
    });

    //点击背景
    $('.mask_car').on('click',function () {
        $('.mask_car').addClass('mask-hide');
        $('.block-brand').removeClass('show');
        $('.block-area').removeClass('show'); 
        $('.aside').removeClass('show');
    });
    

    // 酒店类别筛选
    function getType(){
        $.ajax({
            type: "POST",
            url: masterDomain + "/include/ajax.php?service=travel&action=rentcartype&value=1",
            dataType: "jsonp",
            success: function(res){
                if(res.state==100 && res.info){
                    var typeSelect = new MobileSelect({
                        trigger: '.type_car',
                        title: '',
                        wheels: [
                            {data:res.info}
                        ],
                        position:[0, 0],
                        callback:function(indexArr, data){
                            $('#brand-text').val(data[0]['value']);
                            $('#typeid').val(data[0]['id']);
                        }
                        ,triggerDisplayData:false,
                    });
                }
            }
        });
    }

    getType();


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
    });
    
    //增加车型特点
    $('.add_feature .add_btn').click(function(){
    	var l = $('.add_feature ul li').length;
    	$('.add_feature ul').append('<li data-type = "'+l+'" ><input type="text" placeholder="'+langData['siteConfig'][7][0]+'" maxlength="4"/><i class="del_label"></i></li>');//请输入
    });
    //删除车型特点
    $('.add_feature').delegate('.del_label','click',function(){
    	
    	$(this).parents('li').remove();
    });
    
    //提交数据
    $('.btn-keep').on('click',function(e){
        e.preventDefault();

        var t = $("#fabuForm"), action = t.attr("action"), url = t.attr("data-url");
        var addrid = 0, cityid = 0, r = true;

        var typeid = $('#typeid').val(),           //车型
            title  = $('#title').val(),            //标题
            address = $('#address').val(),         //详细地址
            price_area = $('#price_area').val();   //租金

        if($('#fileList li.thumbnail').length<=0){
            r = false;
            showErr(langData['travel'][3][27]);  //'请至少上传1张图片'
        }else if(typeid=='' || typeid==undefined){
            r = false;
            showErr(langData['travel'][9][9]);//请选择车型
            return;
        }else if(title=='' || title==undefined){
            r = false;
            showErr(langData['travel'][12][42]);//请输入汽车标题
            return;
        }else if(address=='' ||address==undefined){
            r = false;
            showErr(langData['travel'][8][61]);//请输入详细地址
            return;
        }else if(price_area=='' || price_area==undefined){
            r = false;
            showErr(langData['travel'][9][11]);//请输入租金
            return;
        }
        
        var ids = $('.gz-addr-seladdr').attr("data-ids");
        if(ids != undefined && ids != ''){
            addrid = $('.gz-addr-seladdr').attr("data-id");
            ids = ids.split(' ');
            cityid = ids[0];
        }else{
            r = false;
            showErr(langData['homemaking'][5][19]);  //请选择所在地
            return;
        }
        $('#addrid').val(addrid);
        $('#cityid').val(cityid);

        var pics = [];
        $("#fileList").find('.thumbnail').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#pics").val(pics.join(','));

        var video = [];
        $("#fileList2").find('.thumbnail').each(function(){
            var src = $(this).find('video').attr('data-val');
            video.push(src);
        });
        $("#video").val(video.join(','));

        //获取酒店特色
        var feature = [];
        $('.add_feature ul').find('li').each(function(){
            var t = $(this),val = t.find('input').val(), featureid = t.data('type');
            if(val!=''){
                feature.push(val);
            }
        })
        $("#car_type").val(feature.join('|'));

        if(!r){
            return;
        }
    
        $("#btn-keep").addClass("disabled").html(langData['siteConfig'][6][35]+"...");	//提交中
    
        $.ajax({
            url: action,
            data: t.serialize(),
            type: 'post',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    var tip = langData['siteConfig'][20][341];
                    if(id != undefined && id != "" && id != 0){
                        tip = langData['siteConfig'][20][229];
                    }
                    location.href = url;
                }else{
                    showErr(data.info);
                    $("#btn-keep").removeClass("disabled").html(langData['marry'][2][58]);		//立即发布
                }
            },
            error: function(){
                showErr(langData['siteConfig'][6][203]);
            }
        })

    });

    //错误提示
	var showErrTimer;
	function showErr(txt){
	    showErrTimer && clearTimeout(showErrTimer);
	    $(".popErr").remove();
	    $("body").append('<div class="popErr"><p>'+txt+'</p></div>');
	    $(".popErr p").css({"margin-left": -$(".popErr p").width()/2, "left": "50%"});
	    $(".popErr").css({"visibility": "visible"});
	    showErrTimer = setTimeout(function(){
	        $(".popErr").fadeOut(300, function(){
	            $(this).remove();
	        });
	    }, 1500);
	}