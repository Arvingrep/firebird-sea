var uploadCustom = {
	//旋转图集文件
	rotateAtlasPic: function(mod, direction, img, c) {
		var g = {
			mod: mod,
			type: "rotateAtlas",
			direction: direction,
			picpath: img,
			randoms: Math.random()
		};
		$.ajax({
			type: "POST",
			cache: false,
			async: false,
			url: "/include/upload.inc.php",
			dataType: "json",
			data: $.param(g),
			success: function(a) {
				try {
					c(a)
				} catch(b) {}
			}
		});
	}
}

$(function(){

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//树形递归分类
		treeTypeList: function(type){
			var typeList = [], cl = "";
			var l = type == "addr" ? addrListArr : industryListArr;
			var s = type == "addr" ? addrid : industry;
			typeList.push('<option value="0">请选择</option>');
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if(s == jsonArray["id"]){
						selected = " selected";
					}
					typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					if(jArray != undefined){
						for(var k = 0; k < jArray.length; k++){
							cl += '    ';
							var selected = "";
							if(s == jArray[k]["id"]){
								selected = " selected";
							}
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
					}
				})(l[i]);
			}
			return typeList.join("");
		}

		//区域树形递归分类
		,treeTypeList_: function(){
			var typeList = [], cl = "";
			var l = addrListArr;
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower;
					typeList.push('<a href="javascript:;" data="'+jsonArray["id"]+'">'+cl+"|--"+jsonArray["typename"]+'</a>');
					if(jArray != undefined){
						for(var k = 0; k < jArray.length; k++){
							cl += '    ';
							if(jArray[k]['lower'] != ""){
								arguments.callee(jArray[k]);
							}else{
								typeList.push('<a href="javascript:;" data="'+jArray[k]["id"]+'">'+cl+"|--"+jArray[k]["typename"]+'</a>');
							}
							if(jsonArray["lower"] == null){
								cl = "";
							}else{
								cl = cl.replace("    ", "");
							}
						}
					}
				})(l[i]);
			}
			return typeList.join("");
		}

		//重新上传时删除已上传的文件
		,delFile: function(b, d, c) {
			var g = {
				mod: "renovation",
				type: "delCard",
				picpath: b,
				randoms: Math.random()
			};
			$.ajax({
				type: "POST",
				cache: false,
				async: d,
				url: "/include/upload.inc.php",
				dataType: "json",
				data: $.param(g),
				success: function(a) {
					try {
						c(a)
					} catch(b) {}
				}
			})
		}
	};

	//填充区域
	$("#addrid").html(init.treeTypeList("addr"));

	//类别切换
	$("input[name=type]").bind("click", function(){
		var val = $(this).val(), obj = $(".jiastyle"), obj1 = $(".comstyle");
		if(val == 0){
			obj.show();
			obj1.hide();
		}else if(val == 1){
			obj.hide();
			obj1.show();
		}
	});

	//域名过期时间
	$("#began").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});



	//表单验证
	$("#editform").delegate("input,textarea", "focus", function(){
		var tip = $(this).siblings(".input-tips");
		if(tip.html() != undefined){
			tip.removeClass().addClass("input-tips input-focus").attr("style", "display:inline-block");
		}
	});

	$("#editform").delegate("input,textarea", "blur", function(){
		var obj = $(this);
		huoniao.regex(obj);
	});

	$("#editform").delegate("select", "change", function(){
		if($(this).parent().siblings(".input-tips").html() != undefined){
			if($(this).val() == 0){
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}
	});

	// //模糊匹配会员
	// $("#designername").bind("input", function(){
	// 	$("#designer").val("0");
	// 	var t = $(this), val = t.val();
	// 	if(val != ""){
	// 		t.addClass("input-loading");
	// 		huoniao.operaJson("../inc/json.php?action=checkDesigner", "key="+val, function(data){
	// 			t.removeClass("input-loading");
	// 			if(!data) {
	// 				$("#designerList").html("").hide();
	// 				return false;
	// 			}
	// 			var list = [];
	// 			for(var i = 0; i < data.length; i++){
	// 				list.push('<li data-id="'+data[i].id+'" data-name="'+data[i].name+'">'+data[i].name+"--"+data[i].company+'</li>');
	// 			}
	// 			if(list.length > 0){
	// 				var pos = t.position();
	// 				$("#designerList")
	// 					.css({"left": pos.left, "top": pos.top + 36})
	// 					.html('<ul>'+list.join("")+'</ul>')
	// 					.show();
	// 			}else{
	// 				$("#designerList").html("").hide();
	// 			}
	// 		});

	// 	}else{
	// 		$("#designerList").html("").hide();
	// 	}
 //    });

	// $("#designerList").delegate("li", "click", function(){
	// 	var name = $(this).text(), id = $(this).attr("data-id"), name = $(this).attr("data-name");
	// 	$("#designername").val(name);
	// 	$("#designer").val(id);
	// 	$("#designerList").html("").hide();
	// 	checkGw($("#designername"), name, $("#id").val());
	// 	return false;
	// });

	// $(document).click(function (e) {
 //        var s = e.target;
 //        if (!jQuery.contains($("#designerList").get(0), s)) {
 //            if (jQuery.inArray(s.id, "designername") < 0) {
 //                $("#designerList").hide();
 //            }
 //        }
 //    });

	//选择小区
	$(".chooseCommunity").bind("click", function(){

		var content = [], type = "Brand";

		//选地区
		content.push('<div class="selectCarBrand-item" id="selectAddr" style="margin-left:30px;"><h2>选择地区：</h2><div class="selectCarBrand-container clearfix">');
		content.push('<div class="pinp_main"><div class="pinp_main_zm">'+init.treeTypeList_()+'</div></div>');
		content.push('</div></div>');

		//选小区
		content.push('<div class="selectCarBrand-item" id="selectOffer" style="width:230px; margin-left:30px;"><h2>选择小区：</h2><div class="selectCarBrand-container clearfix">');
		content.push('<div class="pinp_main" style="height:300px;"><div class="pinp_main_zm"><center style="line-height:290px;">没有相关小区！</center></div></div>');
		content.push('</div>');
		// content.push('<div style="margin-top:8px;"><input type="text" id="communityInput" style="width:216px;" placeholder="没有找到？直接输入小区名" /></div>');
		content.push('</div>');

		$.dialog({
			id: "selectCommunity",
			fixed: false,
			title: "选择小区",
			content: '<div class="selectCarBrand clearfix">'+content.join("")+'</div>',
			width: 600,
			okVal: "确定",
			ok: function(){

				//确定选择结果
				var obj = parent.$("#selectOffer .cur"),
					id = obj.attr("data-id"),
					text = obj.attr("data-title"),
					value = parent.$("#communityInput").val();
				if((id != undefined && text != undefined) || value != ""){
					if(id != undefined && text != undefined){
						$("#communityid").val(id);
						$("#community").val(text);
						$("#communityName")
							.html('<span class="checked">'+text+'<a href="javascript:;">×</a></span>');
						}else{
							$("#communityid").val(0);
							$("#community").val(value);
							$("#communityName")
								.html('<span class="checked">'+value+'<a href="javascript:;">×</a></span>');
						}

				}else{
					alert("请选择或直接输入小区名！");
					return false;
				}

			},
			cancelVal: "关闭",
			cancel: true
		});

		//选择地区
		parent.$("#selectAddr a").bind("click", function(){
			parent.$("#selectAddr a").removeClass("cur");
        	$(this).addClass("cur");
        	getCommunity();
		});

		//获取小区
		function getCommunity(){
			var addr = parent.$("#selectAddr .cur").attr("data");

			addr = addr != undefined ? addr : 0;

			parent.$("#selectOffer .pinp_main_zm").html('<center style="line-height:290px;">搜索中...</center>');
			huoniao.operaJson("renovationCommunity.php", "dopost=getList&sAddr="+addr+"&pagestep=9999", function(data){
				if(data && data.state == 100){
					var dealer = [], list = data.renovationCommunity;
					for (var i = 0; i < list.length; i++) {
						dealer.push('<a href="javascript:;" data-id="'+list[i].id+'" data-title="'+list[i].title+'" title="'+list[i].title+'"> '+(i+1)+'. '+list[i].title+'</a>');
					};
					parent.$("#selectOffer .pinp_main_zm").html(dealer.join(""));
				}else{
					parent.$("#selectOffer .pinp_main_zm").html('<center style="line-height:290px;">没有相关小区！</center>');
				}
			});
		}

		//选择小区
		parent.$("#selectOffer").delegate("a", "click", function(){
			parent.$("#selectOffer a").removeClass("cur");
        	$(this).addClass("cur");
		});


	});

	// 添加阶段
	$('.addNew').click(function(){
		var html = addCustomInput();
		var $html = $(html);
		obj.append($html);
		filepickerEach();//继续添加下阶段时 上传图片需要重新each
		wxUpFileEach();//继续添加下阶段时 上传图片需要重新each
	})
	// 编辑状态获取问题html或者选项html
	var addCustomInput = function(st){

		var html = [],html2=[];
		var count = obj.children('.item').length+1;
		html.push('<section class="sectionStage item editing">');
		html.push('  <div class="result"  data-id="">');
		html.push('    <div class="title"><span class="px">'+count+'</span>.<span class="tit"></span></div>');
		html.push('    <div class="descrip"></div>');
		html.push('    <div class="img_wrap fn-clear" data-img=""></div>');
		html.push('  </div>');
		html.push('  <div class="edit">');
		html.push('  <dl class="fn-clear" data-required="1">');
		html.push('  <dt><span>*</span>'+langData['renovation'][9][43]+'：</dt>');//选择阶段
		html.push('  <dd>');
		html.push('  <select class="inp stageChose">');
		$.ajax({
			type: "POST",
			url: "/include/ajax.php?service=renovation&action=type&type=9",
			dataType: "json",
			async:false,
			success: function(res){
				if(res.state==100 && res.info){
					var list = res.info;
					html2.push('<option value="">'+langData['siteConfig'][7][2]+'</option>');
					for(var j = 0;j<list.length;j++){

						html2.push('<option value="'+list[j].id+'">'+list[j].typename+'</option>');


					}
				}
			},
		})
		html.push(html2)
		html.push('	</select>');
		html.push('	</dd>');
		html.push(' </dl>');
		html.push(' <dl class="fn-clear" data-required="1">');
		html.push(' <dt><span>*</span>'+langData['renovation'][9][44]+'：</dt>');//阶段描述
		html.push(' <dd>');
		html.push(' <textarea class="note"></textarea>');
		html.push(' </dd>');
		html.push(' </dl>');
		html.push(' <dl class="fn-clear">');
		html.push(' <dt><span>*</span>	'+langData['siteConfig'][19][2]+'：</dt>');//图集
		html.push(' <dd class="listImgBox fn-hide">');
		html.push(' <div class="list-holder">');
		html.push(' <ul id="listSection'+count+'" class="fn-clear listSection fn-hide">');
		html.push(' </ul>');
		html.push(' <input type="hidden" name="imglist" value="" class="imglist-hidden">');
		html.push(' </div>');
		html.push(' <div class="btn-section fn-clear">');
		html.push(' 	<div class="wxUploadObj fn-clear">');
		html.push(' 		<div class="uploadinp filePicker" id="filePicker'+count+'" data-type="album" data-count="20" data-size="'+atlasSize+'" data-imglist=""><div id="flasHolder'+count+'"></div><span>'+langData['siteConfig'][6][168]+'</span></div>');//添加图片

		html.push(' <span class="upload-split fn-hide">'+langData['siteConfig'][13][0]+'</span>');//或
		html.push(' <dl class="wxUpload fn-hide fn-clear">');
		html.push(' <dt><img id="wxUploadImg'+count+'"  class="wxUploadImg"/></dt>');

		//使用 -- 微信 -- 扫描左侧二维码 -- 关注 -- 公众号后 -- 将图片 -- 发送 -- 给公众号即可传图
		// html.push(' <dd>'+langData['siteConfig'][19][362]+'<em class="wx">'+langData['siteConfig'][27][139]+'</em>'+langData['siteConfig'][27][140]+'<br />'+langData['siteConfig'][19][846]+''+wxName+''+langData['siteConfig'][27][141]+'<br />'+langData['siteConfig'][27][142]+'<em class="fs">'+langData['siteConfig'][6][139]+'</em>'+langData['siteConfig'][27][143]+'</dd>');
		html.push(' </dl>');
		html.push(' </div>');
		html.push('<div class="upload-tip">');
		html.push('<p>');
		html.push('<a href="javascript:;" class="fn-hide deleteAllAtlas">'+langData['siteConfig'][6][79]+'</a>');
		html.push('&nbsp;&nbsp;'+langData['siteConfig'][54][19].replace(' 1 ','2').replace(' 2 ',20)+' <span class="fileerror"></span></p>');//单张最大 1 M，最多 2 张
		html.push('</div>');
		html.push('</div>');
		html.push('</dd>');
		html.push('</dl>');
		html.push('<div class="finishEdit">'+langData['siteConfig'][31][79]+'</div>');//完成编辑
		html.push('    </div>');
		html.push('    <div class="g-btns-right g-btns">');
		html.push('      <a href="javascript:;" class="edit secEdit"><i class="icon icon_edit"></i>'+langData['siteConfig'][6][6]+'</a>');   //编辑
		html.push('      <a href="javascript:;" class="down"><i class="icon icon_down2"></i>'+langData['siteConfig'][6][159]+'</a>');  //下移
		html.push('      <a href="javascript:;" class="up"><i class="icon icon_up2"></i>'+langData['siteConfig'][6][158]+'</a>');  //上移
		html.push('      <a href="javascript:;" class="gotop"><i class="icon icon_top"></i>'+langData['siteConfig'][31][87]+'</a>');  //最前
		html.push('      <a href="javascript:;" class="gobottom"><i class="icon icon_bottom"></i>'+langData['siteConfig'][31][88]+'</a>');  //最后
		html.push('      <a href="javascript:;" class="del"><i class="icon icon_del1"></i>'+langData['siteConfig'][6][8]+'</a>');  //删除
		html.push('    </div>');
		html.push('  </section>');

		return html.join("");

	}

	var obj = $(".stage-wrap");
	// 上移下移
	obj.delegate(".g-btns .up, .g-btns .down, .g-btns .gotop, .g-btns .gobottom", "click", function(){
		var t = $(this), item = t.closest('.item');
		if(t.hasClass('up')){
			if(!item.prev().length) return;
			item.prev().before(item);
		}else if(t.hasClass('down')){
			if(!item.next().length) return;
			item.next().after(item);
		}else if(t.hasClass('gotop')){
			obj.prepend(item);
		}else if(t.hasClass('gobottom')){
			obj.append(item);
		}
		checkQuesNum();
	})
	// 删除
	obj.delegate(".g-btns .del", "click", function(){
		var item = $(this).closest('.item');
		delPic(item);
		checkQuesNum();
	})
	// 修改问题编号
	function checkQuesNum(){
		obj.children('.item').each(function(i){
			$(this).find('.px').text((i+1));
		})
	}
	// 删除
	function delPic(obj){
		obj.hide();
		var $imgitem = obj.find('.pubitem');
		$imgitem.each(function(){
			var img = $(this).find('img').attr('data-val');
			if(img != ''){
				delAtlasPic(img)
			}
		})
		obj.remove();
	}
	//删除已上传图片
	var delAtlasPic = function(picpath){
		var g = {
			mod: "renovation",
			type: "delthumb",
			picpath: picpath,
			randoms: Math.random()
		};
		console.log(g)
		$.ajax({
			type: "POST",
			url: "/include/upload.inc.php",
			data: $.param(g)
		})
	};
	// 进入编辑状态
	obj.delegate(".secEdit", "click", function(){
		var t = $(this), p = t.closest('.item');
		if(p.hasClass('editing')) return;
		p.addClass('editing').removeClass('normal');
	})
	// 退出编辑状态
	obj.delegate(".finishEdit", "click", function(){
		var t = $(this), p = t.closest('.item');
		p.find('input.error').removeClass('error');

		var config = getQuestConfg(p);

		if(config){

			// 阶段
			p.find('.result .tit').text(config.stageName);
			p.find('.result').attr('data-id',config.stage);
			//描述
			p.find('.result .descrip').text(config.description);

			// 选项
			var imgHtml = [], len = config.imgList.length,imgvalList=[];
			for(var i = 0; i < len; i++){
				var d = config.imgList[i];
				imgvalList.push(d.dataVal)
				imgHtml.push('  <div class="pic">');
				imgHtml.push('    <img src="'+d.dataSrc+'" alt="" data-val="'+d.dataVal+'" data-url="'+d.dataUrl+'">');
				imgHtml.push('  </div>');
			}
			p.find('.img_wrap').attr('data-img',imgvalList.join('||'));
			p.find('.img_wrap').html(imgHtml.join(""));

			// 没有任何修改的情况下，body部分会有抖动？
			setTimeout(function(){
				p.removeClass('editing').addClass('normal');
			}, 200)
		}
	})
	// 判断阶段表单
	function getQuestConfg(item){
		var config = {}, imgList = [];
		var tit    = item.find('.edit .stageChose'),
			descrip = item.find('.note'),
			imgItem  = item.find('.pubitem');
		var stageName =  tit.find('option:selected').text();
		var stage = tit.val();

		if(!stage){
			showError(tit, langData['renovation'][14][63]);//请选择阶段
			return false;
		}

		var stList = []
		$('.item.normal .result').each(function(){
			var tid = $(this).attr('data-id');
			stList.push(tid)
		})
		if(stList.indexOf(stage) >-1){
			showError(tit, langData['renovation'][15][53]);//请选择不同的阶段
			return false;
		}

		var description = $.trim(descrip.val());
		if(!description){
			showError(descrip, langData['renovation'][14][64]);//请输入阶段描述
			return false;
		}
		if(imgItem.length == 0){
			$.dialog.alert(langData['renovation'][15][52]);//请上传阶段图集
			return false;
		}else{
			// 图集
			imgItem.find('img').each(function(){
				var t = $(this),
					imgval = t.attr('data-val'),
					imgsrc = t.attr('src'),
					imgurl = t.attr('data-url');
				imgList.push({"dataVal":imgval, "dataSrc" : imgsrc, "dataUrl" : imgurl});
			})
		}

		config = {
			stageName: stageName,
			stage: stage,
			description: description,
			imgList: imgList
		}

		return config;

	}
	// 错误提示
	function showError(t, info){
		t.addClass('error').focus();
		$.dialog.alert(info);
	}

	//删除已选择的效果图
	$(".selectedTags").delegate("span a", "click", function(){
		var pp = $(this).parent(), input = pp.parent().nextAll("input");
		pp.remove();
		input.val("");
	});

	//搜索回车提交
    $("#editform input").keyup(function (e) {
        if (!e) {
            var e = window.event;
        }
        if (e.keyCode) {
            code = e.keyCode;
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            $("#btnSubmit").click();
        }
    });

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		$('#addrid').val($('.addrBtn').attr('data-id'));
        var addrids = $('.addrBtn').attr('data-ids').split(' ');
		var t            = $(this),
			id           = $("#id").val(),
			title        = $("#title"),
			designername = $("#designername").val(),
			designer     = $("#designer").val();

		if(!huoniao.regex(title)){
			huoniao.goInput(title);
			return false;
		};
		//获取施工详情列表
		var stagelist = [],stage_len = $('.stage-wrap .normal').length;
		if(stage_len == 0){
			$.dialog.alert(langData['renovation'][15][54]);//请至少添加一个阶段
			offsetTop = $("#selTeam").position().top;
		}else{
			$('.stage-wrap').find('.normal').each(function(){
				var d = $(this), stage_name = d.find('.tit').text(),
					stage_id = d.find('.result').attr('data-id'),
					note = d.find('.descrip').html(),
					imgL = d.find('.img_wrap').attr('data-img');
				stagelist.push({
					"stageName":stage_name,
					"stage":stage_id,
					"description":note,
					"imgList":imgL
				})
			});
		}

		//异步提交
		huoniao.operaJson("renovationConstructionAdd.php", $("#editform").serialize() + "&stagelist="+JSON.stringify(stagelist)+"&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){

					huoniao.parentTip("success", "发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					huoniao.goTop();
					window.location.reload();

				}else{

					huoniao.parentTip("success", "修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					t.attr("disabled", false);

				}
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});
	});

});

//上传成功接收
function uploadSuccess(obj, file){
	$("#"+obj).val(file);
	$("#"+obj).siblings(".spic").find(".sholder").html('<img src="'+cfg_attachment+file+'" />');
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}
