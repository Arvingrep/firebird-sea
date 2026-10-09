$(function(){
	
	$(".addNav").click(function(){
		$(".pop h4 span").text(langData['business'][9][54]); //'新建分类'
		$(".pop_mask").show();
		$(".pop").css({'transform':'translateY(0)','opacity':'1'});
	});
	
	$('.newstypeList').delegate('.edit_btn','click',function(){
		$(".pop h4 span").text(langData['business'][9][55]); //'修改分类'
		var t = $(this),li = t.closest('li');
		var lid = li.attr('data-id')
		$(".pop input").val(li.find('h3').text())
		$(".pop").attr('data-id',lid);
		$(".pop_mask").show();
		$(".pop").css({'transform':'translateY(0)','opacity':'1'});
		
	})
	
	$(".pop_mask,.pop .cancel_btn").click(function(){
		$(".pop").removeAttr('data-id')
		$(".pop input").val('')
		$(".pop_mask").hide();
		$(".pop").css('transform','translateY(3.3rem)');
		setTimeout(function(){
			$(".pop").css({'opacity':'0'});
		},300)
	});
	
	$(".pop .sure_btn").click(function(){
		var data = [],edit_id = $('.pop').attr('data-id');
		$(".newstypeList li").each(function(i){
			var id = $(this).attr('data-id');
			var val = $(this).find('h3').text();
			if(edit_id && id == edit_id){
				val = $(".pop input").val();
			}
			data.push('{"id": "'+id+'", "weight": "'+i+'", "val": "'+val+'"}');
		})
		
		if(!edit_id){
			data.push('{"id": "'+edit_id+'", "weight": "'+$(".newstypeList li").length+'", "val": "'+$(".pop input").val()+'"}');
		}
		$.ajax({
			url: "/include/ajax.php?service=business&action=updateNewsType",
			data: "data=["+data.join(",")+"]",
			type: "POST",
			dataType: "json",
			success: function(data){
				if(data && data.state == 100){
					showErrAlert(langData['business'][9][45]); //'添加成功'
					getnewstype();
					$(".pop_mask").click()
				}else{
					showErrAlert(data.info);
				}
			}
		});
	});
	
	// 获取数据
	getnewstype()
	function getnewstype(){
		$(".btnbox").before('<div class="loading">'+langData['siteConfig'][38][2]+'~</div>')  //'加载中'
		$.ajax({
			url: "/include/ajax.php?service=business&action=newstype",
			type: "POST",
			dataType: "json",
			success: function(data){
				if(data && data.state == 100){
					var html ='';
					var list = data.info;
					for(var i = 0; i<list.length; i++){
						html +=`<li class="newstype" data-id="`+list[i].id+`">
									<h3>`+list[i].typename+`</h3>
									<div class="btn_group">
										<a href="javascript:;" class="edit_btn"></a>
										<a href="javascript:;" class="del_btn"></a>
									</div>
								</li>`
					}
					$('.newstypeList').html(html);
					$('.loading').remove()
				}else{
					showErrAlert(data.info);
				}
			}
		});
	}
	
	// 删除
	$('.newstypeList').delegate('.del_btn','click',function(){
		var t = $(this),li = t.closest('li'),lid = li.attr('data-id')
		// delNewsType(id)
		$(".delMask").addClass('show');
		$('.delAlert').show();
		
		$(".cancelDel,.delMask").click(function(){
			$(".delMask").removeClass('show');
			$('.delAlert').hide();
		});
		
		$(".sureDel").click(function(){
			$(".delMask").removeClass('show');
			$('.delAlert').hide();
			delNewsType(lid)
		});
	})
	function delNewsType(id){
		$.ajax({
			url: "/include/ajax.php?service=business&action=delNewsType&id="+id,
			type: "POST",
			dataType: "json",
			success: function(data){
				if(data && data.state == 100){
					showErrAlert(langData['business'][9][28]);  //删除成功
					$(".newstypeList li[data-id='"+id+"']").remove();
				}else{
					showErrAlert(data.info);
				}
			}
		});
	}
})