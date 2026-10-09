var pid,cid,did,tid;
var addridsArr = []
var addrArr = []
// 是否有存储的数据
var citys = []; //分站列表
var wxAddress = localStorage.getItem('wxAddress');
var lnglat = ''; //经纬度
var infoData = localStorage.getItem('infoData') && localStorage.getItem('infoData') != 'undefined'  ? JSON.parse(localStorage.getItem('infoData')):[] ;
autoLocation = infoData.length ? false : autoLocation;
for(var i = 0; i < infoData.length; i++){
	if(infoData[i].name == 'lnglat' && infoData[i].value == ''){
		autoLocation = true;
	}
}
//新增收货地址- 2021-9-26
$(function(){
	// 判断从哪里来的，订单还是地址管理
	var currLocation = window.location.href;
	if(currLocation.indexOf('from=addrlist') > -1 && currLocation.indexOf('from=order') <= -1){
		$(".saveBtn").addClass('fn-hide');
		$('.fromList').removeClass('fn-hide');
	}

	paramCurr = window.location.search.substring(1)
	

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
                        // $('.areacode_span').siblings('input').css({'paddingTop':'.2rem','paddingLeft':'.24rem'})
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

    // 上传LOGO
	var upPhoto = new Upload({
	    btn: '#up_logo',
	    bindBtn: '',
	    title: 'Images',
	    mod: 'business',
	    params: 'type=atlas',
	    atlasMax: 1,
	    deltype: 'delAtlas',
	    replace: true,
	    fileQueued: function(file){

	    },
	    uploadSuccess: function(file, response){
	      if(response.state == "SUCCESS"){
	        var dt = $('.logoshow');
	        var img = dt.children('img');
	        if(img.length){
	          var old = img.attr('data-url');
	          upPhoto.del(old);
	        }
	        dt.html('<img src="'+response.turl+'" data-url="'+response.url+'" alt="">').removeClass('fn-hide');
			//dt.siblings('dd').addClass('fn-hide')
	        $("#logo").val(response.url)

	      }
	    },
	    showErr: function(info){
	      showErr(info);
	    }
	});

	//识别输入地址
	$("#spot").bind('input propertychange',function(){
		var tht = $(this).html();
		if(tht !=''){
			$('.spotOper').css('display','flex');
			$('#up_logo').hide();
		}else{
			$('.spotOper').css('display','none');
			$('#up_logo').show();
		}

	});
	//识别-取消
	$('.spotOper .spotCancel').click(function(){
		$("#spot").html('');
		$('.spotOper').css('display','none');
		$('#up_logo').show();
	})
	//识别-识别
	$('.spotOper .spotSure').click(function(){
		var t = $(this);
		if(t.hasClass("disabled")) return false;
		var tht = $('#spot').html();
		t.addClass("disabled").html("识别中");//提交中
		$.ajax({
			url: "/include/ajax.php?service=siteConfig&action=getAddress&address="+tht,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					$('.spotSuc').css('display','flex');
					setTimeout(function(){
						$('.spotSuc').css('display','none');
					},1000)
					$('.spotOper').css('display','none');
					$('#up_logo').show();
					var info = data.info;
					if(info.addrid){
						$('#addrid').val(info.addrid);
						$(".gz-addr-seladdr.chose_area").attr("data-id",info.addrid)
					}
					if(info.addrids){
						$('.chose_area').attr('data-ids',info.addrids);
					}
					if(info.addrname){
						$('.chose_area .city').html(info.addrname);
					}
					if(info.lng && info.lat){
						$('.map_detail').attr('data-lng',info.lng);
						$('.map_detail').attr('data-lat',info.lat);
						$('#lnglat').val(info.lng+','+info.lat);
					}
					if(info.phonenum){
						$('#mobile').val(info.phonenum);
					}
					if(info.person){
						$('#person').val(info.person);
					}
					if(info.detail){
						$('#addr').html(info.detail);
					}

				}else{
					var popOptions = {
						btnCancel:'确定',
				      	title:data.info,
				      	btnColor:'#222',
				      	noSure:true,
				      	isShow:true
				    }
					confirmPop(popOptions);
					
				}
				t.removeClass("disabled").html('识别');
			},
			error: function(){
				var popOptions = {
					btnCancel:'确定',
			      	title:langData['siteConfig'][20][183],
			      	btnColor:'#222',
			      	noSure:true,
			      	isShow:true
			    }
				confirmPop(popOptions);
				t.removeClass("disabled").html('识别');
			}
		});

	})

	//设为默认地址
	$('.setDefault .switch').click(function(){
		if($(this).hasClass('active')){
			$(this).removeClass('active');
			$('#setDefault').val('0');
		}else{
			$(this).addClass('active');
			$('#setDefault').val('1');
		}
	})
	$('.addAddress .delBtn').click(function(){

		$.ajax({
			url: "/include/ajax.php?service=member&action=addressDel",
			data: "id="+addressid,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					window.location.href = adrUrl.indexOf('currentPageOpen=1') > -1 ? adrUrl : (adrUrl + '&currentPageOpen=1');
				}else{
					var popOptions = {
						btnCancel:'确定',
						title:data.info,
						btnColor:'#222',
						noSure:true,
						isShow:true
					}
					confirmPop(popOptions);
				}
			},
			error: function(){
				var popOptions = {
					btnCancel:'确定',
					title:langData['siteConfig'][20][183],
					btnColor:'#222',
					noSure:true,
					isShow:true
				}
				confirmPop(popOptions);
			}
		});
	})


	// gzAddrSeladdr.removeClass("gz-no-sel").attr("data-ids", ids.join(" ")).attr("data-id", id).find("dd p").html(addrname.join(" "));
                // gzAddrInit.hideNewAddrMask();
                // $('#addr, #addrid').val(id);

        $(".sureAddrid").click(function(){
        	var ids = [],id = '',addrname = []
        	$(".gz-sel-addr-nav li").each(function(){
        		if($(this).attr('data-id')){
        			ids.push($(this).attr('data-id'))
        			addrname.push($(this).text())
        			id = $(this).attr('data-id')
        		}
        	})

            var lastAddrLi = $(".gz-sel-addr-nav").find("li:last");
            var lng = lastAddrLi.attr('data-lng'), lat = lastAddrLi.attr('data-lat');

        	$(".gz-addr-seladdr").attr("data-ids",ids.join(' ')).attr("data-id", id).find("dd p").html(addrname.join(" "))
            $('#lnglat').val(lng+','+lat);
        	$("#gzAddNewObj").removeClass('gz-sel-addr-active');
            $('.gz-sel-addr-mask').fadeOut(500, function(){
                window.scrollTo(0,0);
            });
            $("#gzSelAddr").addClass('gz-sel-addr-hide');

        })

	

	//新地址表单验证
	var inputVerify = {
		person: function(){
			var t = $("#person"), val = t.val(), par = t.closest("li");
			if(val.length < 2 || val.length > 15){
				showErrAlert(langData['shop'][2][15])
				return false;
			}
			return true;
		}
		,mobile: function(){
			var t = $("#mobile"), val = t.val(), par = t.closest("li");
			var exp = new RegExp("^(12|13|14|15|16|17|18|19)[0-9]{9}$", "img");
			if(val == ""){
				showErrAlert(langData['shop'][2][16]);
				return false;
			}else{
				let areaCode = $("#areaCode").val(); //只验证86号段
				if(areaCode == 86 && !/^(12|13|14|15|16|17|18|19)[0-9]{9}$/.test(val) && val != ""){
					showErrAlert(langData['shop'][2][17])
					return false;
				}
			}
			return true;
		}
		,addrid: function(){
			if($(".gz-addr-seladdr.chose_area").attr("data-id") == undefined || $(".gz-addr-seladdr.chose_area").attr("data-id") == '' ){
				showErrAlert(langData['shop'][2][18])
				return false;
			}
			return true;
		}
		,address: function(){
			if($('#addr').html() == ''){
				showErrAlert('请填写详细地址');
				return false;
			}
			return true;
		},
		lnglat:function(){
			if($('#lnglat').val() == ''){
				showErrAlert('定位失败，请重新定位');	
				return false
			}
			return true;
		}
	}

	//提交新增/修改 保存并使用
	$(".saveBtn").on("click", function(){

		var t = $(this);
		var ttxt = t.text();
		if(t.hasClass("disabled")) return false;
		var addrid = $(".gz-addr-seladdr.chose_area").attr("data-id");

		//验证表单
		if(inputVerify.person() && inputVerify.mobile() && inputVerify.addrid() && inputVerify.address() && inputVerify.lnglat() ){
			t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");//提交中

			gzAddrEditId = $('#gzAddrEditId').val();
			var data = [];
			data.push('id='+ gzAddrEditId);
			data.push('addrid='+addrid);
			data.push('address='+encodeURIComponent($("#addr").html()));
			data.push('person='+encodeURIComponent($("#person").val()));
			data.push('mobile='+$("#mobile").val());
			data.push('areaCode='+$("#areaCode").val());
			data.push('lnglat='+$('#lnglat').val())
			data.push('default='+$('#setDefault').val())
			

      		$.ajax({
				url: "/include/ajax.php?service=member&action=addressAdd",
				data: data.join("&"),
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						if(!t.hasClass('fromList')){
							var tref1 = confirmUrl.replace('%adrid%',addrid);
							var tref = tref1.replace('%adid%',data.info);
							let moduleName=t.attr('data-module');
							if(wx_miniprogram&&miniprogram_native_module.includes(moduleName)){ //小程序且启用原生页面
								let link=`/pages/packages/shop/confirm-order/confirm-order?adsid=${data.info}&${paramCurr}`;
								wx.miniProgram.redirectTo({ url: link });
								return false
							}
							window.location.href = tref.indexOf('currentPageOpen=1') > -1 ? tref : (tref + '&currentPageOpen=1');
						}else{
							showErrAlert('保存成功');
							setTimeout(function(){
								if(paramCurr && paramCurr.indexOf('logitcpros') > -1){
									var tref1 = confirmUrl.replace('%adrid%',addrid).replace('&from=addrlist','');
									var tref = tref1.replace('%adid%',data.info).replace('&from=addrlist','');;
									// alert(tref)
									window.location.href = tref.indexOf('currentPageOpen=1') > -1 ? tref : (tref + '&currentPageOpen=1');
									return false;
								}
								if(paramCurr.indexOf('url=') > -1){
									url = paramCurr.split('url=')[1];
									window.location.replace(decodeURIComponent(url))
								}else{
									window.location.replace(listUrl)
								}
								
							},1500)
						}
						

					}else{
						var popOptions = {
							btnCancel:'确定',
					      	title:data.info,
					      	btnColor:'#222',
					      	noSure:true,
					      	isShow:true
					    }
						confirmPop(popOptions);
						t.removeClass("disabled").html(ttxt);
					}
				},
				error: function(){
					var popOptions = {
						btnCancel:'确定',
				      	title:langData['siteConfig'][20][183],
				      	btnColor:'#222',
				      	noSure:true,
				      	isShow:true
				    }
					confirmPop(popOptions);
					t.removeClass("disabled").html(ttxt);
				}
			});

		}

	});


	// 20220705修改
	/***********
	 * 1.获取数据
	 * 2.跳转页面
	 * 3.选择地址
	 * 4.返回页面，处理数据
	 * 
	 * ***********/ 



	 var district = ''; //省份信息
	 // 遍历
	 if(infoData.length > 0){
		 for(var i = 0; i < infoData.length; i++){
			 var info = infoData[i];
			 if($("input[name='"+info.name+"']").length){
				 $("input[name='"+info.name+"']").val(info.value)
			 }
			 $(function () {
			 	if(info.name && $("#" + info.name) && $("#" + info.name).length){
				 	 $("#" + info.name).html(info.value)
				 }
			 })
			 if(info.name == 'default' && info.value == '1' ){
				 $(".setDefault .switch").addClass('active')
			 }
			 if(info.name == 'address'  ){
				 $("#addr").text(info.value)
			 }
	 
			 if(info.name == 'district'){
				
				 district = JSON.parse(info.value );
				 $(".chosePosiadr .chose_area ").attr('data-addrname',district.address);
				
			 }

			 if(info.name == 'lnglat' && info.value != ''){
			 	var point = {
			 		lng:info.value.split(',')[0],
			 		lat:info.value.split(',')[1],
			 	}
			 	$('.loadIcon').removeClass('fn-hide')
			 	$("#lnglat").val(point.lng + ',' + point.lat) 
			 	 HN_Location.lnglatGetTown(point,function(data){
					 var province = data.province ? data.province.replace('省','').replace('市','') : ''; // 省,直辖市
					 var city = data.city ? data.city.replace('市','') : ''; // 市
					 var district = data.district ? data.district.replace('区','').replace(city,'') : ''; // 
					 var town = data.town ? data.town.replace('镇','').replace('街道','') : ''; // 
					 calcAddrid(province,city,district,town)
	 
				 })
			 }else{
			 	$('.loadIcon').addClass('fn-hide')
			 }
			 
		 }
			
		 localStorage.removeItem("infoData");
	 }else{
		$('.loadIcon').addClass('fn-hide')
	 }

	$(".map_detail").click(function(){
		localStorage.setItem('infoData', JSON.stringify(getAllData()));
		window.location.href = memberUrl + '/mapPosi.html?noPosi=1&currentPageOpen=1'
	});

	// 保存所有数据
	function getAllData(){
		var dataArr = $(".adrform").serializeArray();

		var addrname = $(".chosePosiadr .chose_area").attr('data-name') ? $(".chosePosiadr .chose_area").attr('data-name') : ''
		var addrids = $(".chosePosiadr .chose_area").attr('data-ids') ? $(".chosePosiadr .chose_area").attr('data-ids') : ''
		dataArr.push({
			'name':'addrArr',
			'value': addrname
		})
		dataArr.push({
			'name':'addrids',
			'value': addrids
		})
		dataArr.push({
			'name':'spot',
			'value': $("#spot").html()
		})
		dataArr.push({
			'name':'address',
			'value': $("#addr").text()
		})
		dataArr.push({
			'name':'returnUrl',
			'value': window.location.href
		})
		return dataArr;
	};


	// // 根据坐标获取省市区
	// function getCityInfo(){

	// }
	// 微信选地址
	if(wxAddress){
		localStorage.removeItem('wxAddress')
		let wxAddrObj = JSON.parse(wxAddress);
		var myprovince = (wxAddrObj.provinceName || wxAddrObj.provinceFirstStageName).replace('省','')
        var mycity = (wxAddrObj.cityName || wxAddrObj.citySecondStageName).replace('市','')
        var mydistrict = (wxAddrObj.countryName || wxAddrObj.countiesThirdStageName).replace('区','');
        $("#person").val(wxAddrObj.userName);
        $("#mobile").val(wxAddrObj.telNumber);
        $("#addr").text(wxAddrObj.detailInfo || wxAddrObj.detailInfoNew);
        calcAddrid(myprovince,mycity,mydistrict,'',wxAddrObj)
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
		if($("#gzAddrArea0 li").length > 0){ //获取过数据
			$("#gzAddrArea0 li").each(function(){
                var _val = $(this).text();
				if(_val == myprovince || _val.indexOf(myprovince) > -1 || myprovince.indexOf(_val) > -1){
					pid = $(this).attr('data-id');
					addridsArr.push(pid)
				    checkCityid_v2(cityArr)
				}
			})
		}else{
            checkCityid_v2(cityArr)
		}	

	}

	
