$(function(){
     
    //搜索切换
	$('.chose_type').click(function(){
		$('.chose_box').toggle();
		$(this).toggleClass('curr');
		
	});

    $('.chose_box li').click(function(){
		var txt = $(this).text();
		var stype = $(this).attr("data-type");
		$('.chose_type').text(txt).attr('data-type',stype);
		$('#searchtype').val(stype)
		$('.chose_box').hide();
		$('.chose_type').removeClass('curr');
		getList(1);
        if(stype == 1){
            $('.choose-box').hide();
            $('.list').addClass('spe');
        }else{
            $('.choose-box').show();
            $('.list').removeClass('spe');
        }

	})
	var myscroll_area = new iScroll("choose-area", {vScrollbar: false});
    var myscroll_nature = new iScroll("scroll-nature", {vScrollbar: false});
    var myscroll_type = new iScroll("scroll-type", {vScrollbar: false});
    // 显示下拉框
    $('.choose-tab  li').click(function(){
        var index = $(this).index();
        var local = $('.choose-local').eq(index);
        if ( local.css("display") == "none") {
            $(this).addClass('active').siblings('.choose-tab li').removeClass('active');
            local.show().siblings('.choose-local').hide();
            $('.mask').show();
            myscroll_nature.refresh();
            myscroll_type.refresh();
            myscroll_area.refresh();
            
        }else{
            $(this).removeClass('active');
            local.hide();
            $('.mask').hide();
        }
    });

    // 展开二级区域
    var chooseAreaSecond = null;
    $('#choose-area li').click(function(){
        var t = $(this), index = t.index(), id = t.attr("data-id"), localIndex = t.closest('.choose-local').index();
        if (index == 0) {
            $('#area-box .choose-stage-l').removeClass('choose-stage-l-short');
            t.addClass('current').siblings().removeClass('active');
            t.closest('.choose-local').hide();
            $('.choose-tab li').eq(localIndex).removeClass('active').attr("data-id", 0).find('span').text("不限");
            $('.mask').hide();
            getList(1);
        }else{
            t.siblings().removeClass('current');
            t.addClass('active').siblings().removeClass('active');
            $('#area-box .choose-stage-l').addClass('choose-stage-l-short');
            $('.choose-stage-r').show();
            chooseAreaSecond = new iScroll("choose-area-second", {vScrollbar: false,mouseWheel: true,click: true});

            $.ajax({
                url: masterDomain + "/include/ajax.php?service=house&action=addr&type="+id,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    if(data && data.state == 100){
                        var html = [], list = data.info;
                        html.push('<li data-id="'+id+'">不限</li>');
                        for (var i = 0; i < list.length; i++) {
                            html.push('<li data-id="'+list[i].id+'">'+list[i].typename+'</li>');
                        }
                        $("#choose-area-second").html('<ul>'+html.join("")+'</ul>');
                        chooseSecond = new iScroll("choose-area-second", {vScrollbar: false,mouseWheel: true,click: true});
                    }else if(data.state == 102){
                        $("#choose-area-second").html('<ul><li data-id="'+id+'">不限</li></ul>');
                    }else{
                        $("#choose-area-second").html('<ul><li class="load">'+data.info+'</li></ul>');
                    }
                },
                error: function(){
                    $("#choose-area-second").html('<ul><li class="load">网络错误，加载失败！</li></ul>');
                }
            });
        }
    })

    //点击二级区域
    $('#choose-area-second').delegate("li", "click", function(){
        var $t = $(this), id = $t.attr("data-id"), val = $t.html(), local = $t.closest('.choose-local'), index = local.index();

        $t.addClass('on').siblings().removeClass('on');
        $('.choose-tab li').eq(index).removeClass('active').attr("data-id", id).find('span').text(val);
        $('.choose-local').hide();
        $('.mask').hide();
        getList(1);

    })

    //点击小箭头 收起
    $('.sort').click(function () {
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab  li').removeClass('active');
    });

    // 性质
    $('.choose-list .choose-nature li').click(function () {
        var id = $(this).attr("data-id");
        $(this).addClass('active').siblings().removeClass('active');
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab .nature').attr("data-id", id);
        $('.choose-tab .nature span').html($(this).html());
        $('.choose-tab  li').removeClass('active');
        getList(1);
    });

    // 类型
    $('.choose-list .choose-type li').click(function () {
        var id = $(this).attr("data-id");
        $(this).addClass('active').siblings().removeClass('active');
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab .typeid').attr("data-id", id);
        $('.choose-tab .typeid span').html($(this).html());
        $('.choose-tab  li').removeClass('active');
        getList(1);
    });

    $('.mask').click(function () {
        $('.mask').removeClass('spe').hide();
        $('.choose-local').hide();
        $('.choose-tab li').removeClass('active');
        $('.choose-more').animate({"right":'-100%'},200);
    });
	
	var atpage = 1,isload = false;
	// 下拉加载	
	$(window).scroll(function() {
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w - 50;
		if ($(window).scrollTop() > scroll && !isload) {
			atpage++;
			getList();
		};
	});
	

	getList(1)
	//数据列表
	function getList(tr){

		isload = true;

		//如果进行了筛选或排序，需要从第一页开始加载
		if(tr){
			atpage = 1;
			$(".list ul").html("");
		}
		
		$(".list .loading").remove();
		$(".list").append('<div class="loading">加载中...</div>');
		var act = $('.chose_type').attr('data-type'),keywords = $('#keywords').val();

		var data = [];
        data.push("page="+atpage);
        data.push("pageSize=6");
        data.push("keywords="+keywords);

        $(".choose-tab li").each(function(){
            data.push($(this).attr("data-type") + "=" + $(this).attr("data-id"));
        });

		var url;
		if(act == 1){//查小区
			url="/include/ajax.php?service=house&action=getCommunity&"+data.join("&");
		}else{//查学校
			url="/include/ajax.php?service=house&action=getSchool&"+data.join("&");
		}


		$.ajax({
			url: url,
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data){
					if(data.state == 100){
						$(".list .loading").remove();
						var list = data.info.list, html = [];
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
								var pic = list[i].logo != "" && list[i].logo != undefined ? list[i].logo : "/static/images/404.jpg";
								var typearr = list[i].typearr;
								// 查小区
								if(act == '1'){
									var id = list[i].id, title = list[i].title;
									var urlString = sUrl + "?sid="+id+"&sname="+title;
									html.push('<li class="comuLi"><a href="'+urlString+'" class="fn-clear">');
									html.push('<div class="left_b fn-left">');
									html.push('<h2 class="tit">'+list[i].title+'</h2>');
									html.push('<p class="addr"><i></i>'+list[i].addrName+'</p>');
									html.push('</div>');									
									html.push('<div class="right_b fn-right"><strong>'+list[i].schoolcount+'</strong>所学校</div>');
									html.push('</a></li>');
									
								}else{//查学校
									html.push('<li class="scLi"><a href="'+dUrl+'?id='+list[i].id+'">');
									html.push('<div class="left_img"><img src="'+pic+'" alt=""></div>');
									html.push('<div class="rightSc">');
									html.push('<h3>'+list[i].title+'</h3> ');
									html.push('<p class="addr"><i></i>'+list[i].addrName+'</p> ');
									html.push('<p class="tag">');
									html.push('<span class="nature">'+list[i].schoolnaturename+'</span>');//民办或者公办必有
									for(var a = 0; a < typearr.length; a++){
                                      var cla = '3';
                                      if(typearr[a].typename == '幼儿园'){
                                        cla ='1'
                                      }else if(typearr[a].typename == '小学'){
                                        cla ='2'
                                      }
									  html.push('<span class="slevel-'+cla+'">'+typearr[a].typename+'</span>');//幼儿园等 可多个
									}
									html.push('</p>');
									html.push('<p class="fire"><i></i>'+list[i].click+'</p>');//热度
									html.push('</div>');
									html.push('</a></li>');
								}

							}

							$(".list ul").append(html.join(""));
							isload = false;

							//最后一页
							if(atpage >= data.info.pageInfo.totalPage){
								isload = true;
								$(".list ul").append('<div class="loading">已经到最后一页了</div>');
							}

						//没有数据
						}else{
							isload = true;
							$(".list ul").append('<div class="loading"><p class="p1">暂无数据</p><p class="p2">没有搜到您想要的内容</p></div>');
						}

					//请求失败
					}else{
						$(".list .loading").html('<p class="p1">暂无数据</p><p class="p2">没有搜到您想要的内容</p>');
					}

				//加载失败
				}else{
					$(".list .loading").html('加载失败');
				}
			},
			error: function(){
				isload = false;
				$(".list .loading").html('网络错误，加载失败！');
			}
		});
	}
   

	
});



    