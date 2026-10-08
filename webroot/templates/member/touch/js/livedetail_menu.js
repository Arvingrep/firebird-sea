$(function(){
  
    //APP端取消下拉刷新
    toggleDragRefresh('off');
  
	// 删除
	$(".container").delegate(".self_li .del_btn","click",function(){
		var selfli = $(this),par = $(this).parents('.self_li');
		$(".popsure_box").css("display","flex");
		$(".popsure_box .pop_sure").removeClass("fn-hide");
		$(".mask").show();
		$(".pop_sure .sure_btn").click(function(){
			par.remove();
			$(".pop_sure .cancel_btn").click();
		});
	});
	
	// 关闭弹窗
	$(".pop_sure .cancel_btn,.mask").click(function(){
		$(".popsure_box").css("display","none");
		$(".popsure_box .pop_sure").addClass("fn-hide");
		$(".mask").hide();
	});
	
	// 新增
	var px = $('.menu_ul li').length;
	$(".add_li").click(function(){
		$(".container .menu_ul").append('<li class="menu_li self_li" data-idx="'+px+'"><div class="menu"><input class="ml_text" type="text" name="menu['+px+'][name]" placeholder="'+langData['live'][2][0]+'"><div class="mr_show"><em>'+langData['live'][1][40]+'</em><span class="selected"><i></i></span></div><div class="inp_link"><input type="hidden" name="menu['+px+'][show]" class="show" value="1"><input type="hidden" name="menu['+px+'][sys]" class="sys" value="0"><input type="text" class="mlink" name="menu['+px+'][url]" placeholder="'+langData['live'][2][1]+'"></div></div><div class="op_box"><i class="px_btn"></i><i class="del_btn" title="'+langData['live'][0][36]+'"></i></div></li>');
		px++;
	});
	// $(".add_li").click(function(){
	// 	// $(".container .menu_ul").append('<li class="menu_li self_li" data-idx="100"><div class="menu"><input class="ml_text" type="text" placeholder="'+langData['live'][2][0]+'"><div class="mr_show"><em>'+langData['live'][1][40]+'</em><span class="selected"><i></i></span></div><div class="inp_link"><input type="text" class="mlink" placeholder="'+langData['live'][2][1]+'"></div></div><div class="op_box"><i class="px_btn"></i><i class="del_btn" title="'+langData['live'][0][36]+'"></i><input type="hidden" name="menu[{#$k#}][show]" class="show" value="1"><input type="hidden" name="menu[{#$k#}][sys]" class="sys" value="1"></div></li>'); 
	// });
	
	// 排序
	var container = document.getElementById("multi");
	var sortable = new Sortable(container, {
		 filter: ".ignore-li",
		 preventOnFilter: true, 
		 sort: true,  
		 delay: 0, 
		 handle: ".px_btn",  
	 });
	 
	 
	 // 切换显示或隐藏
	$(".container").delegate(".mr_show span","click",function(){
		var t = $(this),pli = t.parents('li'),ptxt = t.parents('.mr_show');
		t.toggleClass('selected');
		if(t.hasClass("selected")){
			pli.find('input.show').val(1);
			ptxt.find('em').text(langData['live'][1][40])
		}else{
			pli.find('input.show').val(0);
			ptxt.find('em').text(langData['live'][1][50])
		}
	});
	
	
	// 保存
	$(".save_btn").click(function(){
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
		
				t.addClass('disabled').html(langData['live'][6][9]);  //提交中
		
				$.ajax({
		            url: "/include/ajax.php?service=live&action=updateLiveMenu",
		            type: 'post',
		            dataType: 'json',
		            data:"id="+id+"&menu="+JSON.stringify(data),
		            success: function (data) {
		                if(data && data.state == 100){
		                    alert(langData['live'][5][35]);
							location.reload();
		                }else{
		                    alert(data.info)
							t.removeClass('disabled').html(langData['live'][5][36]);
		                }
		            }
		        });
	})
	
})