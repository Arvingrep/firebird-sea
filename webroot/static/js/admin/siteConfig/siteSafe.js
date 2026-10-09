$(function(){
	//头部导航切换
	$(".config-nav button").bind("click", function(){
		var index = $(this).index(), type = $(this).attr("data-type");
		if(!$(this).hasClass("active")){
			$(".item").hide();
			$("input[name=configType]").val(type);
			$(".item:eq("+index+")").fadeIn();
		}
	});

	//注册类型
	registerOper();
	function registerOper(){
		$('#registerType input').each(function(){
			var t = $(this), val = t.val();

			//用户名注册
			if(t.is(":checked")){
				if(val == 1){
					t.parent().siblings('label').find('input').prop('checked', false);
					$('#registerByUsername').show();
				}else{
					$('#registerType dd label:eq(2) input').prop('checked', false);
					$('#registerByUsername').hide();
				}
			}

		})
	}

	$('#registerType input').bind('click', function(){
		var t = $(this), val = t.val();

		if(val == 1){
			t.parent().siblings('label').find('input').prop('checked', false);
			$('#registerByUsername').show();
		}else{
			$('#registerType dd label:eq(2) input').prop('checked', false);
			$('#registerByUsername').hide();
		}

		registerOper();
	});

	//开启、关闭交互
	$("input[name=geetest]").bind("click", function(){
		var t = $(this);
		if(t.val() == 0){
			$("#geetest1").hide();
			$("#geetest2").hide();
		}else if(t.val() == 1){
			$("#geetest1").show();
			$("#geetest2").hide();
		}else if(t.val() == 2){
			$("#geetest1").hide();
			$("#geetest2").show();
		}
	});

	//开启、关闭交互
	$("input[name=moderationPlatform]").bind("click", function(){
		var t = $(this);
		if(t.val() == ''){
			$("#moderation_aliyun").hide();
			$("#moderation_huawei").hide();
		}else if(t.val() == 'aliyun'){
			$("#moderation_aliyun").show();
			$("#moderation_huawei").hide();
		}else if(t.val() == 'huawei'){
			$("#moderation_aliyun").hide();
			$("#moderation_huawei").show();
		}
	});

	//消息通知配置
	$("#siteNotify").bind("click", function(event){
		var href  = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("siteNotifyphp", "siteConfig", "消息通知配置", "siteConfig/"+href);
		} catch(e) {}
	});

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

	//开启、关闭交互
	$("input[name=regstatus]").bind("click", function(){
		var t = $(this), parent = t.parent().parent().parent();
		if(t.val() == 0){
			$("#reg0").hide();
			$("#reg1").show();
		}else{
			$("#reg0").show();
			$("#reg1").hide();
		}
	});

	//支付成功跳转页面
	$("input[name=payReturnType]").bind("click", function(){
		var t = $(this);
		if(t.val() == 0){
			$(".payReturnType1").hide();
		}else{
			$(".payReturnType1").show();
		}
	});

	//拼接现有问题
	if(safeqa.length > 0){
		var html = [];
		for(var i = 0; i < safeqa.length; i++){
			html.push('<li class="clearfix">');
			html.push('  <span class="row60"><input type="text" name="question[]" class="row90" value="'+safeqa[i].question+'" /></span>');
			html.push('  <span class="row30"><input type="text" name="answer[]" class="row90" value="'+safeqa[i].answer+'" /></span>');
			html.push('  <span class="row10 center"><a href="javascript:;" title="删除" class="del">删除</a></span>');
			html.push('</li>');
		}
		$("#qaList").append(html.join(""));
	}

	//新增安全问题
	$("#addNew").bind("click", function(){
		var html = [];
		html.push('<li class="clearfix">');
		html.push('  <span class="row60"><input type="text" name="question[]" class="row90" /></span>');
		html.push('  <span class="row30"><input type="text" name="answer[]" class="row90" /></span>');
		html.push('  <span class="row10 center"><a href="javascript:;" title="删除" class="del">删除</a></span>');
		html.push('</li>');
		$("#qaList").append(html.join(""));
	});

	//删除安全问题
	$("#qaList").delegate(".del", "click", function(){
		var t = $(this), parent = t.parent().parent();
		parent.remove();
	});

    //在线生成RSA密钥
    $('.autoget').bind('click', function(){
        var t = $(this), type = t.attr('data-type');
        
        //ras
        if(type == 'rsa'){

            huoniao.showTip("loading", "正在生成，请稍候...");

            $.ajax({
                url: 'https://www.kumanyun.com/include/ajax.php?action=createRsaKey',
                type: 'GET',
                dataType: 'jsonp',
                timeout: 5000,
                success: function (data) {
                    if(data.state == 100){
                        huoniao.showTip("success", "生成成功！", "auto");
                        var keys = data.data;
                        var privKey = keys.privKey;
                        var pubKey = keys.pubKey;
                        $('#encryptPrivkey').val(privKey);
                        $('#encryptPubkey').val(pubKey);
                    }else{
                        huoniao.hideTip();
                        $.dialog.alert(data.info);
                    }
                },
                error: function () { 
                    huoniao.hideTip();
                    $.dialog.alert('网络错误，生成失败！<br />请使用第三方工具生成后填写到页面中进行保存！<br />推荐网址：<a target="_blank" href="http://tools.jb51.net/static/api/rsa_encode/index.html">http://tools.jb51.net/static/api/rsa_encode/index.html</a>');
                }
            });
        }

        //aes
        else if(type == 'aes'){

            huoniao.operaJson("siteSafe.php?action=createAesKey", "", function(data){
                var state = "success";
                if(data.state != 100){
                    state = "error";
                }
                // huoniao.showTip(state, data.state == 100 ? '生成成功！' : data.info, "auto");

                if(data.state == 100){
                    $('#aes_key').val(data.info);
                }
    
            });

        }
    });

    //AES转换数据
    $('.convertAesData').bind('click', function(){
        var t = $(this), type = t.attr('data-type');
        $.dialog.confirm('<strong style="color: red;">使用本功能前，请务必做好数据库备份，以免操作错误导致数据异常无法恢复！！！</strong><br />为了防止转换数据时有新数据写入，请在转换数据前，<font color="red">先关闭网站</font>【系统基本参数-网站状态-禁用】，否则可能会导致数据异常！<br /><br />确认要转换数据吗？', function(){

            huoniao.hideTip();
            huoniao.showTip("loading", "正在转换，请稍候...");

            huoniao.operaJson("siteSafe.php?dopost=convertAesData", "type="+type, function(data){
                var state = "success";
                huoniao.hideTip();
                if(data.state != 100){
                    $.dialog.alert(data.info);
                }else{
                    huoniao.showTip(state, data.info, "auto");
                }
            });
        })
    });

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var index = $(".config-nav .active").index(),
			type = $("input[name=configType]").val();

		//基本设置
		if(type == "basic"){
			var holdsubdomain = $("#holdsubdomain"),
				iplimit = $("#iplimit"),
				regstatus = $("input[name=regstatus]:checked").val(),
				regclosemessage = $("#regclosemessage"),
				replacestr = $("#replacestr");

			//保留子级域名
			if(!huoniao.regex(holdsubdomain)){
				window.scroll(0, 0);
				return false;
			};

			//IP访问限制
			if(!huoniao.regex(iplimit)){
				window.scroll(0, 0);
				return false;
			};

			//会员注册关闭
			if(regstatus == 0){
				if(!huoniao.regex(regclosemessage)){
					window.scroll(0, 0);
					return false;
				};
			}

			//敏感词过滤
			if(!huoniao.regex(replacestr)){
				window.scroll(0, 0);
				return false;
			};

		//验证码
		}else if(type == "verify"){
			var seccodewidth = $("#seccodewidth").val(),
				seccodeheight = $("#seccodeheight").val();

			if(seccodewidth == ""){
				$.dialog.alert("请填写验证码尺寸：宽度");
				return false;
			}

			if(seccodeheight == ""){
				$.dialog.alert("请填写验证码尺寸：高度");
				return false;
			}

		}

		//异步提交
		post = $("#editform .item:eq("+index+")").find("input, select, textarea").serialize();
		huoniao.operaJson("siteSafe.php?action="+type, post + "&token="+$("#token").val(), function(data){
			var state = "success";
			if(data.state != 100){
				state = "error";
			}
			huoniao.showTip(state, data.info, "auto");

			if(type == "verify"){
				$("#sceimg").attr("src", $("#sceimg").attr("src"));
			}

		});
	});


});
