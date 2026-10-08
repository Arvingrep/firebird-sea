/*var get_img_url= 'index.php?r=picture/getimgbyname&group_name=';
var get_group_url = 'index.php?r=picture/getallgroup';*/
var get_img_url;
var get_group_url;
var keyword = '';

$(function(){
	

	$(document).bind("click",function(e){
		  var target  = $(e.target);
		  /*if(target.closest(".sel_img_view").length == 0){
		       $(".sel_img_view").hide();
		  }*/
	})
	
	$('#all_checked').toggle(
		
		function(){
			$('#js_all').attr('checked',true);
			$('.img_pick').find('input[type="checkbox"]').attr('checked',true);
			changeMouseStyle();
		},
		function(){
			$('#js_all').attr('checked',false);
			$('.img_pick').find('input[type="checkbox"]').attr('checked',false);
			changeMouseStyle();
		}

	)


	// 单选
	$('.imagename').click(function(){
		var cur_img = $(this).next('input[name="deleteimages[]"]');
		var is_checked = $(cur_img).is(':checked');

		if(!is_checked){

			$(cur_img).attr('checked',true);
		}else{
			
			$(cur_img).attr('checked',false);
		}
		changeMouseStyle();

	})

	$('#ensure').mouseover(ableBtnOver);
	$('#ensure').mouseout(ableBtnOut);
	$('#cancel').mouseover(ableBtnOver);
	$('#cancel').mouseout(ableBtnOut);

	// 此处需要用到live，解决追加后的节点绑定点击事件无效
	$('.box').live('click',changeStyleGetValue);

	$('.inner_menu_item').live('click',requestGroupImg)

	//$('#img_box').click(showImgBox);

	$('#cancel').click(closeImgBox);

	$('#prev_page').click(selPageChangeData);
	$('#next_page').click(selPageChangeData);

	$('#js_upload').click(function(){
		//$('input[name="picselect"]').val('');
		$('#picselect').click();
		$('#picselect').change(function(){
			closeWindow('.sel_img_view')
		})
	})
	
	/* 点击图片搜索 */
	$('.js-search-img').click(function(){
		doSearchImg();
	})
	var $inp = $('input'); //所有的input元素
	$inp.keypress(function (e) { //这里给function一个事件参数命名为e，叫event也行，随意的，e就是IE窗口发生的事件。
	    var key = e.which; //e.which是按键的值
	    if($('input[name="img_keyword"]').is(":focus"))
	    {
	    	if (key == 13) {
		    	doSearchImg();
		    }
		}
	});
	
	$('.pagination .page a,.pagination .next a,.pagination .prev a').live('click',function(){
		
		get_img_url = $(this).attr('href');
		var name = $('.inner_menu').find('.selected').find('input[name="gruop_name"]').val();
		getImgByName(name,keyword);
		return false;
	})
})

function ableBtnOver(){

	$(this).addClass('btn_abled_over');
}

function ableBtnOut(){
	$(this).removeClass('btn_abled_over');
}

function changeStyleGetValue(){

	var checked = $('.img_pick').find('input[name="img_name"]:checked');

	if(is_single && checked.length > 0){
		$('.box').removeClass('selected');
		
		$('.img_pick').find('input[name="img_name"]:checked').attr('checked',false);
		
	}

	if($(this).find('input[name="img_name"]:checked').is(':checked')){
		
		$(this).find('input[name="img_name"]').attr('checked',false);
		$(this).removeClass('selected');
		
	}else{
		$(this).find('input[name="img_name"]').attr('checked',true);
		$(this).addClass('selected');
	}
	

	
}

function requestGroupImg(){

	var group_name = $(this).find('input[name="gruop_name"]').val();
	
	$('.inner_menu_item').removeClass('selected');
	$('input[name="limit"]').val('');
	$(this).addClass('selected');
	getImgByName(group_name);
}

/**
 * 显示图片选择框
 * @param getimgurl	取出图片的url
 * @param getgroupurl	取出分组url
 * @param issingle	是否单选
 * @param is_allow	是否允许上传图片
 */
function showImgBox(getimgurl,getgroupurl,issingle,is_allow){

	get_img_url = getimgurl;
	get_group_url = getgroupurl;
	is_single = issingle;
 
	// 取出分组
	$.post(get_group_url,'', function(result){
		var dd = '';

		if(result && result['success'] == 1){
			for(var g in result['data'])
			{
				var selected = g=='0' ? 'selected' : ''; 
				dd += '<dd class="inner_menu_item '+selected+' js_groupitem">';
				dd += '<a class="inner_menu_link" href="javascript:;">';
				dd += '<input type="hidden" name="gruop_name" value="'+g+'">';
				dd += '<strong>'+result['data'][g]+'</strong></a></dd>';
			}
		}
		$('.inner_menu').html(dd);

	},'JSON')
	
	if(is_allow){
		
		$('.media-list .global_mod').hide();
	}
	
	getImgByName(0);
	
	showWindow('.sel_img_view');
}
function closeImgBox(){

	closeWindow('.sel_img_view');
}

