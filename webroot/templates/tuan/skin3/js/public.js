var isgoing,tuanInit,glocart,cartbtn,carcountObj,cartcontent,cartwrap,cartlist,cartul,statics,onClass;
$(function () {
    // 导航

    $('.nav li').hover(function () {
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
    });

    /* 左侧导航 */
    $(".category-popup").hover(function(){
        $(this).find("li").show();
        $(this).addClass("category-hover");
        $(this).find(".more").hide();
    }, function(){
        $(this).removeClass("category-hover");
        $(this).find("li").each(function(){
            var index = $(this).index();
            if(index > 7 && sy){
                $(this).hide();
            }
        });
        $(this).find(".more").show();
    });

    $(".category-popup li").hover(function(){
        var t = $(this);
        t.siblings("li").removeClass("active");
        t.siblings("li").find(".sub-category").hide();

        if(!t.hasClass("active")){
            t.addClass("active");

            setTimeout(function(){
                if(t.find(".subitem").html() == undefined){
                    var dlh = $(".category-popup").height(), ddh = dlh - 55, ocount = parseInt(ddh/32), aCount = t.find("dd a").length;
                    t.find("dd").css("height", ddh+"px");
                    t.find(".sub-category").css({"width": Math.ceil(aCount/ocount) * 120 + "px"});
                    t.find("dd a").each(function(i){ t.find("dd a").slice(i*ocount,i*ocount+ocount).wrapAll("<div class='subitem'>");});
                }
            }, 1);
            t.find(".sub-category").show();
        }
    }, function(){
        $(this).removeClass("active");
        $(this).find(".sub-category").hide();
    });


    // 购物车
    var isclick = 1;

    glocart     = $("#glocart"),
        cartbtn     = glocart.find(".cartbtn"),
        carcountObj = cartbtn.find(".cartpop b"),
        cartcontent = glocart.find(".cartcontent"),
        cartwrap    = glocart.find(".cartwrap"),
        cartlist    = glocart.find(".cartlist"),
        cartul      = cartlist.find("ul"),
        statics     = cartlist.find(".statics");
    onClass     = "cart_on";

    //初始计算购物车数量
    if($("#glocart").length > 0){
        tuanInit.list();
    }

    //点击购物车显示/隐藏内容
    cartbtn.bind("click", function(){
        if(!glocart.hasClass(onClass)){
            tuanInit.show();
        }else{
            tuanInit.hide();
        }
    });

    //结算
    glocart.find(".cartlink").bind("click", function(){
        var href = $(this).attr("href");
        location.href = href;
        return false;
    });

    //鼠标经过显示删除按钮
    cartwrap.delegate("li", "mouseover", function(){
        $(this).find(".del").show();
    });
    cartwrap.delegate("li", "mouseout", function(){
        $(this).find(".del").hide();
    });

    //删除购物车内容
    cartwrap.delegate(".del", "click", function(){
        tuanInit.del($(this));
    });

    //点击购物车区域不隐藏
    glocart.bind("click", function(){
        isclick = 1;
    });

    //点击页面隐藏购物车
    $(window).bind("click", function(){
        if(isclick != 1){
            tuanInit.hide();
        }
        isclick = 0;
    });

});



