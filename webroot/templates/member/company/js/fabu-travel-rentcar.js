$(function(){

	//地图标注
	var init = {
		popshow: function() {
			var src = "/api/map/mark.php?mod=travel",
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

	//车型特色
	$(".tags_enter").blur(function() { //焦点失去触发
        var txtvalue=$(this).val().trim();
        if(txtvalue!=''){
            addTag($(this));
        }
    }).keydown(function(event) {
        var key_code = event.keyCode;
        var txtvalue=$(this).val().trim();
        if (key_code == 13 && txtvalue != '') { //enter
            addTag($(this));
        }
        if (key_code == 32 && txtvalue!='') { //space
            addTag($(this));
        }
        if (key_code == 13) {
            return false;
        }
	});
	$(".close").live("click", function() {
        $(this).parent(".tag").remove();
    });

	//下拉弹窗
	$('.w-form #fabuForm .down-div .inp').click(function(e){
		var par = $(this).closest('.down-div');
		var downCon = par.find('.time_choose');
		if(!par.hasClass('curr')){
			par.addClass('curr');
			$('.time_choose').removeClass('active');
			downCon.addClass('active');
		}else{
			par.removeClass('curr');
			downCon.removeClass('active');
		}
			
		$(document).one('click',function(){
			par.removeClass('curr');
			downCon.removeClass('active');
		})
		e.stopPropagation();
	})

	//选择下拉
	$('.time_choose p').click(function(){
		$(this).addClass('curr').siblings('p').removeClass('curr');
		var par = $(this).closest('.time_choose');
		var timeDiv = $(this).closest('.down-div').find('.time-div');
		var tid = $(this).find('a').attr('data-id');
		var txt = $(this).find('a').text();
		par.siblings('input').val(tid);
		if(timeDiv.hasClass('huNum')){
			timeDiv.find('input').val(tid);
		}else{
			timeDiv.find('input').val(txt);
		}
		var pardl = $(this).closest('dl');
        var hline = pardl.find(".tip-inline");
        hline.removeClass().addClass("tip-inline success").html("<s></s>");
		
	})
	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();
        $('#addrid').val($('.addrBtn').attr('data-id'));
        var addrids = $('.addrBtn').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);
        //车型特色
        var tags = [];
        $('.tags').find('.tag').each(function(){
            var t = $(this), val = t.attr('data-val');
            tags.push(val);
        })
        $('#tag_shop').val(tags.join('|'));

		var t           = $(this),
				addrid      = $("#addrid"),
				address      = $("#address"),
				shopname    = $("#shopname"),//标题
				typename      = $("#typename"),//车型
				typeid      = $("#typeid"),//车型
				price_area   = $("#price_area"),//租金
				tag_shop    = $("#tag_shop");//车型特色


		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

		//标题
		if($.trim(shopname.val()) == "" || shopname.val() == 0){
			var stip = shopname.data('title');
			shopname.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+stip);
			offsetTop = offsetTop == 0 ? shopname.position().top : offsetTop;
		}		

		//汽车图集
		if($('#listSection2').find('.pubitem').size() == 0){
			$.dialog.alert('请上传汽车图集');
			offsetTop = offsetTop == 0 ? $('#listSection2').position().top : offsetTop;
		}

		//车型
		if(typeid.val() == ''){
			var pardl = typename.closest('dl');
			var hline = pardl.find(".tip-inline"), tips = typename.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? typename.position().top : offsetTop;
		}
		//租金
		if(price_area.val() == ''){
			var pardl = price_area.closest('dl');
			var hline = pardl.find(".tip-inline"), tips = price_area.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? price_area.position().top : offsetTop;
		}

		//区域
		if($.trim(addrid.val()) == "" || addrid.val() == 0){
			addrid.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][68]);
			offsetTop = offsetTop == 0 ? $("#selAddr").position().top : offsetTop;
		}

		//详细地址
		if($.trim(address.val()) == ""){
			var tips =  address.data("title");
			address.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? $("#selAddr").position().top : offsetTop;
		}

	
		
		//车型特色
		if(tag_shop.val()==''){
			$.dialog.alert('请输入车型特色标签');
			offsetTop = offsetTop == 0 ? $('#tags').position().top : offsetTop;
		}


		var video = "";
	    if($("#listSection3 li").length){
	      video = $("#listSection3 li").eq(0).children("video").attr("data-val");
	    }
        $("#video").val(video);


		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}


		var form = $("#fabuForm"), action = form.attr("action"),url=form.attr("data-url");
		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");
		var data = form.serialize();
		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					$.dialog({
						title: langData['siteConfig'][19][287],
						icon: 'success.png',
						content: data.info,
						ok: function(){}
					});
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);
					setTimeout(function(){location.href = url;},500)
					
				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);

				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['siteConfig'][6][63]);
			}
		});


	});
});
function addTag(obj) {
	var tag = obj.val();
	if (tag != '') {
		var i = 0;
		$(".tag").each(function() {
			if ($(this).text() == tag + "×") {
				$(this).addClass("tag-warning");
				setTimeout("removeWarning()", 400);
				i++;
			}
		})
		obj.val('');
		if (i > 0) { //说明有重复
			return false;
		}
		$("#tag_shop").before("<span class='tag' data-val='"+tag+"'>" + tag + "<button class='close' type='button'>×</button></span>"); //添加标签
	}
}

function removeWarning() {
    $(".tag-warning").removeClass("tag-warning");
}