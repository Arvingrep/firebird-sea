$(function(){
	//发布类别选择
	$('.fabu_category dd').bind('click',function(){
		$(this).addClass('on').siblings('dd').removeClass('on');
		$('#fabu_category').val($(this).data('id'));

		if($(this).data('id')=='1'){
			
			$('.rental_box label').text(langData['siteConfig'][40][13]);//售价
			$('.rental_box span').text(langData['siteConfig'][13][27] + echoCurrency('short'));//万元
			$('.transfer_box,.sale_none').hide();
			//出售状态
			$('.state_zu,.state_zhuan').removeClass('show');
			$('.state_shou').addClass('show');
			
		}else if($(this).data('id')=='2'){
			$('.rental_box label').text(langData['siteConfig'][19][101]);//租金
			$('.rental_box span').text(echoCurrency('short')+'/'+langData['siteConfig'][40][45]);//元/月
			$('.transfer_box,.sale_none').show();
			//转让状态
			$('.state_zu,.state_shou').removeClass('show');
			$('.state_zhuan').addClass('show');
		}else{
			$('.rental_box label').text(langData['siteConfig'][19][101]);//租金
			$('.rental_box span').text(echoCurrency('short')+'/'+langData['siteConfig'][40][45]);//元/月
			$('.transfer_box').hide();
			$('.sale_none').show();
			//出租状态
			$('.state_zhuan,.state_shou').removeClass('show');
			$('.state_zu').addClass('show');
		}
		//获取销售状态值
		var finalState = $('.cwstate.show .chose_btn').find('a').data('id');
		$('#sellstate').val(finalState);
	});
	
	
	//是否包含物业
	$('.pricein_wuye .active').bind('click',function(){
		$(this).addClass('chose_btn').siblings('.active').removeClass('chose_btn');
		$('#wuye_in').val($(this).find('a').data('id'));
	});
	//出售状态
	$('.cwstate .active').bind('click',function(){
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
		 $('#payway_type').val(data).attr('data-id',pay_id[indexArr]);
		 
	    }
	    ,triggerDisplayData:false,
	});
	$('.sub_btn').bind('click',function(){
		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;
		event.preventDefault();
		var t = $(this);
		if(t.hasClass('disabled')) return;
		
	var lei = $('#fabu_category').val(),    //发布类别
		community =$('#house_chosed').val(),  //厂房位置
		communityid = $('#houseid').val(),
		addrid = $("#addrid").val(),
		address = $('#detail_addr').val(), //详细地址
		lnglat = $('#addr_lnglat').val(),  //经纬度
		mintime = $('#rent_time').val(), //起租期
		area = $('#space').val(),      //面积
		price = $('#price').val(),     //租金
		paytype = ($('#payway_type').data('id')==undefined)?'':($('#payway_type').data('id')), //付款方式
		transfer = $('#transfer_price').val(), //转让费
		title = $('#house_title').val(), //房源标题
		person = $('#person').val(),  //用户姓名
		tel = $('#contact').val(),  //用户联系方式
		areaCode      = $('#areaCode').val(),  //国籍区号
		sex = $('#usersex').val(), //性别
		wx_tel = $('#wx_tel').val(), //手机即微信
		wuye_in = $('#wuye_in').val(),
		//以上为初始表单，以下为填写更多表单
		note =$('#note').val(),  //房源描述
	    qj_pics =$('#qj_pics').val(), //全景图
	    qj_url = $('#qj_url').val(), 
	    sellstateTo = $('#sellstate').val(),//出售状态
		vercode = $('#vercode').val();
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
		if (community == "") {
	      showMsg(langData['siteConfig'][20][350]);
	      tj = false;
	    }
	    else if(community != "" && (communityid == 0 || communityid == "") && address == ""){
	      showMsg(langData['siteConfig'][20][351]);
	      tj = false;
			}
	    else if(community != "" && (communityid == 0 || communityid == "") && addrid == 0){
	      showMsg(langData['siteConfig'][20][344]);
	      tj = false;
			}
	    else if(area == "" || area== 0){
	      showMsg(langData['siteConfig'][20][352]);
	      tj = false;
			}
	    else if(price == "" || price == 0){
	      // showMsg(langData['siteConfig'][20][364]);
	      // tj = false;
			}
	    else if(title== "" || title == 0){
	      showMsg(langData['siteConfig'][20][343]);
	      tj = false;
			}
	    else if($('#fileList li.thumbnail').length<0){
	      showMsg(langData['siteConfig'][20][357]);
	      tj = false;
			}
	    else if(person == "" || person == 0){
	      showMsg(langData['siteConfig'][20][345]);
	      tj = false;
	      return false;
	    }
	    
	    else if(tel == "" || tel== 0){
	      showMsg(langData['siteConfig'][20][239]);
	      tj = false;
	    }
	    if(!tj) return;
		var data = '&lei='+lei+'&community='+encodeURI(community)+'&communityid='+communityid+'&addrid='+addrid+'&address='+encodeURI(address)+'&lnglat='+lnglat
		+'&mintime='+mintime+'&area='+area+'&price='+price+'&paytype='+paytype+'&transfer='+transfer+'&title='+encodeURI(title)
		+'&person='+encodeURI(person)+'&tel='+tel+'&areaCode='+areaCode+'&sex='+sex+'&wx_tel='+wx_tel+'&note='+encodeURI(note)+'&qj_pics='+qj_pics+'&qj_url='+qj_url
		+'&wuye_in='+wuye_in
        +'&vercode='+vercode
        +'&sellstate='+sellstateTo
		+'&proprice='+$('#wuye_price').val();
      	
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
		 console.log(data)
		 $.ajax({
		   url: action,
		   data: data + "&cityid="+cityid+'&vercode='+vercode,
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
	});
	
});
