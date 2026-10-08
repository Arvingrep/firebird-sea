function alertinfo(data){
	alert(data);
} 
$(function(){
	$('#otitle').on('keyup',function(){
		var title = $(this).val();
		$('#ztitle').html(title);
	});
	$('#ofm').on('change',function(){
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
	    		$('#surfaceimg').attr('src',data);
	    		$('#surfaceimg').attr('rel',data);
	    		$('#ofm').select();
				$('#ofm').val('');				
	    		//document.execCommand("delete"); 
	    	}else{
	    		alertinfo(langData['waimai'][6][178]);
				$('#ofm').val('');
	    	}
	    });	
	});
	$('.o_save').on('click',function(){
		var tage = $(this).attr('tage');
		if(tage == 1){
			$(this).attr('tage','0');
			var title = $('input[name=title]').val();
			var content = $('#content').val();
			var describe = $('#describe').val();
			var surface = $('#surfaceimg').attr('rel');
			var url = $('.baseurl').html()+'/autoreply/createonews';
			var urltype = $('#urltype').val();	
			var outside_url = $('#outside_url').val();
			var shop_id = $('#shop_id').val();
			var shop_type = $('#shop_type').val();
			if(title == '' || describe == '' || surface == ''){
				alertinfo(langData['waimai'][6][185]);
				$(this).attr('tage','1');
				return;
			}
			$.post(url,{title:title,content:content,describe:describe,surface:surface,urltype:urltype,outside_url:outside_url,shop_id:shop_id,shop_type:shop_type},function(data){
				if(data == 'success'){
					//console.log(data);
					window.open($('.baseurl').html()+'/autoreply/news','_self');
				}else{
					//console.log(data);
					alertinfo(langData['waimai'][6][186]);
					window.open($('.baseurl').html()+'/autoreply/news','_self');
				}
			});
			$(this).attr('tage','1');
		}else{
			return;
		}
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
