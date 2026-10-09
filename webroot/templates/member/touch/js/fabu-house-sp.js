$(function(){
	//选择发布类别
	$('.fabu-category dd').bind('click',function(){
		$(this).addClass('on').siblings('dd').removeClass('on');
		$('#fabu-category').val($(this).data('id'));
		if($(this).data('id')=='1'){  //如果选择出售的话
			$('.transfer_box,.run_sp').hide();
			$('.rental_num').show();
			$('.rental_num label').text(langData['siteConfig'][40][13]);//售价
			$('.rental_num span').text(langData['siteConfig'][13][27] + echoCurrency('short'));//万元
			$('.rental_num input').val('');

			//出售状态
			$('.state_zu,.state_zhuan').removeClass('show');
			$('.state_shou').addClass('show');

		}else if($(this).data('id')=='2'){    //如果选择转让的话
			$('.transfer_box,.run_sp').show();
			$('.rental_num').hide();
			//转让状态
			$('.state_zu,.state_shou').removeClass('show');
			$('.state_zhuan').addClass('show');

		}else{                                   //如果选择出租的话
			$('.transfer_box,.run_sp').hide();
			$('.rental_num').show();
			$('.rental_num label').text(langData['siteConfig'][19][101]);//租金
			$('.rental_num span').text(echoCurrency('short')+'/'+langData['siteConfig'][40][45]);//元/月
			$('.rental_num input').val('');

			//出租状态
			$('.state_zhuan,.state_shou').removeClass('show');
			$('.state_zu').addClass('show');

		}
		//获取销售状态值
		var finalState = $('.spstate.show .chose_btn').find('a').data('id');
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

			var result_val = data.join('/')
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
			// $('#louceng').val(parseInt(data[2].replace(/[^0-9]/ig,""))).attr('data-id',(val1+'-'+val2));
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
		$('#wuye_in').val(value);
	});

	//出售状态
	$('.spstate .active').bind('click',function(){
		var value = $(this).find('a').data('id');
		$(this).addClass('chose_btn').siblings('.active').removeClass('chose_btn');
		$('#sellstate').val(value);
	});

	//获取经营类别数据
	var industry=[];
	if($('#industry').length>0){
		var len = $('#industry optgroup').length;
		for(var i=0; i<len; i++){
			var f = $('#industry optgroup').eq(i),len_l =f.find('option').length;
			var f_id = f.data('id'),f_name = f.attr('label');
			industry.push({
			  	id:f_id,
			  	value:f_name,
			  	childs:[]
			 });
			for(var n=0; n<len_l; n++){
				industry[i].childs.push({
					id:f.find('option').eq(n).val(),
					value:f.find('option').eq(n).text()
				})
			}
		}
	}
	//经营类别选择
	var run_category = new MobileSelect({
	    trigger: '.run_category',
	    title: langData['siteConfig'][26][39],//经营类别
	    wheels: [
	                {data: industry},

	            ],
	    position:[0, 0],
	    transitionEnd:function(indexArr, data){

	    },
	    callback:function(indexArr, data){
		  $('#curr_run').val(data[1].value).attr('data-id',data[1].id)
		  console.log(data[1])
	    }
	    ,triggerDisplayData:false,
	});
	//经营状态
	var run_if = new MobileSelect({
	    trigger: '#run_state',
	    title: langData['siteConfig'][31][27],//经营状态
	    wheels: [
	                {data: [{
	                	id:'1',
	                	value:langData['siteConfig'][31][28]//经营中
	                },{
	                	id:'2',
	                	value:langData['siteConfig'][31][29]//空置中
	                }]},

	            ],
	    position:[0],
	    callback:function(indexArr, data){
	    	console.log(data)
		  $('#run_state').val(data[0].value).attr('data-id',data[0].id)

	    }
	    ,triggerDisplayData:false,
	});
	//商铺类型选择
	 var sp_category = [],sp_categoryid=[];
	 if($('#protype option').length>0){
	 	var pro = $('#protype option');
	 	for(var i= 0; i<pro.length ;i++){
	 		sp_category.push(pro.eq(i).text());
	 		sp_categoryid.push(pro.eq(i).val());
	 	}
	 }
	 var Renovation = [],Renovationid=[];
	 if($('#zhuangxiu option').length>0){
	    for(var i= 0; i<$('#zhuangxiu option').length; i++){
			Renovation.push($('#zhuangxiu option').eq(i).text());
			Renovationid.push($('#zhuangxiu option').eq(i).val());
	    }
	 }
	 //付款方式的数据
	 var pay_way = [],pay_id=[];
	 if($('#paytype_ option').length>0){
	    for(var i= 0; i<$('#paytype_ option').length; i++){

	     		pay_way.push($('#paytype_ option').eq(i).text());
				pay_id.push($('#paytype_ option').eq(i).val())

	    }
	    console.log(pay_way)
	 }
	 var sp_category = new MobileSelect({
	    trigger: '.about_sp',
	    wheels: [
	                {data: sp_category},
	                {data: Renovation},
	                {data: pay_way}
	            ],
	    position:[0,0,0],
	    callback:function(indexArr, data){
		  for(var i=0; i<data.length; i++){
		  	if(i==0){
		  		$('#sp_category').val(data[i]).attr('data-id',sp_categoryid[indexArr[i]]);
		  	}else if(i==1){
		  		$('#zxiu').val(data[i]).attr('data-id',Renovationid[indexArr[i]]);
		  	}else{
		  		$('#pay_way').val(data[i]).attr('data-id',pay_id[indexArr[i]]);
		  	}
		  }
	    }
	    ,triggerDisplayData:false,
	});


	//配置设施选择
	//适合行业
	//商铺特色
	$('.checkbox dd').click(function(){
		var t = $(this), p = t.parent();
		if(p.data('count') != '0') return;
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

  var CommunityObj = $('.intell_data');  //地址列表

	 //小区模糊搜索
  $('#house_name').bind("input", function(){
//  $('#house_name').val('0');
    var title = $(this).val();
    $.ajax({
          url: masterDomain + '/include/ajax.php?service=house&action=checkLoupan&type=sp&title='+title,
          data: "keywords="+title,
          dataType: "jsonp",
          success: function (data) {
              if(data){
                  var list = data.info, addrList = [];
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


//数据提交
$('.sub_btn').bind('click',function(){
	var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;
	event.preventDefault();

	var lei = $('#fabu-category').val(),    //发布类别
		loupan =$('#house_chosed').val(),  //楼盘名
		loupanid = $('#houseid').val(),   //楼盘id
		addrid      = $("#addrid").val(),
		address = $('#detail_addr').val(), //详细地址
		// floor = $('#louceng').val(),     //楼层总数
		// bno = $('#louceng').data('id'), //出租楼层
		area = $('#space').val(),      //面积
		miankuan = $('#sp_w').val(),  //面宽
		jinshen =  $('#sp_d').val(), //进深
		cenggao = $('#sp_h').val(), //层高
		price = $('#price').val(),     //租金
		proprice = $('#wuye_price').val(), // 物业费
		wuye_in = $('#wuye_in').val(), //是否包含物业费
		protype = ($('#sp_category').data('id')==undefined)?'':($('#sp_category').data('id')), //商铺类型
		zhuangxiu = ($('#zxiu').data('id')==undefined)?'':($('#zxiu').data('id')), //装修情况
		paytype = ($('#pay_way').data('id')==undefined)?'':($('#pay_way').data('id')), //付款方式
		sp_config= $('#sp_config').val(), //商铺配置
		title = $('#house_title').val(), //房源标题
		person = $('#person').val(),  //用户姓名
		tel = $('#contact').val(),  //用户联系方式
		areaCode      = $('#areaCode').val(),  //国籍区号
		sex = $('#usersex').val(), //性别
		wx_tel = $('#wx_tel').val(),  //手机能否查找微信
		transfer_rentprice = $('#rent_price').val(), //转让租金
		transfer_price = $('#transfer_price').val(); //转让费用
		industry = ($('#curr_run').data('id')==undefined)?'':($('#curr_run').data('id')), //目前经营
		operating_state = ($('#run_state').data('id')==undefined)?'':($('#run_state').data('id')),//是否正在经营
		//以上为初始表单，以下为填写更多表单
		industry_for = $('#industry_for').val(), //适合行业
		flag = $('#sp_feature').val(), //商铺特色
		note =$('#note').val(),  //房源描述
	    qj_pics =$('#qj_pics').val(),  //全景图
	    qj_url = $('#qj_url').val(),
      qj_type = $('#qj_type').val(),
      vercode = $('#vercode').val(),
	    floor  = $('#floor').val(),  //楼层总数
	    bno	=  $('#bno').val(),  //出售的楼层
	    floortype = $('[name=floortype]:checked').val(),
	    sellstateTo = $('#sellstate').val(),//出售状态
	    floorspr = $('#floorspr').val()
	    ;
	    var cityid = 0;
	    var loupanCityid = parseInt($('#house_chosed').attr('data-cityid'));

	    if(loupanCityid){
	    	cityid = loupanCityid;
	    }else{
	    	var ids = $('.gz-addr-seladdr').attr('data-ids');
	    	if(ids){
	    		var idsArr = ids.split(' ');
	    		cityid = idsArr[0];
	    	}
	    }

		var price_ = price;
		if(lei == 2){
			price_ = transfer_rentprice;
		}

		var data= '&lei='+lei+'&loupan='+encodeURI(loupan)+'&loupanid='+loupanid+'&addrid='+addrid+'&address='+encodeURI(address)+'&floorval='+floor+'&bno='+bno+'&area='+area+'&miankuan='+miankuan+'&jinshen='+jinshen
		+'&cenggao='+cenggao+'&price='+price_+'&proprice='+proprice+'&wuye_in='+wuye_in+'&protype='+protype+'&zhuangxiu='+zhuangxiu+'&paytype='+paytype
		+'&config='+sp_config+'&title='+encodeURI(title)+'&person='+encodeURI(person)+'&tel='+tel+'&areaCode='+areaCode+'&sex='+sex+'&wx_tel='+wx_tel
		+'&transfer='+transfer_price+'&industry='+industry+'&operating_state='+operating_state+'&suitable='+industry_for+'&flag='+flag
		+'&note='+encodeURI(note)+'&qj_pics='+qj_pics+'&qj_url='+qj_url+'&qj_type='+qj_type
		+'&vercode='+vercode
		+'&floortype='+floortype+'&floorspr='+floorspr
		+'&sellstate='+sellstateTo
    +'&lnglat='+$('#addr_lnglat').val()
		;

		if(lei == 2 && (industry == "" || industry == undefined)){
	       showMsg(langData['siteConfig'][20][361]);    //经营类型
	       tj = false;
		}else if(lei == 2&&(transfer_rentprice==''||transfer_rentprice==undefined)){
			showMsg(langData['siteConfig'][44][84]);// 请填写价格
	        tj = false;

		}else if(lei == 2&&(transfer_price==''||transfer_price==undefined)){
		   showMsg(langData['siteConfig'][44][85]);// 请填写转让费用
	       tj = false;
		}else if($('#fileList li.thumbnail').length<=0){
			showMsg(langData['siteConfig'][44][78]); //   请至少上传一张图片
	       tj = false;
		}else if(loupan == "" ||loupan == undefined) {
	       showMsg(langData['siteConfig'][20][350]);
	       tj = false;
	    }else if(!loupanid && (addrid == 0 || addrid == "") ){
	       showMsg(langData['siteConfig'][20][359]);
	       tj = false;
	    }else if(!loupanid && address == ""){
	       showMsg(langData['siteConfig'][20][360]);
	       tj = false;
	    }else if(area == "" || area == undefined){
	      showMsg(langData['siteConfig'][20][352]);
	      tj = false;
		}else if(lei != 2&&(price== "" || price== undefined)){
	      showMsg(langData['siteConfig'][20][328]);
	      tj = false;
		}else if(proprice == "" || proprice == undefined){
		      showMsg(langData['siteConfig'][20][338]);
		      tj = false;
		}else if(title == "" || title==undefined){
	       showMsg(langData['siteConfig'][20][343]);
	       tj = false;
		}else if(person == "" || person == 0){
		      showMsg(langData['siteConfig'][20][345]);
		      tj = false;

		}else if(tel == "" || tel == 0){
		      showMsg(langData['siteConfig'][20][239]);
		      tj = false;
		}

		if(!tj) return;

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

})






})
