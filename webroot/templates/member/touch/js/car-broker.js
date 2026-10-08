$(function () {

    var pageSize = 10, atpage = 1, isload = false;

    getList(1);

    $(window).scroll(function() {
        var h = $('.footer').height() + $('.adviser-list').height() * 2;
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - h - w;
        if ($(window).scrollTop() > scroll && !isload) {
            atpage++;
            getList();
        };
    });

    function getList(tr){
        isload = true;

		if(tr){
			atpage = 1;
			$(".adviser-list").html("");
        }

        $(".adviser-list .loading").remove();
        $(".adviser-list").append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...

        var data = [];
		data.push("page="+atpage);
		data.push("pageSize="+pageSize);
        data.push("comid="+comid);

        $.ajax({
            url: "/include/ajax.php?service=car&action=adviserList&type=getnormal&u=1",
            data: data.join("&"),
            type: "GET",
            dataType: "json",
			success: function(data){
				if(data){
					if(data.state == 100){
						$(".adviser-list .loading").remove();
						var list = data.info.list, html = [];
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
                                var soldnums = list[i].soldnums ? list[i].soldnums : 0;
                                html.push('<li><a href="'+editurl+'?do=edit&id='+list[i].id+'" class="fn-clear">');
                                html.push('<div class="img"><img src="'+list[i].litpic+'" alt=""></div>');

                                html.push('<div class="info">');
                                if(list[i].quality==1){
                                    html.push('<p class="name">'+list[i].name+'  <span>'+langData['car'][4][44]+'</span></p>');//金牌顾问
                                }else{
                                    html.push('<p class="name">'+list[i].name+'</p>');
                                }
                                html.push('<p class="num">'+langData['car'][6][84]+list[i].click+'  |  '+langData['car'][4][46]+soldnums+langData['car'][6][82]+'</p>');//咨询量 -- 售出 --辆
                                html.push('<p class="tel">'+list[i].tel+'</p>');
                                html.push('</div>');
                                html.push('<a class="btn-m" href="'+editurl+'?do=edit&id='+list[i].id+'">'+langData['car'][4][42]+'</a>');

                                html.push('</a></li>');
                                
							}
							$(".adviser-list").append(html.join(""));
							isload = false;

							//最后一页
							if(atpage >= data.info.pageInfo.totalPage){
								isload = true;
								$(".adviser-list").append('<div class="loading">'+langData['siteConfig'][18][7]+'</div>');//已经到最后一页了
							}
						}else{
							isload = true;
							$(".adviser-list").append('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');//暂无相关信息
						}
					}else{
						$(".adviser-list .loading").html(data.info);
					}
				}else{
					$(".adviser-list .loading").html(langData['siteConfig'][20][462]);//加载失败！
				}
			},
			error: function(){
				isload = false;
				$(".adviser-list .loading").html(langData['siteConfig'][20][227]);//网络错误，加载失败！
			}
        });
        
        
    }

});