$(function(){
	// 复制url
	var clipboard
	    clipboard = new ClipboardJS('.copy_btn');
		clipboard.on('success', function(e) {
			alert(langData['siteConfig'][46][101]);  //复制成功
		});

		clipboard.on('error', function(e) {
			alert(langData['siteConfig'][46][102]); //复制失败
		});

	// 倒计时
	if(state==0){
		countDown(ftimes);
		setInterval(function(){
			countDown(ftimes)
		},1000);
	}

	// 遍历商品
	var prohtml = [];
	 for(var i = 0; i < $(".pro_list a.pro_link").length; i++){
		prohtml.push($(".pro_list li").eq(i).html());
	 }
	 var listArr = [];
	  for(var i = 0; i < prohtml.length; i++){
		 listArr.push(prohtml.slice(i, i + 3).join(""));
		 i += 2;
	 }
	$(".pro_list ul").html('<li class="pro_li fn-clear">'+listArr.join('</li><li class="pro_li fn-clear">'))

	function countDown(time){
		var now = (new Date()).getTime();
		var restsec = time*1000 - now;
		var day = parseInt(restsec/(60*60*24*1000));
		var day_ = day > 0 ? day + langData['siteConfig'][13][6] : '';  //天

		var hour = parseInt(restsec/(60*60*1000)%24);
		var hour_ = hour > 0 ? hour + langData['siteConfig'][13][44] : '';  //小时

		var min = parseInt(restsec/(60*1000)%60);
		var min_ = min > 0 ? min + langData['live'][1][47] : '';    //分

		var sec = parseInt(restsec/(1000)%60);
		var sec_ = (sec > 0 ? sec : 0) + langData['live'][1][48];   //秒

		$(".nstate h3 span").html(langData['live'][1][49] + day_ + hour_ + min_ + sec_);  //倒计时
	}



	// 回放开关
	$(".r_box span").click(function(e){
		var t =$(this);
		if(!t.hasClass("chosed")){
			t.addClass("chosed");
			t.siblings("em").text(langData['live'][1][36]);  //开启

			$.ajax({
				url: "/include/ajax.php?service=live&action=updateReplayState&id="+id,
				type: 'post',
				dataType: 'json',
				success: function (data) {
					if(data && data.state == 100){
						location.reload();
					}else{
						alert(data.info);
					}
				}
			});

		}else{
			$(".pop_box").show();
			e.stopPropagation();
		}

	});

	$(".r_box .pop_box .sure_btn").click(function(){
		var t = $(".r_box span");
		$(".pop_box").hide();
		t.removeClass("chosed");
		t.siblings("em").text(langData['live'][1][7])    //关闭

		$.ajax({
			url: "/include/ajax.php?service=live&action=updateReplayState&id="+id,
			type: 'post',
			dataType: 'json',
			success: function (data) {
				if(data && data.state == 100){
					location.reload();
				}else{
					alert(data.info);
				}
			}
		});

		return false;
	})

	$(document).bind("click",function(){
		$(".pop_box").hide();
	})

	// 不可编辑
	$(".live_slide .edit_link,.livedetail .edit_btn").click(function(){
		if(state==1){
			$(".mask_tooltip").show();
			$(".tooltips").show();
			$(".tooltips .close_btn,.mask_tooltip").click(function(){
				$(".mask_tooltip").hide();
				$(".tooltips").hide();
			})
		}
	});


	// 推流切换
	$(".tlset_box .tab li").click(function(){
		var t = $(this),index = t.index();

		// 此处需判断是否已经设置过推流方式
		// if(!$(".auto_tui .vaddr_after").hasClass("fn-hide") && index==1){
		// 	$(".tooltips_confirm.auto_tool,.mask_tooltip").show();
		// 	return false;
		// }
		if(($(".self_tui #addrPc").val()!='' || $(".self_tui #addrMob").val()!='') && index==0){
			$(".tooltips_confirm.self_tool,.mask_tooltip").show();
			return false;
		}
		t.addClass("ontab").siblings("li").removeClass("ontab");
		$(".tab_container>div").eq(index).removeClass("fn-hide").siblings("div").addClass("fn-hide");
	});

	$(".self_tool .sure_btn").click(function(){
		var t = $(this), par = t.closest(".tooltips_confirm");
		// 此处需要清空原来的值
		if(par.hasClass(".self_tool")){
			$(".self_tui #addrPc").val('');
			$(".self_tui #addrMob").val('');
			$(".tab_container>div").eq(1).removeClass("fn-hide").siblings("div").addClass("fn-hide");
			$(".tlset_box .tab li").eq(1).addClass("ontab").siblings("li").removeClass("ontab");
		}else{
			$(".tlset_box .tab li").eq(0).addClass("ontab").siblings("li").removeClass("ontab");
			$(".tab_container>div").eq(0).removeClass("fn-hide").siblings("div").addClass("fn-hide");

			$.ajax({
	            url: "/include/ajax.php?service=live&action=updateLiveType&type=0&id="+id,
	            type: 'post',
	            dataType: 'json',
	            data:"id="+id,
	            success: function (data) {
	                if(data && data.state == 100){
						// location.reload();
						alert('设置成功');
	                }else{
						alert(data.info);
					}
	            }
	        });
		}
		$(".tooltips_confirm,.mask_tooltip").hide();
	})


	//使用第三方拉流地址
	$('.vurl_box .btn_sure').bind('click', function(){
		var t = $(this);
		if(t.hasClass('disabled')) return false;

		var addrPc = $.trim($('#addrPc').val()), addrMob = $.trim($('#addrMob').val());
		if(addrPc == ''){
			alert('请输入电脑端拉流地址！');
			return false;
		}
		if(addrMob == ''){
			alert('请输入移动端拉流地址！');
			return false;
		}

		t.addClass('disabled').html('提交中...');

		$.ajax({
            url: "/include/ajax.php?service=live&action=updateLiveType&type=1&id="+id+"&pc=" + encodeURIComponent(addrPc) + "&touch=" + encodeURIComponent(addrMob),
            type: 'post',
            dataType: 'json',
            data:"id="+id,
            success: function (data) {
                if(data && data.state == 100){
					alert('保存成功');
					location.reload();
                }else{
					alert(data.info);
					t.removeClass('disabled').html('重新提交');
				}
            }
        });

	});


	/*  自定义菜单  */
	//菜单显示和隐
	$(".menuset_box").delegate(".menu_li .mr_show span","click",function(){
		var t = $(this);
		t.toggleClass("selected");
		var inp = t.closest('li').find('.show');
		if(t.hasClass("selected")){
			inp.val(1);
			t.siblings("em").text(langData['live'][1][40]) ; //显示
		}else{
			inp.val(0);
			t.siblings("em").text(langData['live'][1][50]) ;  //隐藏
		}
	});

	// 新增自定义菜单
	/* 请输入菜单名称  显示  请输入菜单链接  删除*/
	var px = $('.menu_ul li').length;
	$(".menuset_box .add_li").click(function(){
		$(".menuset_box ul").append('<li class="menu_li self_li" data-idx="'+px+'"><div class="menu"><input class="ml_text" type="text" name="menu['+px+'][name]" placeholder="'+langData['live'][2][0]+'"><div class="mr_show"><em>'+langData['live'][1][40]+'</em><span class="selected"><i></i></span></div><input type="hidden" name="menu['+px+'][show]" class="show" value="1"><input type="hidden" name="menu['+px+'][sys]" class="sys" value="-1"><input type="text" class="mlink" name="menu['+px+'][url]" placeholder="'+langData['live'][2][1]+'"></div><div class="op_box"><i class="px_btn"></i><i class="del_btn" title="'+langData['live'][0][36]+'"></i></div></li>');
		px++;
	});

	// 删除自定义菜单
	$(".menuset_box").delegate(".menu_li .del_btn","click",function(){
		var t = $(this),li = t.closest('.menu_li');
		$(".tooltips_confirm,.mask_tooltip").show();
		$(".btn_group .sure_btn").click(function(){
			li.remove();
			$(".tooltips_confirm,.mask_tooltip").hide();
		})
	});
	$(".btn_group .cancel_btn,.mask_tooltip").click(function(){
		$(".tooltips_confirm,.mask_tooltip").hide();
	});

	//菜单排序
	if($('.menu_ul').size()>0){
		$('.menu_ul').sortable({
		    items: 'li',
		    placeholder: 'placeholder',
		    orientation: 'vertical',
		    axis: 'y',
		    handle:'.px_btn',
		    opacity: .9,
		    revert: 0,
		    update:function(){
		        menuSort();
		    }
		});
	}


	function menuSort(type){
		var r = true;
		return r;
	    $('.menu li').each(function(n){
	        var t = $(this), idx = t.attr('data-idx'), sys = t.find('.sys').val(), title = t.find('.name').val(), val = t.find('.url').val();
	        if(sys == 0){
	        	if((title != '' && val == '') || (title == '' && val != '')){
	        		if(type){
	        			r = false;
	        			return false;
	        		}
	        	}
	        }else{
	        	if(title == ''){
	        		r = false;
	        		return false;
	        	}
	        }
	        t.find('input').each(function(){
	            var inp = $(this), name = inp.attr('name');
	            inp.attr('name', name.replace('[0]', '['+n+']').replace(idx, n));
	        })
	        t.attr('data-idx', n);
	    })
	    return r;
	}


	// 直播权限切换
	$(".livetype span").click(function(){
		var t = $(this);
		t.parents("label").siblings("").find("span").removeClass("selected");
		$(".type_fee").addClass("fn-hide");
		$(".type_psd").addClass("fn-hide");
		t.toggleClass("selected");
		val = t.attr("data-val");
		if(t.hasClass("selected")){
			$('#live_lx').val(val);
			if(val == "1"){
				$(".type_psd").removeClass("fn-hide");
			}else {
				$(".type_fee").removeClass("fn-hide");
			}
		}else{
			$('#live_lx').val('');
			if(val == "1"){
				$(".type_psd").addClass("fn-hide");
			}else {
				$(".type_fee").addClass("fn-hide");
			}
		}
	});


	// 加减
		$(".type_fee .live_fee i").click(function(){
			var t = $(this);
			var sib = t.siblings("input")
			var fee = sib.val()*1;
			if(t.hasClass("add_btn")){
				fee = fee + 1;
			}else{
				if(fee>1){
					fee = fee -1;
				}
			}
			sib.val(fee.toFixed(2))
		});
	// 直播费用
	$(".type_fee input").on("blur",function(){
		var t = $(this);
		var val = t.val();
		if(val != ''){
			var nowval = val.replace(/[^\d\.]/g,'')*1
			t.val(nowval.toFixed(2))
		}else{
			t.val(0)
		}
	});

	$(".type_fee input").on("input",function(){
		var t = $(this);
		var val = t.val();
		var nowval = val.replace(/[^\d\.]/g,'')
			t.val(nowval)
	});


	//开始直播
	$('.start-live').bind('click', function(){
		if(confirm(langData['siteConfig'][44][11])){  //是否开始直播
            update(1);
            window.location.reload();
        }
	});

	//结束直播
	$('.end-live').bind('click', function(){
        if(confirm(langData['siteConfig'][31][133])) {  //是否确定关闭直播？
            update(2);
            window.location.reload();
        }
	});


	function update(state){
        $.ajax({
            url: "/include/ajax.php?service=live&action=updateState&state="+state+"&id="+id,
            type: 'post',
            dataType: 'json',
            async : false,   //注意：此处是同步，不是异步
            data:"id="+id,
            success: function (data) {
                if(data && data.state == 100){
                    data.info=langData['siteConfig'][32][12];   //结束直播
                    // alert(data.info);
                }else{
                    alert(data.info)
                }
            }
        });
    }


	//观看限制保存
	$('.lxset_box .save_btn').bind('click', function(){
		var t = $(this);

		if(t.hasClass('disabled')) return false;

		var catid = $('#live_lx').val(), password = $.trim($('#password').val()), startmoney = parseFloat($('#start_collect').val()), endmoney = parseFloat($('#end_collect').val());
		if(catid == 1){
			if(password == ''){
				alert(langData['siteConfig'][20][502]);   //请填写密码
				return false;
			}
		}else if(catid == 2){
			if(startmoney < 0 || startmoney == '' || startmoney == null || startmoney == undefined){
				alert(langData['siteConfig'][31][95]);  //请填写开始收费
				return false;
			}
			if(endmoney < 0 || endmoney == '' || endmoney == null || endmoney == undefined){
				alert(langData['siteConfig'][31][96]);   //请填写结束收费
				return false;
			}
		}

		t.addClass('disabled').html('提交中...');

		$.ajax({
            url: "/include/ajax.php?service=live&action=updateLiveLimit&catid="+catid+"&password="+password+"&startmoney="+startmoney+"&endmoney="+endmoney,
            type: 'post',
            dataType: 'json',
            data:"id="+id,
            success: function (data) {
                if(data && data.state == 100){
                    alert('保存成功');
					location.reload();
                }else{
                    alert(data.info)
					t.removeClass('disabled').html('重新提交');
                }
            }
        });
	});


	//自定义菜单保存
	$('.menu_box .save_btn').bind('click', function(){
		var t = $(this);

		if(t.hasClass('disabled')) return false;

		var data = [];

		$('.menu_ul').find('li').each(function(){
			var li = $(this);

			//自定义
			if(li.hasClass('self_li')){
				var ml_text = $.trim(li.find('input.ml_text').val()), show = parseInt(li.find('.show').val()), sys = parseInt(li.find('.sys').val()), mlink = $.trim(li.find('.mlink').val());
				if(ml_text == ''){
					li.find('input.ml_text').focus();
					alert(langData['live'][2][0]);  //请填写菜单名称
					return false;
				}

				if(mlink == ''){
					li.find('.mlink').focus();
					alert(langData['live'][2][1]);  //请输入菜单链接
					return false;
				}

				data.push({'name': ml_text, 'show': show, 'sys': sys, 'url': mlink});

			}else{
				var ml_text = $.trim(li.find('input.ml_text').val()), show = parseInt(li.find('.show').val()), sys = parseInt(li.find('.sys').val());
				if(ml_text == ''){
					li.find('input.ml_text').focus();
					alert(langData['live'][2][0]);  //请填写菜单名称
					return false;
				}

				data.push({'name': ml_text, 'show': show, 'sys': sys});
			}
		});

		t.addClass('disabled').html('提交中...');

		$.ajax({
            url: "/include/ajax.php?service=live&action=updateLiveMenu",
            type: 'post',
            dataType: 'json',
            data:"id="+id+"&menu="+JSON.stringify(data),
            success: function (data) {
                if(data && data.state == 100){
                    alert('保存成功');
					location.reload();
                }else{
                    alert(data.info)
					t.removeClass('disabled').html('重新提交');
                }
            }
        });


	});

})
