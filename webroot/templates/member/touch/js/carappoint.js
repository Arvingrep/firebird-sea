$(function () {
    $("#appo-list").delegate(".icon-tel","click",function(){
        var t = $(this), phone = t.data('tel'), id = t.data('id');
        if(phone!=''){
            $(".tel-box p").html(langData['siteConfig'][44][38]+phone);//即将拨打
            $("#surephone").attr("href", "tel:" + phone);
            $("#surephone").attr("data-id", id);
            $('.tel-box-bg').show();
        }
    });

    $('.tel-box-bg>div .btns span.cancel').click(function () {
        $('.tel-box-bg').hide();
    });
    $('.tel-box-bg>div .btns span.sure').click(function () {
        var t = $(this), id = t.find('#surephone').data('id');
        $.ajax({
            url: '/include/ajax.php?service=car&action=updateAppoint&id=' + id,
            type: "GET",
            dataType: "json",
            success: function (data) {
                
            }
        });
        $('.tel-box-bg').hide();
    });

    var pageSize = 10, atpage = 1, isload = false;

    getList(1);

    $(window).scroll(function() {
        var h = $('.footer').height() + $('.appo-list').height() * 2;
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
			$(".appo-list").html("");
        }

        $(".appo-list .loading").remove();
        $(".appo-list").append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...

        var data = [];
		data.push("page="+atpage);
		data.push("pageSize="+pageSize);
		data.push("store="+store);
        
        $.ajax({
            url: "/include/ajax.php?service=car&action=storeAppointList",
            data: data.join("&"),
            type: "GET",
            dataType: "json",
			success: function(data){
				if(data){
					if(data.state == 100){
						$(".appo-list .loading").remove();
						var list = data.info.list, html = [];
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
                                var activeClass = list[i].state == 1 ? 'active' : '';
                                html.push('<li class="'+activeClass+'"><a class="fn-clear">');

                                if(list[i].state==1){
                                    html.push('<div class="state"><span>'+langData['siteConfig'][26][146]+'</span></div>');//已联系
                                }else{
                                    html.push('<div class="state"><span>'+list[i].pubdate1+'</span></div>');
                                }
                                html.push('<div class="info"><p class="name">'+list[i].nickname+'</p><p class="tel">'+list[i].tel+'</p></div>');

                                html.push('<span data-id="'+list[i].id+'" data-tel="'+list[i].tel+'" class="icon-tel"><img src="'+templets_skin+'images/car/tel_icon.png" alt=""></span>');

								html.push('</a></li>');
							}
							$(".appo-list").append(html.join(""));
							isload = false;

							//最后一页
							if(atpage >= data.info.pageInfo.totalPage){
								isload = true;
								$(".appo-list").append('<div class="loading">'+langData['siteConfig'][18][7]+'</div>');//已经到最后一页了
							}
						}else{
							isload = true;
							$(".appo-list").append('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');//暂无相关信息
						}
					}else{
						$(".appo-list .loading").html(data.info);
					}
				}else{
					$(".appo-list .loading").html(langData['siteConfig'][20][462]);//加载失败！
				}
			},
			error: function(){
				isload = false;
				$(".appo-list .loading").html(langData['siteConfig'][20][227]);//网络错误，加载失败！
			}
        });
        
        
    }

});