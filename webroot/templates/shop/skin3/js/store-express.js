// 2021-12-8 速递到家
$(function(){
//选择收货地址
$('.chooseAdr').click(function(){
	$('.adrMask').show();
	$('.adrAlert').addClass('show');
})
$('.adrMask,.adrCancel').click(function(){
	$('.adrMask').hide();
	$('.adrAlert').removeClass('show');
})
$('.adrAlert .adrItem').click(function(){
	$(this).toggleClass('active').siblings('.adrItem').removeClass('active')
})
//选择收货地址--确认
$('.adrAlert .adrSure').click(function(){
	$('.adrMask').hide();
	$('.adrAlert').removeClass('show');
	if($('.adrItem.active').length == 0){
		return false;
	}else{
		var chosadr = $('.adrItem.active');
		var name = chosadr.find('.sadrname').text();
		var tel = chosadr.find('.sadrtel').text();
		var adres = chosadr.find('.sadres').text();
		$('.firAdr').html('');
		$('.hasAdr h3').html(name+' '+tel);
		$('.hasAdr p').html(adres);
		$('.chooseAdr').html('选择其他地址');
	}
})
	//收藏
    $(".soucang,.gz").bind("click", function(){
        var t = $(this), type = "add", oper = "+1", txt = "已关注";

        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }

        if(!t.hasClass("has")){
            t.addClass("has");
        }else{
            type = "del";
            t.removeClass("has");
            oper = "-1";
            txt = "关注店铺";
        }

        var $i = $("<b>").text(oper);
        var x = t.offset().left, y = t.offset().top;
        $i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "5000", color: "#E94F06"});
        $("body").append($i);
        $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 2000, function(){
            $i.remove();
        });

        $(".soucang,.gz").html("<s></s>"+txt);
        $.post("/include/ajax.php?service=member&action=collect&module=shop&temp=store-detail&type="+type+"&id="+id);
        showErrAlert(type=='del'?"已取消关注" : "已成功关注");

    });
var atpage = 1,pageSize = 20;
var fload = 1; // 是否第一次加载第一页
 	//筛选
    $('.chooseTab li').click(function(){
        var t = $(this);
        var tindex = t.index();     
        if(tindex == 3){//价格
            if(t.hasClass('up')){
                t.addClass('down').removeClass('up');
                t.attr('data-id',4);
            }else{
                t.addClass('up').removeClass('down');
                t.attr('data-id',3);
            }
            t.addClass('curr').siblings('li').removeClass('curr');
            getList(1);
        }else{
            if(!t.hasClass('curr')){
                t.addClass('curr').siblings('li').removeClass('curr');
                $('.chosePrice').removeClass().addClass('chosePrice');
                getList(1);
            }
        }
        
        
    })

getList();
function getList(is){
	if( fload != 1){
		$('.proList').html('');
    	$('.proList').html('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');
	}
    $(".sepagination").hide();
    if(is){
        atpage = 1;
    }
    var orderbyitem = $('.chooseTab .curr').attr('data-id');
    //请求数据
    var data = [];
    data.push("pageSize=20");
    data.push("page="+atpage);
    data.push("moduletype=4");
    data.push("store="+storeid);
    data.push("orderby="+orderbyitem);

    var url="";
    url = "/include/ajax.php?service=shop&action=slist"
    
    $.ajax({
        url: url,
        data:data.join("&"),
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
            if(data && data.state != 200){
                if(data.state == 101){
                    $('.emptyData').show();
                    $('.chooseTab').hide();
                }else{
                    var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
                    totalCount = pageInfo.totalCount;
                    var totalPage = pageInfo.totalPage;                   
                    //拼接列表
                    if(list.length > 0){
                    	if(fload != 1){
	                        for(var i = 0; i < list.length; i++){
	                            var item      = [],
	                                    id        = list[i].id,
	                                    title     = list[i].title,
	                                    url       = list[i].url,
	                                    sales     = list[i].sales,
	                                    huodongarr     = list[i].huodongarr,
	                                    price     = list[i].price,
	                                    huodongprice     = list[i].huodongprice,
	                                    mprice     = list[i].mprice,
	                                    litpic    = list[i].litpic;
	  

	                            html.push('<li><a href="'+url+'">');
						        html.push('    <div class="leftImg"><img src="'+litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';"></div>');
						        html.push('    <div class="rInfo">');
						        html.push('      <h3>'+title+'</h3>');
						        html.push('      <div class="godPrice">');
						        html.push('        <span class="nprice">'+echoCurrency('symbol')+'<strong>'+price+'</strong></span>');
						        html.push('      </div>');
						        html.push('    </div>');
						        html.push('</a></li>');
	                        }
	                        $('.chooseTab').show();
	                        $('.emptyData').hide();
	                        $('.proList').html(html.join(""));
	                    }
	                    showPageInfo();

                    }else{
                        $('.chooseTab').hide();
                        $('.emptyData').show();
                        

                    }

                    
                    
                }
            }else{
                $('.chooseTab').hide();
                $('.emptyData').show();
                $('.emptyData p').html(langData['siteConfig'][20][126]);

            }
        }
    });

}

