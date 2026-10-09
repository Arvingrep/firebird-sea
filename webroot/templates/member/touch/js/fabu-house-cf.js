$(function(){
	//发布类别选择
	$('.fabu-category dd').bind('click',function(){
		$(this).addClass('on').siblings('dd').removeClass('on');
		$('#fabu_category').val($(this).data('id'));
		$('#sellstate').val('');//清空出售状态值
		if($(this).data('id')=='2'){
			$('.rental_box label').text(langData['siteConfig'][40][13]);//售价
			$('.rental_box span').text(langData['siteConfig'][13][27] + echoCurrency('short'));//万元
			$('.transfer_box,.sale_none').hide();
			//出售状态
			$('.state_zu,.state_zhuan').removeClass('show');
			$('.state_shou').addClass('show');

		}else if($(this).data('id')=='1'){

			$('.transfer_box,.sale_none').show();
			//转让状态
			$('.state_zu,.state_shou').removeClass('show');
			$('.state_zhuan').addClass('show');
		}else{
			$('.rental_box label').text(langData['siteConfig'][19][101]);//租金
			$('.rental_box span').text(echoCurrency('short')+'/'+langData['siteConfig'][40][45]);//元/月
			$('.sale_none').show();
			$('.transfer_box').hide();
			//出租状态
			$('.state_zhuan,.state_shou').removeClass('show');
			$('.state_zu').addClass('show');
		}
		//获取销售状态值
		var finalState = $('.cfstate.show .chose_btn').find('a').data('id');
		$('#sellstate').val(finalState);
	});
	//房间类型
	$('.room-category dd').bind('click',function(){
		$(this).addClass('on').siblings('dd').removeClass('on');
		$('#room_category').val($(this).data('id'));
		if($(this).text()==langData['siteConfig'][44][70]){//土地
			$('.space_box,.loucen_chose').hide();
			$('.for_land').show();

		}else{
			$('.space_box,.loucen_chose').show();
			$('.for_land').hide();
		}
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
			$('.result_val').text(result_val)
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

	//是否包含物业
	$('.pricein_wuye .active').bind('click',function(){
		$(this).addClass('chose_btn').siblings('.active').removeClass('chose_btn');
		$('#wuye_in').val($(this).find('a').data('id'));
	});
	//出售状态
	$('.cfstate .active').bind('click',function(){
		var value = $(this).find('a').data('id');
		$(this).addClass('chose_btn').siblings('.active').removeClass('chose_btn');
		$('#sellstate').val(value);
	});
	 //付款方式的数据
	 var pay_way = [],pay_id=[];
	 if($('#paytype_ option').length>0){
	    for(var i= 0; i<$('#paytype_ option').length; i++){

	     		pay_way.push($('#paytype_ option').eq(i).text());
				pay_id.push($('#paytype_ option').eq(i).val())

	    }
	    console.log(pay_way)
	 }
	 var paytype = new MobileSelect({
	    trigger: '.pay_box',
	    title:langData['siteConfig'][19][52],//付款方式
	    wheels: [

	                {data: pay_way}
	            ],
	    position:[0],
	    callback:function(indexArr, data){
//	    	console.log(indexArr)
		  $('#payway_type').val(data);
		  $('#payway_type').attr('data-id',pay_id[indexArr]);
	    }
	    ,triggerDisplayData:false,
	});


	//数据提交
	$('.sub_btn').bind('click',function(event){
		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;
		event.preventDefault();
		var t = $(this);
		if(t.hasClass('disabled')) return;

	var lei = $('#fabu_category').val(),    //发布类别
		protype = $('#room_category').val(), //厂房类型
		loupan =$('#house_chosed').val(),  //厂房位置
		addrid = $("#addrid").val(),
		address = $('#detail_addr').val(), //详细地址
		lnglat = $('#addr_lnglat').val(),  //经纬度
		floor = $('#floor').val(),     //楼层总数
		bno = $('#bno').val(),     //楼层总数
		cenggao = $('#floor_height').val(),//层高
		mintime = $('#rent_time').val(), //起租期
		tu_area = $('#tudi_space').val(),      //土地面积
		cf_area = $('#cf_space').val(),  //厂房面积
		price = $('#price').val(),     //租金
		paytype = ($('#payway_type').data('id')==undefined)?'':($('#payway_type').data('id')), //付款方式
		transfer = $('#transfer_price').val(), //转让费
		title = $('#house_title').val(), //房源标题
		person = $('#person').val(),  //用户姓名
		tel = $('#contact').val(),  //用户联系方式
		areaCode      = $('#areaCode').val(), //国籍区号
		sex = $('#usersex').val(), //性别
		wx_tel = $('#wx_tel').val(), //手机即微信
		//以上为初始表单，以下为填写更多表单
		note =$('#note').val(),  //房源描述
	    qj_pics =$('#qj_pics').val(), //全景图
	    qj_url = $('#qj_url').val(),
      	vercode = $('#vercode').val(),
      	qj_type = $('#qj_type').val(),
		floortype = $('[name=floortype]:checked').val(),
		sellstateTo = $('#sellstate').val(),//出售状态
		floorspr = $('#floorspr').val();

		if($('.sub_btn').hasClass("disabled")) return;

		else if($('#fileList li.thumbnail').length<=0){
	      showMsg(langData['siteConfig'][20][357]);
	      tj = false;
		}else if(addrid == 0 || addrid == ""){
	      showMsg(langData['siteConfig'][20][365]);
	      tj = false;
		}else if(address == ""){
	      showMsg(langData['siteConfig'][20][366]);
	      tj = false;
		} else if($('.room-category .on').text()==langData['siteConfig'][44][70]&&(tu_area == "" || tu_area == 0)){
	      showMsg(langData['siteConfig'][20][352]);
	      tj = false;
		}else if($('.room-category .on').text() !=langData['siteConfig'][44][70] &&(cf_area == "" || cf_area == 0)){
	      showMsg(langData['siteConfig'][20][352]);
	      tj = false;
		}else if(price == ""){
	      showMsg(langData['siteConfig'][20][328]);
	      tj = false;
		}else if(title == "" || title == 0){
	      showMsg(langData['siteConfig'][20][343]);
	      tj = false;
		}else if(person == "" || person == 0){
	      showMsg(langData['siteConfig'][20][345]);
	      tj = false;

	   }else if(tel == "" || tel == 0){
	      showMsg(langData['siteConfig'][20][345]);
	      tj = false;

	    }

	  if(!tj) return;

    //cityid
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

		var area = $('.room-category .on').text() == langData['siteConfig'][44][70] ? tu_area : cf_area;//土地

		var data='&lei='+lei+'&protype='+protype+'&addrid='+addrid+'&address='+encodeURI(address)+'&lnglat='+lnglat+'&floorval='+floor+'&bno='+bno
		+'&cenggao='+cenggao+'&mintime='+mintime+'&price='+price+'&paytype='+paytype+'&transfer='+transfer
		+'&title='+encodeURI(title)+'&person='+encodeURI(person)+'&tel='+tel+'&areaCode='+areaCode+'&sex='+sex+'&wx_tel='+wx_tel+'&note='+encodeURI(note)+'&qj_pics='+qj_pics+'&qj_url='+qj_url+'&qj_type='+qj_type
		+'&proprice='+$('#wuye_price').val()
		+'&floortype='+floortype+'&floorspr='+floorspr
		+'&area='+area
		+'&wuye_in='+$('#wuye_in').val()
		+'&sellstate='+sellstateTo
        +'&vercode='+vercode
		;

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
		    if(videolist){}
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
	          console.log(data.info+'-+-')
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