function getImgByName(name, keyword){
	
	keyword = !keyword ? '' : keyword;
	if(get_img_url)
	{
		// 取出图片
		$('.img_pick').html('');

		$.ajax({
			'url' :	get_img_url,
			'type' : 'POST',
			'data' : {'type_id':name, 'name': keyword},
			'dataType' : 'JSON',
			/*xhr: function() {  // 显示加载进程，这里注释掉是因为正式服务器会出现无法加载图片的问题
	            myXhr = $.ajaxSettings.xhr();
	            myXhr.upload.addEventListener('progress',progressHandlingFunction, false); // for handling the progress of the upload
	           	return myXhr;
	        },*/
			'success' : function(result){
				var img = '';
				if(result && result['success'] == 1){

					if(result['data'].length > 0){
						for(var i=0; i<result['data'].length; i++){
							img += '<div class="box" style="float:left;margin-top:15px ;margin-left:15px ;width:120px;cursor: pointer;position: relative;"><div class="boximg">';
							img += '<img class="imagesclass" title="'+result['data'][i]['name']+'" src="https://img.lewaimai.com'+result['data'][i]['file']+'"/>';
							img += '</div><span class="imagename">';
							img += '<input style="display:none" type="checkbox" name="img_name" value="'+result['data'][i]['file']+'" class="ace"/>';
							img += result['data'][i]['name'].substring(0,10)+'...';
							img += '</span>';
							img += '<div class="selected_mask"><div class="selected_mask_inner "></div><div class="selected_mask_icon "></div></div>';
							img += '</div>';
						}
						// 分页
						$('.pages_layout').html(result['pages']);
			            
					}else{
						$('#pages').hide();
						img = '<div style="margin-top:200px;height:80px;text-align:center;font-size:20px;font-weight:bold;">'+langData['waimai'][6][172]+'</div>';

					}
				}
				$('.img_pick').html(img);
				
			}
		})
	}

}

function selPageChangeData(){

	if(!$(this).hasClass('disabled')){
		var name = $('.inner_menu').find('.selected').find('input[name="gruop_name"]').val();
		getImgByName(name);
	}
}


function progressHandlingFunction(e){
    if(e.lengthComputable){
    	var loaded = e.loaded;     //已经上传大小情况 
    	var tot = e.total;      //附件总大小 
    	var per = Math.floor(100*loaded/tot);  //已经上传的百分比 
    	$(".progress_bar").css("width" , per +"%");
    }
}

/* 执行搜索 */
function doSearchImg()
{
	var name = $('.inner_menu').find('.selected').find('input[name="gruop_name"]').val();
	keyword = $('input[name="img_keyword"]').val();

	getImgByName(name,keyword);
}



var strVar = "";
    strVar += " <div class='sel_img_view ' style='display: none'>";
    strVar += "			  ";
    strVar += "			  	  <div class=\"oper_group group clearfix\">";
    strVar += "                            <div class=\"frm_controls oper_ele l\">";
    strVar += "                          			      "+langData['siteConfig'][6][49];
    strVar += "                            <\/div>";
    strVar += "	             <\/div>";
    strVar += "			  ";
    strVar += "			  	<!-- group box start -->";
    strVar += "				";
    strVar += "				<div class=\"group_list\">";
    strVar += "                        <div class=\"inner_menu_box\" id=\"js_group\">";
    strVar += "	                        <dl class=\"inner_menu\">";
    strVar += "					    	<\/dl>";
    strVar += "    					<\/div>";
    strVar += "                <\/div>";
    strVar += "			  	<!-- group box end -->";
    strVar += "			  ";
    strVar += "				<!-- main start -->";
    strVar += "				<div class=\"media-list clearfix\">";
    strVar += "					<div class=\"global_mod float_layout clearfix\">";
    strVar += "	                    ";
    strVar += "		                   <div class=\"global_extra\">";
    strVar += "<div class=\"img-search\" id=\"nav-search\">";
    strVar += "								<div class=\"form-search\">";
    strVar += "									<span class=\"input-icon\">";
    strVar += "										<input name='img_keyword' value=\"\" placeholder=\""+langData['waimai'][6][100]+"\" class=\"nav-search-input\" type=\"text\">";
    strVar += "										<i class=\"ace-icon fa fa-search nav-search-icon js-search-img\"><\/i>";
    strVar += "									<\/span>";
    strVar += "								<\/div>";
    strVar += "							<\/div>";
    strVar += "			                      <div class=\"upload_box align_right r\">";
    strVar += "			                      	<input type=\"file\" multiple=\"multiple\" name='file' accept=\"image/\" style=\"display: none;\">";
    strVar += "			                        ";
    strVar += "			                        <span class=\"upload_area \"><a id=\"js_upload\" class=\"upload-btn upload-btn_primary\" style>本地上传<\/a><\/span>";
    strVar += "			                      	";
    strVar += "			                      <\/div>";
    strVar += "			                      <div class=\"mini_tips weak_text icon_after img_water_tips r\">";
    strVar += "	                                    	"+langData['waimai'][6][174];
    strVar += "			                          <i id=\"js_water_tips\" class=\"glyphicon glyphicon-question-sign\"><\/i>";
    strVar += "			                      <\/div>";
    strVar += "		";
    strVar += "		                  <\/div>";
    strVar += "	            	<\/div>";
    strVar += "	                  ";
    strVar += "				<div class='clearfix'>";
    strVar += "		";
    strVar += "						";
    strVar += "						<div class='img_pick'>";
    strVar += "							";
    strVar += "						<\/div>";
    strVar += "				<\/div>";
    strVar += "				";
    strVar += "				<div class=\"pages_layout\" >";
    strVar += "				<\/div>";
    strVar += "				<\/div>";
    strVar += "				";
    strVar += "				<!-- main end -->";
    strVar += "				";
    strVar += "				<div class=\"dialog_ft\">";
    strVar += "				";
    strVar += "			        <span id=\"ensure\" class=\"upload-btn upload-btn_default oper_ele l js_popover\">"+langData['siteConfig'][6][1]+"<\/span>";
    strVar += "			        <span id=\"cancel\" class=\"upload-btn upload-btn_default oper_ele l js_popover\">"+langData['siteConfig'][6][12]+"<\/span>";
    strVar += "				";
    strVar += "				<\/div>";
    strVar += "		       ";
    strVar += "";
    strVar += "		   <\/div>";
    strVar += "				";
    strVar += "		<\/div>";
    
$('body').append(strVar);
