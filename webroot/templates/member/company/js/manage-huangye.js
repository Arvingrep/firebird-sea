var huoniao = {
	/**
	 * 提示信息
	 * param string type 类型： loading warning success error
	 * param string message 提示内容
	 * param string hide 是否自动隐藏 auto
	 */

	//父级窗口提示
	parentTip: function(type, message){
		if(parent.$(".w-notice").html() != undefined){
			parent.$(".w-notice").remove();
		}
		parent.$("body").append('<div class="w-notice"><span class="msg '+type+'"><s></s>'+message+'</span></div>');

		huoniao.parentHideTip();
	}

	//表单验证
	,regex: function(obj){
		var regex = obj.attr("data-regex"), tip = obj.siblings(".input-tips");
		if(regex != undefined && tip.html() != undefined){
			var exp = new RegExp("^" + regex + "$", "img");
			if(!exp.test($.trim(obj.val()))){
				tip.removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
				return false;
			}else{
				tip.removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
				return true;
			}
		}
	}
}

var aue = [], navLength = $('.cusNavCon dl').length, navIndex = navLength + 1;

function ueNews(index){
	if(index == 0){
		for(var i = 1; i < navLength; i++){
			var ue = UE.getEditor('body'+i);
			var mue = UE.getEditor('mbody'+i, {"term": "mobile"});
			aue.push({ue: ue,mue: mue});
		}
	}else{
		var ue = UE.getEditor('body'+index);
		var mue = UE.getEditor('mbody'+index, {"term": "mobile"});
		aue.push({ue: ue,mue: mue});
	}
}

ueNews(0);

var customerNav = '<dl class="fn-clear"><dt><label><span class="text-info folding">'+langData['siteConfig'][6][26]+'</span> '+langData['siteConfig'][19][654]+'&no：</label></dt><dd><div class="custombox"><p class="typename"><input type="text" class="inp custonav" placeholder="'+langData['siteConfig'][26][120]+'"><label class="checkbox"><input type="checkbox" value="1" checked="checked" class="isshow" />'+langData['siteConfig'][19][655]+'</label><div class="input-append"><input type="text" size="8" maxlength="6" value="&px" class="px"><span class="add-aft">'+langData['siteConfig'][6][20]+'</span></div><input type="button" class="btn-del" value="'+langData['siteConfig'][6][8]+'" /></p><div class="typebody"><ul class="nav-tbody fn-clear"><li class="active"><a href="javascript:;">'+langData['siteConfig'][26][121]+'</a></li><li><a href="javascript:;">'+langData['siteConfig'][26][122]+'</a></li></ul><div class="con-tbody"><div class="item-tbody"><script id="body&index" name="body[]" type="text/plain" style="width:85%;height:300px"></script></div><div class="hide item-tbody"><script id="mbody&index" name="mbody[]" type="text/plain" style="width:960px;height:300px"></script></div></div></div></div></dd></dl>';

