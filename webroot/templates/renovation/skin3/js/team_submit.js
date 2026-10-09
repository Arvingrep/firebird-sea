$(function(){

	//国际手机号获取
	  getNationalPhone();
	  function getNationalPhone(){
	      $.ajax({
	              url: "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
	              type: 'get',
	              dataType: 'JSONP',
	              success: function(data){
	                  if(data && data.state == 100){
	                     var phoneList = [], list = data.info;
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
	  $('.areaCode').bind('click', function(){
	    var par = $(this).closest('form');
	    var areaWrap =par.find('.areaCode_wrap');
	    if(areaWrap.is(':visible')){
	      areaWrap.fadeOut(300)
	    }else{
	      areaWrap.fadeIn(300);
	      return false;
	    }
	  });
	  //选择区号
	  $('.areaCode_wrap').delegate('li', 'click', function(){
	    var t = $(this), code = t.attr('data-code');
	    var par = t.closest('form');
	    var areaIcode = par.find(".areaCode");
	    areaIcode.find('i').html('+' + code);
	    par.find('.areaCodeinp').val(code);
	  });

	  $('body').bind('click', function(){
	    $('.areaCode_wrap').fadeOut(300);
	  });
	//表单验证
	$(".team_mask .team_submit").bind("click", function(){

		var f = $(this);
		var txt = f.text();
		var str = '',r = true;
		if(f.hasClass("disabled")) return false;
		var par = f.closest('.formCommon').find('form');
		var areaCodev = $.trim(par.find('.areaCodeinp').val());
		// 称呼
		var team_name = $('#team_name');
		var team_namev = $.trim(team_name.val());

		var type 		= $("#type").val();
		var userid 		= $("#userid").val();
		var resetype 	= $("#resetype").val();
		if(team_namev == '') {
			if (r) {
				team_name.focus();
				errmsg(team_name, langData['renovation'][14][45]);//请填写您的称呼
			}
			r = false;
		}
		// 手机号
		var team_phone = $('#team_phone')
		var team_phonev = $.trim(team_phone.val());
		if(team_phonev == '') {
			if (r) {
				team_phone.focus();
				errmsg(team_phone, langData['renovation'][12][0]);// 请输入手机号码
			}
			r = false;
		} 

		// 区域
		var addr1 = $('#addr111');
		if(addr1.val() == 0 || addr1.val() == "") {
			if (r) {
				errmsg(addr1, langData['renovation'][14][47]);//请选择区域
			}
			r = false;
		}
		// 街道
		var addr2 = $('#addr222');
      	if(!$('#addr111').hasClass('noSon')){ 
          if(addr2.val() == 0 || addr2.val() == "") {
              if (r) {
                  errmsg(addr2, langData['renovation'][14][48]);//请选择街道
              }
              r = false;
          }
        }

		// 小区
		var priceOrigin = $('#priceOrigin');
		var priceOriginv = $.trim(priceOrigin.val());
		if(priceOriginv == '') {
			if (r) {
				priceOrigin.focus();
				errmsg(priceOrigin, langData['renovation'][1][5]);//请填写您的小区
			}
			r = false;
		}

		if(!r) {
			return false;
		}		
		
		f.addClass("disabled").text(langData['renovation'][14][58]);//预约中...

		var data = [];
		data.push("community="+priceOriginv);
		data.push("people="+team_namev);
		data.push("type="+type);
		data.push("bid="+userid);
		if(type ==0){
				data.push("company="+userid);

		}
		data.push("resetype="+resetype);
		data.push("areaCode="+areaCodev);
		data.push("contact="+team_phonev);
      	if(!$('#addr111').hasClass('noSon')){ 
			data.push("addrid="+addr2.val());
        }else{
          	data.push("addrid="+addr1.val());
        }

		$.ajax({
			url: "/include/ajax.php?service=renovation&action=sendRese",
			data: data.join("&"),
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				f.removeClass("disabled").text(txt);//立即预约免费设计
				if(data && data.state == 100){
					$('.team_mask').hide()
					$('.team_mask2').show()
					
				}else{
					alert(data.info);
				}
			},
			error: function(){
				alert(langData['renovation'][14][90]);//预约失败，请重试！
				f.removeClass("disabled").text(txt);//立即预约免费设计
			}
		});

	})
	$('.team_mask .close_alert').click(function(){
		$('.team_mask').hide();
	})
	$('.team_mask2 .close_alert').click(function(){
		$('.team_mask2').hide();
	})
	$('.team_mask2 .t3').click(function(){
		$('.team_mask2').hide();
	})
	//数量错误提示
	var errmsgtime;
	function errmsg(div,str){
		$('#errmsg').remove();
		clearTimeout(errmsgtime);
		var top = div.offset().top - 33;
		var left = div.offset().left;

		var msgbox = '<div id="errmsg" style="position:absolute;top:' + top + 'px;left:' + left + 'px;height:30px;line-height:30px;text-align:center;color:#f76120;font-size:14px;display:none;z-index:99999;background:#fff;">' + str + '</div>';
		$('body').append(msgbox);
		$('#errmsg').fadeIn(300);
		errmsgtime = setTimeout(function(){
			$('#errmsg').fadeOut(300, function(){
				$('#errmsg').remove()
			});
		},2000);
	};


})
