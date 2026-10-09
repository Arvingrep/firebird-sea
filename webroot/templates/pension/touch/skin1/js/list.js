$(function() {

    var detailList;
	detailList = new h5DetailList();
	setTimeout(function(){detailList.removeLocalStorage();}, 500);

	var dataInfo = {
		id: '',
		url: '',
		addrid: '',
		addrpid: '',
		addrname: '',
		orderby: '',
		orderbyname: '',
        targetcare:'',
        rzmaxprice:'',
        monthmaxprice:'',
		keywords:'',
		isBack: true
    };
    
    $('.con_ul').delegate('.con_li', 'click', function(){
		var t = $(this), a = t.find('a'), url = a.attr('data-url'), id = t.attr('data-id');

		var orderby     = $('#orderby_class li.on').attr('data-id');
		var orderbyname = $('#orderby_class li.on').text();
		
		var addrpid     = $('#choose-area li.active').attr('data-id');
		var addrid      = $('#choose-area-second li.on').attr('data-id');
        var addrname2   = $('#choose-area li.active').text();
		var addrname1   = $('#choose-area-second li.on').text();
        var addrname    = addrpid == addrid ? addrname2 : addrname1;
        
        var targetcare  = $('#targetcare li.active').attr('data-id');
        var rzmaxprice  = $('#rzmaxprice li.active').attr('data-id');
        var monthmaxprice  = $('#monthmaxprice li.active').attr('data-id');
		

		dataInfo.url = url;
		dataInfo.addrid  = addrid;
		dataInfo.addrpid = addrpid;
		dataInfo.addrname = addrname;
		dataInfo.orderby = orderby;
        dataInfo.orderbyname = orderbyname;
        dataInfo.targetcare = targetcare;
        dataInfo.rzmaxprice = rzmaxprice;
        dataInfo.monthmaxprice = monthmaxprice;
		dataInfo.keywords = $('#search_keyword').val();

		detailList.insertHtmlStr(dataInfo, $("#list").html(), {lastIndex: page});

		location.href = url;

    });
    
    $('.sure').click(function () {
        closeNav();
        page = 1;
		getList();
    })

    //搜索
	$('.search_keyword').click(function(){
		var keywords = $('#search_keyword').val();
		page = 1;
		getList();
	});

    $(".price_choose input").focus(function(){
        $("#rzmaxprice li").removeClass('active');
    });

    $(".price_choose2 input").focus(function(){
        $("#monthmaxprice li").removeClass('active');
    });
    
    var mask = $('.mask');
    //下拉选项选中 因用到getList() 无法提取为公共部分
    // 区域二级展开选项
    var chooseAreaSecond = null;
    $('#choose-area li').click(function(){
        var t = $(this), index = t.index(), id = t.attr("data-id"), localIndex = t.closest('.choose-local').index();
        if (index == 0) {
            $('#area-box .choose-stage-l').removeClass('choose-stage-l-short');
            t.addClass('current').siblings().removeClass('active');
            t.closest('.choose-local').hide();
            $('.choose-tab li').eq(localIndex).removeClass('active').attr("data-id", 0).find('span').text("不限");
            mask.hide();

            page = 1;
            getList();
        }else{
            t.siblings().removeClass('current');
            t.addClass('active').siblings().removeClass('active');
            $('#area-box .choose-stage-l').addClass('choose-stage-l-short');
            $('.choose-stage-r').show();
            chooseAreaSecond = new iScroll("choose-area-second", {vScrollbar: false,mouseWheel: true,click: true});

            $.ajax({
                url: masterDomain + "/include/ajax.php?service=pension&action=addr&type="+id,
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

    //  区域二级选中
    var screenScroll = null;
    $(' #choose-area-second').delegate("li", "click", function(){
        var $t = $(this), id = $t.attr("data-id"), val = $t.html(), local = $t.closest('.choose-local'), index = local.index();

        $t.addClass('on').siblings().removeClass('on');
        $('.choose-tab li').eq(index).removeClass('active').attr("data-id", id).find('span').text(val);
        local.hide();
        mask.hide();

        page = 1;
        getList();

    })

     //排列顺序
    $('#orderby_class').delegate("li", "click", function(){
        var $t = $(this), id = $t.attr("data-id"), val = $t.html(), local = $t.closest('.choose-local'), index = local.index();

        $t.addClass('on').siblings().removeClass('on');
        $('.choose-tab li').eq(index).removeClass('active').attr("data-id", id).find('span').text(val);
        local.hide();
        mask.hide();

        page = 1;
        getList();

    })


    // 下拉加载
    var isload = isend = false;
    $(window).scroll(function() {
        var h = $('.info_list .con_li').height();  
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - h - w;
        if ($(window).scrollTop() > scroll && !isload && !isend) {
            page++;
            getList();
        };
    });

    //初始加载
	if($.isEmptyObject(detailList.getLocalStorage()['extraData']) || !detailList.isBack()){
		getList();
	}else {
		getData();
		setTimeout(function(){
			detailList.removeLocalStorage();
		}, 500)
    }
    
    getList();

    //获取信息列表
    function getList(tr){

        // if(isload) return false;
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        $(".choose-tab li").each(function(){
            data.push($(this).attr("data-type") + "=" + $(this).attr("data-id"));
        });

        $(".nav-second li.active").each(function(){
            data.push($(this).parent('ul').data('type') + "=" + $(this).attr("data-id"));
        });

        var minp = $("#price1").val();
        var maxp = $("#price2").val();
        if(minp=='' && maxp!=''){
            data.push("rzmaxprice="+maxp + ',');
        }else if(minp!='' && maxp==''){
            data.push("rzmaxprice="+',' + minp);
        }else if(minp!='' && maxp!='' && minp < maxp){
            data.push("rzmaxprice="+minp + ',' + maxp);
        }

        var minp = $("#price3").val();
        var maxp = $("#price4").val();
        if(minp=='' && maxp!=''){
            data.push("monthmaxprice="+maxp + ',');
        }else if(minp!='' && maxp==''){
            data.push("monthmaxprice="+',' + minp);
        }else if(minp!='' && maxp!='' && minp < maxp){
            data.push("monthmaxprice="+minp + ',' + maxp);
        }

        if($("#search_keyword").val()!='' && $("#search_keyword").val()!=null){
			data.push("search="+$("#search_keyword").val());
		}
        

        isload = true;
        if(page == 1){
            //数据加载中...
            $(".info_list .con_ul").html('<div class="empty">'+langData['education'][4][1]+'</div>');
        }else{
            //数据加载中...
            $(".info_list .con_ul").append('<div class="empty">'+langData['education'][4][1]+'</div>');
        }
        
        $.ajax({
            url: masterDomain + "/include/ajax.php?service=pension&action=elderlyList&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    $(".empty").remove();
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;

                    for (var i = 0; i < list.length; i++) {
                        html.push('<li class="con_li fn-clear" data-name="'+list[i].elderlyname+'" data-id="'+list[i].id+'">');
                        html.push('<a data-url="'+list[i].url+'" href="javascript:;">');
                        var pic = list[i].photo != "" && list[i].photo != undefined ? huoniao.changeFileSize(list[i].photo, "small") : "/static/images/404.jpg"; 
                        html.push('<div class="com_top">');
                        html.push('<div class="left_b"><img src="'+pic+'"></div>');
                        html.push('<div class="right_b fn-clear">');
                        html.push('<div class="man_head fn-clear">');
                        html.push('<h3 class="man_name">'+list[i].elderlyname+'</h3>');
                        html.push(' <p class="man_info"><span class="sex">'+(list[i].sex ? '男' : '女')+'</span>/<span class="age">'+list[i].age+'岁</span></p><span class="health">'+list[i].targetcarename+'</span>');
                        html.push('</div>');
                        html.push('<p class="old_info3"><img src="'+templatePath+'images/icon2.png"><span class="sec_span">'+list[i].addrname[0]+list[i].addrname[1]+'</span></p>');
                        html.push('</div>');
                        html.push('</div>');
                        html.push('<div class="com_bottom fn-clear">');
                        html.push('<ul class="fn-clear">');
                        html.push('<li><p class="fir_p">'+echoCurrency('symbol')+list[i].rzminprice+'万-'+echoCurrency('symbol')+list[i].rzmaxprice+'万</p><p class="sec_p">入住费用预算</p></li>');
                        html.push('<li><p class="fir_p">'+echoCurrency('symbol')+list[i].monthminprice+'-'+echoCurrency('symbol')+list[i].monthmaxprice+'</p><p class="sec_p">月费用预算</p></li>');
                        html.push('</ul>');
                        var visitxt = list[i].storepower==1 ? 'can_visit' : 'no_visit';
                        html.push('<span class="visit '+visitxt+'">邀请参观入住</span>');
                        html.push('</div>');
                        html.push('</a>');
                        html.push('</li>');
                    }

                    if(page == 1){
                         $(".info_list .con_ul").html("");
                      
                        setTimeout(function(){$(".info_list .con_ul").html(html.join(""))}, 200);
                       
                    }else{
                     
                        $(".info_list .con_ul").append(html.join(""));
                        
                    }
                    isend = false;

                    if(page >= pageinfo.totalPage){
                        isend = true;
                        if(page != 1){
                            $(".info_list .con_ul").append('<div class="empty">到底了...</div>');
                        }
                    }

                }else{
                    if(page == 1){
                        $(".info_list .con_ul").html("");
                    }
                    $(".info_list .con_ul").html('<div class="empty">'+data.info+'</div>');
                }
            },
            error: function(){
                isload = false;
                if(page == 1){
                    $(".info_list .con_ul").html("");
                }
                $(".info_list .con_ul .empty").html('网络错误，加载失败...').show();
            }
        });

    }

    //参观权限弹出
    $('.info_list').delegate('.no_visit', 'click', function(){
        $('.info_mask2').show();
        return false;
    })
    //参观权限关闭
    $('.info_mask2').delegate('.know', 'click', function(){
        $('.info_mask2').hide();
    })

    //允许参观弹出
    $('.info_list').delegate('.can_visit', 'click', function(){
        $('.info_mask').css('visibility','visible');
        $("#elderly").val($(this).closest('li').data('id'));
        $(".info_con .info_inp .tip").html('尊敬的'+$(this).closest('li').data('name')+'，您好：');
        return false;
    })

     // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }
    //  表单验证
    function isPhoneNo(p) {
        var pattern = /^1[23456789]\d{9}$/;
        return pattern.test(p);
    }
    $('.info_con .sure').click(function(){

        var info_name = $('#info_name').val(), 
            info_phone = $('#info_phone').val(), 
            f = $(this) ;

        if(f.hasClass("disabled")) return false;

        if (!info_name) {
            showMsg('请填写联系人'); //请填写联系人
            return false;
        }else if (!info_phone) {
            showMsg('请填写联系电话'); //请填写联系电话
            return false;
        }else if (isPhoneNo($.trim(info_phone)) == false){
            showMsg('请填写正确的手机号');   //请填写正确的手机号
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
					$("#info_name").val('');
					$("#info_phone").val('');
					$('.info_mask').css('visibility','hidden');
					$('.org_mask2').show();
					f.removeClass("disabled").html(langData['siteConfig'][6][63]);
				}else{
					showMsg(data.info);
					f.removeClass("disabled").html(langData['siteConfig'][6][63]);
				}
			},
			error: function(){
				showMsg(langData['siteConfig'][20][183]);
				f.removeClass("disabled").html(langData['siteConfig'][6][63]);
			}
        });
        
    })
    $('.info_con .cancel').click(function(){
        $('.info_mask').css('visibility','hidden');
    })

    // 关闭
    $('.org_mask2 .konw').click(function(){
        $('.org_mask2').hide();
    })

    //getAddrList();

    function getAddrList(){
		var id = $("#choose-area .active").data('id');

		var filter = $.isEmptyObject(detailList.getLocalStorage()['filter']) ? dataInfo : detailList.getLocalStorage()['filter'];

		if(id){
			$.ajax({
				url: masterDomain + "/include/ajax.php?service=pension&action=addr&type="+id,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						var html = [], list = data.info;
						var className1 = filter.addrid == id ? 'class="second_on"' : '';
						html.push('<li '+className1+' data-id="'+id+'">'+langData['travel'][13][7]+'</li>');
						for (var i = 0; i < list.length; i++) {
							var className = filter.addrid == list[i].id ? 'class="second_on"' : '';
							html.push('<li '+className+' data-id="'+list[i].id+'">'+list[i].typename+'</li>');
						}
                        $("#choose-area-second ul").html(html.join(""));
					}else if(data.state == 102){
						$("#choose-area-second ul").html('<li data-id="'+id+'">'+langData['travel'][13][7]+'</li>');
					}else{
						$("#choose-area-second ul").html('<li class="load">'+data.info+'</li>');
					}
				},
				error: function(){
					$("#choose-area-second ul").html('<li class="load">'+langData['travel'][13][6]+'</li>');
				}
			});
		}
	}

    // 本地存储的筛选条件
    function getData() {

        var filter = $.isEmptyObject(detailList.getLocalStorage()['filter']) ? dataInfo : detailList.getLocalStorage()['filter'];

		page = detailList.getLocalStorage()['extraData'].lastIndex;

		if (filter.addrpid != undefined && filter.addrpid!='') {
			$('#choose-area li').siblings('li').removeClass('active');
			$('#choose-area li[data-id="'+filter.addrpid+'"]').addClass('active');
		}

		if (filter.addrid != undefined && filter.addrid!='') {
			$('.addrid').attr('data-id', filter.addrid);
			$('#choose-area-second li').siblings('li').removeClass('on');
			$('#choose-area-second li[data-id="'+filter.addrid+'"]').addClass('on');
		}

		if (filter.keywords != '') {
			$('#search_keyword').val(filter.keywords);
		}

		if (filter.addrname != '' && filter.addrname != null) {$('.addrid span').text(filter.addrname);}

		if (filter.orderbyname != '' && filter.orderbyname != null) {$('.order_type span').text(filter.orderbyname);}

        if (filter.orderby != '') {
            $('.order_type').attr('data-id', filter.orderby);
            $('#orderby_class li[data-id="'+filter.orderby+'"]').addClass('on').siblings('li').removeClass('on');
        }
        
        if (filter.targetcare != '') {
            $('#targetcare li').siblings('li').removeClass('active');
			$('#targetcare li[data-id="'+filter.targetcare+'"]').addClass('active');
        }
        
        if (filter.rzmaxprice != '') {
            $('#rzmaxprice li').siblings('li').removeClass('active');
			$('#rzmaxprice li[data-id="'+filter.rzmaxprice+'"]').addClass('active');
        }
        
        if (filter.monthmaxprice != '') {
            $('#monthmaxprice li').siblings('li').removeClass('active');
			$('#monthmaxprice li[data-id="'+filter.monthmaxprice+'"]').addClass('active');
		}
		
    }



})