//操作购物车
tuanInit = {

    //计算购物车数量
    count: function () {
        var cartCount = 0;
        this.database('get', '', function (cartData) {
            if (cartData != null && cartData != "") {
                cartData = cartData.split("|");
                for (var i = 0; i < cartData.length; i++) {
                    var singelData = cartData[i].split(",");
                    cartCount += Number(singelData[1]);
                }
            }
            cartbtn.find(".cartpop b").html(cartCount);
        })
        // var cartData = $.cookie(cookiePre+"tuan_cart");
        // if(cartData != null && cartData != ""){
        // 	cartData = cartData.split("|");
        // 	for(var i = 0; i < cartData.length; i++){
        // 		var singelData = cartData[i].split(",");
        // 		cartCount += Number(singelData[1]);
        // 	}
        // }
        // cartbtn.find(".cartpop b").html(cartCount);
    }

    //显示购物车内容
    , show: function () {
        if (!glocart.hasClass(onClass) && isgoing == null) {
            glocart.addClass(onClass);
            cartbtn.stop().animate({"width": "290px"}, 300);
            setTimeout(function () {
                if (glocart.hasClass(onClass) && isgoing == null) {
                    isgoing = 1;
                    curHeight = cartcontent.height(),
                        autoHeight = cartcontent.css('height', 'auto').height();
                    cartcontent.show().height(curHeight).stop().animate({"height": autoHeight, "opacity": 1}, 300);
                }
            }, 300);

            this.list();
        }
    }

    //隐藏购物车内容
    , hide: function () {
        if (glocart.hasClass(onClass) && isgoing != null) {
            cartcontent.stop().animate({"height": "0", "opacity": 0}, 300, function () {
                cartcontent.hide();
            });
            setTimeout(function () {
                if (glocart.hasClass(onClass) && isgoing != null) {
                    isgoing = null;
                    cartbtn.stop().animate({"width": "270px"}, 300);
                    glocart.removeClass("cart_on");
                }
            }, 300);
        }
    }

    //购物车新增
    , add: function (data) {

        var ishas = 0;
        cartul.find(".loading").remove();
        statics.show();

        cartwrap.find("li").each(function () {
            var t = $(this), id = t.attr("data-id"), count = t.attr("data-count");
            if (id == data.id) {
                ishas = 1;

                var ncount = Number(data.count) + Number(count);
                t.find(".c").html(ncount);
                t.attr("data-count", ncount);
            }
        });

        glocart.find(".empty").hide();

        if (!ishas) {
            var li = $('<li data-id="' + data.id + '" data-count="' + data.count + '" data-price="' + data.price + '" class="fn-hide">' +
                '<a href="' + data.url + '" target="_blank" class="pic"><img src="' + data.thumb + '" /></a>' +
                '<div class="info">' +
                '<h5><a href="' + data.url + '" target="_blank">' + data.title + '</a></h5>' +
                '<p><span><strong>' + echoCurrency('symbol') + data.price + '</strong> × <strong class="c">' + data.count + '</strong></span><a href="javascript:;" class="del">删除</a></p>' +
                '</div>' +
                '</li>');
            cartul.append(li);
            li.slideDown();
        }

        cartlist.show();
        this.update();
    }

    //更新购物车
    , update: function () {

        var totalCount = 0, totalPrice = 0, data = [];
        cartwrap.find("li").each(function () {
            var t = $(this), id = t.attr("data-id"), count = t.attr("data-count"), price = t.attr("data-price");
            if (count != undefined && price != undefined) {
                totalCount += Number(count);
                totalPrice += (price * Number(count));
            }
            data.push(id + "," + count);
        });

        cartwrap.find(".statics strong").html(totalPrice.toFixed(2));
        cartbtn.find(".cartpop b").html(totalCount);

        if (totalCount == 0) {
            glocart.find(".empty").show();
            cartlist.hide();
        }

        // $.cookie(cookiePre+"tuan_cart", data.join("|"), {expires: 7, domain: cookieDomain, path: '/'});
        this.database('update', data.join("|"));

        if (!cartcontent.is(":hidden")) {
            curHeight = cartcontent.height(),
                autoHeight = cartcontent.css('height', 'auto').height();
            cartcontent.css({"height": "auto"});
        }

    }

    //删除购物车内容
    , del: function (t) {
        var thi = this,
            t = t.closest("li");

        t.slideUp(300, function () {
            t.remove();
            cartcontent.css("height", "auto");
            thi.update();
        });
    }

    //加载列表
    , list: function () {

        var thi = this;

        glocart.find(".empty").hide();
        cartlist.show();
        cartul.html('<div class="loading">加载中...</div>');
        statics.hide();

        //异步获取信息详细
        $.ajax({
            url: '/include/ajax.php?service=tuan&action=getCartList',
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if (data && data.state == 100) {

                    cartul.html("");
                    cartlist.show();
                    statics.show();

                    var info = data.info;
                    for (var i = 0; i < info.length; i++) {
                        var li = $('<li data-id="' + info[i].id + '" data-count="' + info[i].count + '" data-price="' + info[i].price + '">' +
                            '<a href="' + info[i].url + '" target="_blank" class="pic"><img src="' + info[i].thumb + '" /></a>' +
                            '<div class="info">' +
                            '<h5><a href="' + info[i].url + '" target="_blank">' + info[i].title + '</a></h5>' +
                            '<p><span><strong>' + echoCurrency('symbol') + info[i].price + '</strong> × <strong class="c">' + info[i].count + '</strong></span><a href="javascript:;" class="del">删除</a></p>' +
                            '</div>' +
                            '</li>');
                        cartul.append(li);
                    }
                    thi.update();

                } else {
                    glocart.find(".empty").show();
                    cartlist.hide();
                    cartbtn.find(".cartpop b").html(0);
                }
            },
            error: function () {
                cartul.html('<div class="loading"><font color="ff0000">获取失败，请稍候重试！</font></div>');
            }
        });
    }

    // 数据库
    , database: function (type, content, callback) {
        var type = type == undefined ? 'get' : type;
        var data = [];
        data.push('module=tuan');
        data.push('type=' + type);
        if (type == 'update') {
            data.push('content=' + content);
        }
        $.ajax({
            url: '/include/ajax.php?service=member&action=operateCart',
            type: 'post',
            data: data.join('&'),
            dataType: 'json',
            success: function (data) {
                if (data && data.state == 100) {
                    if (type == 'get') {
                        callback(data.info.content);
                    }
                }
            },
            error: function () {

            }
        })
    }
}