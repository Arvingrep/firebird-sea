//实例化编辑器
/*var ue = UE.getEditor('body');
var mue = UE.getEditor('mbody', {"term": "mobile"});*/
var aue = [];

function ueNews(index){
	var index = index == undefined ? '' : index;
	var ue = UE.getEditor('body'+index);
	var mue = UE.getEditor('mbody'+index, {"term": "mobile"});
	aue.push({ue: ue,mue: mue});
}

ueNews();


$(function () {

    //填充城市列表
    huoniao.buildAdminList($("#cityid"), cityList, '请选择分站', cityid);
    $(".chosen-select").chosen();

    huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	//开始、结束时间
	$("#began, #end, #baomingend").datetimepicker({format: 'yyyy-mm-dd hh:ii', autoclose: true, language: 'ch'});

	//平台切换
	$('.nav-tabs a').click(function (e) {
		e.preventDefault();
		var obj = $(this).attr("href").replace("#", "");
		if(!$(this).parent().hasClass("active")){
			$(".nav-tabs li").removeClass("active");
			$(this).parent().addClass("active");

			$(".nav-tabs").parent().find(">div").hide();
			cfg_term = obj;
			$("#"+obj).show();
		}
	});

	//自动获取关键词、描述
	$(".autoget").bind("click", function(){
		var t = $(this), type = t.data("type");
		var title = $('#title').val();
		var body = aue[0].ue.getContentTxt();
		if(body != ""){
			if(t.text() == "自动获取" || t.text() == "重新获取"){
				$.ajax({
					url: "/include/ajax.php?service=siteConfig&action=autoget",
					data: "type="+type+"&title="+title+"&body="+body,
					type: "POST",
					dataType: "json",
					success: function(data){
						if(data.state == 100){
							$("#"+type).val(data.info);
							t.html("重新获取");
						}else{
							t.html("获取失败，请稍后重试！");
							setTimeout(function(){
								t.html("重新获取");
							}, 2000);
						}
					}
				});
			}
		}else{
			$.dialog.alert("请先输入内容！");
		}
	});


	//表单验证
	$("#editform").delegate("input,textarea", "focus", function(){
		var tip = $(this).siblings(".input-tips");
		if(tip.html() != undefined){
			tip.removeClass().addClass("input-tips input-focus").attr("style", "display:inline-block");
		}
	});

	$("#editform").delegate("input[type='radio'], input[type='checkbox']", "click", function(){
		if($(this).attr("data-required") == "true"){
			var name = $(this).attr("name"), val = $("input[name='"+name+"']:checked").val();
			if(val == undefined){
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}
	});

	$("#editform").delegate("input,textarea", "blur", function(){
		var obj = $(this), tip = obj.siblings(".input-tips");
		if(obj.attr("data-required") == "true"){
			if($(this).val() == ""){
				tip.removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				tip.removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}else{
			huoniao.regex(obj);
		}
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

	$(".color_pick").colorPicker({
		callback: function(color) {
			var color = color.length === 7 ? color : '';
			$("#color").val(color);
			$(this).find("em").css({"background": color});
		}
	});

	//跳转表单交互
	$("input[name='flags[]']").bind("click", function(){
		if($(this).val() == "t"){
			if(!$(this).is(":checked")){
				$("#rDiv").hide();
			}else{
				$("#rDiv").show();
			}
		}
	});

	//删除文件
	$(".spic .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		init.delFile(input.val(), false, function(){
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});

	//头部导航切换
	$(".config-nav button").bind("click", function(){
		var index = $(this).index();
		if(!$(this).hasClass("active")){
			$(".item").hide();
			$(".item:eq("+index+")").fadeIn();
		}
	});

	//上传单张图片
	function mysub(id){
    var t = $("#"+id), p = t.parent(), img = t.parent().find(".img"), uploadHolder = t.siblings('.pic');

    var data = [];
    data['mod'] = 'vote';
    data['filetype'] = 'image';
    data['type'] = 'thumb';

    $.ajaxFileUpload({
      url: "/include/upload.inc.php",
      fileElementId: id,
      dataType: "json",
      data: data,
      success: function(m, l) {
        if (m.state == "SUCCESS") {
        	if(img.length > 0){
        		img.attr('src', m.turl);

        		delAtlasPic(p.find(".inp_pic").val());
        	}else{
        		p.children('.upimg').html('<a href="'+m.turl+'" target="_blank"><img src="'+m.turl+'" alt="" class="img" style="height:35px;min-width:50px;max-width:50px;"></a><em class="cancel" title="移除">×</em>');
        	}
        	p.find(".inp_pic").val(m.url);

        	uploadHolder.removeClass('disabled').text('图片');

        } else {
          uploadError(m.state, id, uploadHolder);
        }
      },
      error: function() {
        uploadError("网络错误，请重试！", id, uploadHolder);
      }
  	});

	}

	function uploadError(info, id, uploadHolder){
		$.dialog.alert(info);
		uploadHolder.removeClass('disabled').text('图片');
	}

	//删除已上传图片
	var delAtlasPic = function(picpath){
		var g = {
			mod: "vote",
			type: "delthumb",
			picpath: picpath,
			randoms: Math.random()
		};
		$.ajax({
			type: "POST",
			url: "/include/upload.inc.php",
			data: $.param(g)
		})
	};

	$("#postitem").delegate(".pic", "click", function(){
		var t = $(this), inp = t.siblings("input");
		if(t.hasClass("disabled")) return;
		inp.click();
	})

	$("#postitem").delegate(".Filedata", "change", function(){
		if ($(this).val() == '') return;
		$(this).siblings('.pic').addClass('disabled').text('········');

	    mysub($(this).attr("id"));
	})

	// 删除选项图片
	$("#postitem").delegate(".upimg .cancel", "click", function(){
		var t = $(this), p = t.closest('.btns'), inp = p.find(".inp_pic");
		delAtlasPic(inp.val());
		p.children('.upimg').html('');
		inp.val('');
	})
	// 选项删除
	$("#postitem").delegate(".singlelist .del", "click", function(){
		var t = $(this), p = t.closest('.z'), len = p.siblings().length;
		if(len <= 1){
			$.dialog.alert('至少保留两个选项');
			return;
		}else{
			p.find('.cancel').click();
			p.remove();
		}
	})
	// 新增选项
	$("#postitem").delegate(".add", "click", function(){
		var t = $(this), type = t.closest('dl').attr('data-type'), p = t.siblings('.singlelist'), len = getSinglelLength();
		var html = addCustomInput('singel');
		p.append(html);
	})

	var addCustomInput = function(type, where){
		var html = [];
		if(type == 'singel' || type == 'multi'){

			var getbody = function(){
				var body = [];
				body.push('				<div class="z">');
				body.push('					<label><input type="'+(type == 'singel' ? 'radio' : 'checkbox')+'" name="" disabled></label><input type="text" value="0" placeholder="请输入选项">');
				body.push('					<div class="btns">');
				body.push('						<span class="upimg"></span>');
				body.push('						<a href="javascript:;" class="pic" title="图片">图片</a>');
				body.push('    				<a href="javascript:;" class="up" title="上移">上移</a>');
				body.push('    				<a href="javascript:;" class="down" title="下移">下移</a>');
				body.push('    				<a href="javascript:;" class="del" title="删除">删除</a>');
				body.push('    				<input type="file" name="Filedata" value="" class="imglist-hidden Filedata" id="Filedata_'+getSinglelLength()+'">');
				body.push('    				<input type="hidden" name="pic" class="inp_pic" value="">');
				body.push('  				</div>');
				body.push('  			</div>');

				return body.join("");
			}

			if(where == 'full'){
				html.push('<dl class="clearfix" data-type="'+type+'">');
				html.push('	<dt><label for="">'+($(".property_box dl").length+1)+'：</label></dt>');
				html.push('	<dd class="radio">');
				html.push('		<div class="c">');
				html.push('			<div class="title">');
				html.push('				<input class="input-xlarge" type="text" name="" value="" placeholder="标题">');
				html.push('     	<a href="javascript:;" class="up" title="上移">上移</a>')
				html.push('     	<a href="javascript:;" class="down" title="下移">下移</a>')
				html.push('				<a href="javascript:;" class="del" title="删除">删除</a>');
				html.push('			</div>');
				html.push('			<div class="singlelist">');

				html.push(getbody());
				html.push(getbody());

				html.push('  		</div>');
				html.push('  		<a class="add" href="javascript:;" title="增加">+</a>');
				html.push('  	</div>');
				html.push('  </dd>');
				html.push('</dl>');

			}else{
				html.push(getbody());
			}
		}

		return html.join("");
	}

	// 上移
	$("#postitem").delegate(".up", "click", function(){
		var t = $(this), ptag = t.parent().hasClass('btns') ? '.z' : 'dl', p = t.closest(ptag), index = p.index();
		if(index == 0) return;
		var clone = p.clone();
		p.next().after(clone);
		p.remove();
	})
	// 下移
	$("#postitem").delegate(".down", "click", function(){
		console.log("down")
		var t = $(this), ptag = t.parent().hasClass('btns') ? '.z' : 'dl', p = t.closest(ptag), index = p.index();
		if(index == p.siblings().length) return;
		var clone = p.clone();
		p.next().after(clone);
		p.remove();
	})
	// 删除题目
	$("#postitem").delegate(".title .del", "click", function(){
		var t = $(this), p = t.closest('dl');
		p.find('.singlelist .z').each(function(){
			$(this).find('.cancel').click();
		})
		p.remove();
	})
	// 新增题目
	$(".property_type .tp").click(function(){
		var t = $(this), type = t.attr('data-type');
		var html = addCustomInput(type, 'full');
		$(".property_box").append(html);
	})

	// 取得当前表单选项总数，供上传选项图片使用
	function getSinglelLength(){
		return $('#postitem').find('.z').length;
	}

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
            cityid       = $("#cityid").val(),
			title        = $("#title"),
			litpic       = $("#litpic"),
			began        = $("#began"),
			end          = $("#end"),
			baomingend   = $("#baomingend"),
			weight       = $("#weight"),
			keywords     = $("#keywords"),
			description  = $("#description"),
			tj           = true;

        //城市
        if(cityid == '' || cityid == 0){
            $.dialog.alert('请选择城市');
            return false;
        };

		//标题
		if(!huoniao.regex(title)){
			tj = false;
			huoniao.goTop();
			return false;
		};

		//代表图片
		/*if(litpic.val() == ""){
			huoniao.goInput(litpic);
			$.dialog.alert("请上传活动代表图片！");
			tj = false;
			return false;
		}*/

		//活动开始时间
		if(began.val() == ""){
			$.dialog.alert("请输入活动开始时间！");
			return false;
		}

		//活动结束时间
		if(end.val() == ""){
			$.dialog.alert("请输入活动结束时间！");
			return false;
		}

		//关键词
		if(keywords.val() != ""){
			if(!huoniao.regex(keywords)){
				tj = false;
				huoniao.goTop();
				return false;
			};
		}

		//描述
		if(description.val() != ""){
			if(!huoniao.regex(description)){
				tj = false;
				huoniao.goTop();
				return false;
			};
		}

		//排序
		if(!huoniao.regex(weight)){
			tj = false;
			huoniao.goTop();
			return false;
		}

		// 验证表单
		var property = [], tj_ = true;
		if($(".property_box dl").length){
			$(".property_box dl").each(function(index){
				if(tj_){
					var t = $(this), type = t.attr('data-type'), title = $.trim(t.find('.text').val());
					if(title == ''){
						tj_ = false;
						errmsg(t.find('.text'), "请填写表单第"+(index+1)+"项！");
						return false;
					}
					var arr = [];
					if(type == 'multi' || type == 'single'){
						var zuList = t.find('.zu'), tj_1 = true;
						if(zuList.length > 0){
							zuList.each(function(i){
								if(tj_1){
									var t = $(this),
											xuan = $.trim(t.find('.xuan').val()),
											pic = t.find('.inp_pic').val();
									if(xuan == ''){
										tj_ = tj_1 = false;
										errmsg($(this).find('.xuan'), "请输入选项"+(i+1)+"的内容！");
										return false;
									}
									// arr.push('"'+xuan+'"');
									arr.push({"xuan":xuan,"pic":pic});
								}
							});
						}else{
							tj_ = false;
							errmsg(t.find('.text'), "请添加表单第"+(index+1)+"项的选项内容！");
							return false;
						}
					}

					property.push('{"type": "'+type+'", "required": "'+required+'", "title": "'+title+'", "val": ['+arr.join(',')+']}');
				}
			})
		}else{
			tj_ = false;
			$.dialog.alert('至少添加一个题目');
			return false;
		}



		if(tj && tj_){
			t.attr("disabled", true).html("提交中...");
			$.ajax({
				type: "POST",
				url: action+"Add.php?action="+action,
				data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
				dataType: "json",
				success: function(data){
					if(data.state == 100){
						if($("#dopost").val() == "save"){

							huoniao.parentTip("success", "信息发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
							huoniao.goTop();
							location.href = action+"Add.php";

						}else{

							huoniao.parentTip("success", "信息修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
							t.attr("disabled", false).html("确认提交");

						}
					}else{
						$.dialog.alert(data.info);
						t.attr("disabled", false).html("确认提交");
					};
				},
				error: function(msg){
					$.dialog.alert("网络错误，请刷新页面重试！");
					t.attr("disabled", false).html("确认提交");
				}
			});
		}
	});

});

Array.prototype.in_array = function(e){
	for(i=0;i<this.length && this[i]!=e;i++);
	return !(i==this.length);
}

//错误提示
var errmsgtime;
function errmsg(div, str){
	$('#errmsg').remove();
	clearTimeout(errmsgtime);
	var top = div.offset().top - 33;
	var left = div.offset().left;

	$('html, body').animate({scrollTop:top}, 300);

	var msgbox = '<div id="errmsg" style="position:absolute;top:' + top + 'px;left:' + left + 'px;height:30px;padding:0 10px;line-height:30px;text-align:center;color:#ff0;font-size:14px;display:none;z-index:99999;background:#f00;">' + str + '</div>';
	$('body').append(msgbox);
	$('#errmsg').fadeIn(300);
	errmsgtime = setTimeout(function(){
		$('#errmsg').fadeOut(300, function(){
			$('#errmsg').remove();
		});
	},3000);
};
