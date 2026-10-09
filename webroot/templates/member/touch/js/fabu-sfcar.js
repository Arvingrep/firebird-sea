var citys = []; //分站列表
var addridsArr = [];
var addrArr = []
$(function(){

	
	//获取url中的参数
    function getUrlParam(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if ( r != null ){
         return decodeURI(r[2]);
      }else{
         return null;
      }
    }
    var timeFlag = langData['sfcar'][2][39];//不选择
	//身份切换
	$('.tab-ul li').bind('click',function(){
		if(doEdit ==1){
			return false;
		}
		timeFlag = langData['sfcar'][2][39];//不选择
		clockSelect.cancelBtn.innerHTML = timeFlag;
		var t = $(this);
		t.addClass('active').siblings().removeClass('active');
		$('.daychose').removeClass('checked');
		$('#more_date').removeClass('hastime').show().val('');
		$('.startTime .timeStart s.s1').hide()
		$('.timeStart input.clock').css('width','45%').hide().val('').attr('placeholder',langData['sfcar'][0][44])//时间（选填）
		var thisType = t.attr('data-type');
		if(t.parent('ul').hasClass('on')){
			t.parent('ul').removeClass('on');
			$('.daychose').show();
		}else{
			t.parent('ul').addClass('on');
			$('.daychose').hide();
		}
		checkUse();

	})
	
	//用途
	$('#yongtu').val($('.zs_btn li.curr').attr('data-type'));
	$('.use .zs_btn').bind('click',function(){
		var t = $(this);
		t.toggleClass('click');
		t.find('li').toggleClass('curr');
		checkUse()
		
	})
	tagList(tagId);
	function tagList(id){
		$('.tag-alert ul').html('')
		$.ajax({
            url: "/include/ajax.php?service=sfcar&action=item&type="+id,
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var tagList = [], list = data.info;
                   for(var i=0; i<list.length; i++){
                       tagList.push('<li data-id="'+list[i].id+'">'+list[i].typename+'</li>'); 
                   }
                  	$('.tag-alert ul').html(tagList.join(''));
                }
            }

        })

        
	}
	
		
		
	
	var yongtu = tagId;
	function checkUse(){
		var useType = $('.zs_btn li.curr').attr('data-type');//车的用途
		var userType  = $('.tab-ul li.active').attr('data-type');//用车人的身份
		$('#yongtu').val(useType);
		$('.tag-alert li').removeClass('checked');
		if(doEdit==0){//发布时
			$('.chose-tag').html('');
            
		}	
      	$('.tag-div .com-input').attr('placeholder',langData['sfcar'][0][49]);//请选择标签
		$('.chose-tag').hide();
		tagNum()
		//用车 载人
		if(userType == '0'){//乘客
			if(useType == '0'){//找车载人
				yongtu = 1;
				$('.people').show();
				$('.peopleNum').attr('placeholder',langData['sfcar'][0][4]);//请填写乘坐人数
				$('.people span').text('('+langData['siteConfig'][13][32]+')');//人
				$('.carType-div').hide();
				tagList(1)
              	if(tagId ==1 && $('.chose-tag').hasClass('hasTag')){//tag标签有内容 并且是编辑此状态
                  $('.chose-tag').show();
                  $('.tag-div .com-input').attr('placeholder','');//
                }
			}else{//找车载货
				yongtu = 2;
				$('.people').hide();
				$('.carType-div').hide();
				tagList(2)
              	if(tagId ==2 && $('.chose-tag').hasClass('hasTag')){//tag标签有内容 并且是编辑此状态
                  $('.chose-tag').show();
                  $('.tag-div .com-input').attr('placeholder','');//
                }
			}
			
			$('.route').hide();
			$('.note').find('textarea').attr('placeholder',langData['sfcar'][0][50]);//例如：携带几件行李，最早/最晚出发时间/可随时出发，或其他需要补充说明的情况
		}else{//车主
			if(useType == '0'){//找人
				yongtu = 3;
				$('.people').show();
				$('.peopleNum').attr('placeholder',langData['sfcar'][0][5]);//请填写座位数
				$('.people span').text('('+langData['sfcar'][0][70]+')');//座
				$('.carType-div').hide();
				tagList(3)
             	if(tagId ==3 && $('.chose-tag').hasClass('hasTag')){//tag标签有内容 并且是编辑此状态
                  $('.chose-tag').show();
                  $('.tag-div .com-input').attr('placeholder','');//
                }
			}else{//找货
				yongtu =4;
				$('.people').hide();
				$('.carType-div').show();
				tagList(4)
              	if(tagId ==4 && $('.chose-tag').hasClass('hasTag')){//tag标签有内容 并且是编辑此状态
                  $('.chose-tag').show();
                  $('.tag-div .com-input').attr('placeholder','');//
                }
			}
			
			$('.route').show();
			$('.note').find('textarea').attr('placeholder',langData['sfcar'][1][9]);//例如：最早/最晚出发时间/可随时出发，或其他需要补充说明的情况

		}
	}
	//国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').hide();
                        $('.areacode_span').siblings('input').css({'paddingTop':'.2rem','paddingLeft':'.24rem'})
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'"><span>'+list[i].name+'<span><em class="fn-right">+'+list[i].code+'</em></span></span></li>');
                   }
                   $('.areacodeList ul').append(phoneList.join(''));
                }else{
                   $('.areacodeList ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.areacodeList ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $(".popl_box").animate({"bottom":"0"},300,"swing");
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.areacodeList').delegate('li','click',function(){
        var t = $(this), txt = t.attr('data-code');
        t.addClass('achose').siblings('li').removeClass('achose');
        $(".areacode_span label").text('+'+txt);
        $("#areaCode").val(txt);

        $(".popl_box").animate({"bottom":"-100%"},300,"swing");
        $('.mask-code').removeClass('show');
    })


    // 关闭弹出层
    $('.anum_box .back, .mask-code').click(function(){
        $(".popl_box").animate({"bottom":"-100%"},300,"swing");
        $('.mask-code').removeClass('show');
    })
    // 错误提示
	function showError(str){
	  var o = $(".error");
	  o.html(str).css('display','block');
	  setTimeout(function(){
	  	o.css('display','none')
	  },1000);
	}
	//弹出标签
    $('.tag-div').click(function(){
    	$('.comm-mask').show();
		$('.tag-alert').animate({"bottom":'0'},200);
		if(tagArr.length>0){
        	for(var t = 0;t<tagArr.length;t++){
				var tid = tagArr[t];
				$('.tag-alert ul li').each(function(){
					var id = $(this).data('id');					
					if(tid ==id){
						$(this).addClass('checked');
					}
				})
			}
        }
    })
    //清除标签
    $('.clearAll').click(function(){
		$('.tag-alert li').removeClass('checked');
		$('.chose-tag').html('').hide();
		$('.tag-div .com-input').attr('placeholder',langData['sfcar'][0][49]);//请选择标签
		tagNum()
    })
    //添加标签
    $(".tag-alert").delegate('li','click',function(){
		if($(this).hasClass('checked')){
			$(this).toggleClass('checked');          
		}else{
			if($('.tag-alert li.checked').size() < 3){
				$(this).toggleClass('checked');
			}else{
                showError(langData['sfcar'][0][71]);//最多只能选择三个

            }
		}
		tagNum()
	})
	//确定标签
	$('.sure').click(function(){
    	$('.comm-mask').hide();
		$('.tag-alert').animate({"bottom":'-100%'},200);
		var html=[];
		$('.tag-alert li.checked').each(function(){
			var id=$(this).attr('data-id');
			html.push('<span data-id="'+id+'" data-name="'+$(this).text()+'">'+$(this).text()+'<i class="del-tag"></i></span>')
		})
		$('.tag-div .chose-tag').html(html.join(''));
		if($('.tag-alert li.checked').length>0){
			$('.chose-tag').show();
			$('.tag-div .com-input').attr('placeholder','');
		}
    })
	//删除标签
    $('.chose-tag').delegate('.del-tag','click',function(){
    	var t =$(this);
    	var par  =t.closest('span');
    	par.remove();
    	var dId= par.attr('data-id');
    	$('.tag-alert li.checked').each(function(){
    		var sId = $(this).attr('data-id');
    		if(dId == sId){
    			$(this).removeClass('checked');
    		}
    	})
    	if($('.tag-div .chose-tag span').length == 0){
    		$('.tag-div .chose-tag').hide();
			$('.tag-div .com-input').attr('placeholder',langData['sfcar'][0][49]);//请选择标签
    	}
    	tagNum()
    	return false
    })
    function tagNum(){
    	var liLen = $('.tag-alert li.checked').length;
		$('.tag-alert em.tagNum').text(liLen)
    }

    //遮罩层
	$('.comm-mask').click(function(){
    	$(this).hide();
    	$('.route-alert').hide();
		$('.tag-alert').animate({"bottom":'-100%'},200);
		$('.car-alert').animate({"bottom":'-100%'},200);

    })

    //途径地点 tip
    $('.route .route-tip').click(function(){
    	$('.comm-mask').show();
		$('.route-alert').show();
    })

    //知道了
    $('.route-alert .know').click(function(){
    	$('.comm-mask').hide();
		$('.route-alert').hide();
    })

    //选择车型
	$('.carType-div').click(function(){
    	$('.comm-mask').show();
		$('.car-alert').animate({"bottom":'0'},200);
    })
    //添加车型
    $(".car-alert li").click(function(){		
        $(this).toggleClass('checked').siblings().removeClass('checked');                 

	})
	//确定车型
	$('.car-alert .confirm').click(function(){
    	$('.comm-mask').hide();
		$('.car-alert').animate({"bottom":'-100%'},200);
		var htxt = $('.car-alert li.checked').text();
		var hid = $('.car-alert li.checked').attr('data-id')
		console.log(hid)
		if($('.car-alert li.checked').length>0){
			$('.carType-div .com-input').val(htxt);
			$('.carType-div').attr('data-id',hid)
		}else{
			$('.carType-div .com-input').val('');
		}
    })
	//取消车型
	$('.car-alert .cancel').click(function(){
    	$('.comm-mask').hide();
		$('.car-alert').animate({"bottom":'-100%'},200);
    })

    //当出发地和目的地为输入时
    $('.placeInp .fakeinp').click(function(){
    	$(this).hide();
    	$(this).siblings('.comInpu').show();
    	$(this).siblings('.comInpu').focus();
    })
  
   $('.placeInp').on('blur','.comInpu',function(){
     	var t = $(this);
		tt = t.text();
		if(tt == '' || tt == ' '){
	       t.hide();
	       t.siblings('.fakeinp').show();
	       return false;
	    }
   })
    
    //是否选择天天发车
    $('.startTime .daychose').click(function(){
    	$('.timeStart s.s1').hide();
    	$('#more_date').removeClass('hastime').val('');
    	$(this).toggleClass('checked');
    	if($(this).hasClass('checked')){
    		timeFlag = langData['siteConfig'][6][12];//取消
    		$('.startTime').addClass('dayday');
    		$('#more_date').hide();
    		$('.timeStart input.clock').css('width','100%').show().attr('placeholder',langData['sfcar'][2][10])//请选择时间（必填）
    	}else{
    		timeFlag = langData['sfcar'][2][39];//不选择
			$('.startTime').removeClass('dayday')
			$('.timeStart input.clock').css('width','45%').hide().attr('placeholder',langData['sfcar'][0][44])//时间（选填）
			$('#more_date').show();

    	}
    	clockSelect.cancelBtn.innerHTML = timeFlag
    })
    

	var flag=1;

	$('.route').delegate('.com-input','blur',function(){
		var inpArray = [];
		$('.route-div.has').each(function(){
				var inp = $(this).find('.com-input').val();	 
				if(inp == ''){
					$(this).remove()
				}			
				inpArray.push(inp);	    			
		})
		var nary=inpArray.sort(); 
		for(var i=0;i<inpArray.length;i++){  
		    if ((nary[i]==nary[i+1])&&nary[i]!=''){  
				flag=0;
				showError(langData['sfcar'][0][72]);	//途经地点不能重复	        
				return false;

			 }
		}
		routeNum()
		
	})
	$('.route').delegate('.com-input','focus',function(){
		flag=1;

	})
	//途经地点
	$('.route').delegate('.com-input','input propertychange',function(){
		var inpVal = $(this).val();
	    var par = $(this).closest('.route-div');
	    	    
    	if((inpVal !='') && (checkKong() == 0)){//1.自身不为空 2.所有输入框不得有空值 
			//console.log('值不为空')
			if(flag == 1){
				par.addClass('has');
				par.find('.del-route').remove();
	    		par.append('<i class="del-route"></i>');	
	    		var inpLen = $('.route .route-div.has').length;
	    		if(inpLen < 10){
	    			//继续添加途径地点
	    			$('.route').append('<div class="route-div half"><input type="text" placeholder="'+langData['sfcar'][1][8]+'" class="com-input"></div>');
	    			return false
	    		}
			}			   		
    		
    	}else if(inpVal ==''){

			$(this).attr('placeholder','添加途径地点')
    		
    	}
    	routeNum()

	   
	});

	//删除途经地点
	$('.route').delegate('.del-route','click',function(e){
		var par = $(this).closest('.route-div');
		par.remove();
		routeNum()
		var rLen = $('.route .route-div').length
		var lastInp = $('.route .route-div:last-child').find('.com-input').val();
		if((rLen == 1) && lastInp == ''){
			$('.route .route-div:last-child').removeClass('half');

		}else if(rLen == 0){
			//添加途径地点
			$('.route').append('<div class="route-div"><input type="text" placeholder="'+langData['sfcar'][0][42]+'" class="com-input"></div>');
		}else if(rLen>1 && lastInp!='' && (checkKong() == 0)){
			//继续添加途径地点
	    	$('.route').append('<div class="route-div half"><input type="text" placeholder="'+langData['sfcar'][1][8]+'" class="com-input"></div>');
		}
		e.stopPropagation();
	})
	function routeNum(){
		var inpLen = $('.route .route-div.has').length;
		$('.routeNum .num').text(inpLen);
	}
	function checkKong(){
		var inpArray = [];
		$('.route-div').each(function(){
			var inp = $(this).find('.com-input').val();	    			
			inpArray.push(inp);	    			
		})
		if(inpArray.includes('')){
			return 1;
		}else{
			return 0;
		}
	}

 	// 选择日期 年月日
    $("#more_date").hotelDate();
    var clockList = [];
    var join=[]
    for(var s = 0; s < 60; s++){//分钟 五分钟一个间隔
    	var e = (s<10)?('0'+s):s;
	    join.push({
	      id: e,
	      value: e+langData['sfcar'][0][73],//分
	    })
	    s=s+4
    }
   
    for(var i = 0; i < 24; i++){
		var n = (i<10)?('0'+i):i;
    	clockList.push({
	      id: n,
	      value: n+langData['sfcar'][0][74],//时
	    })
    }

    //选择具体时间
    var clockSelect = new MobileSelect({
	    trigger: '#clockChose',
	    title: langData['sfcar'][1][0],//请选择时间
	    cancelBtnText: langData['sfcar'][2][39],//不选择
	    wheels: [
	    	{data : clockList},
	    	{data : join}
	    ],
	    transitionEnd:function(indexArr, data){
	    	var fir = indexArr[0];
	    	var sec = indexArr[1];
	    	$('.selectContainer').find('li').removeClass('onchose')
			var firWheel =$('.wheels .wheel:first-child').find('.selectContainer');
			var secWheel =$('.wheels .wheel:last-child').find('.selectContainer');
			firWheel.find('li').eq(fir).addClass('onchose');
			secWheel.find('li').eq(sec).addClass('onchose');
	    	 
	    },
	    callback:function(indexArr, data){
	    	$('#clockChose').val(data[data.length-2].id+':'+data[data.length-1].id)
	        console.log(data); //返回选中的json数据

	    }
	    ,triggerDisplayData:false
	});

	var sendUserType = decodeURI(getUrlParam('type'));
    if(sendUserType=='1'){//我是车主
    	$('.tab-ul li.ownerFabu').click();
    }


	$('.mobileSelect .cancel').click(function(){
		if($(this).text() == langData['sfcar'][2][39]){//不选择
			$('#clockChose').val('');
			return false;
		}
	})

	$('.wheels .wheel:first-child').find('li').eq(0).addClass('onchose')
	$('.wheels .wheel:last-child').find('li').eq(0).addClass('onchose')

	

	$('#submit').bind('click',function(){
		var  t = $(this),tj = true;
		event.preventDefault();
		if(t.hasClass('disabled')) return;
		var sAddr = eAddr = sAddrid = eAddrid = '';

		if(st==0){//出发地 目的地 是填写的
			$('#sAddrInp').val($('.inputStart').text().trim())
        	$('#eAddrInp').val($('.inputEnd').text().trim())

        	sAddr = $('#sAddrInp').val();
        	eAddr = $('#eAddrInp').val();

		}else{

			sAddr = $.trim($('.startAddr').html()).replace('选择出发地', '');
			eAddr = $.trim($('.endAddr').html()).replace('选择目的地', '');
			sAddrid =  $('#sAddr').val()
			eAddrid =  $('#eAddr').val()
		}
		var clockhas = $('#clockChose').val();
		var userType  = $('.tab-ul li.active').attr('data-type');//用车人的身份

		var startTime 	= $('#more_date').val(),//出发时间
		daychose 	= $('.daychose').hasClass('checked'),//出发时间
		useAcess = $('#yongtu').val(),//用途类型
		contact = $('#contact').val(),//手机号
		contactName = $('#contactName').val(),//联系人
		areaCode = $('#areaCode').val(),//区号
		number = '',
		carseat = '',
		cartype = '',
		vercode = $('#code').val();//验证码
		var useTu = '';
		if(yongtu == 1){//乘客找车载人
			number = $('.peopleNum').val();//乘坐人数
		}else if(yongtu == 3){//车主找人
			carseat =  $('.peopleNum').val();//座位数
		}else if(yongtu == 4){//车主找货
			cartype = $('.carType-div').attr('data-id');
			
		}
		//必填项验证
		
		if (sAddr == "") {
	      	showError((st==1)?langData['sfcar'][0][0]:langData['sfcar'][2][36]);//请选择出发地--请填写出发地
	      	tj = false;
	    }else if(eAddr == ""){
	    	showError((st==1)?langData['sfcar'][0][1]:langData['sfcar'][2][37]);//请选择目的地---请填写目的地
	      	tj = false;
	    }else if(eAddr == sAddr){
	    	showError((st==1)?langData['sfcar'][0][2]:langData['sfcar'][2][38]);//请选择不同的出发地和目的地---请填写不同的出发地和目的地
	      	tj = false;
		}else if(startTime == "" && !daychose){
	    	showError(langData['sfcar'][0][3]);//请选择出发时间
	      	tj = false;
	    }else if(clockhas == "" && daychose){
	    	showError(langData['sfcar'][0][3]);//请选择出发时间
	      	tj = false;
	    }else if(number == "" && yongtu == 1){//
	    	showError(langData['sfcar'][0][4]);//请填写乘坐人数
	      	tj = false;
	    }else if(carseat == "" && yongtu == 3){//
	    	showError(langData['sfcar'][0][5]);//请填写座位数
	      	tj = false;
	    }else if(cartype == "" && yongtu == 4){//
	    	showError(langData['sfcar'][0][6]);//请选择车型
	      	tj = false;
	    }else if(contact == ""){
	    	showError(langData['siteConfig'][20][27]);//请输入您的手机号
	      	tj = false;
	    }else if(vercode == "" && $('.test_code').is(':visible')){
	    	showError(langData['siteConfig'][20][540]);//请填写验证码
	      	tj = false;
	    }else if(contactName == ""){
	    	showError(langData['siteConfig'][20][345]);//请填写联系人
	      	tj = false;
	    }
	    
	    if(!tj) return;

		var data = '&fabutype='+userType+'&startTime='+startTime+'&usetype='+useAcess+'&tel='+contact+'&areaCode='+areaCode+'&vercode='+vercode+'&number='+number+'&carseat='+carseat+'&cartype='+cartype+'&person='+encodeURI(contactName);
		//验证选填的

		//详细地址

			data += "&startaddr="+encodeURI(sAddr);
			data += "&endaddr="+encodeURI(eAddr);
			data += "&startaddrid="+sAddrid;
			data += "&endaddrid="+eAddrid;


		var startAdress = $('.startAdress').html();
		var endAdress   = $('.endAdress').html();
		if(startAdress!='' && startAdress!=null ){
			data += "&startAdress="+encodeURI(startAdress);
		}
		if(endAdress!='' && endAdress!=null){
			data += "&endAddress="+encodeURI(endAdress);
		}


		if(daychose){
			data += "&startType=1";
		}else{
			data += "&startType=0";
		}

		//途径地点
		if(userType == '1'){
			var ways = [];
	        $(".route").find('.route-div.has').each(function(){
	            var routeWay = $(this).find('.com-input').val();
	            ways.push(encodeURI(routeWay));
	        });
	        $("#way").val(ways.join(','));

		    if(ways.length>0){
			    data += "&route="+ways.join(",");
			}
		}
		//出发时间的具体时间
		if(clockhas!=''){
			data += "&startClock="+clockhas;
		}
		//标签
		var choseTag =[];
		if($('.tag-div .chose-tag').find('span').size()>0){
			$('.tag-div .chose-tag span').each(function(){
				var tag = $(this).attr('data-id');
				choseTag.push(tag);
			})
		}
		if(choseTag.length>0){
		    data += "&flag="+choseTag.join(",");
		}
		//备注说明
		var note = $('#note').val();
		if(note !=''){
			data += "&note="+encodeURI(note);
		}
		
		//获取图片的
		var pics = [];
        $("#fileList").find('.thumbnail').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#pics").val(pics.join(','));

	    if(pics.length>0){
		    data += "&imglist="+pics.join(",");
		}
	  
		
	 	t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");
	 	var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url")
		 $.ajax({
		   url: action,
		   data: data + "&cityid="+cityId,
		   type: "POST",
		   dataType: "json",
		   success: function (data) {
             
		    if(data && data.state == 100){
		     	if(data.info.aid != undefined && id == 0){
		            var urlNew = fabuSuccessUrl.replace("%id%", data.info.aid);
		            if(data.info.arcrank =='0'){
		            	url = fabuUrl
		            }else{

		            	url = urlNew;
		            }
		        }
		        fabuPay.check(data, url, t);
		    }else{
		       alert(data.info);
		       console.log(data.info+'-+-')
		       t.removeClass("disabled").html(langData['siteConfig'][11][19]);
		     }
		   },
		   error: function(){
      			
		     alert(langData['sfcar'][2][44]);//发布失败
		     t.removeClass("disabled").html(langData['siteConfig'][11][19]);
		   }
		 });
	});






	/*********自动定位相关***********/ 



	if(auto_location == 1) {

		HN_Location.init(function(data){
			if (data == '' || data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
			  // 首次加载数据
				console.log('定位失败');
				showErrAlert('定位失败，请手动'+(st == '1' ? "选择" : "填写"))
			}else{
				// console.log(data)
				if(st == '1'){
					let lng = data.lng, lat = data.lat;
					$('.startAdress').html(data.name != data.city && data.name || data.address).show()
					$('#lnglat').val(`${lng},${lat}`)
					var province = data.province ? data.province.replace('省','').replace('市','') : ''; // 省,直辖市
					var city = data.city ? data.city.replace('市','') : ''; // 市
					var district = data.district ? data.district.replace('区','').replace(city,'') : ''; // 
					var town = data.town ? data.town.replace('镇','').replace('街道','') : ''; //

					calcAddrid(province,city,district,town)
				}else{
					// $('.inputStart').text(data.name != data.city && data.name || data.address).show().siblings('.fakeinp').hide()
					let address = data.name != data.city && data.name || data.address
					if(address){
						$('.inputStart').text(data.name != data.city && data.name || data.address).show().siblings('.fakeinp').hide()
					}
				}
	
			}
		});
	}

	// 获取当前定位的城市id，区域id
	function calcAddrid(myprovince,mycity,mydistrict,town,param){

		var cityArr = [myprovince,mycity,mydistrict,town]
		if(myprovince == mycity){
			cityArr = [myprovince,mydistrict,town]
		}
		cityArr = cityArr.filter(item => {
			return item;
		})
		addridsArr = [];
		checkCityid_v2(cityArr)	
	}
	

	async function checkCityid_v2(strArr){
        if(citys.length == 0){
            await getCitys();
        }
		$('.loadIcon').removeClass('fn-hide')
		matchCity(citys,0,strArr)
        
    }

	// 匹配分站
	async function matchCity(city,type,strArr){
		let str = strArr[type];
		let cityChecked = false
		for(let i = 0; i < city.length; i++){
            let currCity = city[i];
            let cityname = currCity.typename.replace('省','').replace('市','').replace('区','').replace('镇','')
            if(str && (cityname.includes(str) || str.includes(cityname))){ //匹配上之后就匹配下一级
				cityChecked = true; //找到了
                addridsArr.push(currCity.id);
				addrArr.push(currCity.typename)			
				if(currCity.lower){ //查找到之后 应该查找下一级
					await getCitys(currCity.id);
					type++
					if(type < strArr.length){
						matchCity(citys,type,strArr)
					}else{
						$('.loadIcon').addClass('fn-hide')
					}
				}else{
					
					$(".startAddr").attr('data-ids',addridsArr.join(' ')).text(addrArr.join(' ')).addClass('has')
					$(".startAddr").attr('data-id',addridsArr[addridsArr.length - 1])
					$('#sAddr').val(addridsArr[addridsArr.length - 1])
				}
                break;
            }else if(!str){
            	$(".startAddr").attr('data-ids',addridsArr.join(' ')).text(addrArr.join(' ')).addClass('has')
				$(".startAddr").attr('data-id',addridsArr[addridsArr.length - 1])
				$('#sAddr').val(addridsArr[addridsArr.length - 1])
            }
        }

		if(!cityChecked){
			if(type < strArr.length){ //没查找到  继续匹配地图返回数据的洗衣机
				++type
				matchCity(citys,type,strArr)
			}else if(addridsArr.length == 0){ //查找结束 
				showErrAlert('城市定位失败，请手动选择城市')
				// $(".chose_area .city").text('省市区县，点击"定位”选择地区');
				// $('.chose_area').addClass('gz-no-sel')
				// $('.loadIcon').addClass('fn-hide')
			}
		}

		if(type >= (strArr.length - 1)){
			$('.loadIcon').addClass('fn-hide')
		}
		
	}

	 // 获取所有城市分站
	function getCitys(id = 0, strArr) {
		$.ajax({
			url: "/include/ajax.php?service=siteConfig&action=area&type=" + id,
			type: "POST",
			async: false,
			dataType: "json",
			success: function (data) {
				if (data && data.state == 100) {
					citys = data.info;
				}
			},
		});
	}

	
});
