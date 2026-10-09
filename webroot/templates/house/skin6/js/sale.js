$(function () {

    $("img").scrollLoading();
    $(".totalCount b").html(totalCount);

    //地铁站最后一个点样式
    lastPoint();
    function lastPoint() {
        var l = $('.ditie-sub-point ').length;
        var t = $('.subway-sub-title .direction-line:last-child .ditie-sub-point:last-child');
        var n= Math.ceil(l/14);
        if(n%2 == 0){
            t.find('.line-info').addClass('no-left');
        }else{
            t.find('.line-info').addClass('no-right');
        }
    }

    $('.lplist').delegate('.codebox', 'hover', function (event) {
        var type = event.type;
        var url = $(this).parent().find('a').attr('href');
        if (type == "mouseenter") {
            $(this).find('.qrcode').css("display", "block");
            $(this).find('#qrcode').qrcode({
                render: window.applicationCache ? "canvas" : "table",
                width: 74,
                height: 74,
                text: huoniao.toUtf8(url)
            });
        } else {
            $(this).find('.qrcode').css("display", "none");
            $(this).find('#qrcode').html('');
        }
    });
    $('.lplist').delegate('.btn_sc', 'click', function (event) {
        var t = $(this),
            type = t.hasClass("btn_ysc") ? "del" : "add",
            id = t.closest('li').attr('data-id');
        var userid = $.cookie(cookiePre + "login_user");
        if (userid == null || userid == "") {
            huoniao.login();
            return false;
        }
        if (type == "add") {
            t.addClass("btn_ysc").html("<i class='isc'></i>已收藏");
        } else {
            t.removeClass("btn_ysc").html("<i class='isc'></i>收藏");
        }
        $.post("/include/ajax.php?service=member&action=collect&module=house&temp=sale_detail&type=" + type + "&id=" +
            id);
    });


    /**
     * 筛选变量
     */
    //区域、公交/地铁
    $(".t-fi-item li a").bind("click", function () {
        var t = $(this).parent(),
            index = t.index();
        if (!t.hasClass("curr")) {
            t.addClass("curr").siblings("li").removeClass("curr");
            $(".t-fi .sub-fi").hide();
            $(".t-fi .sub-fi:eq(" + index + ")").show();
        } else {
            t.removeClass("curr");
            $(".t-fi .sub-fi:eq(" + index + ")").hide();
        }
        t.addClass('active').siblings().removeClass('active');

    });

    // 筛选区域的点击事件 切换位置筛选类型 curr 价格是否为自定义
    $('.filterlist').delegate('a', 'click', function(){
      var t = $(this), par = t.closest('dl'), con = t.parent(), index = par.index();
      if(con.hasClass('area') || con.hasClass('subway') || index == 4 || con.hasClass('pos-item')) return;	// 区域和更多条件区域单独处理

      t.addClass('curr').siblings().removeClass('curr');
      if(index == 1){
        $('.inp_price').removeClass('curr');
      }
    })

    // 一级区域
    $('.areabox .pos-item a').click(function () {
        var t = $(this),
            i = t.index(),
            item = t.closest('.areabox').find('.pos-sub-item'),
            id = t.attr("data-id");
        if(t.hasClass('disabled')) return;
        t.addClass('curr').siblings().removeClass('curr');
        item.html('<a href="javascript:;" class="all curr">不限</a>');
        if (i == 0) {
            item.hide();
        }else{
            $.ajax({
                url: "/include/ajax.php?service=house&action=addr&type=" + id,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if (data && data.state == 100) {
                        var list = [],
                            info = data.info;
                        list.push('<a href="javascript:;"  data-area="' + id +
                            '" data-business="0" class="all curr">不限</a>');
                        for (var i = 0; i < info.length; i++) {
                            list.push('<a href="javascript:;" data-area="' + id + '" data-business="' + info[i].id + '">' +
                                info[i].typename + '</a>');
                        }
                        item.html(list.join(""));
                        item.show();
                    }
                }
            });
         }
    })
    // 地铁
    $('.subwaybox .pos-item a').click(function () {
        var t = $(this),
            i = t.index(),
            item = t.closest('.subwaybox').find('.pos-sub-item'),
            id = t.attr("data-id");
        t.addClass('curr').siblings().removeClass('curr');
        $(".pos-sub-item .left-direction").html('');
        $(".pos-sub-item .right-direction").html('');
        if (i == 0) {
            item.hide();
        }else{
            item.show();
            }
    });
    // 地铁二级
    $('.subwaybox').delegate('.ditie-sub-point', 'click', function (event) {
        var t = $(this),
            par = t.closest('.direction-line');
        if (par.hasClass('left-direction')) {
            $('.right-direction .ditie-sub-point').removeClass('show')
        } else {
            $('.left-direction .ditie-sub-point').removeClass('show')
        }
        t.addClass("show").siblings().removeClass("show");

    });
    


    // 自定义价格
    $("#price_sure").bind("click",function () {
        var price1 = $.trim($("#price1").val()), price2 = $.trim($("#price2").val());
        var price = [];
        if(price1 == 0 && price2 == ''){
            return false;
        }
        if(price1 != "" || price2 != ""){
            if(price1 != ""){
                price.push(price1);
            }
            price.push(",");

            if(price2 != ""){
                price.push(price2);
            }
        }

        location.href = priceUrl.replace("pricePlaceholder", price.join(""));
    });



  	// 自定义面积
    $("#area_sure").bind("click",function () {
        var price1 = $.trim($("#areaLow").val()), price2 = $.trim($("#areaTop").val());
        var price = [];
        if(price1 == 0 && price2 == ''){
            return false;
        }
        if(price1 != "" || price2 != ""){
            if(price1 != ""){
                price.push(price1);
            }
            price.push(",");

            if(price2 != ""){
                price.push(price2);
            }
        }

        location.href = areaUrl.replace("areaPlaceholder", price.join(""));
    });

    //更多筛选条件
    $(".filter .more .item").hover(function () {
        $(this).find("ul").stop().slideDown(150);
    }, function () {
        $(this).find("ul").stop().slideUp(150);
    });

    $('.more .item').delegate('li', 'click', function (event) {
        var t = $(this),par = t.closest('.item'),label = par.find('label'),itemtxt = par.find('span'),ptext = label.attr('title'),id = t.attr('data-id'),text = t.find('a').text();
    	if (t.index() == 0) {
            itemtxt.removeClass('cur').html(ptext);
        } else {
      		itemtxt.addClass('cur').html(text);
        }
        t.addClass('active').siblings().removeClass('active');
	    t.closest("ul").hide();

    });

    // 复选框
    $(".checklist").delegate("li", "click", function () {
        var t = $(this).children("s");
        t.hasClass("checked") ? t.removeClass("checked") : t.addClass("checked");
    });

    // 单个删除
    $(".fi-state").delegate(".idel", "click", function () {
        var par = $(this).parent(), group = par.attr('data-group'), level = par.attr("data-level"), id = par.attr("data-id");
        if(group == 0 && level == 1){
            par.siblings('[data-group="0"]').remove();
        }
        par.remove();
        if($(".selected-info").length == 0){
          $(".fi-state").hide();
        }
        clearFilter(group, level, id);

    });

    // 清空条件
    $(".btn_clear").on("click", function () {
        $(".fi-state").hide().children('dd').html('');
        clearFilter();
        $(".fi-state").hide();

    });

    function clearFilter(obj, level, id){
      var group = obj ? obj : 'all';
      if(group == 'all' || group == 'keywords') keywords = '';
      $('.filterlist dl').each(function(g){
        if(group == 'all' || group == g){
            var box = $(this);
            if(group == 'all' || g != 0 || (g == 0 && level == 1)){
              box.find('.curr').removeClass('curr');
              box.find('.cur').removeClass('cur');
              box.find('.active').removeClass('active');
            }
            if(g == 0){

              // 清除二级
              if($('.t-fi-item .curr').index() == 0){
                $('.areabox .pos-sub-item a:eq(0)').addClass('curr').siblings().removeClass('curr');
              }else if($('.t-fi-item .curr').index() == 1){
                $('.ditie-sub-point').removeClass('show')
                $('.subwaybox .left-direction .ditie-sub-point:eq(0)').addClass('show');
              }

              if(level == 1 || level == undefined){
                $('.pos-sub-item').hide();
                $('.sub-fi').hide();
                $('.areabox .pos-item a').eq(0).addClass('curr');
                $('.subwaybox .pos-item a').eq(0).addClass('curr');
              }

            }else if(g == 4){

            	if(group == 'all' || level == undefined || level == 1){
					box.find('.item').each(function(){
						var it = $(this), txt = it.children('label').attr('title');
						it.find('span').text(txt);
					})
				}
				if(group == 'all' || level == undefined || level == 2){
					$(".checklist li s").removeClass('checked');
				}
            }else{
              box.find('dd a:eq(0)').addClass('curr');
              if(g == 1){
                $('.inp_price input[type="input"]').val('');
              }else if(g == 2){
                $('.inp_area input[type="input"]').val('');
              }
            }
          }
        })
    }


    //排序
    $(".m-t li").bind("click", function () {
        var t = $(this),
            i = t.index(),
            id = t.attr('data-id');
        orderby = id;

        if (!t.hasClass("curr")) {
            t.addClass("curr").siblings("li").removeClass("curr");
        }
    });

    $(".m-o a").bind("click", function () {
        var t = $(this),
            i = t.index(),
            id = t.attr('data-id');
        if (i == 1) {
            pantime = id;
        } else if (i == 2) {
            price = id;
        }

        if (!t.hasClass("curr")) {
            t.addClass("curr").siblings("a").removeClass("curr");
        } else {
            if (t.hasClass("curr") && t.hasClass("ob")) {
                t.hasClass("up") ? t.removeClass("up") : t.addClass("up");
            }
        }

    });

    // 对比
    let compareArr = []; //正在展示的数据
    let hasSelected=JSON.parse(localStorage.getItem('sale_compare')); //已选择过的对比项
    if(hasSelected&&hasSelected.length>0){ //添加
        for(let i=0;i<hasSelected.length;i++){
            let item=hasSelected[i];
            addCompare(item);
        }
        compareArr=hasSelected;
    }
    $('.cv-btn').click(function(){ //展开
        $('.c-vertical').hide();
        $('.c-level').show();
    });
    $('.clt-btn').click(function(){ //隐藏
        $('.c-level').hide();
        $('.c-vertical').show();
    })
    let timeoutTimer = '';
    let selectNumber=0; //选择对比数量
    let deleteArr=[]; //之前选择过的，然后删除了
    $('.main .hirig').delegate('.btn_db','click',function(){ //列表添加对比
        let element=$(this);
        let id=element.attr('data-id');
        $('.cv-btn').click();
        if (checkSame(id)) { //检验是否已经添加
            return false
        }
        for(let i=0;i<deleteArr.length;i++){ //检查是否之前添加过
            let item=deleteArr[i];
            if(item.id==id){ //之前已经添加过
                addCompare(item); //添加
                deleteArr.splice(i,1); //从deleteArr中移除
                return false
            }
        }
        getTarget(id);
    });
    $('.clc-list').delegate('.item','click',function(){ //对比选择/取消选择
        let state=$(this).attr('class').includes('selected'); //true:已选择，false:未选择
        if(state){ //取消选中
            --selectNumber;
            $(this).removeClass('selected');
        }else if(selectNumber<4){ //选中
            ++selectNumber;
            $(this).addClass('selected');

        }else{
            popWarn('最多选择4项')
        }
    });
    $('.clc-list').delegate('.item .right .delete','click',function(e){ //删除单条信息操作
        e.stopPropagation(); //父级绑定的有事件，这里处理一下
        let state=$(this).closest('.item').attr('class').includes('selected'); //是否被选中
        if(state){
            --selectNumber;
        }
        let id=$(this).attr('data-id');
        deleteCompare(id);
        $(this).closest('.item').remove();
    });
    $('.clc-btn').delegate('.clear','click',function(){ //全部清除操作
        selectNumber=0;
        for(let i=0;i<compareArr.length;i++){
            let item=compareArr[i];
            deleteArr.push(item); //全部移动到deleteArr中
        }
        compareArr=[];
        localStorage.removeItem('sale_compare');
        $('.clc-list').html(''); //样式清空
    });
    $('.clc-btn').delegate('.start','click',function(){ //对比跳转
        let child=$('.clc-list').find('.item');
        if(child.length==0){
            popWarn('请添加房源对比列');
        }else{
            let idArr=[];
            for(let i=0;i<child.length;i++){ //选中id整理
                let item=child.eq(i);
                if(item.hasClass('selected')){
                    idArr.push(item.attr('data-id'));
                }
            }
            if(idArr.length<2){ //没有选中任何数据
                popWarn('至少选择两个对比项');
            }else{ //跳转
                open(`${channelDomain}/sale-compare.html?id=${idArr.join(',')}`);
            }
        }
    });
    async function getTarget(id) { //获取详情数据
        let data = {
            service: 'house',
            action: 'saleList',
            id: id
        };
        let result = await ajax(data, { dataType: 'json' });
        if (result.state == 100) {
            addCompare(result.info.list[0]);
        } else {
            popWarn(result.info);
        }
    }
    function addCompare(item) { //增加对比元素
        compareArr.push(item);
        // 渲染
        let str=`
            <div class="item" data-id="${item.id}">
                <div class="left">
                    <img src="${templets_skin}images/confirm.png">
                    <span>${item.title}</span>
                </div>
                <div class="right">
                    <div class="num">${item.price>0?`${Number(item.price)}万`:'面议'}</div>
                    <img src="${templets_skin}images/close2.png" class="delete" data-id="${item.id}">
                </div>
            </div>`;
        $('.clc-list').prepend(str);
        localStorage.setItem('sale_compare',JSON.stringify(compareArr));
    }
    function popWarn(info) { //弹窗提示
        $('.warnPop').text(info);
        $('.warnPop').css({ 'display': 'flex' });
        clearTimeout(timeoutTimer);
        timeoutTimer = setTimeout(res => {
            $('.warnPop').hide();
        }, 2000);
    }
    function checkSame(id) { //检验重复添加对比
        for (let i = 0; i < compareArr.length; i++) {
            let item = compareArr[i];
            if (item.id == id) {
                popWarn('该房源已在对比列中');
                return true
            }
        }
        return false
    }
    function deleteCompare(id){ //删除对比元素
        for(let i=0;i<compareArr.length;i++){
            let item=compareArr[i];
            if(item.id==id){ //找到了
                compareArr.splice(i,1); //移除
                deleteArr.push(item); //添加到deleteArr中
                localStorage.setItem('sale_compare', JSON.stringify(compareArr));
                return false
            }
        }
    }
});