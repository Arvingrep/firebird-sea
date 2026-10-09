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
        typeid:'',
        targetcare:'',
        roomtype:'',
        bednums:'',
        price:'',
        servicecontent:'',
        tag:'',
		keywords:'',
		isBack: true
    };
    
    $('.com_ul').delegate('.com_li', 'click', function(){
		var t = $(this), a = t.find('a'), url = a.attr('data-url'), id = t.attr('data-id');

		var orderby     = $('#orderby_class li.on').attr('data-id');
		var orderbyname = $('#orderby_class li.on').text();
		
		var addrpid     = $('#choose-area li.active').attr('data-id');
		var addrid      = $('#choose-area-second li.on').attr('data-id');
        var addrname2   = $('#choose-area li.active').text();
		var addrname1   = $('#choose-area-second li.on').text();
        var addrname    = addrpid == addrid ? addrname2 : addrname1;
        
        var typeid  = $('#typeid li.active').attr('data-id');
        var targetcare  = $('#targetcare li.active').attr('data-id');
        var roomtype  = $('#roomtype li.active').attr('data-id');
        var bednums  = $('#bednums li.active').attr('data-id');
        var price  = $('#price li.active').attr('data-id');
        var servicecontent  = $('#servicecontent li.active').attr('data-id');
        var tag  = $('#tag li.active').attr('data-id');
		

		dataInfo.url = url;
		dataInfo.addrid  = addrid;
		dataInfo.addrpid = addrpid;
		dataInfo.addrname = addrname;
		dataInfo.orderby = orderby;
        dataInfo.orderbyname = orderbyname;
        dataInfo.typeid = typeid;
        dataInfo.targetcare = targetcare;
        dataInfo.roomtype = roomtype;
        dataInfo.bednums = bednums;
        dataInfo.price = price;
        dataInfo.servicecontent = servicecontent;
        dataInfo.tag = tag;
		dataInfo.keywords = $('#search_keyword').val();

		detailList.insertHtmlStr(dataInfo, $("#store").html(), {lastIndex: page});

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
        $("#price li").removeClass('active');
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
        var h = $('.old_list .com_li').height();  
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

    //获取信息列表
    function getList(tr){

        if(isload) return false;
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("catid="+catid);
        $(".choose-tab li").each(function(){
            data.push($(this).attr("data-type") + "=" + $(this).attr("data-id"));
        });

        $(".nav-second li.active").each(function(){
            data.push($(this).parent('ul').data('type') + "=" + $(this).attr("data-id"));
        });

        var minp = $("#price1").val();
        var maxp = $("#price2").val();
        if(minp=='' && maxp!=''){
            data.push("price="+maxp + ',');
        }else if(minp!='' && maxp==''){
            data.push("price="+',' + minp);
        }else if(minp!='' && maxp!='' && minp < maxp){
            data.push("price="+minp + ',' + maxp);
        }

        if($("#search_keyword").val()!='' && $("#search_keyword").val()!=null){
			data.push("search="+$("#search_keyword").val());
		}
        

        isload = true;
        if(page == 1){
            //数据加载中...
            $(".old_list .com_ul").html('<div class="empty">'+langData['education'][4][1]+'</div>');
        }else{
            //数据加载中...
            $(".old_list .com_ul").append('<div class="empty">'+langData['education'][4][1]+'</div>');
        }
        
        $.ajax({
            url: masterDomain + "/include/ajax.php?service=pension&action=storeList&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    $(".empty").remove();
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;

                    for (var i = 0; i < list.length; i++) {
                        
                        html.push('<li class="com_li fn-clear">');
                        html.push('<a data-url="'+list[i].url+'" href="javascript:;">');
                        var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                        html.push('<div class="left_b"><img src="'+pic+'" alt=""></div>');
                        html.push('<div class="right_b fn-clear">');
                        var zhu = list[i].flag == 1 ? '<s></s>' : '';
                        html.push('<div class="org_title"><h3 class="org_h3">'+list[i].title+'</h3>'+zhu+'</div>');
                        html.push('<div class="com1">');
                        var w = list[i].sco1 / 5 * 100;
                        html.push('<ul class="info_ul"><li style="width: '+w+'%;"></li></ul>');
                        if(list[i].tagArr!=''){
                            for(var m=0;m<list[i].tagArr.length;m++){
                                if(m>2) break;
                                var orgTxt = m==0 ? 'org_ser' : (m==1 ? 'org_car' : '');
                                html.push('<span class="'+orgTxt+'">'+list[i].tagArr[m]+'</span>');
                            }
                        }
                        html.push('</div>');
                        var totalPrice = (list[i].price*12/10000).toFixed(2);
                        if(catid=='1'){
                            html.push('<p class="old_info old_info1"><span>入住费用：</span>'+echoCurrency('symbol')+'<em>'+totalPrice+'</em>万</p>');
                            html.push('<p class="old_info"><span>月费：</span>'+echoCurrency('symbol')+'<em>'+list[i].price+'</em></p>');
                        }else{
                            html.push('<p class="old_info old_info1"><span>费用：</span>'+echoCurrency('symbol')+'<em>'+list[i].price+'</em></p>');
                            html.push('<p class="old_info old_info2"><img src="'+templatePath+'images/icon2.png" alt=""><span class="sec_span">'+list[i].address+'</span></p>');
                        }
                        html.push('<a href="tel:'+list[i].tel+'" class="old_call"></a>');
                        html.push('</div>');
                        html.push('</a>');
                        html.push('</li>');

                    }

                    if(page == 1){
                         $(".old_list .com_ul").html("");
                      
                        setTimeout(function(){$(".old_list .com_ul").html(html.join(""))}, 200);
                       
                    }else{
                     
                        $(".old_list .com_ul").append(html.join(""));
                        
                    }
                    isend = false;

                    if(page >= pageinfo.totalPage){
                        isend = true;
                        if(page != 1){
                            $(".old_list .com_ul").append('<div class="empty">到底了...</div>');
                        }
                    }

                }else{
                    if(page == 1){
                        $(".old_list .com_ul").html("");
                    }
                    $(".old_list .com_ul").html('<div class="empty">'+data.info+'</div>');
                }
            },
            error: function(){
                isload = false;
                if(page == 1){
                    $(".old_list .com_ul").html("");
                }
                $(".old_list .com_ul .empty").html('网络错误，加载失败...').show();
            }
        });

    }

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
        
        if (filter.typeid != '') {
            $('#typeid li').siblings('li').removeClass('active');
			$('#typeid li[data-id="'+filter.typeid+'"]').addClass('active');
        }
        
        if (filter.rzmaxprice != '') {
            $('#rzmaxprice li').siblings('li').removeClass('active');
			$('#rzmaxprice li[data-id="'+filter.rzmaxprice+'"]').addClass('active');
        }
        
        if (filter.roomtype != '') {
            $('#roomtype li').siblings('li').removeClass('active');
			$('#roomtype li[data-id="'+filter.roomtype+'"]').addClass('active');
        }
        
        if (filter.bednums != '') {
            $('#bednums li').siblings('li').removeClass('active');
			$('#bednums li[data-id="'+filter.bednums+'"]').addClass('active');
        }
        
        if (filter.price != '') {
            $('#price li').siblings('li').removeClass('active');
			$('#price li[data-id="'+filter.price+'"]').addClass('active');
        }
        
        if (filter.servicecontent != '') {
            $('#servicecontent li').siblings('li').removeClass('active');
			$('#servicecontent li[data-id="'+filter.servicecontent+'"]').addClass('active');
        }
        
        if (filter.tag != '') {
            $('#tag li').siblings('li').removeClass('active');
			$('#tag li[data-id="'+filter.tag+'"]').addClass('active');
		}
		
    }



})
