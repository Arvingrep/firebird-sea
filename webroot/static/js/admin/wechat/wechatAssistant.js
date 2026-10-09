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
    if($("#info_cityid").size() > 0){
	    huoniao.choseCity($(".choseCity"),$("#info_cityid"));
    }
	
	//填充栏目分类
	$("#info_typeid").html(init.treeTypeList("type", infoTypeListArr));
	$("#shop_typeid").html(init.treeTypeList("type", shopTypeListArr));
	$("#job_typeid").html(init.treeTypeList("type", jobTypeListArr));

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


	// 按钮切换
	$(".config-nav button.btn").click(function(){
		var t = $(this);
		$(".item").eq(t.index()).removeClass('fn-hide').siblings('.item').addClass('fn-hide');
		var type = $(".item").eq(t.index()).attr('data-type');
		$(".pagination ").removeAttr('id')
		$(".pageInfo_"+type).attr('id','pageInfo')
	})
	
});


//预览
function preview(){
	var data = [], module = $('.config-nav .active').attr('data-type');
	if(module != 'info'){
		$("#"+module+'_cityid').val($("#info_cityid").val())
	}
	data = "module="+module+"&"+$('#editform').serialize();

	huoniao.showTip("loading", "正在生成，请稍候...");

	$.ajax({
		type: "POST",
		url: "?action=getData",
		data: data,
		dataType: "json",
		success: function(val){
			console.log(val)
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
					};

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
										.replace(/\{\$address\}/g, (list[i].address.length > 1 ? list[i].address[list[i].address.length-2] + ' ' : '') + list[i].address[list[i].address.length-1])
										.replace(/\{\$pics\}/g, pics.join(''))
										.replace(/\{\$click\}/g, list[i].click)
										.replace(/\{\$qr\}/g, qr)
										.replace(/\{\$i\}/g, i+1);

					};
					if(module == 'shop'){

						var pics = [];
						if(list[i].imgGroup.length > 0){
							// pics.push('<section class="house-images">');
							// pics.push('<img src="'+list[i].picArr[0].litpic+'" onerror="this.src=\''+cfg_basehost+'/static/images/404.jpg\'" alt="" class="img1">');
							// if(list[i].picArr.length > 2){
							// 	pics.push('<section class="right-img">');
							// 	pics.push('<img src="'+list[i].picArr[1].litpic+'" onerror="this.src=\''+cfg_basehost+'/static/images/404.jpg\'" alt="" class="img-item">');
							// 	pics.push('<img src="'+list[i].picArr[2].litpic+'" onerror="this.src=\''+cfg_basehost+'/static/images/404.jpg\'" alt="" class="img-item">');
							// 	pics.push('</section>');
							// }
							pics.push('<section class="pic"><img src="'+list[i].imgGroup[0]+'" alt="" onerror="this.src=\''+cfg_basehost+'/static/images/404.jpg\'"></section>');
							if(list[i].imgGroup.length > 1){
								pics.push('<section class="pic"><img src="'+list[i].imgGroup[1]+'" alt="" onerror="this.src=\''+cfg_basehost+'/static/images/404.jpg\'"></section>');

							}
						}
						var quan = []
						if(list[i].quanhave || list[i].quanlist.length > 0){
							if(list[i].quanlist[0].promotiotype == '0'){
								quan.push('<span class="quan">'+parseFloat(list[i].quanlist[0].promotio)+'元优惠券</span>')
							}else{
								quan.push('<span class="quan">'+parseFloat(list[i].quanlist[0].promotio)+'折优惠券</span>')
							}
						}
						var _html = template.replace(/\{\$litpic\}/g, list[i].litpic)
										.replace(/\{\$quan\}/g, quan.join(''))
										.replace(/\{\$storeLogo\}/g, huoniao.changeFileSize(list[i].storeLogo,18,18))
										.replace(/\{\$storeTitle\}/g, list[i].storeTitle)
										.replace(/\{\$shopname\}/g, list[i].storeTitle)
										.replace(/\{\$price\}/g, parseFloat(list[i].price))
										.replace(/\{\$title\}/g, list[i].title)
										.replace(/\{\$mprice\}/g, list[i].price < list[i].mprice ? '<s>￥'+parseFloat(list[i].mprice)+'</s>' : '' )
										.replace(/\{\$mprice1\}/g, parseFloat(list[i].mprice) )
										.replace(/\{\$pics\}/g, pics.join(''))
										.replace(/\{\$click\}/g, list[i].collectnum)
										.replace(/\{\$qr\}/g, qr)
										.replace(/\{\$i\}/g, i+1);
						

					};
					if(module == 'job'){
						var _html = template.replace(/\{\$title\}/g, list[i].title)
											.replace(/\{\$ctitle\}/g, list[i].ctitle)
											.replace(/\{\$number\}/g, list[i].number)
											.replace(/\{\$welfare\}/g, list[i].welfare.join('/'))
											.replace(/\{\$note\}/g, list[i].note)
											.replace(/\{\$educational_name\}/g, list[i].educational_name ? list[i].educational_name : '不限学历')
											.replace(/\{\$experience_name\}/g, list[i].experience_name ? list[i].experience_name : '不限')
											.replace(/\{\$max_salary\}/g, list[i].max_salary)
											.replace(/\{\$min_salary\}/g, list[i].min_salary)
											.replace(/\{\$show_salary\}/g, list[i].show_salary)
											.replace(/\{\$salary_unit\}/g, list[i].show_salary != '面议' ? '/月' : '')
											.replace(/\{\$dy_salary\}/g, list[i].dy_salary && list[i].dy_salary != '12' ? '('+list[i].dy_salary+'薪)' : '')
											.replace(/\{\$qr\}/g, qr)
						if(list[i].addressDetail){
							let arr=list[i].addressDetail.addrName.slice(-2);
							_html=_html.replace(/\{\$addressDetail\}/g, arr.join('')+',');
						}else{
							_html=_html.replace(/\{\$addressDetail\}/g, '');
						};
					};
					html.push(_html);
				};
				if(module=='job'){
					switch (temp){
						case '1':{
							let end=`<section class="j-end">
							<span>— — xxxx招聘 — —</span>
							<p>专业招聘求职平台</p>
							</section>`;
							html=`<section class="items">${html.join('')}</section>${end}`;
							break;
						}
						case '2':{
							let img=`<img src="${cfg_basehost}/static/images/admin/wechat/job/joinus.png" class="j-topimg">`;
							let end=`<section class="j-end">
							<span>— — xxxx招聘 — —</span>
							<p>专业招聘求职平台</p>
							</section>`;
							html=`${img}<section class="items">${html.join('')}</section>${end}`;
							break;
						}
						case '3':{
							let img=` <img src="${cfg_basehost}/static/images/admin/wechat/job/templet3_top.png" class="j-exhibiton">`;
							let str=`            
							<section class="j-text">
								<section class="jt-title">高薪急聘,寻找发光的你<s></s></section>
								<section class="jt-text">
									<p><span>xxx方向</span>专场招聘</p>
									<p><span>20+实力企业</span>诚邀您投递</p>
									<p><span>在线沟通</span>offer直收</p>
									<p>这里是您的文案</p>
								</section>
								<section class="jt-divide">热招岗位</section>
								<img src="${cfg_basehost}/static/images/admin/wechat/job/down_angle_black.png">
							</section>`;
							let end=`<section class="j-end">
							<span>— — xxxx招聘 — —</span>
							<p>专业招聘求职平台</p>
							</section>`;
							html=`${img}${str}<section class="j-items">${html.join('')}<section class="jc-end">-THE END-</section></section>${end}`
							break;
						}
						default:break
					}
				}
				$('#wechatPreview').html('<section class="wechat_template"><section class="wechat_template"><section class="wechat_template_placeholder"></section></section><section class="'+module+'Template_'+temp+'">'+`${module=='job'?html:html.join('')}`+'</section></section></section>');


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