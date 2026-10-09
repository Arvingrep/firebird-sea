
$(function(){
	
	var atpage = 1, totalCount = 0, pageSize = 20;

	//大切换
	$('.detail_tab li').click(function(){
    	$(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.detail_wrap2 .detail_con').eq(i).addClass('detail_show').siblings().removeClass('detail_show');
    })

    //大图切换
    $(".sale_slide").slide({titCell: ".plist .slideshow-item",mainCell: ".album",effect: "fold",autoPlay: true,delayTime: 800,switchLoad: "_src",pageStateCell:".pageState",startFun: function(i, p) {if (i == 0) {$(".sprev").click()} else if (i % 5 == 0) {$(".snext").click()}}});

    //小图左滚动切换
    $(".sale_slide .thumb").slide({mainCell: ".slideCell",delayTime: 600,vis: 5,scroll: 5,effect: "left",autoPage: true,prevCell: ".sprev",nextCell: ".snext",pnLoop: false});
    setTimeout(function(){$(".sale_slide .thumb a").attr('href','javascript:;');},500)
    

    $('.table1 td:last-child').css({'width':'25%','color':'#FF6600'});
    $('.table3 td:last-child').css({'width':'18%','color':'#666'});
    $('.table4 td:last-child').css({'width':'15%','color':'#666'});
    $('.home_table1 td:nth-child(2)').css({'width':'36%','color':'#666'});
    $('.photo_con li:nth-child(2n)').css('margin-right','0');

    //居家养老 小切换
    $('.home_tab li').click(function(){
    	$(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.tab_container .tab_con').eq(i).addClass('tab_show').siblings().removeClass('tab_show');
    })

    //相册图片放大
	$('.photo_con,.comm_li ul').viewer({
		url: 'data-original',
	});

	// 百度地图API功能
    if(site_map == 'baidu'){
        var map = new BMap.Map("allmap");
        var point = new BMap.Point(infoData.lng,infoData.lat);
        var marker = new BMap.Marker(point);  // 创建标注
        map.addOverlay(marker);              // 将标注添加到地图中
        map.centerAndZoom(point, 15);
        map.panBy(550,300);////中心点偏移多少像素（width,height）为div 宽高的1/2;
        var opts = {
        width : 200,     // 信息窗口宽度
        height: 100,     // 信息窗口高度
        title : infoData.title , // 信息窗口标题
        enableMessage:true,//设置允许信息窗发送短息
        message:"llllll"
        }
        var infoWindow = new BMap.InfoWindow("地址：" + address, opts);  // 创建信息窗口对象 
        marker.addEventListener("click", function(){          
            map.openInfoWindow(infoWindow,point); //开启信息窗口
        });
    }else{
        $('#allmap').remove();
    }

	//星级选择
	$('.star_ul li').click(function(){
		var t = $(this).index();
		$('.star_ul li').removeClass('active');
		for( i = 0;i <= t;i++){			
			$('.star_ul li').eq(i).addClass('active');
		}
		$('.star_tip span').eq(t).addClass('tip_show').siblings().removeClass('tip_show');
	})
	//评论选择
	$('.comm_ul li').click(function(){
		$(this).addClass('active').siblings().removeClass('active');
		var t = $(this).index();
		$('.comm_con2 .all_con').eq(t).addClass('all_show').siblings().removeClass('all_show');
		var tit = $(this).find('.tit').text(), num = $(this).find('.commentnum').text();
		$(".comm_h3").html(tit + '<span class="con_num">( '+num+' )</span>');
		atpage = 1;
		getList();
	});

	//评论登录
    $(".comm_con1").delegate(".login", "click", function(){
        if ($.browser.msie && ($.browser.version == "6.0") && !$.support.style) {
            $("html, body").scrollTop(0);
        }
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = masterDomain + '/login.html';
            return false;
        }
	});
	
	//发表评论
	$(".comm_con1").delegate(".subtn", "click", function(){
		var t = $(this), sco1 = $('.star_ul li.active');

		if(t.hasClass("login") || t.hasClass("loading")) return false;

		if(sco1.length == 0){
			errmsg($(".star_ul"), '请给机构评分');
			return;
		}
		sco1 = sco1.index() + 1;

		if($("#content").val()==''){
			errmsg($("#content"), '请填写评论内容');
			return;
		}

		var pics = [];
		$('#fileList li').each(function(){
			var img = $(this).find('img').attr('data-val');
			if(img!='' && img!=undefined){
				pics.push(img);
			}
		})

		t.addClass('disabled');

		$.ajax({
            url: '/include/ajax.php?service=member&action=sendComment&type=pension-store&aid=' + infoData.id,
            data: "sco1=" + sco1 + "&content="+$("#content").val() +'&pics='+pics.join(','),
            type: "POST",
            dataType: "json",
            success: function (data) {
                t.removeClass("disabled");
                if(data && data.state == 100){
					location.reload();
                }else{
					alert(data.info);
				}
            },
			error: function(){
				errmsg($("#content"), '网络错误，请重试!');
			    t.removeClass('disabled');
			}
        });

		

	});
	//国际手机号获取
	  getNationalPhone();
	  function getNationalPhone(){
	    $.ajax({
	            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
	            type: 'get',
	            dataType: 'JSONP',
	            success: function(data){
	                if(data && data.state == 100){
	                   var phoneList = [], list = data.info;
	                   for(var i=0; i<list.length; i++){
	                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
	                   }
	                   $('.areaCode_wrap ul').append(phoneList.join(''));
	                }else{
	                   $('.areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
	                  }
	            },
	            error: function(){
	                $('.areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
	            }

	        })
	  }
	  //显示区号
	  $('.areaCode').bind('click', function(){
	    var areaWrap =$(this).closest("form").find('.areaCode_wrap');
	    if(areaWrap.is(':visible')){
	      areaWrap.fadeOut(300)
	    }else{
	      areaWrap.fadeIn(300);
	      return false;
	    }
	  });

	  //选择区号
	  $('.areaCode_wrap').delegate('li', 'click', function(){
	    var t = $(this), code = t.attr('data-code');
	    var par = t.closest("form");
	    var areaIcode = par.find(".areaCode");
	    areaIcode.find('i').html('+' + code);
	    $('#areaCode').val(code);
	  });

	  $('body').bind('click', function(){
	    $('.areaCode_wrap').fadeOut(300);
	  });


	//评论加载

	getList();

	function getList(){

		var where = $('.comm_ul li.active').data('id');
		where = where ? '&'+where : '';
		
		$.ajax({
	        url: '/include/ajax.php?service=member&action=getComment&type=pension-store&isAjax=0&aid=' + infoData.id + where + "&page=" + atpage + "&pageSize=" + pageSize,
	        type: "GET",
	        dataType: "json",
	        success: function(data){
				if(data && data.state == 100){
					var list = data.info.list;
                    var pageInfo = data.info.pageInfo;
					var html = [];
					for(var i = 0; i < list.length; i++){
						var d = list[i];

						html.push('<li class="fn-clear comm_li" data-id="'+d.id+'">');
						html.push('<div class="pic_l"><img src="'+(d.user.photo ? d.user.photo : (staticPath + 'images/noPhoto_60.jpg') )+'"></div>');
						html.push('<div class="right_c">');
						html.push('<p class="peo_name">'+d.user.nickname+'</p>');
						var star = (d.sco1 / 5) * 100;
						html.push('<div class="star_img"><s style="width: '+star+'%;"></s></div>');
						html.push('<p class="comm_p">'+d.content+'</p>');
						if(d.pics.length){
							html.push('<ul class="fn-clear">');
							for(var n = 0; n < d.pics.length; n++){
								html.push('<li><img src="'+d.pics[n]+'"></li>');
							}
							html.push('</ul>');
						}
						html.push('<div class="pub_time fn-clear">');
						html.push('<span class="time">'+d.ftime+'</span>');
						html.push('<p class="pub_hd"><span class="reply">回复</span><span class="zan_num '+(d.zan_has == "1" ? " active" : "")+'">'+d.zan+'</span></p>');
						html.push('</div>');
						html.push('</div>');
						html.push('</li>');
					}
					$('#commentList').html(html.join(""));

					totalCount = pageInfo.totalCount;
					$('.comment_total').text(pageInfo.totalCount);
                    $('.comment_good').text(pageInfo.sco4 + pageInfo.sco5);
                    $('.comment_middle').text(pageInfo.sco2 + pageInfo.sco3);
                    $('.comment_bad').text(pageInfo.sco1);
                    $('.comment_pic').text(pageInfo.pic);
					showPageInfo();
					if(data.info.pageInfo.totalPage == atpage && atpage==1){
						$('#commentList').append('<div class="loading">已加载全部数据</div>');
					}
				}else{
					$(".pagination1").html("").hide();
					$('#commentList').html('<div class="loading">暂无数据！</div>');
				}
			},
			error: function(){
				$("#commentList").html('<div class="loading">网络错误，请重试!</div>');
			}

		});

	}

	//打印分页
	function showPageInfo() {
	    var info = $(".pagination1");
	    var nowPageNum = atpage;
	    var allPageNum = Math.ceil(totalCount/pageSize);
	    var pageArr = [];
	    info.html("").hide();
	    var pages = document.createElement("div");
	    pages.className = "pagination-pages";
	    info.append(pages);
	    //拼接所有分页
	    if (allPageNum > 1) {
	        //上一页
	        if (nowPageNum > 1) {
	            var prev = document.createElement("a");
	            prev.className = "prev";
	            prev.innerHTML = "上一页";
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
	            next.innerHTML = "下一页";
	            next.onclick = function () {
	                atpage = nowPageNum + 1;
	                getList();
	            }
	            info.find(".pagination-pages").append(next);
	        }
	        info.show();
	    }else{
	        info.hide();
	    }
	}

	//点赞
	var commentObj=$('#commentList');
    commentObj.delegate(".zan_num", "click", function(){
        var t = $(this), id = t.closest("li").attr("data-id");
        if(t.hasClass("active")) return false;
		var ncount = Number(t.text());
        var ncount1=ncount+1
		
		if(id != "" && id != undefined){
            $.ajax({
                url: "/include/ajax.php?service=member&action=dingComment&type=add&id="+id,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    t.addClass("active").html(ncount1);
                    //加1效果
					var $i = $("<b>").text("+1");
					var x = t.offset().left, y = t.offset().top;
					$i.css({top: y - 10, left: x + 17, position: "absolute", color: "#E94F06"});
					$("body").append($i);
					$i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
						$i.remove();
					});

                }
            });
        }

        


    });

	//立即预约
	$('.order').click(function(){
		$('.org_mask').show();
	})
		//表单验证
	$(".org_mask .sure").bind("click", function(){
		var f = $(this);
		var str = '',r = true;
		if(f.hasClass("disabled")) return false;
		// 称呼
		var org_name = $('#org_name');
		var org_namev = $.trim(org_name.val());
		if(org_namev == '') {
			if (r) {
				org_name.focus();
				errmsg(org_name, '请填写您的称呼');
			}
			r = false;
		}
		// 手机号
		var org_phone = $('#org_phone')
		var org_phonev = $.trim(org_phone.val());
		if(org_phonev == '') {
			if (r) {
				org_phone.focus();
				errmsg(org_phone, '请输入手机号码');
			}
			r = false;
		}
		if(!r) {
			return false;
		}		

		var form = $("#yuform"), action = form.attr("action");

		$.ajax({
			url: action,
			data: form.serialize(),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					$("#org_name").val('');
					$("#org_phone").val('');
					$("#areaCode").val('86');
					$(".areaCode i").text('+86')
					$('.org_mask').hide();
					$('.org_mask2').show();
					f.removeClass("disabled").html(langData['siteConfig'][6][63]);
				}else{
					alert(data.info);
					f.removeClass("disabled").html(langData['siteConfig'][6][63]);
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
				f.removeClass("disabled").html(langData['siteConfig'][6][63]);
			}
		});

	})
	$('.org_mask .close_alert,.org_mask .cancel').click(function(){
		$('.org_mask').hide();
	})

	$('.org_mask2 .close_alert,.org_mask2 .t3').click(function(){
		$('.org_mask2').hide();
	})



	//数量错误提示
	var errmsgtime;
	function errmsg(div,str){
		$('#errmsg').remove();
		clearTimeout(errmsgtime);
		var top = div.offset().top - 33;
		var left = div.offset().left;

		var msgbox = '<div id="errmsg" style="position:absolute;top:' + top + 'px;left:' + left + 'px;height:30px;line-height:30px;text-align:center;color:#f76120;font-size:14px;display:none;z-index:99999;background:#fff;">' + str + '</div>';
		$('body').append(msgbox);
		$('#errmsg').fadeIn(300);
		errmsgtime = setTimeout(function(){
			$('#errmsg').fadeOut(300, function(){
				$('#errmsg').remove()
			});
		},2000);
	};


})
