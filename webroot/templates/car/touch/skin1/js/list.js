$(function () {
	toggleDragRefresh('off');  //取消下拉刷新

	var sFlag = 0;
    // 显示下拉框
    $('.choose-tab  li').click(function(){
        var index = $(this).index();
        var local = $('.choose-local').eq(index);
        if ( local.css("display") == "none") {
            $(this).addClass('active').siblings('.choose-tab li').removeClass('active');
            local.show().siblings('.choose-local').hide();
            $('.mask').show();
          	if($(this).hasClass('brand') && !sFlag){//首页进入列表页 定位到选定的品牌
              if(listId){
                var scroH = $('.category-wrapper .brand-list li.curr').position().top;
                $('.category-wrapper').scrollTop(scroH);
                sFlag =1;
              }
            }
        }else{
            $(this).removeClass('active');
            local.hide();
            $('.mask').hide();
        }
    });
    //收起下拉框
    $('.choose-li  .up').click(function () {
        $(this).parent().hide();
        $('.mask').hide();
        $('.choose-tab  li').removeClass('active');
    });

    // 品牌筛选
    // 二级类别切换
    $('.choose-list .choose-brand .category-wrapper .brand-list li').click(function(){
        var t = $(this), id = t.data('id');
        if(id!=''){
            $.ajax({
                url: '/include/ajax.php?service=car&action=typeList&page=1&pageSize=9999&orderby=3&chidren=1&type=' + id,
                type: 'get',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        var html = [], list = data.info.list;
                        for(var i = 0; i < list.length; i++){
                            if(list[i]['lower'].length>0){
                                for(var j = 0; j < list[i]['lower'].length; j++){
                                    html.push('<li data-id="'+list[i]['lower'][j].id+'">'+list[i]['lower'][j].typename+'</li>');
                                }
                            }else{
                                html.push('<li data-id="'+list[i].id+'">'+list[i].typename+'</li>');
                            }
                        }
                        $('.brand-wrapper ul').html(html.join(''));
                    }else{
                        $('.brand-wrapper ul').html('');
                        $('.choose-local').hide();
                        $('.mask').hide();
                        $('.choose-tab .brand span').html(t.text());
                        $('.brand').attr('data-id', id);
                    }
                    getCarList(1);
                }
            });
        }
        $(this).addClass('curr').siblings().removeClass('curr');
        var i = $(this).index();
        $('.choose-list .choose-brand .brand-wrapper ul').eq(i).addClass('show').siblings().removeClass('show');
    });
  	if(listId){
    	$('.category-wrapper .brand-list li[data-id="'+listId+'"]').click();
  	}

    //$('.choose-brand .brand-wrapper ul li').click(function () {
    $(".choose-brand .brand-wrapper ul").delegate("li","click",function(){
        var t = $(this), id = t.data('id');
        $(this).addClass('active').siblings().removeClass('active');
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab .brand span').html($(this).html());
        $('.brand').attr('data-id', id);
        $('.choose-tab  li').removeClass('active');
        getCarList(1);
    });

    $('.choose-list .choose-brand .category-wrapper .brand-top').click(function () {
        $('.brand').attr('data-id', '');
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab .brand span').html($(this).html());
        $('.choose-tab  li').removeClass('active');
        getCarList(1);
    });



    // 更多筛选
    $('.choose-more .more-child ul li').click(function () {
        $(this).toggleClass('select');
    });

    $('.choose-more .panel ul li').click(function () {
        $(this).toggleClass('select');
    });

    $('.choose-more .btns span.cancel').click(function () {
        $('.choose-more .more-child ul li').removeClass('select');
        $('.choose-more .panel ul li').removeClass('select');
        // $('.choose-tab  li').removeClass('active');
        $('.choose-local').hide();
        $('.mask').hide();
        getCarList(1);
    });
    $('.choose-more .btns span.sure').click(function () {
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab  li').removeClass('active');
        getCarList(1);
    });

    // 排序筛选
    $('.choose-list .choose-sort li').click(function () {
        var t = $(this), id = t.data('id');
        $('.paixu').attr('data-id', id)
        $(this).addClass('active').siblings().removeClass('active');
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab .paixu span').html($(this).html());
        $('.choose-tab  li').removeClass('active');
        getCarList(1);
    });

    // 价格筛选
    $('.choose-price ul li').click(function () {
        var t = $(this), price = t.data('price');
        $('.price').attr('data-id', price);
        $(this).addClass('active').siblings().removeClass('active');
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab .price span').html($(this).html());
        $('.choose-tab  li').removeClass('active');
        getCarList(1);
    });



    var $d5 = $("#price_u");
    var $d5_buttons = $(".js-btn__d5");
    $d5.ionRangeSlider({
        skin: "big",
        type: "double",
        min: 0,
        max: 40,
        from: 10,
        to: 25,
        grid: true,
        step: 1
    });



    $('#price-text').html('10万-25万');
    $('#price-text').attr('data-price', '10,25');
    $d5.on("change", function () {
        var $inp = $(this);
        var v = $inp.prop("value");     // input value in format FROM;TO
        var from = $inp.data("from");   // input data-from attribute
        var to = $inp.data("to");       // input data-to attribute

        $('#price-text').html(''+from+'万-'+to+'万');
        $('#price-text').attr('data-price', from+','+to);
        if(to==40){
            $('#price-text').html(''+from+'万-'+to+'万以上');

        }
    });

    // 自定义价格
    $('#sure-btn').on('click',function () {
        $('.choose-local').hide();
        $('.mask').hide();
        var price = $('#price-text').attr('data-price');
        $('.price').attr('data-id', price);
        $('.choose-tab .price span').html($('#price-text').html());
        $('.choose-tab  li').removeClass('active');
        getCarList(1);
    });

    var d5_instance = $d5.data("ionRangeSlider");
    $d5_buttons.on("click", function () {
        var min = rand(0, 1000);
        var from = rand(min, min + 2000);
        var to = rand(from, from + 5000);
        var max = rand(to, to + 2000);
        var num = rand(0, 20);
        var step = rand(1, 100);


        d5_instance.update({
            min: min,
            max: max,
            from: from,
            to: to,
            grid_num: num,
            step: step

        });

    });

    function rand (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;

    }

    var servepage = 1;
    var totalpage = 0;
    var isload = false;

    $("#search").click(function(){
        var keywords = $("#keywords").val();
        if(keywords!=''){
            getCarList(1);
        }
    });

    // 获取汽车数据
    getCarList(1);

    function transTimes(timestamp, n){
        
        const dateFormatter = huoniao.dateFormatter(timestamp);
        const year = dateFormatter.year;
        const month = dateFormatter.month;
        const day = dateFormatter.day;
        const hour = dateFormatter.hour;
        const minute = dateFormatter.minute;
        const second = dateFormatter.second;
        
        if(n == 1){
            return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
        }else if(n == 2){
            return (year+'-'+month+'-'+day);
        }else if(n == 3){
            return (month+'-'+day);
        }else if(n == 4){
           return year;
       }else{
            return 0;
        }
    }

    function  getCarList(tr){
        if(tr){
			servepage = 1;
            $('.car-list').html('');
        }

        var data = [];
        data.push("page="+servepage);
        data.push("pageSize=10");
        var keywords = $("#keywords").val();
        if(keywords!='' && keywords!=null && keywords!=undefined){
            data.push("keywords="+keywords);
        }


        var brand = 0;
        brand = Number($(".brand").attr("data-id"));
        if(brand!='' && brand!=null && brand!=undefined){
            data.push("brand="+brand);
        }

        var price = $(".price").attr("data-id");
        price = price == undefined ? "" : price;
        if(price != ""){
            data.push("price="+price);
        }

        var orderby = $(".paixu").attr("data-id");
		orderby = orderby == undefined ? "" : orderby;
		if(orderby != ""){
			data.push("orderby="+orderby);
        }

        var color = [];
        $(".panel ul li").each(function(){
            var t = $(this), type = t.data('type');
            if(t.hasClass('select')){
                var colorid = t.data('id');
                color.push(colorid);
            }
        });
        color = color ? color.join(',') : '';
        if(color != ""){
            data.push("color="+color);
        }

        var level = [];
        var year  = [];
        var gearbox = [];
        var mileage = [];
        var emissions = [];
        var standard  = [];
        var flag = [];
        var fueltype = [];
        var internalsetting = [];
        $(".more-child ul li").each(function(){
            var t = $(this), type = t.data('type');
            if(type == 'level'){
                if(t.hasClass('select')){
                    var levelid = t.data('id');
                    level.push(levelid);
                }
            }else if(type == 'year'){
                if(t.hasClass('select')){
                    var yearid = t.data('id');
                    year.push(yearid);
                }
            }else if(type == 'gearbox'){
                if(t.hasClass('select')){
                    var gearboxid = t.data('id');
                    gearbox.push(gearboxid);
                }
            }else if(type == 'mileage'){
                if(t.hasClass('select')){
                    var mileageid = t.data('id');
                    mileage.push(mileageid);
                }
            }else if(type == 'emissions'){
                if(t.hasClass('select')){
                    var emissionsid = t.data('id');
                    emissions.push(emissionsid);
                }
            }else if(type == 'standard'){
                if(t.hasClass('select')){
                    var standardid = t.data('id');
                    standard.push(standardid);
                }
            }else if(type == 'flag'){
                if(t.hasClass('select')){
                    var flagid = t.data('id');
                    flag.push(flagid);
                }
            }else if(type == 'fueltype'){
                if(t.hasClass('select')){
                    var fueltypeid = t.data('id');
                    fueltype.push(fueltypeid);
                }
            }else if(type == 'internalsetting'){
                if(t.hasClass('select')){
                    var internalsettingid = t.data('id');
                    internalsetting.push(internalsettingid);
                }
            }
        });
        level = level ? level.join(',') : '';
        if(level != ""){
            data.push("level="+level);
        }

        year = year ? year.join(',') : '';
        if(year != ""){
            data.push("year="+year);
        }

        gearbox = gearbox ? gearbox.join(',') : '';
        if(gearbox != ""){
            data.push("gearbox="+gearbox);
        }

        mileage = mileage ? mileage.join(',') : '';
        if(mileage != ""){
            data.push("mileage="+mileage);
        }

        emissions = emissions ? emissions.join(',') : '';
        if(emissions != ""){
            data.push("emissions="+emissions);
        }

        standard = standard ? standard.join(',') : '';
        if(standard != ""){
            data.push("standard="+standard);
        }

        flag = flag ? flag.join(',') : '';
        if(flag != ""){
            data.push("flags="+flag);
        }

        fueltype = fueltype ? fueltype.join(',') : '';
        if(fueltype != ""){
            data.push("fueltype="+fueltype);
        }

        internalsetting = internalsetting ? internalsetting.join(',') : '';
        if(internalsetting != ""){
            data.push("internal="+internalsetting);
        }

        store = store ? store : '';
        if(store!=''){
            data.push("store="+store);
        }

        usertype = usertype ? usertype : '';
        if(usertype!=''){
            data.push("usertype="+usertype);
        }
        $.ajax({
            url: '/include/ajax.php?service=car&action=car',
            data: data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data && data.state != 200){
                    if(data.state == 101){
                        $('.loading span').text(langData['siteConfig'][20][126]);
                    }else{
                        var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
                        totalpage = pageInfo.totalPage;
                         //拼接列表
                         if(list.length > 0){
                            for(var i = 0; i < list.length; i++){
                                html.push('<li class="fn-clear"><a href="'+list[i].url+'">');
                                var tag = '';
                                if(list[i].flag.indexOf('4')!=-1){
                                    tag = '<i class="tag"></i>';
                                }
                                html.push('<div class="img"><img src="'+list[i].litpic+'" alt="">'+tag+'</div>');
                                html.push('<div class="info">');
                                var newss = '';
                                if(list[i].flag.indexOf('2')!=-1){
                                    newss = ' <span class="new"> </span>';
                                }
                                if(list[i].flag.indexOf('1')!=-1){
                                    newss += ' <span class="z_new"> </span>';
                                }
                                html.push('<div class="tit"> <span class="tit_tex sliceFont" data-num="30">'+list[i].title+'</span>'+newss+'</div>');
                                var usertype = list[i].usertype==1 ? langData['car'][6][66] : langData['car'][6][67];
                                html.push('<p class="con">'+transTimes(list[i].cardtime, 4)+langData['car'][6][55]+'  |  '+list[i].mileage+langData['car'][6][21]+'  |  '+usertype+'</p>');
                                if(list[i].staging==1){
                                    html.push('<p class="price">'+list[i].price+' <span class="fir-price">'+langData['car'][6][68]+list[i].sf+langData['car'][6][20]+'</span></p>');
                                }else{
                                    html.push('<p class="price">'+list[i].price+' </p>');
                                }
                                html.push('</div>');
                                html.push('</a></li>');
                            }
                            $('.car-list').append(html.join(''))
                            isload = false;
                            if(servepage == totalpage){
                                isload = true;
                                $('.loading span').text(langData['car'][6][69]);
                            }

                         }else{
                            $('.loading span').text(langData['siteConfig'][20][185]);
                         }
                    }
                }else{
                    $('.loading span').text(langData['siteConfig'][20][126]);
                }
            },
            error: function(){
                $('.loading span').text(langData['car'][6][65]);
            }
        });
    }

    $(window).scroll(function() {
        var sh = $('.carList .loading').height();
        var allh = $('body').height();
        var w = $(window).height();

        var s_scroll = allh - sh - w;

        //服务列表
        if ($(window).scrollTop() > s_scroll && !isload) {
            servepage++;
            isload = true;
            if(servepage <= totalpage){
                getCarList();
            }

        };

    });


    //控制标题的字数
    $('.sliceFont').each(function(index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        $(this).attr('title',$(this).text());
        if(len > num){
            $(this).html(text.substring(0,num) + '...');
        }
    });

    $('.sliceFont').live('each',function () {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        $(this).attr('title',$(this).text());
        if(len > num){
            $(this).html(text.substring(0,num) + '...');
        }
    });

    // 回到顶部
    $(window).scroll(function(){
        var this_scrollTop = $(this).scrollTop();
        if(this_scrollTop>200 ){
            $(".top").show();
        }else {
            $(".top").hide();
        }
    });






});
