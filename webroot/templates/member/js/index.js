var p = [], path1 = [], path2 = [], p_mouseOver = [], p_mouseOut = [],
		banner = $(".banner"), atpage = 1, totalCount = 0, pageSize = 9, loadType = 1, covertypeid = "rec",
		defaultImg = banner.css("background-image").replace("url(", "").replace(")", "");

$(function(){

	//模块集合
	$('.modules ul').find('li').hover(function(){
		$(this).find('.cover').html($(this).find('.m-content').html().replace('.png', '1.png'));
		$(this).find('.cover').css('display','block');
	},function(){
		$(this).find('.cover').css('display','none');
	});


	//自定义封面图片
	$("#customBanner").bind("click", function(){
		$('html, body').animate({scrollTop: $(".container").offset().top}, 300);

		var cover = $(".custom-cover");
		if(cover.size() > 0) {
			cover.show();
			return;
		}

		var html = [];
		var offsetLeft = banner.offset().left, width = banner.width();
		html.push('<div class="custom-cover" style="left: '+offsetLeft+'px; width: '+width+'px;">');
		html.push('<div class="tit">');
		html.push('<h5>'+langData['siteConfig'][23][108]+'</h5>');   // 自定义封面图片
		html.push('<a href="javascript:;" class="close" title="'+langData['siteConfig'][6][15]+'">'+langData['siteConfig'][6][15]+'</a>');
		//关闭
		html.push('</div>');
		html.push('<div class="cont"><p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p></div>');//加载中，请稍候
		html.push('<div class="foot"><input type="button" value="'+langData['siteConfig'][6][27]+'" class="save" /><input type="button" value="'+langData['siteConfig'][6][12]+'" class="cancel" /></div>');  //取消
		html.push('</div>');

		banner.closest('.wrap').append(html.join(""));
		getList();

	});

	$('body').delegate(".custom-cover .save", "click", function(){
		var id = $(".cover-list .curr").attr("data-id"), t = $(this);
		if(id == undefined){
			alert(langData['siteConfig'][20][527]);  //请选择要设置的背景图！
		}else{
			t.val(langData['siteConfig'][6][35]+"...").attr("disabled", true);  //提交中
			$.post("/include/ajax.php?service=member&action=updateCoverBg", {id: id}, function(){
				t.val(langData['siteConfig'][6][27]).attr("disabled", false);  //保存
				$(".custom-cover").hide();
			});
		}
	});

	$('body').delegate(".close, .cancel", "click", function(){
		$(".custom-cover").hide();
		banner.css("background-image", "url("+defaultImg+")");
	});

	$('body').delegate(".cover-type li", "click", function(){
		var t = $(this), id = t.attr("data-id");
		if(id && !t.hasClass("curr")){
			covertypeid = id;
			t.addClass("curr").siblings("li").removeClass("curr");
			atpage = 1;
			getList();
		}
	});

	$('body').delegate(".cover-list li", "click", function(){
		var t = $(this), pic = t.attr("data-pic");
		t.addClass("curr").siblings("li").removeClass("curr");
		banner.css("background-image", "url("+pic+")");
	});




});





//异步获取封面图片
function getList(){

	$('.loading').remove();
	$(".custom-cover .cover-list").html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	//加载中，请稍后

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=member&action=customCoverBg&loadtype="+loadType+"&typeid="+covertypeid+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state == 100){

				if(loadType){
					var typeList = data.info.typeList, typeHtml = [];
					typeHtml.push('<li class="curr" data-id="rec"><a href="javascript:;">'+langData['siteConfig'][23][109]+'</a></li>');   //推荐
					for(var i = 0; i < typeList.length; i++){
						typeHtml.push('<li data-id="'+typeList[i].id+'"><a href="javascript:;">'+typeList[i].typename+'</a></li>');
					}

					$(".custom-cover .cont").html('<ul class="cover-type fn-clear">'+typeHtml.join("")+'</ul>');
					$(".custom-cover .cont").append('<ul class="cover-list fn-clear"></ul><div class="pagination fn-clear"></div>');
				}
				loadType = 0;

				var list = data.info.list, coverList = [];
				totalCount = data.info.pageInfo.totalCount;

				for(var i = 0; i < list.length; i++){
					var cla = "";
					if(defaultImg == list[i].big){
						cla = ' class="curr';
					}
					coverList.push('<li'+cla+' data-id="'+list[i].id+'" data-pic="'+list[i].big+'"><a href="javascript:;"><img src="'+list[i].litpic+'" /><div class="txt"><p>'+list[i].title+'</p><span></span></div><i></i></a></li>');
				}

				$(".custom-cover .cover-list").html(coverList.join(""));
				showPageInfo();

			}else{
				loadCoverBgError(data.info);
			}
		},
		error: function(){
			loadCoverBgError(langData['siteConfig'][20][528]);  //网络错误，请刷新重试！
		}
	});

}

function loadCoverBgError(info){
	$(".custom-cover .cover-list").html('').after('<p class="loading">'+info+'</p>');
}