// 	新版
    async function checkCityid_v2(strArr){
        if(citys.length == 0){
            await getCitys();
        }
		$('.loadIcon').removeClass('fn-hide')
		matchCity(citys,0,strArr)
        
    }

	async function matchCity(city,type,strArr){
		let str = strArr[type] || '';
		let cityChecked = false
		for(let i = 0; i < city.length; i++){
            let currCity = city[i];
            let cityname = currCity.typename.replace('省','').replace('市','').replace('区','').replace('镇','')
            if(cityname.includes(str) || str.includes(cityname)){ //匹配上之后就匹配下一级
				cityChecked = true; //找到了
                addridsArr.push(currCity.id);
				addrArr.push(currCity.typename)
                $(".chose_area").attr('data-ids',addridsArr.join(' '))
				$(".chose_area").attr('data-id',addridsArr[addridsArr.length - 1])
				$("#addrid").val(addridsArr[addridsArr.length - 1])
				if(currCity.longitude && currCity.latitude){
					lnglat = currCity.longitude + ',' + currCity.latitude
				}
                $(".chose_area").removeClass('gz-no-sel').attr('data-addrname',addrArr.join(' '));
				$(".chose_area .city").text(addrArr.join(' '))
				if(!$("#lnglat").val()){
					$("#lnglat").val(lnglat) 
				}
								
				if(currCity.lower){ //查找到之后 应该查找下一级
					await getCitys(currCity.id);
					type++
					if(type < strArr.length){
						matchCity(citys,type,strArr)
					}else{
						$('.loadIcon').addClass('fn-hide')
					}
				}
                break;
            }
        }

		if(!cityChecked){
			if(type < strArr.length){ //没查找到  继续匹配地图返回数据的洗衣机
				++type
				matchCity(citys,type,strArr)
			}else if(addridsArr.length == 0){ //查找结束 
				showErrAlert('城市定位失败，请手动选择城市')
				$(".chose_area .city").text('省市区县，点击"定位”选择地区');
				$('.chose_area').addClass('gz-no-sel')
				$('.loadIcon').addClass('fn-hide')
			}
		}

		if(type >= (strArr.length - 1)){
			$('.loadIcon').addClass('fn-hide')
		}
		
	}

    

    
    // 获取所有城市分站
    function getCitys(id = 0,strArr){
    	$.ajax({
			url: "/include/ajax.php?service=siteConfig&action=area&type=" + id ,
			type: "POST",
			dataType: "jsonp",
			success: function(data){
			    if(data && data.state == 100){
			        citys = data.info
					
			    }
			}
    	})
    }

	function checkCityid(strArr,type,param){
		$('.loadIcon').removeClass('fn-hide')
		var id = 0;
		switch(type){
			case 0 : 
				id = 0;
				break;
			case 1 : 
				id = pid;
				break;
			case 2 : 
				id = cid;
				break;
			case 3 : 
				id = did;
				break;
		}
		var typeStr = '&type='+id;
		$.ajax({
			url: "/include/ajax.php?service=siteConfig&action=area" + typeStr,
			type: "POST",
			dataType: "jsonp",
			success: function(data){
				if(data && data.state == 100){
					var city = data.info;
					for(var i=0; i<city.length; i++){


						if(city[i].typename == strArr[type] || (city[i].typename == strArr[type] + '区') ||  city[i].typename == strArr[type] + '省' || (city[i].typename && city[i].typename.indexOf(strArr[type]) > -1) || (strArr[type] && strArr[type].indexOf(city[i].typename) > -1) ||  (city[i].typename == strArr[type] + '市') ||  (city[i].typename == strArr[type] + '镇') ){
							switch(type){
								case 0 : 
									pid = city[i].id;
									break;
								case 1 : 
									cid = city[i].id;
									break;
								case 2 : 
									did = city[i].id;
									break;
								case 3 : 
									tid = city[i].id;
									break;
							}
							type++;
							addridsArr.push(city[i].id)
							$(".chose_area").attr('data-ids',addridsArr.join(' '))
							$(".chose_area").attr('data-id',addridsArr[addridsArr.length - 1])
							$("#addrid").val(addridsArr[addridsArr.length - 1])
							if(city[i].longitude && city[i].latitude){
							 lnglat = city[i].longitude + ',' + city[i].latitude
							}

							if(type < strArr.length){
								checkCityid(strArr,type)
							}else{
								$(".chose_area").removeClass('gz-no-sel').attr('data-addrname',strArr.join(' '));
								$(".chose_area .city").text(strArr.join(' '))
								if(!$("#lnglat").val()){
									console.log(lnglat)
									$("#lnglat").val(lnglat) 
								}
								
							}
							$('.loadIcon').addClass('fn-hide')
						}else{
							type ++;
							switch(type){
								case 0 : 
								pid = 0;
								break;
								case 1 : 
								cid = 0;
								break;
								case 2 : 
								did = 0;
								break;
								case 3 : 
								tid = 0;
								break;
							}
							if(type < strArr.length){
								checkCityid(strArr,type)    
							}else{
								showErrAlert('城市定位失败，请手动选择城市')
								$(".chose_area").attr('data-ids',addridsArr.join(' '))
								$(".chose_area").attr('data-id',addridsArr[addridsArr.length - 1])
								$("#addrid").val(addridsArr[addridsArr.length - 1])
								// $(".chose_area").removeClass('gz-no-sel').attr('data-addrname',strArr.join(' '));
								$(".chose_area .city").text('省市区县，点击"定位”选择地区');
								$('.chose_area').addClass('gz-no-sel')
								$('.loadIcon').addClass('fn-hide')
							}
						}
					}
					
				}else{
					$('.loadIcon').addClass('fn-hide')
				}
			}
		})
		
	}

   
})