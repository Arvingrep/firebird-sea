$(function(){
	//发布类别选择
	$('.fabu-category dd').bind('click',function(){
		$(this).addClass('on').siblings('dd').removeClass('on');
		$('#fabu-category').val($(this).data('id'));


		if($(this).data('id')=='0'){

			$('.rental_num label').text(langData['siteConfig'][19][101]);//租金
			$('.rental_num span').html(echoCurrency('short')+'/'+echoCurrency('areasymbol')+'·'+langData['siteConfig'][40][45]);//元/月

			//出租状态
			$('.state_zu').addClass('show');
			$('.state_shou').removeClass('show');
		}else{
			$('.rental_num label').text(langData['siteConfig'][40][13]);//售价
			$('.rental_num span').text(langData['siteConfig'][13][27] + echoCurrency('short'));//万元
			//出售状态
			$('.state_zu').removeClass('show');
			$('.state_shou').addClass('show');
		}
		//获取销售状态值
		var finalState = $('.xzlstate.show .chose_btn').find('a').data('id');
		$('#sellstate').val(finalState);
	});


	//楼层选择
	$('.loucen_chose .active').click(function(){
		$(this).addClass('chose_btn').siblings('.active').removeClass('chose_btn');
	});
	var numfloor = [],countfloor = [],startfloor = [],endfloor=[];
	for(var i=1; i<201;i++){
		numfloor.push(langData['siteConfig'][44][71].replace('1',i));//第1层
		startfloor.push(langData['siteConfig'][44][71].replace('1',i));//第1层
		endfloor.push(langData['siteConfig'][44][71].replace('1',i));//第1层
		countfloor.push(langData['siteConfig'][44][72].replace('1',i))//共1层
	}

	//单层选择
	var sigfloorSelect = new MobileSelect({
	    trigger: '.sig-build',
	    title: langData['siteConfig'][44][73],//单层选择
	    wheels: [
	                {data: numfloor},
	                {data: countfloor},
	            ],
	    position:[0, 0],
	    transitionEnd:function(indexArr, data){
	      		if(indexArr[0]>indexArr[1]){
					sigfloorSelect.locatePosition(1,indexArr[0])
				}
	    },
	    callback:function(indexArr, data){

			var result_val = data.join('/');
			$('.result_val').text(result_val);
			// $('#louceng').val(parseInt(data[1].replace(/[^0-9]/ig,""))).attr('data-id',parseInt(data[0].replace(/[^0-9]/ig,"")));
			$('#bno').val(parseInt(data[0].replace(/[^0-9]/ig,"")));
				$('#floorspr').val(0);
				$('#floor').val(parseInt(data[1].replace(/[^0-9]/ig,"")));
	    }
	    ,triggerDisplayData:false,
	});

	//跃层选择
	var multfloorSelect = new MobileSelect({
	    trigger: '.mul-build',
	    title: langData['siteConfig'][44][74],//跃层选择
	    wheels: [
	    			{data: startfloor},
	                {data: endfloor},
	                {data: countfloor},
	            ],
	    position:[0, 0],
	    transitionEnd:function(indexArr, data){
//	       console.log(indexArr);

	       if(indexArr[0]>indexArr[1]&&indexArr[0]>indexArr[2]){
	       	  multfloorSelect.locatePosition(1,indexArr[0]);
	       	  multfloorSelect.locatePosition(2,indexArr[0]);
	       }else if(indexArr[0]>indexArr[1]){
	       		multfloorSelect.locatePosition(1,indexArr[0]);
	       }else if(indexArr[0]>indexArr[2]){
	       	 	multfloorSelect.locatePosition(2,indexArr[0]);
	       }else if(indexArr[1]>indexArr[2]){
	       		multfloorSelect.locatePosition(2,indexArr[1]);
	       }

	    },
	    callback:function(indexArr, data){

	    	var val1 = parseInt(data[0].replace(/[^0-9]/ig,""));
	    	var val2 = parseInt(data[1].replace(/[^0-9]/ig,""))
	        var result_val = val1+'-'+val2+langData['siteConfig'][13][12]+'/'+data[2];//层
				$('.result_val').text(result_val);
				$('#bno').val(val1);
				$('#floorspr').val(val2);
				$('#floor').val(parseInt(data[2].replace(/[^0-9]/ig,"")));
	    }
	    ,triggerDisplayData:false,
	});

	//物业费是否包含
	$('.pricein_wuye .active').bind('click',function(){
		var value = $(this).find('a').data('id');
		$(this).addClass('chose_btn').siblings('.active').removeClass('chose_btn');
		$('#wuye_in').val(value)
	});

	//是否可分割
	$('.fenge .active').bind('click',function(){
		var value = $(this).find('a').data('id');
		$(this).addClass('chose_btn').siblings('.active').removeClass('chose_btn');
		$('#fenge_if').val(value);
	});

	//状态
	$('.xzlstate .active').bind('click',function(){
		var value = $(this).find('a').data('id');
		$(this).addClass('chose_btn').siblings('.active').removeClass('chose_btn');
		$('#sellstate').val(value);

	});



	//物业类型
	var wuye_protype = [],wuye_protypeid = [];
	if($('#protype option').length>0){
		for(var i=0; i<$('#protype option').length;i++){
			wuye_protype.push($('#protype option').eq(i).text());
			wuye_protypeid.push($('#protype option').eq(i).val());
		}
	};
	//装修情况
	 var Renovation = [],Renovationid=[];
	 if($('#zhuangxiu option').length>0){
	    for(var i= 0; i<$('#zhuangxiu option').length; i++){
			Renovation.push($('#zhuangxiu option').eq(i).text());
			Renovationid.push($('#zhuangxiu option').eq(i).val());
	    }
	 }
	// 等级
	var level=['A级','B级','C级'];

	var abouthouse = new MobileSelect({
	    trigger: '.about_house',
	    title: langData['siteConfig'][7][2],//请选择
	    wheels: [
	                {data: wuye_protype},
	                {data: Renovation},
	                {data: level}
	            ],
	    position:[0, 0],

	    callback:function(indexArr, data){
			$('#wuye_protype').val(data[0]).attr('data-id',wuye_protypeid[indexArr[0]]);
			$('#zxiu').val(data[1]).attr('data-id',Renovationid[indexArr[1]]);
			$('#level').val(data[2]).attr('data-id',indexArr[2]+1);
	    }
	    ,triggerDisplayData:false,
	});

	//写字楼特色
	$('.xzl_feature dd').bind('click',function(){
		var t = $(this), p = t.parent();
		t.toggleClass('on');
		var r = [];
		p.children('dd').each(function(){
			var d = $(this), id = d.data('id');
			if($(this).hasClass('on')){
				r.push(id);
			}
		})
		p.children('input').val(r.join(","));

	});
	//配套设施
	$('.conf dd').bind('click',function(){
		var t = $(this), p = t.parent();
		t.toggleClass('on');
		var r = [];
		p.children('dd').each(function(){
			var d = $(this), id = d.data('id');
			if($(this).hasClass('on')){
				r.push(id);
			}
		})
		p.children('input').val(r.join(","));
	})

//写字楼模糊搜索

var CommunityObj = $('.intell_data');  //地址列表
  $('#house_name').bind("input", function(){
//  $('#house_name').val('0');
    var title = $(this).val();
    $.ajax({
          url:  masterDomain + '/include/ajax.php?service=house&action=checkLoupan&type=xzl&title='+title,
          data: "keywords="+title,
          dataType: "jsonp",
          success: function (data) {
              if(data){
                  var list = data.info.list, addrList = [];
                  if(data.state == 100 && list.length > 0){

                      for (var i = 0, addr, contact; i < list.length; i++) {
                          addr = list[i];
                          addrList.push('<li class="intell_data_li" data-id="'+list[i].id+'" data-cityid="'+list[i].cityid+'"><p><span>'+list[i].title+'</span><a href="javascript:;">附近</a></p></li>');
                      }
                      CommunityObj.html(addrList.join(""));

                      $('.intell_data').show();
                      $(".chose_house").hide();
                      $('.search_tips').text(langData['siteConfig'][6][209]);//您可以直接选择，智能识别区域与位置

                  }else{
                      if(list && list.length == 0){
                          CommunityObj.html('<div class="empty">'+langData['siteConfig'][20][349]+'</empty>');
                      }else{
                          CommunityObj.html('<div class="empty">'+data.info+'</empty>');
                      }

                      $('.intell_data').hide();
                      $(".chose_house").show();
                      $('.search_tips').text(langData['siteConfig'][44][83])//暂未找到相关小区，如确认选择该小区，可手动录入区域和位置
                  }

              }else{
                  CommunityObj.html('<div class="empty">'+langData['siteConfig'][20][228]+'</empty>');

                    $('.intell_data').hide();
                    $(".community-addr").show();
              }
          },
          error: function(){
              CommunityObj.html('<div class="empty">'+langData['siteConfig'][20][227]+'</empty>');

                $('.intell_data').hide();
                $(".chose_house").show();
          }
      });


  })

  //点击模糊匹配的信息时
  $('.intell_data').delegate('.intell_data_li', 'click', function(){
  	var name2 = $('#house_chosed').val(),str = $('#house_title').val();
    var t = $(this), val = t.find('span').text(), id = t.attr('data-id'), cityid = t.attr('data-cityid');
//  $('.detail_house .tip span').text(val);
    $('#house_name,#house_chosed').attr('data-cityid', cityid);
    $('#house_name,#house_chosed').val(val);
    $('#houseid').val(id);
    $('.page.gz-address').hide().siblings('.page.input_info').show();
    //选择的小区名整合到标题中

    var house_name = val;
		if($('#house_title').val()!=''){
			if(house_name != name2){
				$('#house_title').val(str.replace(name2,house_name)) ;
			}
		}else{
			$('#house_title').val(val);
		}

  });


   $(".search_btn").bind("click", function(){
    var communityTitle = $.trim($('#house_name').val());
		if(communityTitle != ''){
			$.ajax({
				url: "/include/ajax.php?service=house&action=communityList&allcity=1&keywords="+communityTitle,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100 && data.info.list.length > 0){
						var list = data.info.list;
						for (var i = 0; i < list.length; i++) {
							if(list[i].title == communityTitle){
								$('#house_chosed').attr('data-cityid', list[i].cityid);
								$('#houseid').val(list[i].id);
							}
						}
					}
				}
			});
		}
  });
