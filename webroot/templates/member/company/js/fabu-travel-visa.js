$.fn.extend({textareaAutoHeight:function(a){this._options={minHeight:0,maxHeight:1e3},this.init=function(){for(var b in a)this._options[b]=a[b];0==this._options.minHeight&&(this._options.minHeight=parseFloat($(this).height()));for(var b in this._options)null==$(this).attr(b)&&$(this).attr(b,this._options[b]);$(this).keyup(this.resetHeight).change(this.resetHeight).focus(this.resetHeight)},this.resetHeight=function(){var a=parseFloat($(this).attr("minHeight")),b=parseFloat($(this).attr("maxHeight"));$.browser.msie||$(this).height(0);var c=parseFloat(this.scrollHeight);c=a>c?a:c>b?b:c,$(this).height(c).scrollTop(c),c>=b?$(this).css("overflow-y","scroll"):$(this).css("overflow-y","hidden")},this.init()}});
$(function(){

	getEditor("detail_text");
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

	var nowDa = new Date();
	$('#depart_date').click(function(){
		$(".form_datetime .add-aft").click();
	})
	//开始时间
	$(".form_datetime .add-aft").datetimepicker({		
		minView: 2,//设置只显示到月份
		format: 'yyyy-mm-dd',
		linkFormat: 'yyyy-mm-dd',
		autoclose: true,
		language: 'ch',
		todayBtn: true,
		timePicker : false,
		startDate:new Date(),
		linkField: "depart_date",
		onSelect: gotohdDate
	}).on('changeDate',gotohdDate);

	function gotohdDate(ev){
		if($('#depart_date').val()!=""){
        	$('.form_datetime .tip-inline').removeClass().addClass("tip-inline success").html("<s></s>");
        }else{
        	$('.form_datetime .tip-inline').removeClass().addClass("tip-inline error").html("<s></s>请选择最早出发日期");
        }
	}
	$(".w-form").delegate("input[type=text]", "blur", function(){
		var t = $(this), dd = t.closest("dd"),dl = t.closest("dl"), hline = dd.find(".tip-inline");
		var errrTip = t.attr('data-title');
		if(dl.attr("data-required") == 1){
			if($(this).val() !=" " && $(this).val() !=""){
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}else{
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+errrTip)
			}
		}
		if(dl.attr("data-required") == 2){//针对后面已给提示语
			if($(this).val() !=" " && $(this).val() !=""){
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}else{
				hline.removeClass().addClass("tip-inline").html("<s></s>")
			}
		}
		
	})

	$(".w-form").delegate("input[type=text]", "focus", function(){
		var t = $(this), dl = t.closest("dl"), hline = dl.find(".tip-inline");
		var errrTip = t.attr('data-title');

		if(dl.attr("data-required") == 1){
			if($(this).val() ==" " || $(this).val() ==""){
				hline.removeClass().addClass("tip-inline focus").html("<s></s>"+errrTip)
			}
		}
		

	})
	//所需材料
	var scHtml = '<div class="notice-item fn-hide"><div class="label"><textarea placeholder="所需材料标题"></textarea></div><div class="dd"><textarea placeholder="材料详细描述"></textarea></div><span class="btn move" title="'+langData['siteConfig'][6][19]+'"><i></i></span><span class="btn del" title="'+langData['siteConfig'][6][8]+'"><i></i></span><span class="btn add" title="'+langData['siteConfig'][6][18]+'"><i></i></span></div>';
	//所需材料-新增一项
	$('.addnotice').bind("click", function(){
		var sloPar = $(this).closest('.visaInfo');
		var sloApr = sloPar.find('.commVisa')
		var newSc = $(scHtml);
		// newSc.appendTo(sloApr);
        $(this).before(newSc);
		newSc.slideDown(300);
	});

	$(".scienceWrap").delegate(".add", "click", function(){
		var t = $(this).closest(".notice-item");
		var newnotice = $(scHtml);
		newnotice.insertAfter(t);
		newnotice.slideDown(300);
	});

	//删除所需材料
	$(".scienceWrap").delegate(".del", "click", function(){
		var t = $(this).closest(".notice-item"), val1 = t.find(".label textarea").val(), val2 = t.find(".dd textarea").val();
		if(val1 == "" && val2 == ""){
			t.slideUp(300, function(){
				t.remove();
			});
		}else{
			$.dialog.confirm(langData['siteConfig'][27][97], function(){
				t.slideUp(300, function(){
					t.remove();
				});
			});
		}
	});

	$('.scienceWrap .commVisa').each(function(){
		$(this).dragsort({ dragSelector: ".move", placeHolderTemplate: '<div class="notice-item"></div>' });
	})
	

	


	//添加流程
	var noticeHtml = '<div class="notice-item fn-hide"><div class="label"><input type="text" placeholder="'+langData['siteConfig'][19][0]+'" /></div><div class="dd"><textarea placeholder="'+langData['siteConfig'][19][1]+'"></textarea></div><span class="btn move" title="'+langData['siteConfig'][6][19]+'"><i></i></span><span class="btn del" title="'+langData['siteConfig'][6][8]+'"><i></i></span><span class="btn add" title="'+langData['siteConfig'][6][18]+'"><i></i></span></div>';
	$(".addRoute").bind("click", function(){
		var newnotice = $(noticeHtml);
		newnotice.appendTo("#route");
		newnotice.slideDown(300);
	});
	$("#route").delegate(".add", "click", function(){
		var t = $(this).closest(".notice-item");
		var newnotice = $(noticeHtml);
		newnotice.insertAfter(t);
		newnotice.slideDown(300);
	});

	//删除流程
	$("#route").delegate(".del", "click", function(){
		var t = $(this).closest(".notice-item"), val1 = t.find("input").val(), val2 = t.find("textarea").val();
		if(val1 == "" && val2 == ""){
			t.slideUp(300, function(){
				t.remove();
			});
		}else{
			$.dialog.confirm(langData['siteConfig'][27][97], function(){
				t.slideUp(300, function(){
					t.remove();
				});
			});
		}
	});

	$("#route textarea").textareaAutoHeight({minHeight:52, maxHeight:100});
	$("#route").dragsort({ dragSelector: ".move", placeHolderTemplate: '<div class="notice-item"></div>' });

	

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t           = $(this),
				title_visa      = $("#title_visa"),//标题
				second_title    = $("#second_title"),//副标题
				country    = $("#country"),//国家
				typeid    = $("#typeid"),//类型
				price_area    = $("#price_area"),//价格
				depart_date    = $("#depart_date"),//出发日期
				handle_len    = $("#handle_len"),//办理时长
				entrytimes    = $("#entrytimes"),//入境次数
				staytimes    = $("#staytimes"),//停留天数
				edate    = $("#edate"),//有效期限
				entrytimes    = $("#entrytimes"),//入境次数
				sl_area = $('#sl_area'),  //受理范围
			    dj_file = $('#dj_file'),    //递交材料
			    service = $("#service"),    //服务包含
			    tip = $('#tip'),    //重要提醒
				know = $('#know');   //签证须知	

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;
		//标题
		if($.trim(title_visa.val()) == "" || title_visa.val() == 0){
			var stip = title_visa.data('title');
			title_visa.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+stip);
			offsetTop = offsetTop == 0 ? title_visa.position().top : offsetTop;
		}	
		//副标题
		if($.trim(second_title.val()) == "" || second_title.val() == 0){
			var stip = second_title.data('title');
			second_title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+stip);
			offsetTop = offsetTop == 0 ? second_title.position().top : offsetTop;
		}	

		//景点图集
		if($('#listSection2').find('.pubitem').size() == 0){
			$.dialog.alert('请上传景点图集');
			offsetTop = offsetTop == 0 ? $('#listSection2').position().top : offsetTop;
		}


		//国家
		if(country.val() == ''){
			var pardl = country.closest('dl');
			var hline = pardl.find(".tip-inline"), tips = $('#countryname').data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? country.position().top : offsetTop;
		}
		//类型
		if(typeid.val() == ''){
			var pardl = typeid.closest('dl');
			var hline = pardl.find(".tip-inline"), tips = $('#category').data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? typeid.position().top : offsetTop;
		}

		//类型
		if(price_area.val() == ''){
			var pardl = price_area.closest('dl');
			var hline = pardl.find(".tip-inline"), tips = price_area.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? price_area.position().top : offsetTop;
		}

		//出发日期
		if(depart_date.val() == ''){
			var pardl = depart_date.closest('dl');
			var hline = pardl.find(".tip-inline"), tips = depart_date.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? depart_date.position().top : offsetTop;
		}

		//办理时长
		if(handle_len.val() == ''){
			var pardl = handle_len.closest('dl');
			var hline = pardl.find(".tip-inline"), tips = handle_len.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? handle_len.position().top : offsetTop;
		}

		//入境次数
		if(entrytimes.val() == ''){
			var pardl = entrytimes.closest('dl');
			var hline = pardl.find(".tip-inline"), tips = $('#times').data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? $('#times').position().top : offsetTop;
		}
		//停留天数
		if(staytimes.val() == ''){
			var pardl = staytimes.closest('dl');
			var hline = pardl.find(".tip-inline"), tips = staytimes.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? staytimes.position().top : offsetTop;
		}
		//有效期限
		if(edate.val() == ''){
			var pardl = edate.closest('dl');
			var hline = pardl.find(".tip-inline"), tips = edate.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? edate.position().top : offsetTop;
		}
	

		ue.sync();

		if(!ue.hasContents() && offsetTop == 0){
			$.dialog.alert(langData['travel'][14][148]);   //请输入图文内容！
			offsetTop = offsetTop == 0 ? $("#detail_text").offset().top : offsetTop;
		}

		//受理范围
		if($.trim(sl_area.val()) == "" || sl_area.val() == 0){
			var stip = sl_area.data('title');
			sl_area.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+stip);
			offsetTop = offsetTop == 0 ? sl_area.position().top : offsetTop;
		}

		//递交材料
		if($.trim(dj_file.val()) == "" || dj_file.val() == 0){
			var stip = dj_file.data('title');
			dj_file.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+stip);
			offsetTop = offsetTop == 0 ? dj_file.position().top : offsetTop;
		}

		//服务包含
		if($.trim(service.val()) == "" || service.val() == 0){
			var stip = service.data('title');
			service.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+stip);
			offsetTop = offsetTop == 0 ? service.position().top : offsetTop;
		}

		//重要提醒
		if($.trim(tip.val()) == "" || tip.val() == 0){
			var stip = tip.data('title');
			tip.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+stip);
			offsetTop = offsetTop == 0 ? tip.position().top : offsetTop;
		}

		//签证须知
		if($.trim(know.val()) == "" || know.val() == 0){
			var stip = know.data('title');
			know.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+stip);
			offsetTop = offsetTop == 0 ? know.position().top : offsetTop;
		}
		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}

		//在职人员
		var incumbentsscience = [],hasIncumbent=[], incumbentsscienceItem = $(".incumbentsscience .notice-item");
		if(incumbentsscienceItem.length > 0){
			incumbentsscienceItem.each(function(){
	    		var obj = $(this);
	    		var tit = obj.find(".label textarea").val();
	    		var con = obj.find(".dd textarea").val();
	    		if(tit && con){
	    			hasIncumbent.push('1');
	    			incumbentsscience.push(tit+"$$$"+con);
	    		}else{
	    			hasIncumbent.push('');
	    		}
	    	});
		}else{
			$.dialog.alert('请填写在职人员所需材料！');
			return false;
		}
		var Incumbent_exist = $.inArray('1',hasIncumbent);
		if(Incumbent_exist<0){
			$.dialog.alert('请填写在职人员所需材料！');
			return false;
		}


		//退休人员
		var retireescience = [],hasRetiree=[], retireescienceItem = $(".retireescience .notice-item");
		if(retireescienceItem.length > 0){
			retireescienceItem.each(function(){
	    		var obj = $(this);
	    		var tit = obj.find(".label textarea").val();
	    		var con = obj.find(".dd textarea").val();
	    		if(tit && con){
	    			hasRetiree.push('1');
	    			retireescience.push(tit+"$$$"+con);
	    		}else{
	    			hasRetiree.push('');
	    		}
	    	});
		}else{
			$.dialog.alert('请填写退休人员所需材料！');
			return false;
		}
		var Retiree_exist = $.inArray('1',hasRetiree);
		if(Retiree_exist<0){
			$.dialog.alert('请填写退休人员所需材料！');
			return false;
		}

		//自由职业者
		var professionalscience = [],hasProfess=[], professionalscienceItem = $(".professionalscience .notice-item");
		if(professionalscienceItem.length > 0){
			professionalscienceItem.each(function(){
	    		var obj = $(this);
	    		var tit = obj.find(".label textarea").val();
	    		var con = obj.find(".dd textarea").val();
	    		if(tit && con){
	    			hasProfess.push('1');
	    			professionalscience.push(tit+"$$$"+con);
	    		}else{
	    			hasProfess.push('');
	    		}
	    	});
		}else{
			$.dialog.alert('请填写自由职业者所需材料！');
			return false;
		}

		var Profess_exist = $.inArray('1',hasProfess);
		if(Profess_exist<0){
			$.dialog.alert('请填写自由职业者所需材料！');
			return false;
		}

		//在校学生
		var studentsscience = [],hasStudent=[], studentsscienceItem = $(".studentsscience .notice-item");
		if(studentsscienceItem.length > 0){
			studentsscienceItem.each(function(){
	    		var obj = $(this);
	    		var tit = obj.find(".label textarea").val();
	    		var con = obj.find(".dd textarea").val();
	    		if(tit && con){
	    			hasStudent.push('1');
	    			studentsscience.push(tit+"$$$"+con);
	    		}else{
	    			hasStudent.push('');
	    		}
	    	});
		}else{
			$.dialog.alert('请填写在校学生所需材料！');
			return false;
		}

		var Student_exist = $.inArray('1',hasStudent);
		if(Student_exist<0){
			$.dialog.alert('请填写在校学生所需材料！');
			return false;
		}

		//学龄前儿童
		var childrenscience = [],hasChildren=[], childrenscienceItem = $(".childrenscience .notice-item");
		if(childrenscienceItem.length > 0){
			childrenscienceItem.each(function(){
	    		var obj = $(this);
	    		var tit = obj.find(".label textarea").val();
	    		var con = obj.find(".dd textarea").val();
	    		if(tit && con){
	    			hasChildren.push('1');
	    			childrenscience.push(tit+"$$$"+con);
	    		}else{
	    			hasChildren.push('');
	    		}
	    	});
		}else{
			$.dialog.alert('请填写学龄前儿童所需材料！');
			return false;
		}

		var Children_exist = $.inArray('1',hasChildren);
		if(Children_exist<0){
			$.dialog.alert('请填写学龄前儿童所需材料！');
			return false;
		}

		


		

		//购买须知
	    var routeList = [], noticeItem = $("#route .notice-item");
	    if(noticeItem.length > 0){
	    	noticeItem.each(function(){
	    		var obj = $(this);
	    		var tit = obj.find("input").val();
	    		var con = obj.find("textarea").val();
	    		routeList.push(tit+"$$$"+con);
	    	});
	    }
			
		var form = $("#fabuForm"), action = form.attr("action"),url=form.attr("data-url");
		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");
		var data = form.serialize() + "&processingflow="+routeList.join("|||") +"&incumbentsscience=" + incumbentsscience.join("|||") + "&retireescience="+retireescience.join("|||")+"&professionalscience="+professionalscience.join("|||")+"&childrenscience="+childrenscience.join("|||")+"&studentsscience="+studentsscience.join("|||") ;
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
