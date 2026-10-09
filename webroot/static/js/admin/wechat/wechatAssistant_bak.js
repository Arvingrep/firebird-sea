$(function () {
	
	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" ); 
		thisUPage = tmpUPage[ tmpUPage.length-1 ]; 
		thisPath  = thisURL.split(thisUPage)[0];
	
	var init = {
		//树形递归分类
		treeTypeList: function(type, l){
			var typeList = [], cl = "";
            typeList.push('<option value="">所有分类</option>');
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if(jsonArray['lower'] != "" && type == "type"){
						typeList.push('<option value="'+jsonArray["id"]+'">'+cl+jsonArray["typename"]+'</option>');
					}else{
						typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					}
					for(var k = 0; k < jArray.length; k++){
						cl += '    ';
						var selected = "";						
						if(jArray[k]['lower'] != ""){
							arguments.callee(jArray[k]);
						}else{
							typeList.push('<option value="'+jArray[k]["id"]+'"'+selected+'>'+cl+"|--"+jArray[k]["typename"]+'</option>');
						}
						if(jsonArray["lower"] == null){
							cl = "";
						}else{
							cl = cl.replace("    ", "");
						}
					}
				})(l[i]);
			}
			return typeList.join("");
		}

	};

    //城市分站
	huoniao.choseCity($(".choseCity"),$("#info_cityid"));
	
	//填充栏目分类
	$("#info_typeid").html(init.treeTypeList("type", infoTypeListArr));

	//信息数量类型
	$('.pageType').bind('click', function(){
		var type = $(this).data('type'), val = parseInt($(this).val());
		if(val == 2){
			$('.pageInfo_'+type).addClass('pagination_show');
		}else{
			$('.pageInfo_'+type).removeClass('pagination_show');
		}
	})

	//一键复制
	var clipboard = new ClipboardJS('#copyWechat', {
		target: function() {
			return document.querySelector('#wechatPreview')
		}
	})
	clipboard.on('success', function (e) {
		e.clearSelection()
		huoniao.showTip("success", "复制成功！", 'auto');
	})
	clipboard.on('error', function (e) {
		huoniao.showTip("error", "复制失败！");
		console.log(e)
	})
	
	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		$("#list").attr("data-atpage", 1);
		preview();
	});
	
});


//预览
function preview(){
	var data = [], module = $('.config-nav .active').attr('data-type');
	data = "module="+module+"&"+$('#editform').serialize();

	huoniao.showTip("loading", "正在生成，请稍候...");

	$.ajax({
		type: "POST",
		url: "?action=getData",
		data: data,
		dataType: "json",
		success: function(val){

			huoniao.hideTip();

			if(val.state != "200"){
				$('#list').attr("data-totalpage", val.pageInfo.totalPage);
				huoniao.showPageInfo();

				var temp = $('input[name="'+module+'[template]"]:checked').val();
				var template = $('#'+module+'Template_' + temp).html();

				var list = val.list, html = [];

				//分类信息模板三头部区域
				if(module == 'info' && temp == 3){
					var _header = `<section class="previewBox3">
						<section class="bgBox">&nbsp;</section>
						<section class="titleBox">
						<section class="h1">本地生活信息</section>
						<section class="h1 marginLeft">推荐TOP10</section>
						</section>
					</section>`;
					html.push(_header);
				}

				for(var i = 0; i < list.length; i++){
					
					//二维码
					var qrType = $('input[name="'+module+'[qr]"]:checked').val();
					var qr = list[i].qr.h5;
					if(qrType == 2){
						qr = list[i].qr.wechat;
					}else if(qrType == 3){
						qr = list[i].qr.wxmini;
					}

					//分类信息
					if(module == 'info'){

						//头像
						var photo = list[i].member ? list[i].member.photo : cfg_basehost + '/static/images/noPhoto_60.jpg';

						var pics = [];
						if(list[i].picArr.length > 0){
							pics.push('<section class="house-images">');
							pics.push('<img src="'+list[i].picArr[0].litpic+'" onerror="this.src=\''+cfg_basehost+'/static/images/404.jpg\'" alt="" class="img1">');
							if(list[i].picArr.length > 2){
								pics.push('<section class="right-img">');
								pics.push('<img src="'+list[i].picArr[1].litpic+'" onerror="this.src=\''+cfg_basehost+'/static/images/404.jpg\'" alt="" class="img-item">');
								pics.push('<img src="'+list[i].picArr[2].litpic+'" onerror="this.src=\''+cfg_basehost+'/static/images/404.jpg\'" alt="" class="img-item">');
								pics.push('</section>');
							}
							pics.push('</section>');
						}

						var _html = template.replace(/\{\$typename\}/g, list[i].typename)
										.replace(/\{\$desc\}/g, list[i].desc)
										.replace(/\{\$photo}/g, photo)
										.replace(/\{\$nickname\}/g, list[i].member ? list[i].member.nickname : '匿名')
										.replace(/\{\$address\}/g, list[i].address[list[i].address.length-2] + ' ' + list[i].address[list[i].address.length-1])
										.replace(/\{\$pics\}/g, pics.join(''))
										.replace(/\{\$click\}/g, list[i].click)
										.replace(/\{\$qr\}/g, qr)
										.replace(/\{\$i\}/g, i+1);

					}
					html.push(_html);
				}

				$('#wechatPreview').html('<section class="wechat_template"><section class="wechat_template"><section class="wechat_template_placeholder"></section><section class="'+module+'Template_'+temp+'"></section><section class="'+module+'Template_'+temp+'">'+html.join('')+'</section></section></section>');


			}else{
				$('#wechatPreview').html('<div class="wechat_empty">请先点击左边的【生成模板】按钮</div>');
				huoniao.showTip("warning", val.info, "auto");
			}
			
		},
		error: function(msg){
			huoniao.hideTip();
			$.dialog.alert("网络错误，生成失败 ！");
		}
	});
};

//分页加载
function getList(){
	var module = $('.config-nav .active').attr('data-type');
	$('#'+module+'_page').val($("#list").attr("data-atpage"));
	preview();
}