$(function(){

	//填充栏目分类
	// $("#typeid").html(treeTypeList());

  var cusnavList = $('.cusNavList');
	// 增加导航
	$('#addNav').click(function(){
		navLength++;
		// var len = cusnavList.children('dl').length + 1;
		var no = cusnavList.children('dl').length + 1;
		var px = [];
		$('.cusNavList .px').each(function(){
			px.push(parseInt($(this).val()));
		})
		px = px.sort(sortNumber);
		var newpx = 0, len = px.length, min = px[0], max = px[len-1];
		if(min > 1){
			newpx = 1;
		}else{
			for(var i = (min+1); i < max; i++){
				if(!px.in_array(i)){
					newpx = i;
					break;
				}
			}
		}
		newpx = newpx == 0 ? (max+1) : newpx;

		cusnavList.append(customerNav.replace(/&index/g,navLength).replace('&no', no).replace('&px', newpx));
		ueNews(navLength);
	})

	// 删除导航
	$('.cusNavList').delegate('.btn-del', 'click', function (e) {
		var t = $(this), dl = t.closest('dl'), index = dl.index();
		if(confirm(langData['siteConfig'][27][112])){
			dl.slideDown(1,function(){
				dl.remove();
			})

			aue[index].ue.destroy();
			aue[index].mue.destroy();
			aue.splice(index,1);
			navSetIndex();
		}
	})
	// 全部折叠
	$('#allfolding').click(function(){
		var t = $(this), s = t.text(), o = $('.cusNavList .typebody'), b = $('.cusNavList .folding');
		if(s == langData['siteConfig'][6][85]){
			o.slideUp(100);
			t.text(langData['siteConfig'][6][86]);
			b.text(langData['siteConfig'][6][25]);
		}else{
			o.slideDown();
			t.text(langData['siteConfig'][6][85]);
			b.text(langData['siteConfig'][6][26]);
		}
	})

  // 折叠导航
  $('.cusNavCon').delegate('.folding','click',function(){
    var t = $(this), s = t.text(), o = t.closest('dl').find('.typebody');
    if(s == langData['siteConfig'][6][26]){
      o.slideUp(100);
      t.text(langData['siteConfig'][6][25]);
    }else{
      o.slideDown(100);
      t.text(langData['siteConfig'][6][26]);
    }
  })

  // 切换tab
  $('.nav-tabs li').click(function(){
    var t = $(this), index = t.index();
    t.addClass('active').siblings('li').removeClass('active');
    $('#fabuForm .module_box').eq(index).show().siblings('.module_box').hide();
  })

  $('.cusNavList').delegate('.nav-tbody li', 'click', function(){
    var t = $(this), index = t.index(), nav = t.closest('.nav-tbody'), con = nav.siblings('.con-tbody');
    t.addClass('active').siblings('li').removeClass('active');
    con.find('.item-tbody').eq(index).show().siblings().hide();
  })

  // 修改配色
	$('#peise').on('input propertychange', function(){
		var t = $(this).val();
		$('#peiseshow').removeClass().addClass('type_'+t);
	})

  //地图标注
  var init = {
    popshow: function() {
      var src = "/api/map/mark.php?mod=huangye",
          address = $("#address").val(),
          lnglat = $("#lnglat").val();
      if(address != ""){
        src = src + "&address="+address;
      }
      if(lnglat != ""){
        src = src + "&lnglat="+lnglat;
      }
      $("#markPopMap").after($('<div id="shadowlayer" style="display:block"></div>'));
      $("#markDitu").attr("src", src);
      $("#markPopMap").show();
    },
    pophide: function() {
      $("#shadowlayer").remove();
      $("#markDitu").attr("src", "");
      $("#markPopMap").hide();
    }
  };

  $(".map-pop .pop-close, #cloPop").bind("click", function(){
    init.pophide();
  });

  $("#mark").bind("click", function(){
    init.popshow();
  });

  $("#okPop").bind("click", function(){
    var doc = $(window.parent.frames["markDitu"].document),
        lng = doc.find("#lng").val(),
        lat = doc.find("#lat").val(),
        address = doc.find("#addr").val();
    $("#lnglat").val(lng+","+lat);
    if($("#address").val() == ""){
      $("#address").val(address).blur();
    }
    init.pophide();
  });

  //表单验证
	var regex = {

		regexp: function(t, reg, err){
			var val = $.trim(t.val()), dl = t.closest("dl"), name = t.attr("name"),
					tip = t.data("title"), etip = tip, hline = dl.find(".tip-inline"), check = true;

			if(val != ""){
				var exp = new RegExp("^" + reg + "$", "img");
				if(!exp.test(val)){
					etip = err;
					check = false;
				}
			}else{
				check = false;
			}

			if(dl.attr("data-required") == 1){
				if(val == "" || !check){
					hline.removeClass().addClass("tip-inline error").html("<s></s>"+etip);
				}else{
					hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
				}
				return check;
			}
		}

		//名称
		,title: function(){
			return this.regexp($("#title"), ".{5,100}", langData['siteConfig'][27][90]);
		}

	}

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();
    $('#addr').val($('.addrBtn').attr('data-id'));

    var t          = $(this),
      litpic       = $("#litpic").val(),
      typeid       = $("#typeid").val(),
      addr         = $("#addr").val(),
      title        = $("#title"),
      lnglat       = $("#lnglat").val(),
      tj           = true;

		if(t.hasClass("disabled")) return;
    var offsetTop = 0;

    //分类
		if(typeid == "" || typeid == "0"){
			$("#typeid").siblings(".tip-inline").addClass("error");
			tj = false;
			changePame(0);
      $('.main').animate({scrollTop: $('#typeid').position().top + 10}, 300);
      return false;
		}else{
			$("#typeid").siblings(".tip-inline").removeClass("error");
		}

		//标题
		if(!regex.title()){
			tj = false;
      $('.main').animate({scrollTop: $('#title').position().top + 10}, 300);
      changePame(0);
			return false;
		};

		//地区
		if(addr == "" || addr == "0"){
			$("#addr").siblings(".tip-inline").addClass("error");
			tj = false;
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			changePame(0);
			return false;
		}else{
			$("#addr").siblings(".tip-inline").removeClass("error");
		}

    if(litpic == ""){
			$.dialog.alert(langData['siteConfig'][21][129]);
			changePame(0);
			return false;
		}

		if(lnglat == ""){
			$.dialog.alert(langData['siteConfig'][27][113]);
			changePame(0);
			return false;
		}

		if($("#tel").val() == ""){
			$.dialog.alert(langData['siteConfig'][20][433]);
			changePame(0);
			return false;
		}

		var haveBody = false, detail = '';
		$('.cusNavList dl').each(function(i){
			aue[i].ue.sync();
			aue[i].mue.sync();
			var t = $(this), nav = t.find('.custonav'), body = aue[i].ue.getContent(), mbody = aue[i].mue.getContent(), show = 0, weight = 0;
			if(nav.val() != '' || body != ''){
				if(body == ''){
					tj = false;
					changePame(1);
					$.dialog.alert(langData['siteConfig'][27][114].replace('1', (i+1)));
					return false;
				}
				else if(nav.val() == ''){
					tj = false;
					changePame(1);
					nav.focus();
					$.dialog.alert(langData['siteConfig'][27][115].replace('1', (i+1)));
					return false;
				}
				if(t.find('.isshow').is(":checked")){
					haveBody = true;
					show = 1;
				}
				weight = t.find('.px').val();
				weight = weight < 0 ? 0 : weight;
				detail += 'nav::::::'+encodeURIComponent(nav.val())+',,,,,,show::::::'+show+',,,,,,weight::::::'+weight+',,,,,,body::::::'+encodeURIComponent(body)+',,,,,,mbody::::::'+encodeURIComponent(mbody)+';;;;;;';
			}
		})

		detail = detail.substr(0,detail.length-6);
		$('textarea[name="body[]"], textarea[name="mbody[]"]').remove();

    if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}

		if(tj){
			t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");

			$.ajax({
				url: '/include/ajax.php?service=huangye&action=put',
				type: 'post',
				data: $("#fabuForm").serialize() + "&detail=" + detail,
				dataType: 'json',
				success: function(data){
					if(data && data.state == 100){
						$.dialog({
							title: langData['siteConfig'][19][287],
							icon: 'success.png',
							content: data.info,
							ok: function(){
								location.reload();
							}
						});
					}else{
						$.dialog.alert(data.info);
						t.attr("disabled", false).html(langData['siteConfig'][6][151]);
					}
				},
				error: function(){
					$.dialog.alert(langData['siteConfig'][20][183]);
					t.attr("disabled", false).html(langData['siteConfig'][6][151]);
				}
			})
		}

	});


  function sortNumber(a, b){
  	return a - b;
  }

  function navSetIndex(){
    $('.cusNavList dl').each(function(i){
      var dt = $(this).find('dt'), html = dt.html();
      dt.html(html.replace(/\d+/g,++i));
    })
  }

	function changePame(index){
		$('.nav-tabs li:eq('+index+')').click();
	}

})
