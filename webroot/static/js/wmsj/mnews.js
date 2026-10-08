function alertinfo(data){
	alert(data);
} 
$(function(){
	//标题
	$('#otitle').live('keyup',function(){
		var title = $(this).val();
		$('.selectface').children('.facecentent').html(title);
	});

	//摘要
	$('#describe').live('keyup',function(){
		var describe = $(this).val();
		$('.selectface').children('.tempdescribe').html(describe);
	});
	//链接类型
	$('#urltype').live('change',function(){
		var urltype = $(this).val();
		$('.selectface').children('.tempurltype').html(urltype);
	})
	//外部url
	$('#outside_url').live('keyup',function(){
		var outside_url = $(this).val();
		$('.selectface').children('.tempoutsideurl').html(outside_url);
	})
	//店铺ID
	$('#shop_id').live('change',function(){
		var shop_id = $(this).val();
		$('.selectface').children('.tempshopid').html(shop_id);
	})
	//店铺分类
	$('#shop_type').live('change',function(){
		var shop_type = $(this).val();
		$('.selectface').children('.tempshoptype').html(shop_type);
	})
	//选择图片
	$('#ofm').live('change',function(){
	    $(this).parent().ajaxSubmit(function(data){
	    	if(data == 'suffix'){
	    		alertinfo(langData['waimai'][6][177]);
				$('#ofm').val('');
	    	}else if(data == 'size'){
	    		alertinfo(langData['waimai'][6][174]);
				$('#ofm').val('');
	    	}else if(data == 'error'){
	    		alertinfo(langData['waimai'][6][178]);
				$('#ofm').val('');
	    	}else if(data.length<100){
	    		$('.selectface').children('img').attr('src',data);
	    		$('.selectface').children('img').attr('rel',data);
	    		$('#ofm').select();
				$('#ofm').val('');				
	    		//document.execCommand("delete");
	    	}else{
	    		alertinfo(langData['waimai'][6][178]);
				$('#ofm').val('');
	    	}
	    });	
	});
	
	//提交
	$('.o_save').live('click',function(){
		var tage = $(this).attr('tage');
		if(tage == 1){
			$('.selectface').children('.tempcontent').html($('#content').val());
			var data = [];
			var obj = $('#surface,.sonface');
			var num = obj.length-1;
			for(var i=0;i<num;i++){
				if(checkface(obj[i])){
					var content  = $(obj[i]).children('.tempcontent').html();
					var describe = $(obj[i]).children('.tempdescribe').html();
					var surface  = $(obj[i]).children('.faceimg').attr('rel');
					var title    = $(obj[i]).children('.facecentent').html();
					var urltype  = $(obj[i]).children('.tempurltype').html();
					var outside_url  = $(obj[i]).children('.tempoutsideurl').html();
					var shop_id = $(obj[i]).children('.tempshopid').html();
					var shop_type = $(obj[i]).children('.tempshoptype').html();
					data[i] = [content,describe,surface,title,urltype,outside_url,shop_id,shop_type];
				}else{
					alertinfo(langData['waimai'][6][179]);
					return;
				}
			}
			var url = $('.baseurl').html()+'/autoreply/createmnews';
			$.post(url,{data:data},function(data){
				if(data == 'success'){
					window.open($('.baseurl').html()+'/autoreply/news','_self');
				}else{
					alertinfo(langData['waimai'][6][180]);
					window.open($('.baseurl').html()+'/autoreply/news','_self');
				}
			});
			$(this).attr('tage','1');
		}else{
			return;
		}
	});
	
	//悬浮封面框时显示对应的控制
	$('.sonface,#surface').live('mouseover',function(){
			$('.contrlface').hide();
			$(this).children('.contrlface').show();
	});
	$('.sonface,#surface').live('mouseout',function(){
		$(this).children('.contrlface').hide();
	});
	
	//点击添加图文按钮
	$('#endface').click(function(){
		var length = $('.sonface').length;
		if(length >= 8){
			alertinfo(langData['waimai'][6][181]);
			return;
		}
		var html = $('#sonfacehtml').html();
		$(this).before(html);
	});
	
	// 点击编辑图文按钮
	$('.faceedit').live('click',function(){
		var index = $('.faceedit').index(this)+1;
		setoffset(index);
		$('.selectface').children('.tempcontent').html($('#content').val());
		$('.selectface').removeClass('selectface');
		$(this).parents('#surface,.sonface').addClass('selectface');
		var title = $(this).parents('#surface,.sonface').children('.facecentent').html();
		var content = $(this).parents('#surface,.sonface').children('.tempcontent').html();
		var describe = $(this).parents('#surface,.sonface').children('.tempdescribe').html();
		var outside_url = $(this).parents('#surface,.sonface').children('.tempoutsideurl').html();
		var urltype = $(this).parents('#surface,.sonface').children('.tempurltype').html();
		var shopid = $(this).parents('#surface,.sonface').children('.tempshopid').html();
		var shoptype = $(this).parents('#surface,.sonface').children('.tempshoptype').html();
		if(title != langData['siteConfig'][19][0]){
			$('#otitle').val(title);
		}else{
			$('#otitle').val('');
		}
		$('#describe').val(describe);
		$('.outsideoption').each(function(){
			if(parseInt(this.value) == parseInt(urltype)){
				this.selected = true;
			}else{
				this.selected = false;
			}
		});
		$('#outside_url').val(outside_url);
		$('.shopidoption').each(function(){
			if(parseInt(this.value) == parseInt(shopid)){
				this.selected = true;
			}else{
				this.selected = false;
			}		
		});
		$('.shoptypeoption').each(function(){
			if(parseInt(this.value) == parseInt(shoptype)){
				this.selected = true;
			}else{
				this.selected = false;
			}		
		});
		urltype = parseInt(urltype);
		$('#newsconetentbox,#shoptypebox,#shopidbox,#outsideurlbox').hide();
		if(urltype == 0){
			$('#newsconetentbox').show();
		}else if(urltype == 1){
			$('#outsideurlbox').show();
		}else if(urltype == 2){
			$('#shopidbox').show();
		}else if(urltype == 3){
			$('#shoptypebox').show();
		}		
		editor.html(content);
		editor.focus();
	});
	
	$('#urltype').on('change',function(){
		var urltype = parseInt($(this).val());
		$('#newsconetentbox,#shoptypebox,#shopidbox,#outsideurlbox').hide();
		if(urltype == 0){
			$('#newsconetentbox').show();
		}else if(urltype == 1){
			$('#outsideurlbox').show();
		}else if(urltype == 2){
			$('#shopidbox').show();
		}else if(urltype == 3){
			$('#shoptypebox').show();
		}
	});
 })
 function gettempcontent(tempcontent){
	$('.selectface').children('.tempcontent').html(tempcontent);
 }
 //删除图文
 function mnewsdelete(obj){
	var length = $('.sonface').length;
	if(length <= 2){
		alert(langData['waimai'][6][182]);
		return;
	}
	if($(obj).parents('.sonface').is('.selectface')){
		$('#surface').children('.contrlface').children('.faceedit').trigger('click');
	}else{
		var index = $('#surface,.sonface').not($(obj).parents('#surface,.sonface')).index($('.selectface'))+1;
		setoffset(index);
	}
	$(obj).parents('.sonface').remove();	
}

//设置#fingerface和#o_right的位置
function setoffset(index){
	var top = 100;
	if(index == 1){
		top = 80;
		$('#imgsize').html(langData['waimai'][6][183]);
	}else{
		top = 180+60*((index-2)*2+1);
		$('#imgsize').html(langData['waimai'][6][184]);
	}
	$('#fingerface').css('top',top+'px');
	var height = parseInt($('#o_right').css('height'));
	var margin = 0;
	var offset = top - height;
	if(index == 1){
		margin = 0;
	}else if(offset > 0){
		margin = offset+65;
	}else{
		margin = top-60
	}
	$('#o_right').css('margin-top',margin+'px');	
}

function checkface(obj){
	if($(obj).children('.facecentent').html() == '' || $(obj).children('.facecentent').html() == langData['siteConfig'][19][0] || $(obj).children('.faceimg').attr('rel') == '' || $(obj).children('.tempdescribe').html() == ''){
		return false;
	}else{
		return true;
	}
}
