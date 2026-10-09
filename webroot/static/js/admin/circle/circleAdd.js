//实例化编辑器
//var ue = UE.getEditor('note');
//var mue = UE.getEditor('mbody', {"term": "mobile"});

$(function(){

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		regex: function(obj){
			var regex = obj.attr("data-regex");
			console.log(regex);
			if(regex != undefined){
				var exp = new RegExp("^" + regex + "$", "img");
				console.log(exp);
				if(!exp.test($.trim(obj.val())).toString()){
					return false;
				}else{
					return true;
				}
			}
		}

		//树形递归分类
		,treeTypeList: function(){
			var typeList = [], cl = "";
			var l=addrListArr;
			typeList.push('<option value="0">不限</option>');
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if(addrid == jsonArray["id"]){
						selected = " selected";
					}
					typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					for(var k = 0; k < jArray.length; k++){
						cl += '    ';
						var selected = "";
						if(addrid == jArray[k]["id"]){
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
				})(l[i]);
			}
			return typeList.join("");
		},
		//菜单递归分类
		selectTypeList: function(type){
			var typeList = [];
			typeList.push('<ul class="dropdown-menu">');
			typeList.push('<li><a href="javascript:;" data-id="0">选择分类</a></li>');

			//var l = type == 'brand' ? brandListArr : levelListArr;
			var l = brandListArr;
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, cl = "";
					if(jArray.length > 0){
						cl = ' class="dropdown-submenu"';
					}
					typeList.push('<li'+cl+'><a href="javascript:;" data-id="'+jsonArray["id"]+'">'+jsonArray["typename"]+'</a>');
					if(jArray.length > 0){
						typeList.push('<ul class="dropdown-menu">');
					}
					for(var k = 0; k < jArray.length; k++){
						if(jArray[k]['lower'] != null){
							arguments.callee(jArray[k]);
						}else{
							typeList.push('<li><a href="javascript:;" data-id="'+jArray[k]["id"]+'">'+jArray[k]["typename"]+'</a></li>');
						}
					}
					if(jArray.length > 0){
						typeList.push('</ul></li>');
					}else{
						typeList.push('</li>');
					}
				})(l[i]);
			}

			typeList.push('</ul>');
			return typeList.join("");
		},

	};


	//20190816修改
	//选择





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

	//模糊匹配会员
	$("#user").bind("input", function(){
		$("#userid").val("0");
		$("#userPhone").html("").hide();
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkCarAdviser", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#userList, #userPhone").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'" data-phone="'+data[i].phone+'">'+data[i].username+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#userList")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#userList, #userPhone").html("").hide();
				}
			});

		}else{
			$("#userList, #userPhone").html("").hide();
		}
    });

	$("#userList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id"), phone = $(this).attr("data-phone");
		$("#user").val(name);
		$("#userid").val(id);
		$("#userList").html("").hide();
		$("#userPhone").html("电话："+phone).show();
		$("#user").siblings(".input-tips").removeClass().addClass("input-tips input-ok");
        checkZjUser($("#user"), name);
		return false;
	});

	if($("#userList").size() > 0){
		$(document).click(function (e) {
	        var s = e.target;
	        if (!jQuery.contains($("#userList").get(0), s)) {
	            if (jQuery.inArray(s.id, "user") < 0) {
	                $("#userList").hide();
	            }
			}
			if (!jQuery.contains($("#userListP").get(0), s)) {
	            if (jQuery.inArray(s.id, "user") < 0) {
	                $("#userListP").hide();
	            }
	        }
	    });
	}

	$("#user").bind("blur", function(){
		var t = $(this), val = t.val(), flag = false;
		if(val != ""){
            checkZjUser(t, val);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-error");
		}
	});

	function checkZjUser(t, val){
		var flag = false;
        t.addClass("input-loading");
        huoniao.operaJson("../inc/json.php?action=checkCarAdviser", "key="+val, function(data){
            t.removeClass("input-loading");
            if(data) {
                for(var i = 0; i < data.length; i++){
                    if(data[i].username == val){
                        flag = true;
                        $("#userid").val(data[i].id);
                        $("#userPhone").html("电话："+data[i].phone).show();
                    }
                }
            }
            if(flag){
                t.siblings(".input-tips").removeClass().addClass("input-tips input-ok");
            }else{
                t.siblings(".input-tips").removeClass().addClass("input-tips input-error");
            }
        });
	}

	//模糊匹配个人会员
	$("#users").bind("input", function(){
		$("#userid").val("0");
		$("#userPhoneP").html("").hide();
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkCarPersonUser", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#userListP, #userPhoneP").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'" data-phone="'+data[i].phone+'">'+data[i].username+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#userListP")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#userListP, #userPhoneP").html("").hide();
				}
			});

		}else{
			$("#userListP, #userPhoneP").html("").hide();
		}
    });

	$("#userListP").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id"), phone = $(this).attr("data-phone");
		$("#users").val(name);
		$("#userid").val(id);
		$("#userListP").html("").hide();
		//$("#contact").val(phone).show();
		$("#userPhoneP").html("电话："+phone).show();
		$("#users").siblings(".input-tips").removeClass().addClass("input-tips input-ok");
        checkPersonUser($("#users"), name);
		return false;
	});

	$("#users").bind("blur", function(){
		var t = $(this), val = t.val(), flag = false;
		if(val != ""){
            checkPersonUser(t, val);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-error");
		}
	});

	function checkPersonUser(t, val){
		var flag = false;
        t.addClass("input-loading");
        huoniao.operaJson("../inc/json.php?action=checkCarPersonUser", "key="+val, function(data){
            t.removeClass("input-loading");
            if(data) {
                for(var i = 0; i < data.length; i++){
                    if(data[i].username == val){
                        flag = true;
						$("#userid").val(data[i].id);
						$("#userPhoneP").val(data[i].phone).show();
                        //$("#contact").val(data[i].phone).show();
                    }
                }
            }
            if(flag){
                t.siblings(".input-tips").removeClass().addClass("input-tips input-ok");
            }else{
                t.siblings(".input-tips").removeClass().addClass("input-tips input-error");
            }
        });
	}

	//房源性质选择
	$("input[name=usertype]").bind("click", function(){
		var val = $(this).val();
		if(val == 0){
			$("#users").focus();
			var t = $("#users");
			checkPersonUser(t, val);
			$("#userType0").show();
			$("#userType1").hide();
		}else{
			$("#userType1").show();
			$("#userType0").hide();
		}
	});

	//房源性质选择
	$("input[name=staging]").bind("click", function(){
		var val = $(this).val();
		if(val == 0){
			$("#downpayment1").hide();
		}else{
			$("#downpayment1").show();
		}
	});
	var mask=$('.mask')
    getListword();
    getAside();
    getBrand();
    //点击品牌弹窗
    $(".type-brand").bind("click", function(){
        $('.brand-wrap').show();
        $('.aside-main ul li').removeClass('active')
        mask.show();
    })
    function getListword(){
    	$.ajax({
            url: '/include/ajax.php?service=car&action=typeList&son=1&page=1&pageSize=9999&orderby=3',
            type: 'get',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    var html = [], list = data.info.list;
                    var firstword = '';

                    for(var i = 0; i < list.length; i++){
                    	var idword = list[i].firstword
                        if(firstword == list[i].firstword){
                            html.push('');
                        }else{
                        	firstword=list[i].firstword;
                            html.push('<li class="jump-li"><a href="javascript:;" data-id="jump-li-'+idword+'">'+list[i].firstword+'</a></li>');
                        }
                    }
                    $('.jump-ul').append(html.join(''));
                }else{

                }
            },
            error: function(){
            }
        });
    }
    function getAside(){
    	$.ajax({
            url: '/include/ajax.php?service=car&action=type&hot=1&page=1&pageSize=10&orderby=3',
            type: 'get',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    var html = [], list = data.info;

                    for(var i = 0; i < list.length; i++){

                        html.push('<li data-id="'+list[i].id+'">'+list[i].typename+'</li>');
                    }
                    $('.list-hot').append(html.join(''));
                }else{

                }
            },
            error: function(){
            }
        });
    }
    function getBrand(){
    	$.ajax({
            url: '/include/ajax.php?service=car&action=typeList&son=1&page=1&pageSize=9999&orderby=3',
            type: 'get',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    var html = [], list = data.info.list;
                    var firstword = '';

                    for(var i = 0; i < list.length; i++){
                    	var idword = list[i].firstword
                        if(firstword == list[i].firstword){
                            html.push('<li data-id="'+list[i].id+'">'+list[i].typename+'</li>');
                        }else{
                        	html.push('</ul>');
                        	firstword=list[i].firstword;
                        	html.push('<h3 id="jump-li-'+list[i].firstword+'">'+list[i].firstword+'</h3>');
                        	html.push('<ul class="list-line list-line-logo">');
                        	html.push('<li data-id="'+list[i].id+'">'+list[i].typename+'</li>');

                        }
                    }
                    $('.aside-main').append(html.join(''));
                }else{

                }
            },
            error: function(){
            }
        });
    }


    //关闭品牌弹窗
    $(".brand-wrap .close_alert,.ul_wrap .cancel").bind("click", function(){
        $('.brand-wrap').hide();
        mask.hide()
    })

    //分类车系
    $('.block-brand .aside-main').delegate("li","click",function () {
        var t = $(this), id = t.data('id');
        $('.block-brand .aside-main li').removeClass('active')
        t.addClass('active');
        if(id!=''){
            $("#brand").val(id);
            $.ajax({
                url: '/include/ajax.php?service=car&action=typeList&page=1&pageSize=9999&orderby=3&chidren=1&type=' + id,
                type: 'get',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        var html = [], list = data.info.list;

                        html.push('<div class="aside-main">');
                        for(var i = 0; i < list.length; i++){
                            html.push('<h3 class="tt">'+list[i].typename+'</h3>');
                            if(list[i]['lower'] != null){
                                html.push('<ul class="list-line">');
                                for(var j = 0; j < list[i]['lower'].length; j++){
                                    html.push('<li data-id="'+list[i]['lower'][j].id+'">'+list[i]['lower'][j].typename+'</li>');
                                }
                                html.push('</ul>');
                            }
                        }
                        html.push('</div>');
                        $('.block-cartype').html(html.join(''));
                        $('.block-cartype').addClass('show');
                    }else{
                        getModel(id);
                        $('.block-cartype').html('')
                    }
                },
                error: function(){
                }
            })
        }
    });

    // 车型分类
    $(".block-cartype").delegate("li","click",function(){
        var t = $(this), id = t.data('id');
        $('.block-cartype li').removeClass('active')
        t.addClass('active');
        if(id!=''){
            $("#brand").val(id);
            getModel(id);
        }
    });

    //获取型号
    function getModel(id){
        if(id!=''){
            $.ajax({
                url: '/include/ajax.php?service=car&action=carmodel&page=1&pageSize=9999&orderby=3&brand=' + id,
                type: 'get',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        var html = [], list = data.info.list;
                        html.push('<div class="aside-main">');
                        var tempYear = '';
                        for(var i = 0; i < list.length; i++){
                            if(tempYear == list[i]['prodate']){
                                html.push('<li data-id="'+list[i]['id']+'">'+list[i]['title']+'</li>');
                            }else{
                                html.push('</ul>');
                                tempYear = list[i]['prodate'];
                                html.push('<h3 class="tt">'+list[i]['prodate']+langData['car'][6][50]+' <i></i></h3>');
                                html.push('<ul class="list-line">');
                                html.push('<li data-id="'+list[i]['id']+'">'+list[i]['title']+'</li>');
                            }
                        }
                        html.push('</div>');
                        $('.cartype-sub').html(html.join(''));
                        $('.cartype-sub').addClass('show');
                    }else{
                         $('.cartype-sub').removeClass('show');
                    }
                },
                error: function(){
                }
            });
        }
    }
    $(".cartype-sub").delegate("li","click",function(){
        var t = $(this), id = t.data('id');
         if(id!=''){
            $("#model").val(id);
        }
        $('.cartype-sub li').removeClass('active');
        t.addClass('active')
    })

    // 侧边栏点击字幕条状
    var navBar = $(".navbar-car");
    navBar.delegate("li","click",function (e) {
        $(this).addClass("active").siblings().removeClass('active');
        var id = $(this).find('a').attr('data-id');
        var mao = $('#' + id)
        var scrollTop = $('.aside .aside-main').scrollTop()
        var off = mao.position().top + scrollTop;//position() 方法返回匹配元素相对于父元素的位置（偏移）。
        $('.aside .aside-main').stop(true).animate({scrollTop: off+'px'}, 500)

    });

    //品牌确定
    $(".ul_wrap").delegate(".confirm","click",function(){
        var brandVal=$('.block-brand li.active').text()
        var cartypeVal=$('.block-cartype li.active').text();
        var subVal=$('.cartype-sub li.active').text();
        if(subVal){
           $('#title').val(brandVal+' '+cartypeVal+' '+subVal);
       }else{
            alert(langData['car'][5][26]);//请选择车型
       }

        $('.brand-wrap').hide();
        mask.hide();
    })

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
			uid           = $("#uid").val(),
			title        = $("#title"),
			cityid       = $("#cityid").val(),
			litpic_      = $("#litpic_").val(),
			banner_      = $("#banner_").val(),
			browse        = $("#browse").val(),
			carsystem    = $("#carsystem").val(),
			model        = $("#model").val(),
			addrid       = $("#addrid").val(),
			price        = $("#price"),
			totalprice   = $("#totalprice"),
			usertype     = $("input[name=usertype]:checked").val(),
			username     = $("#users"),
			contact      = $("#contact"),
			userid       = $("#userid").val(),
			user         = $("#user").val(),
			typeid       = $("input[name='typeidArr']:checked").val(),
			weight       = $("#weight");





		/* if(litpic_ == ''){
			$.dialog.alert('请上传缩略图');
            return false;
		} */

		if(usertype == 0){
			if(username.val()==''){
				username.focus();
				return false;
			}
			if(userid == "" || userid == 0){
				$("#users").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
				username.focus();
				return false;
			}
			if(!huoniao.regex(contact)){
				contact.focus();
				return false;
			}
		}else{
			if(userid == "" || userid == 0 || user == ""){
				$("#user").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
				username.focus();
				return false;
			}
		}



		// if(!init.regex(totalprice)){
		// 	huoniao.goTop();
		// 	$.dialog.alert("请正确输入新车价格，只能填写数字，支持两位小数！");
		// 	return false;
		// }



		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("circleAdd.php", $("#editform").serialize() + "&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){
					huoniao.parentTip("success", "发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					huoniao.goTop();
					location.reload();
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

	//标注地图
	$("#mark").bind("click", function(){
		$.dialog({
			id: "markDitu",
			title: "标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）</small>",
			content: 'url:'+adminPath+'../api/map/mark.php?mod=house&lnglat='+$("#lnglat").val()+"&city="+mapCity+"&addr="+$("#addr").val(),
			width: 800,
			height: 500,
			max: true,
			ok: function(){
				var doc = $(window.parent.frames["markDitu"].document),
					lng = doc.find("#lng").val(),
					lat = doc.find("#lat").val(),
					addr = doc.find("#addr").val();
				$("#lnglat").val(lng+","+lat);
				if($("#addr").val() == ""){
					$("#addr").val(addr);
				}
				huoniao.regex($("#addr"));
			},
			cancel: true
		});
	});

	//视频预览
	$("#videoPreview").delegate("a", "click", function(event){
		event.preventDefault();
		var href = $(this).attr("href"),
			id   = $(this).attr("data-id");

		window.open(href+id, "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	});

	//全景类型切换
	$("input[name='typeidArr']").bind("click", function(){
		$("#qj_type0, #qj_type1").hide();
		$("#qj_type"+$(this).val()).show();
	});

	//全景预览
	$("#licenseFiles a").bind("click", function(event){
		event.preventDefault();
		var id   = $(this).attr("data-id");

		window.open(cfg_attachment+id, "videoPreview", "height=600, width=650, top="+(screen.height-600)/2+", left="+(screen.width-600)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	});

	//删除文件
	$(".spic .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		delFile(input.val(), false, function(){
			input.val("");
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});

	// 监听楼层切换
	$('[name="floortype"]').change(function(){
		var t = $(this), val = t.val();
		if(val == 0){
			$('#radio-floorspr').hide();
		}else{
			$('#radio-floorspr').show();
		}
	})

});



//上传成功接收
function uploadSuccess(obj, file, filetype, fileurl){
	$("#"+obj).val(file);
	var media = "";
	if(filetype == "swf" || file.split(".")[1] == "swf"){
		media = '<embed src="'+fileurl+'" type="application/x-shockwave-flash" quality="high" wmode="transparent">';
	}else if(obj == "video"){
		media = '<video src="'+cfg_attachment+file+'"></video>';
	}else{
		media = '<img src="'+cfg_attachment+file+'" />';
	}
	$("#"+obj).siblings(".spic").find(".sholder").html(media);
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline;");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}

//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "car",
		type: "delThumb",
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
