var 	uploader_iv;
$(function(){

	if(typeid == 0 && id == 0){
		//大类切换
		$(".catagoryBox a").bind("click", function(){
			var t = $(this), index = t.index();
			// if(!t.hasClass("curr")){
			// 	t.addClass("curr").siblings("li").removeClass("curr");
			// 	$(".seltype .stype ul").hide();
			// 	$(".seltype .stype ul:eq("+index+")").show();
			// }
			$(".catagoryBox a").removeClass('on_chose')
			t.addClass('on_chose')
		});

		$("#skey").val("");
		// $("#skey").autocomplete({
		// 	source: function( request, response ) {
		// 		$.ajax({
		// 			url: "/include/ajax.php?service=info&action=searchType",
		// 			dataType: "jsonp",
		// 			data:{
		// 				key: request.term
		// 			},
		// 			success: function( data ) {
		// 				if(data && data.state == 100){
		// 					response( $.map( data.info, function( item, index ) {
		// 						return {
		// 							id: item.id,
		// 							value: item.typename,
		// 							label: (index+1)+". "+item.typename
		// 						}
		// 					}));
		// 				}else{
		// 					response([])
		// 				}
		// 			}
		// 		});
		// 	},
		// 	minLength: 1,
		// 	select: function( event, ui ) {
		// 		location.href = getUrl(ui.item.id);
		// 	}
		// }).autocomplete( "instance" )._renderItem = function( ul, item ) {
		// 	return $("<li>")
		// 		.append(item.label)
		// 		.appendTo( ul );
		// };

		function getUrl(id){
			var url = $(".sform").data("url");
			return url.replace("%id%", id);
		}

		//二级分类
		$(".seltype .stype li").hover(function(){
			var sub = $(this).find(".subnav");
			if(sub.find("a").length > 0){
				$(this).addClass("curr");
				sub.show();
			}
		}, function(){
			var sub = $(this).find(".subnav");
			if(sub.find("a").length > 0){
				$(this).removeClass("curr");
				sub.hide();
			}
		});

		return false;

	}
	//国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'JSONP',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areaCode').hide();
                        $('.w-form .inp#tel').css({'padding-left':'10px','width':'175px'});
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
                   }
                   $('.areaCode_wrap ul').append(phoneList.join(''));
                }else{
                   $('.areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                        $('.areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
                    }

        })
    }
    //显示区号
    $('.areaCode').bind('click', function(e){
      console.log('codeclick')
        e.stopPropagation();
        var areaWrap =$(this).closest("dd").find('.areaCode_wrap');
        if(areaWrap.is(':visible')){
            areaWrap.fadeOut(300)
        }else{
            areaWrap.fadeIn(300);
           return false;
        }


    });

		$('.radioBox li').click(function(){
			var t = $(this);
			t.addClass('on_chose').siblings('li').removeClass('on_chose');
		})
    //选择区号
    $('.areaCode_wrap').delegate('li', 'click', function(){
        var t = $(this), code = t.attr('data-code');
        var par = t.closest("dd");
        var areaIcode = par.find(".areaCode");
        areaIcode.find('i').html('+' + code);
        $('#areaCode').val(code);
    });

    $('body').bind('click', function(){
        $('.areaCode_wrap').fadeOut(300);
    });

	getEditor("body");

	//自动获取交易地点
	//百度地图
	if(site_map == "baidu"){
		var coords = $().coords();
		var transform = function(e, t) {
			coords.transform(e,	function(e, n) {
				n != null ? $("#address").val(n.street + n.streetNumber) : alert(e.message);
				$("#address").siblings(".tip-inline").removeClass().addClass("tip-inline success");
				var dist = n.district;
				$("#selAddr .sel-group:eq(0) li").each(function(){
					var t = $(this).find("a"), v = t.text(), i = t.attr("data-id");
					if(v.indexOf(dist) > -1){
						$("#addr").val(i);
						$("#selAddr .sel-group:eq(0)").find("button").html(v+'<span class="caret"></span>');
						$("#selAddr .sel-group:eq(0)").siblings(".sel-group").remove();
						getChildAddr(i);
					}
				});
				t.hide();
			}, true);
		};
		$("#getlnglat").bind("click", function() {
			var e = $(this);
			coords.get(function(t, n) {
				transform(n, e);
			}),
			$(this).unbind("click").html("<s></s>"+langData['siteConfig'][7][3]+"...");  //获取中
		});

		//搜索联想
		var autocomplete = new BMap.Autocomplete({
				input: "address"
		});
		autocomplete.setLocation(map_city);

	//google 地图
	}else if(site_map == "google"){

		$("#getlnglat").hide();
	    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('address'), {placeIdOnly: true});

	}

	//选择区域
	$("#selAddr").delegate("a", "click", function(){
		if($(this).text() != langData['siteConfig'][22][96] && $(this).attr("data-id") != $("#addr").val()){  //不限
			var id = $(this).attr("data-id");
			$(this).closest(".sel-group").nextAll(".sel-group").remove();
			getChildAddr(id);
		}
	});

	//获取子级区域
	function getChildAddr(id){
		if(!id) return;
		$.ajax({
			url: "/include/ajax.php?service=info&action=addr&type="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					var list = data.info, html = [];

					html.push('<div class="sel-group">');
					html.push('<button class="sel">'+langData['siteConfig'][22][96]+'<span class="caret"></span></button>');  //不限
					html.push('<ul class="sel-menu">');
					html.push('<li><a href="javascript:;" data-id="'+id+'">'+langData['siteConfig'][22][96]+'</a></li>');  //不限
					for(var i = 0; i < list.length; i++){
						html.push('<li><a href="javascript:;" data-id="'+list[i].id+'">'+list[i].typename+'</a></li>');
					}
					html.push('</ul>');
					html.push('</div>');

					$("#addr").before(html.join(""));

				}
			}
		});
	}


	//有效期
	$("#valid").click(function(){
		WdatePicker({
			el: 'valid',
			doubleCalendar: true,
			isShowClear: false,
			isShowOK: false,
			isShowToday: false,
			minDate: '%y-%M-{%d+1}',
			onpicking: function(dp){

			}
		});
	});

	//价格开关
	$("input[name=price_switch]").bind("click", function(){
		if($(this).is(":checked")){
			$(".priceinfo").hide();
		}else{
			$(".priceinfo").show();
		}
	});



	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		$('#addr').val($('#selAddr .addrBtn').attr('data-id'));
        var addrids = $('#selAddr .addrBtn').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);
		var t       = $(this),
				typeid  = $("#typeid").val(),
				price   = $("#price").val(),
				addr    = $("#addr").val(),
				person  = $("#person"),
				tel     = $("#tel"),
				valid   = $("#valid");

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;
		if(!typeid){
			$.dialog.alert(langData['siteConfig'][20][342]);  //分类ID获取失败，请重新选择类目！
			return false;
		}

		// //验证标题
		// var exp = new RegExp("^" + titleRegex + "$", "img");
		// if(!exp.test(title.val())){
		// 	title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+titleErrTip);
		// 	offsetTop = title.offset().top;
		// }



		$("#itemList").find("input, .radio, .sel-group").each(function() {
			var t = $(this), dl = t.closest("dl");

			//下拉菜单
			if(t[0].tagName == "DIV" && t[0].className == "sel-group"){
				if(dl.find("input[type=hidden]").val() == "" && dl.data("required") == 1){
					dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+dl.find(".sel-group:eq(0)").attr("data-title"));
					offsetTop = offsetTop == 0 ? dl.offset().top : offsetTop;
				}

			//单选
			}else if(t[0].tagName == "DIV" && t[0].className == "radio"){
				if(dl.find("input[type=hidden]").val() == "" && dl.data("required") == 1){
					dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+dl.find(".radio").attr("data-title"));
					offsetTop = offsetTop == 0 ? dl.offset().top : offsetTop;
				}

			//多选
			}else if(t[0].tagName == "INPUT" && t[0].type == "checkbox"){
				if(dl.find("input:checked").length <= 0 && dl.data("required") == 1){
					dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+dl.find(".checkbox").attr("data-title"));
					offsetTop = offsetTop == 0 ? dl.offset().top : offsetTop;
				}

			//文本
			}else if(t[0].tagName == "INPUT" && t[0].type == "text"){
				if(t.val() == "" && dl.data("required") == 1){

					//价格
					if(t[0].name == "price"){
						t.parent().siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+t.attr("data-title"));
					}else{
						t.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+t.attr("data-title"));
					}
					offsetTop = offsetTop == 0 ? t.offset().top : offsetTop;
				}
			}

		});

		ue.sync();

		//验证区域
		if(addr == "" || addr == 0){
			$("#selAddr .tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+$("#selAddr .sel-group:eq(0)").attr("data-title"));
			offsetTop = offsetTop == 0 ? $("#selAddr").offset().top : offsetTop;
		}

		//验证联系人
		var exp = new RegExp("^" + personRegex + "$", "img");
		if(!exp.test(person.val())){
			person.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+personErrTip);
			offsetTop = offsetTop == 0 ? person.offset().top : offsetTop;
		}

		// //验证手机号码
		// var exp = new RegExp("^" + telRegex + "$", "img");
		// if(!exp.test(tel.val())){
		// 	tel.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+telErrTip);
		// 	offsetTop = offsetTop == 0 ? tel.offset().top : offsetTop;
		// }

		//验证有效期
		if(valid.val() == 0 || valid.val() == ""){
			valid.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][22]);  //请选择有效期！
			offsetTop = offsetTop == 0 ? valid.offset().top : offsetTop;
		}

		if(offsetTop){
			$('html, body').animate({scrollTop: offsetTop - 5}, 300);
			return false;
		}


		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
		data = form.serialize();

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");  //提交中

		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){

					fabuPay.check(data, url, t);

				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][11][19]);   //立即发布
					$("#verifycode").click();
				}

			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][184]);  //加载中，请稍候
				t.removeClass("disabled").html(langData['siteConfig'][11][19]);//立即发布
				$("#verifycode").click();
			}
		});


	});
	//视频预览
	$("#listSection3").delegate(".enlarge", "click", function(event){
		event.preventDefault();
		var href = $(this).attr("href");

		window.open(href, "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	});

	//删除文件
	$(".spic .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		delFile(input.val(), false, function(){
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});



	// 弹出分类选择
	$("#typename").click(function(){
		$(".typeMask,.typePop").show();
	});

	// 隐藏分类
	$(".typePop .popTit a.close_pop").click(function(){
		$(".typeMask,.typePop").hide();
	});

	// 选择分类
	$(".catagoryBox dd a.typechose").click(function(){
		var t = $(this);
		$(".catagoryBox dd a.typechose").removeClass('on_chose')
		t.addClass('on_chose');
		typeid = t.attr('data-id');
		typename = t.attr('data-typename');
		var dl = t.closest('dl');
		typeparid = dl.attr('data-pid');
		typepar = dl.find('dt').text();
		$("#typename").val(typename);
		$("#typeid").val(typeid);
		$("#typePar").val(typepar);
		$("#typeparid").val(typeparid);
		$(".typeParBox").removeClass('fn-hide')
		$(".typePop .popTit a.close_pop").click();
	});

	$('.tabArrs span').click(function(){
		var t = $(this);
		t.toggleClass('on_chose');
	});


	// 选择有效期
	$('.endSelBox li').click(function(event) {
		/* Act on the event */
		var t = $(this);
		t.addClass('on_chose').siblings('li').removeClass('on_chose')
	});

	var count = atlasMax;
	var fileCount = 0,$list = $("#listSection2"),picker = $("#filePicker2");

	// 初始化Web Uploader
		uploader_iv = WebUploader.create({
			auto: true,
			swf: pubStaticPath + 'js/webuploader/Uploader.swf',
			server: server_video_url,
			pick: '#filePicker2',
			fileVal: 'Filedata',
			accept: {
				title: 'Images/Video',
				extensions: 'gif,jpg,jpeg,bmp,png,mp4,wmv,mov,3gp,rmvb,mkv,flv,asf',
				mimeTypes: 'video/*,image/*'
			},
      chunked: true,//开启分片上传
            // threads: 1,//上传并发数
			fileNumLimit: count,
			// fileSingleSizeLimit: atlasSize
		});


		uploader_iv.on('beforeFileQueued', function(file) {
			if(file.type.indexOf('image') > -1){  //上传文件为图片
				uploader_iv.options.server = server_image_url;
			}else{

				uploader_iv.options.server = server_video_url;
			}
		});

		uploader_iv.on('fileQueued', function(file) {
			console.log('fileQueued')
			var pick = $(this.options.pick);
			//先判断是否超出限制
			if(fileCount == atlasMax){
		    alert(langData['siteConfig'][38][24]);//文件数量已达上限
				uploader_iv.cancelFile( file );
				return false;
			}

			fileCount++;
			addFile(file);
			updateStatus(pick);
		});



		// 文件上传过程中创建进度条实时显示。
		uploader_iv.on('uploadProgress', function(file, percentage){
			var $li = $('#'+file.id),
			$percent = $li.find('.progress span');

			// 避免重复创建
			if (!$percent.length) {
				$percent = $('<p class="progress"><span></span></p>')
					.appendTo($li)
					.find('span');
			}
			$percent.css('width', percentage * 100 + '%');

			//音频文件浏览器右下角增加上传进度
			if(file.type == 'video'){
				var progressFixed = $('#progressFixed_' + file.id);
				if(!progressFixed.length){
					var $i = $("<b id='progressFixed_"+file.id+"'>");
			        $i.css({bottom: 0, left: 0, position: "fixed", "z-index": "10000", background: "#a5a5a5", padding: "0 5px", color: "#fff", "font-weight": "500", "font-size": "12px"});
					$("body").append($i);
					progressFixed = $('#progressFixed_' + file.id);
				}
				progressFixed.text(""+langData['siteConfig'][38][25]+"："+parseInt(percentage * 100) + '%');//上传进度
				if(percentage == 1){
					progressFixed.remove();
				}
			}

		});
		uploader_iv.on('uploadSuccess',function(file,response){
				console.log(response)
		  	window.webUploadSuccess && window.webUploadSuccess(file, response, picker);
				var $li = $('#'+file.id), listSection = $li.closest('.listSection');
				listSection.show();
				if(response.state == "SUCCESS"){
					var img = $li.find("img");
					if (img.length > 0) {
						img.attr("data-val", response.url).attr("data-url", response.turl).attr("src", response.turl);
						$li.find(".enlarge").attr("href", response.turl);
						// $li.closest('.listImgBox').find('.deleteAllAtlas').show();
						// 此处应该赋值
			      if(fileCount == atlasMax && atlasMax == 1){
			        $(this.options.pick).closest('.wxUploadObj').hide();
			  			return false;
			  		}
				}

				var video = $li.find("video");
				if(video.length > 0){
					img.attr("data-val", response.url).attr("data-url", response.turl).attr("src", response.turl);
					$li.find(".enlarge").attr("href", response.turl);
					if(fileCount == atlasMax && atlasMax == 1){
						$(this.options.pick).closest('.wxUploadObj').hide();
						return false;
					}
				}


			}
		})
		uploader_iv.on('uploadComplete',function(file,response){
				console.log('uploadComplete')
			  $('#'+file.id).find('.progress').remove();
		})
		uploader_iv.on('error',function(file,response){
				console.log('error')
			  console.log(file)
		})



		$('body').delegate('.li-rm', 'click', function(event) {
			console.log(111)
			var $btn = $(this),$li = $btn.closest('.pubitem')
			if($li.find('video').length >= 1){
				var path = $li.find('video').attr('data-val')
				delFile(path, false, 'video', function(){
					$li.remove();
				});
			}else{
				var path = $li.find('img').attr('data-val');
				console.log(path)
				delFile(path, false, 'image',function(){
					$li.remove();
				});
			}
			fileCount--;
		});
		//删除已上传的文件
		function delFile(b, d, d, c) {
			var type = "delVideo"
			if(d == 'image'){
				type = 'delImage'
			}
			var g = {
				mod: "info",
				type: type,
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

		// 新增
		function addFile(file){
			if(file.type.indexOf('image') > -1){
				var $li = $('<div id="' + file.id + '" class="pubitem"><a href="" target="_blank" title="" class="enlarge"><img></a><a class="li-rm" href="javascript:;"></a><span class="setMain">设为主图</span></div>');//删除图片
				var $img = $li.find('img');
				// 创建缩略图
				uploader_iv.makeThumb(file, function(error, src) {
					$img.closest('.listSection').show();
					if(error){
						$list.show();
						$img.replaceWith('<span class="thumb-error">'+langData['siteConfig'][6][177]+'...</span>');//上传中
						return;
					}
					$img.attr('src', src);
				});
			}else{
				var $li = $('<div id="' + file.id + '" class="pubitem videoItem"><a href="javascript:;" target="_blank" title="" class="enlarge"><video></video></a><a class="li-rm" href="javascript:;"></a></div>');//删除图片
				var $video = $li.find('video');
				// $video.attr('src', src);
			}

			var $btns = $li.find('.li-rm');


			$btns.on('click', function(){
				uploader_iv.cancelFile( file );
				uploader_iv.removeFile(file, true);
			});
			$list.prepend($li);
		}


		function updateStatus(obj){
			var len = $(".listSection .pubitem").length;
			if(length == 0){
				$(".wxUploadObj").show()
			}else{
				if(atlasMax == fileCount){
					$(".wxUploadObj").hide()
				}
			}
		}


		// 设为主图
		$("body").delegate('.setMain', 'click', function(event) {
			var t = $(this);
			var li = t.closest('.pubitem');
			var imgPath = li.find('img').attr('src');
			var imgVal = li.find('img').attr('data-val');

		});

		//极速验证
var dataGeetest = "";
  var ftype = "phone";

    //发送验证码
 function sendPhoneVerCode(){
    var btn = $('.codebtn');
    if(btn.filter(":visible").hasClass("disabled")) return;

    var vericode = "";
    // var vericode = $("#vdimgck").val();  //图形验证码
    // if(vericode == '' && !geetest){
    //   alert(langData['siteConfig'][20][170]);
    //   return false;
    // }

    var number = $('#tel').val();
    if (number == '') {
      alert(langData['siteConfig'][20][27]);
      return false;
    }

   if(isNaN(number)){
      alert(langData['siteConfig'][20][179]);
      return false;
    }else{
      ftype = "phone";
    }

    btn.addClass("disabled");

    if(ftype == "phone"){

      var action = "getPhoneVerify";
      var dataName = "phone";
      $.ajax({
        url: masterDomain+"/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=verify",
        data: "vericode="+vericode+"&areaCode="+$("#areaCode").val()+"&phone="+number+dataGeetest,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
          //获取成功

          if(data && data.state == 100){
           alert('验证码已发送');
           countDown(60, $('.codebtn'));
          //获取失败
          }else{
            btn.removeClass("disabled");
            alert(data.info);
          }
        },
        error: function(){
          btn.removeClass("disabled");
          alert(langData['siteConfig'][20][173]);
        }
      });
    }
  }
  if(!geetest){
    $('.codebtn').click(function(){
      if(!$(this).hasClass("disabled")){
        sendPhoneVerCode();
      }
    });
  }else{
    //极验验证
    var handlerPopupFpwd = function (captchaObjFpwd) {
      // captchaObjFpwd.appendTo("#popupFpwd-captcha-mobile");

      // 成功的回调
      captchaObjFpwd.onSuccess(function () {

        var validate = captchaObjFpwd.getValidate();
        dataGeetest = "&terminal=mobile&geetest_challenge="+validate.geetest_challenge+"&geetest_validate="+validate.geetest_validate+"&geetest_seccode="+validate.geetest_seccode;

        //邮箱找回
        if(ftype == "phone"){
      //获取短信验证码
          var number   = $('#tel').val();
          if (number == '') {
            alert(langData['siteConfig'][20][27]);
            return false;
          } else {
            sendPhoneVerCode();
          }

        }
      });

      window.captchaObjFpwd = captchaObjFpwd;
    };


    //获取验证码
    $('.codebtn').click(function(){
      if($(this).hasClass("disabled")) return;
      var number   = $('#tel').val();
      if (number == '') {
        $.dialog.alert(langData['siteConfig'][20][27]);   //请输入您的手机号
        return false;
      } else {
        if(isNaN(number)){
          $.dialog.alert(langData['siteConfig'][20][179]);  //账号错误
          return false;
        }else{
          ftype = "phone";
    }

        if (captchaObjFpwd) {
            captchaObjFpwd.verify();
        }

      }
    });




    $.ajax({
        url: masterDomain+"/include/ajax.php?service=siteConfig&action=geetest&terminal=mobile&t=" + (new Date()).getTime(), // 加随机数防止缓存
        type: "get",
        dataType: "json",
        success: function (data) {
            initGeetest({
                gt: data.gt,
                challenge: data.challenge,
                offline: !data.success,
                new_captcha: true,
                product: "bind",
                width: '312px'
            }, handlerPopupFpwd);
        }
    });

    //倒计时
    function countDown(time, obj){
        obj.html(time+'秒后重发').addClass('disabled');
        mtimer = setInterval(function(){
            obj.html((--time)+'秒后重发').addClass('disabled');
            if(time <= 0) {
                clearInterval(mtimer);
                obj.html('重新发送').removeClass('disabled');
            }
        }, 1000);
    }
  }


// 提交
$("#submit").click(function(){

})

});
