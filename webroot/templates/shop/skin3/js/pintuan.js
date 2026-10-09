// 2021-12-8 拼团
$(function(){

var atpage = 1,pageSize = 16;
var fload = 0; // 是否第一次加载第一页

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
    //请求数据
    var data = [];
    data.push("pageSize="+pageSize);
    data.push("page="+atpage);  
    $.ajax({
        url: "/include/ajax.php?service=shop&action=proHuodongList&huodongtype=4&huodongstate=1",
        data:data.join("&"),
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
            if(data && data.state != 200){
                if(data.state == 101){
                    $('.emptyData').show();
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
                                html.push('  <div class="leftImg"><img src="'+list[i].litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';"></div>');
                                html.push('  <div class="rInfo">');
                                html.push('    <h3>'+title+'</h3>');
                                html.push('    <p class="pttxt">拼团价</p>');
                                html.push('    <div class="godPrice">');
                                var hdPrice = parseFloat(list[i].huodongprice);
                                if(list[i].huodongprice>=10000){
                                    hdPrice = parseInt(list[i].huodongprice);
                                }
                                html.push('      <span class="nprice">'+echoCurrency('symbol')+'<strong>'+hdPrice+'</strong></span>');
                                html.push('      <s class="mprice">'+echoCurrency('symbol')+mprice+'</s>');
                                html.push('     <span class="tNum"><strong>'+list[i].huodongnumber+'</strong>人团</span>');
                                html.push('    </div>');
                                    
                                html.push('    <div class="htBtn">');
                                if(list[i].sales < 100){
                                    html.push('      <span>火热拼团中</span>');
                                }else{
                                    var ssale = parseInt(list[i].sales/100)*100;
                                    html.push('      <span>'+ssale+'+人正在拼</span>');
                                }                    
                                html.push('      <strong>去拼团</strong></div>');
                                html.push('  </div>');
                                html.push('</a></li>');
	                        }
	                        $('.emptyData').hide();
	                        $('.proList').html(html.join(""));
	                    }
	                    showPageInfo();

                    }else{
                        $('.emptyData').show();   
                    }

                    
                    
                }
            }else{
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
