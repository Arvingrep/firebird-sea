$(function(){
  	// 判断浏览器是否是ie8
    if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.manbox a:last-child,.content .com_inf .inf_box:last-child,.salebox ul li:nth-child(4n)').css('margin-right','0');
    }
  
	 // 搜索头部样式
    $('.search-top li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
    })

    $("#search_button").bind('click', function () {

        var keywords = $("#search_keyword"), txt = $.trim(keywords.val());
        if(txt != ""){
            var href = $(".searchbox .search .active a").attr("data-href");
            if(href != ""){
                location.href = href + (href.indexOf("?") > -1 ? "&" : "?") + "keywords="+txt;
            }
        }else{
            keywords.focus();
        }
    })


    //回车搜索
    $("#search_keyword").keyup(function (e) {
        if (!e) {
            var e = window.event;
        }
        if (e.keyCode) {
            code = e.keyCode;
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            $("#search_button").click();
        }
    });
  
	//二级导航
	$(".nav-con li").hover(function(){
		$(this).addClass("active");
	}, function(){
		$(this).removeClass("active");
	});
  	
  	 // 搜索头部样式
    $('.search-top li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');

    })


	//分享功能
	$("html").delegate(".btn_share", "mouseenter", function(){
		var t = $(this), title = t.attr("data-title"), url = t.attr("data-url"), pic = t.attr("data-pic"), site = encodeURIComponent(document.title);
		title = title == undefined ? "" : encodeURIComponent(title);
		url   = url   == undefined ? "" : encodeURIComponent(url);
		pic   = pic   == undefined ? "" : encodeURIComponent(pic);
		if(title != "" || url != "" || pic != ""){
			$("#shareBtn").remove();
			var offset = t.offset(),left   = offset.left - 42 + "px",top    = offset.top + 20 + "px",shareHtml = [];
			shareHtml.push('<ul>');
			shareHtml.push('<li class="sina"><a href="http://service.weibo.com/share/share.php?url='+url+'&title='+title+'&pic='+pic+'" target="_blank">新浪微博</a></li>');
			shareHtml.push('<li class="tqq"><a href="http://share.v.t.qq.com/index.php?c=share&a=index&url='+url+'&title='+title+'&pic='+pic+'" target="_blank">腾讯微博</a></li>');
			shareHtml.push('<li class="qzone"><a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+url+'&desc='+title+'&pics='+pic+'" target="_blank">QQ空间</a></li>');
			shareHtml.push('<li class="qq"><a href="http://connect.qq.com/widget/shareqq/index.html?url='+url+'&desc='+title+'&title='+title+'&summary='+site+'&pics='+pic+'" target="_blank">QQ好友</a></li>');
			
			shareHtml.push('</ul>');

			$("<div>")
				.attr("id", "shareBtn")
				.css({"left": left, "top": top})
				.html(shareHtml.join(""))
				.mouseover(function(){
					$(this).show();
					return false;
				})
				.mouseout(function(){
					$(this).hide();
				})
				.appendTo("body");

			
		}
	});


	$("html").delegate(".btn_share", "mouseleave", function(){
		$("#shareBtn").hide();
	});



	$("html").delegate("#shareBtn a", "click", function(event){
		event.preventDefault();
		var href = $(this).attr("href");
		var w = $(window).width(), h = $(window).height();
		var left = (w - 760)/2, top = (h - 600)/2;
		window.open(href, "shareWindow", "top="+top+", left="+left+", width=760, height=600");
	});
});