//国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.layer_list ul').append(phoneList.join(''));
                }else{
                   $('.layer_list ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.layer_list ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer_code').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        $(".areacode_span label").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

//数据提交
$('.sub_btn').bind('click',function(){
	var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;
	event.preventDefault();

	var lei = $('#fabu-category').val(),    //发布类别
		loupan =$('#house_chosed').val(),  //楼盘名
		loupanid = $('#houseid').val(),   //楼盘id
		addrid = $("#addrid").val(),
		address = $('#detail_addr').val(), //详细地址
    	floor  = $('#floor').val(),  //楼层总数
    	bno	= $('#bno').val(),  //出租的楼层
		area = $('#space').val(),      //面积
		price = $('#price').val(),     //租金
		proprice = $('#wuye_price').val(), // 物业费
		wuye_in = $('#wuye_in').val(), //是否包含物业费
		protype = ($('#wuye_protype').data('id')==undefined)?'':($('#wuye_protype').data('id')), //物业类型
		zhuangxiu = ($('#zxiu').data('id')==undefined)?'':($('#zxiu').data('id')), //装修情况
		level = ($('#level').data('id')==undefined)?'':($('#level').data('id')), //等级
		xzl_config= $('#xzl_config').val(), //商铺配置
		title = $('#house_title').val(), //房源标题
		person = $('#person').val(),  //用户姓名
		tel = $('#contact').val(),  //用户联系方式
		areaCode      = $('#areaCode').val(),  //国籍区号
		sex = $('#usersex').val(), //性别
		wx_tel = $('#wx_tel').val(), //手机即微信
		//以上为初始表单，以下为填写更多表单
		xzl_feature = $('#xzl_feature').val(),//商铺特色
		note =$('#note').val(),  //房源描述
	    qj_pics =$('#qj_pics').val(), //全景图
	    qj_url = $('#qj_url').val(),
      	qj_type = $('#qj_type').val();

	    floortype = $('[name=floortype]:checked').val(),
	    sellstateTo = $('#sellstate').val(),//出售状态
	    floorspr = $('#floorspr').val()
      	vercode = $('#vercode').val();



	    if($('#fileList li.thumbnail').length<=0){
	      showMsg(langData['siteConfig'][20][357]);
	      tj = false;
		}else if(loupan == "") {
	      showMsg(langData['siteConfig'][20][350]);
	      tj = false;
	    }else if(!loupanid && (addrid == 0 || addrid == "") ){
	      showMsg(langData['siteConfig'][20][359]);
	      tj = false;
		}else if(!loupanid && address == ""){
	      showMsg(langData['siteConfig'][20][360]);
	      tj = false;
		}else if(area == "" || area == 0){
	      showMsg(langData['siteConfig'][20][352]);
	      tj = false;
		}else if(price == ""){
	      showMsg(langData['siteConfig'][20][328]);
	      tj = false;
		}else if(proprice == ""){
	      showMsg(langData['siteConfig'][20][338]);
	      tj = false;
		} else if(title== "" || title == 0){
	      showMsg(langData['siteConfig'][20][343]);
	      tj = false;
		}else if(person == "" || person == 0){
	      showMsg(langData['siteConfig'][20][345]);
	      tj = false;

	    } else if(tel == "" || tel == 0){
	      showMsg(langData['siteConfig'][20][239]);
	      tj = false;
	    }

	    if(!tj) return;
	    var data='&lei='+lei+'&loupan='+encodeURI(loupan)+'&loupanid='+loupanid+'&addrid='+addrid+'&address='+encodeURI(address)+'&floorval='+floor+'&bno='+bno+'&area='+area
	    +'&price='+price+'&proprice='+proprice+'&wuye_in='+wuye_in+'&protype='+protype+'&zhuangxiu='+zhuangxiu+'&level='+level
			+'&peitao='+xzl_config+'&title='+encodeURI(title)+'&person='+encodeURI(person)+'&tel='+tel+'&areaCode='+areaCode+'&sex='+sex+'&wx_tel='+wx_tel
			+'&config='+xzl_feature+'&note='+encodeURI(note)+'&qj_pics='+qj_pics+'&qj_url='+qj_url+'&qj_type='+qj_type
			+'&vercode='+vercode
			+'&floortype='+floortype+'&floorspr='+floorspr
	    +'&lnglat='+$('#addr_lnglat').val()
	    +'&fg='+$('#fenge_if').val()
	    +'&sellstate='+sellstateTo
		;

		var cityid = 0;
		var communityCityid = parseInt($('#house_chosed').attr('data-cityid'));

		if(communityCityid){
			cityid = communityCityid;
		}else{
			var ids = $('.gz-addr-seladdr').attr('data-ids');
			if(ids){
				var idsArr = ids.split(' ');
				cityid = idsArr[0];
			}
		}

		//获取图片的
	   	var imgli = $('#fileList li.thumbnail'), imglist = [];
	   	var n = 0;
	   	imgli.each(function(index){
		    var t = $(this), val = t.find("img").attr("data-val"), des = t.find("img").attr("data-des");
	    	if(val != ''){
	    		if(n == 0){
	    			data += '&litpic='+val;
	    		}else{
		        	imglist.push(val+"|"+(des ? des : ''));
		        }
		        n++;
		    }
	    });
	    if(imglist){}
	    data += "&imglist="+imglist.join(",");

	    //获取视频的
	    var videoli = $('.video_li'), videolist =[];
	    videoli.each(function(index){
	      var t = $(this), val = t.find("video").attr("data-url");
	      if(val != ''){
            videolist.push(val);
	      }
	    });
	    data += "&video="+videolist.join(",");

	    $('.sub_btn').addClass("disabled").html(langData['siteConfig'][6][35]+"...");

	    $.ajax({
        url: action,
        data: data + "&cityid="+cityid,
        type: "POST",
        dataType: "json",
        success: function (data) {
            if(data && data.state == 100){

            	fabuPay.check(data, url, $('.sub_btn'));

            }else{
            	alert(data.info);
            	$('.sub_btn').removeClass("disabled").html(langData['siteConfig'][11][19]);
            }
        },
        error: function(){
            alert(langData['siteConfig'][20][183]);
            $('.sub_btn').removeClass("disabled").html(langData['siteConfig'][11][19]);
        }
      });

});



})