//打印分页
function showPageInfo() {
	fload++;
    var info = $(".sepagination");
    var nowPageNum = atpage;
    var allPageNum = Math.ceil(totalCount/pageSize);
    var pageArr = [];

    info.html("").hide();

    var pages = document.createElement("div");
    pages.className = "pagination-pages fn-clear";
    info.append(pages);

    //拼接所有分页
    if (allPageNum > 1) {

        //上一页
        if (nowPageNum > 1) {
            var prev = document.createElement("a");
            prev.className = "prev";
            prev.innerHTML = langData['siteConfig'][6][33];
            prev.onclick = function () {
                atpage = nowPageNum - 1;
                getList();
            }
            info.find(".pagination-pages").append(prev);
        }

        //分页列表
        if (allPageNum - 2 < 1) {
            for (var i = 1; i <= allPageNum; i++) {
                if (nowPageNum == i) {
                    var page = document.createElement("span");
                    page.className = "curr";
                    page.innerHTML = i;
                } else {
                    var page = document.createElement("a");
                    page.innerHTML = i;
                    page.onclick = function () {
                        atpage = Number($(this).text());
                        getList();
                    }
                }
                info.find(".pagination-pages").append(page);
            }
        } else {
            for (var i = 1; i <= 2; i++) {
                if (nowPageNum == i) {
                    var page = document.createElement("span");
                    page.className = "curr";
                    page.innerHTML = i;
                }
                else {
                    var page = document.createElement("a");
                    page.innerHTML = i;
                    page.onclick = function () {
                        atpage = Number($(this).text());
                        getList();
                    }
                }
                info.find(".pagination-pages").append(page);
            }
            var addNum = nowPageNum - 4;
            if (addNum > 0) {
                var em = document.createElement("span");
                em.className = "interim";
                em.innerHTML = "...";
                info.find(".pagination-pages").append(em);
            }
            for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
                if (i > allPageNum) {
                    break;
                }
                else {
                    if (i <= 2) {
                        continue;
                    }
                    else {
                        if (nowPageNum == i) {
                            var page = document.createElement("span");
                            page.className = "curr";
                            page.innerHTML = i;
                        }
                        else {
                            var page = document.createElement("a");
                            page.innerHTML = i;
                            page.onclick = function () {
                                atpage = Number($(this).text());
                                getList();
                            }
                        }
                        info.find(".pagination-pages").append(page);
                    }
                }
            }
            var addNum = nowPageNum + 2;
            if (addNum < allPageNum - 1) {
                var em = document.createElement("span");
                em.className = "interim";
                em.innerHTML = "...";
                info.find(".pagination-pages").append(em);
            }
            for (var i = allPageNum - 1; i <= allPageNum; i++) {
                if (i <= nowPageNum + 1) {
                    continue;
                }
                else {
                    var page = document.createElement("a");
                    page.innerHTML = i;
                    page.onclick = function () {
                        atpage = Number($(this).text());
                        getList();
                    }
                    info.find(".pagination-pages").append(page);
                }
            }
        }

        //下一页
        if (nowPageNum < allPageNum) {
            var next = document.createElement("a");
            next.className = "next";
            next.innerHTML = langData['siteConfig'][6][34];
            next.onclick = function () {
                atpage = nowPageNum + 1;
                getList();
            }
            info.find(".pagination-pages").append(next);
        }

        //输入跳转
        var insertNum = Number(nowPageNum + 1);
        if (insertNum >= Number(allPageNum)) {
            insertNum = Number(allPageNum);
        }

        var redirect = document.createElement("div");
        redirect.className = "redirect";
        redirect.innerHTML = '<i>'+langData['siteConfig'][13][51]+'</i><input id="prependedInput" type="number" placeholder="'+langData['siteConfig'][26][174]+'" min="1" max="'+allPageNum+'" maxlength="4"><i>'+langData['siteConfig'][13][54]+'</i><button type="button" id="pageSubmit">'+langData['siteConfig'][6][1]+'</button>';
        info.find(".pagination-pages").append(redirect);

        //分页跳转
        info.find("#pageSubmit").bind("click", function(){
            var pageNum = $("#prependedInput").val();
            if (pageNum != "" && pageNum >= 1 && pageNum <= Number(allPageNum)) {
                atpage = Number(pageNum);
                getList();
            } else {
                $("#prependedInput").focus();
            }
        });

        info.show();

    }else{
        info.hide();
    }
}

});
