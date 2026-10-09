var pid,cid,did,tid;
$(function(){

  //APP端取消下拉刷新
  toggleDragRefresh('off');
  var modinfoData = utils.getStorage('modinfo');

  if(modinfoData){
    console.log(modinfoData)
    if(modinfoData.modname == 1){
      $('.modname').html('本地团购模板');
      $('.f-item.projects').remove();
    }else{
      $('.modname').html('电商销售模板');
    }
    $('.salename').html(modinfoData.salename);
    $('#shoptype').val(modinfoData.modname);
    $('#typesales').val(modinfoData.saletype);

    var spAr = modinfoData.saletype.split(',');
    for(var i= 0;i<spAr.length;i++){
        $('.saleItem[data-id="'+spAr[i]+'"]').addClass('curr');
    }
    
  }else{
    if($('#typesales').val() == ''){
        alert('请重新选择销售类型');
        location.href = fanUrl1;
        return false;
    }
  }



  //重新修改
  $('.changeMod').click(function(){
    console.log(modinfoData);

    var turl = $(this).attr('href');
    var modAdrr = {'modname': $('#shoptype').val(), 'saletype': $('#typesales').val(),'salename':$('.salename').html()}
    utils.setStorage('modinfo',JSON.stringify(modAdrr));
    // setTimeout(function(){
    //   window.location.href = turl;
    // },500)
  })





 //商家自配、自提
  $('.changePs').click(function(e){
    var t = $(this);
    if(t.hasClass('disabled')) return false;
    var popOptions = {
      title:'确定申请同城配送方式改为商家自行配送？',
      confirmTip:'友情提示：审核通过后商家需自行配置配送范围及运费，并为所有相关商品添加运费模板，后续订单配送收入全归商家所有。',
      isShow:true,
      btnSure:'确定提交审核'
    }
    var pstype = t.closest('.saleItem').attr('data-id');
    if(configstate == '0'){
      popOptions.btnSure='确定'
      if(pstype =='2'){//平台配送
        popOptions.title="确定将平台配送改为商家配送？";
        popOptions.confirmTip='友情提示：商家需自行配置配送范围及运费，并为所有相关商品添加运费模板，后续订单配送收入全归商家所有。';

      }else{
        popOptions.title="确定向平台申请提供平台配送服务？";
        popOptions.confirmTip='友情提示：为您接入平台骑手配送服务平台配送省时省心 为您的商品提供多一种可能！';
      }
    }else{
       popOptions.btnSure='确定提交审核'
      if(pstype =='2'){//平台配送
        popOptions.title="确定申请平台配送方式改为商家自行配送？";
        popOptions.confirmTip='友情提示：审核通过后商家需自行配置配送范围及运费，并为所有相关商品添加运费模板，后续订单配送收入全归商家所有。';
      }else{
        popOptions.title="确定向平台申请提供平台配送服务？";
        popOptions.confirmTip='我们将尽快审核通过，为您接入平台骑手配送服务平台配送省时省心 为您的商品提供多一种可能！';
      }
    }
    
    confirmPop(popOptions,function(){
     
        if(configstate == '0'){
          var txt = ''
           if(pstype =='2'){//平台配送
              $(".saleItem.deliver h3 strong").html('商家自配')
                t.html('改为平台配送>');
                pstype = '3'
                txt = '商家自配'
            }else{//商家自配
              $(".saleItem.deliver h3 strong").html('平台配送')
               pstype = '2'
                t.html('改为商家自配>');
                txt = '平台配送'
            }
            $(".saleItem.deliver p").text('本店支持配送上门，当前配送方式为'+txt)
            $(".saleItem.deliver").attr('data-id',pstype)
        }else{

          $.ajax({
              url: masterDomain+"/include/ajax.php?service=shop&action=editPeisong&id="+id,
              type: 'post',
              dataType: 'json',
              success: function(data){
                  if(pstype =='2'){//平台配送
                      t.addClass('disabled').html('已申请商家自配，请等待审核');
                  }else{//商家自配
                      t.addClass('disabled').html('已申请平台配送，请等待审核');
                  }
              },
              error: function(data){
              showErrAlert(data.info);
              }
          });
          return false;
        }

    })
     e.stopPropagation()
  })

    //选择销售类型
  $('.saleWrap .saleItem').click(function(){
    if($(this).hasClass('disabled')) return false;
     $(this).toggleClass('curr');
     var arr = [];
     $(".saleItem ").each(function(){
        if($(this).hasClass("curr")){
          arr.push($(this).attr('data-id'))
        }
     })
     $("#typesales").val(arr.join(','))
  })

  mobiscroll.settings = {
		    theme: 'ios',
		    themeVariant: 'light',
			height:40,
			lang:'zh',

			headerText:true,
			calendarText:langData['waimai'][10][71],  //时间区间选择
		};
  //所属行业
  $.ajax({
      type: "POST",
      url:  "/include/ajax.php?service=shop&action=type",
      dataType: "json",
      success: function(res){
          if(res.state==100 && res.info){
              var instance = mobiscroll.select('#industryname', {
    						data:res.info,
    						dataText:'typename',
    						dataValue:'id',
    						onSet: function (event, inst) {
    							$("#industry").val(inst._wheelArray)
    						},
    					})
              if($("#industry").val() != ''){
                instance.setVal($("#industry").val(),true);
              }else{
                $("#industry").val(res.info[0].id);
              }
          }
      }
  });

  // 选择定位
  /*
   * 1.获取当前页面填充的数据 保存数据
   * 2.跳转选择地图的页面
   * 3.返回当前页面
   * 4.填充数据

    */
  $('.map_detail').click(function(){
    var addressVal = $('#addr').html();
	  var zizhiArr=[]
    $('.qualityBox .img-box').each(function(){
      var cominp = $(this).find('.compinut');
      var imgPath = $(this).find('.logoshow img').attr('data-url')||'';
      var tid = cominp.attr('data-id'),tname = cominp.attr('data-name'),timg = cominp.val();
      zizhiArr.push({'id':tid,'typename':tname,'image':timg,'imgpath': `${imgPath&&!imgPath.includes('attachment.php')?`/include/attachment.php?f=`:``}${imgPath}`});
    })

		var form = $("#fabuForm"), action = form.attr("action");
    var data = form.serialize()+'&address='+addressVal+'&authattrparam='+JSON.stringify(zizhiArr);
    var dataArr = form.serializeArray();
    // 地址
    dataArr.push({
      name:'address',
      value:addressVal
    })
    // logo
    dataArr.push({
      name:'logoPath',
      value:$('.logobox img').attr('data-turl')||$('.logobox img').attr('data-url')||''
    })

    dataArr.push({
      name:'authattrparam',
      value:zizhiArr,
    })
    // 返回地址
    dataArr.push({
      name:'returnUrl',
      value:window.location.href,
    });

    localStorage.setItem('infoData',JSON.stringify(dataArr))
    window.location.href = (memberUrl + '/mapPosi.html?noPosi=1&currentPageOpen=1');
  });


  //接收数据/处理数据
  var infoData = localStorage.getItem('infoData');
  if(infoData){
    infoData = JSON.parse(infoData);
    infoData.forEach(function(param){
      $("input[name="+param.name+"]").val(param.value);
      if(param.name == 'logoPath'){
        if(param.value){
          $(".logobox img").attr('src',param.value).attr('data-turl',param.value);
          $(".logobox").removeClass('fn-hide')
          $(".logo_container").addClass('fn-hide')
        }else{
          $('.logobox img').remove();
          $(".logobox").addClass('fn-hide');
          $(".logo_container").removeClass('fn-hide');
        }
      }

      if(param.name == 'authattrparam'){
        var zizhiArr = param.value;
        $('.qualityBox .img-box').each(function(){
          var cominp = $(this).find('.compinut');
          var tid = cominp.attr('data-id');
          for(var i = 0; i < zizhiArr.length; i++){
            if(tid == zizhiArr[i]['id']){
              cominp.val(zizhiArr[i]['image'])
              if(zizhiArr[i]['imgpath']){
                $(this).find('.logoshow img').attr('data-url',zizhiArr[i]['image'])
                $(this).find('.logoshow img').attr('src',zizhiArr[i]['imgpath'])
                $(this).find('.logoshow').removeClass('fn-hide')
                $(this).find('.logo_container').addClass('fn-hide')
              }else{
                $(this).find('.logoshow').addClass('fn-hide');
                $(this).find('.logo_container').removeClass('fn-hide');
                $(this).find('.logoshow img').remove();
              }
            }
          }


        })
      }
      if(param.name == 'address'){

        $('#addr').html(param.value)
      }

      if(param.name == 'lnglat' && param.value){
        $('.loadingItem').css({'display':'flex'});
        let lnglat = param.value.split(',')
        $("#lnglat").val(param.value)
        $(".map_detail").attr('data-lng',lnglat[0]).attr('data-lat',lnglat[1])

        let point = {lng:lnglat[0],lat:lnglat[1]}
        setTimeout(() => { //异步，否则看不出loading效果
          HN_Location.lnglatGetTown(point, function (data) {
            // var province = data.province ? data.province.replace('省','').replace('市','') : ''; // 省,直辖市
            // var city = data.city ? data.city.replace('市','') : ''; // 市
            // var district = data.district ? data.district.replace('区','').replace(city,'') : ''; // 
            // var town = data.town ? data.town.replace('镇','').replace('街道','') : ''; // 
            let datas = {
              region: data.province || '',
              city: data.city || '',
              district: data.district || '',
              town: data.town || ''
            }
            $.ajax({
              url: `/include/ajax.php?service=siteConfig&action=verifyCityInfo`,
              data: datas,
              success: res => {
                $('.loadingItem').hide();
                if (typeof res == 'string') {
                  res = JSON.parse(res);
                }
                if (res.state == 100) {
                  let addridsArr = [];
                  let strArr = [];
                  let idsArr = res.info.ids;
                  let namesArr = res.info.names;
                  for (let i = 0; i < idsArr.length; i++) {
                    let ids = idsArr[i];
                    let names = namesArr[i];
                    switch (i) {
                      case 0:
                        pid = ids;
                        break;
                      case 1:
                        cid = ids;
                        break;
                      case 2:
                        did = ids;
                        break;
                      case 3:
                        tid = ids;
                        break;
                    }
                    addridsArr.push(ids);
                    strArr.push(names);
                  }
                  $(".chose_area").attr('data-ids', addridsArr.join(' '));
                  $(".chose_area").attr('data-id', addridsArr[addridsArr.length - 1]);
                  $("#addrid").val(addridsArr[addridsArr.length - 1]);
                  $(".chose_area").removeClass('gz-no-sel').attr('data-addrname', strArr.join(' '));
                  $(".chose_area .city").text(strArr.join(' '));
                } else {
                  showErrAlert('城市定位失败，请手动选择城市');
                  $('.city').text('定位失败，手动选择城市')
                }
              }
            })
            // setTimeout(() => { 
            //   calcAddrid(province,city,district,town);
            // }, 0);
          })
        }, 0);
      }
      
      localStorage.removeItem("infoData");
    })





  }

  // function checkAddr(districtInfo) {
  //   var city = districtInfo.address.split(' ')[0]
  //   var district = districtInfo.title
    
  //   $.ajax({
  //     url: '/include/ajax.php?service=siteConfig&action=verifyCityInfo&city='+city+'&district='+district,
  //     type: "POST",
  //     dataType: "json",
  //     success: function (data) {
  //       if(data && data.state == 100){
  //         var addrArr = data.info.ids;
  //         var addrname = data.info.names;
  //         $(".chose_area").attr('data-ids',addrArr.join(' ')).attr('data-id',addrArr[addrArr.length - 1]);
  //         $(".chose_area p.city").text(addrname.join(' '))
  //         $("#addrid").val(addrArr[addrArr.length - 1])
  //       }
  //     },
  //     error: function(){}
  //   });
  // }


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
					checkCityid(cityArr,1,param)
				}
			})
		}else{
			checkCityid(cityArr,0)
		}	

	}

	function checkCityid(strArr,type,param){
		// var promise = new promise((resolve, reject) => {
			
		// })
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
        $('.loadingItem').hide();
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
                $(".chose_area").removeClass('gz-no-sel').attr('data-addrname',strArr.join(' '));
                $(".chose_area .city").text(strArr.join(' '));
                $('.loadIcon').addClass('fn-hide')
                $('.city').text('定位失败，手动选择城市')
              }
						}
					}
					
				}else{
					$('.loadIcon').addClass('fn-hide')
				}
			}
		})
		
	}


  // 表单提交
  $(".tjBtn").bind("click", function(event){

		event.preventDefault();
    var  t           = $(this);
        
    if((storeid != '' && storeid != '0') && editModuleJoinCheck == '0'){
      var popOptions = {
            title:'温馨提示',
            confirmTip:'提交店铺资料修改后，店铺会进入平台审 核状态，店内商品将暂停销售，进行中订 单仍可正常处理。店铺资料审核通过后即 恢复正常！', 
            isShow:true,
            // noSure:true,
            btnColor:'#3B7CFF',
            btnCancelColor:'#000',
            btnCancel:'取消',
            btnSure:'确定修改'
          }
         confirmPop(popOptions,function(){
            submit(t);  //确认提交
         },function(){
            console.log('取消')
            return false
         })    
        
    }else{
      submit(t); //直接提交
    }

		

  });




  function submit(t){

    var logo      = $("#logo"),
        addrid      = $("#addrid"),
        industry      = $("#industry"),
        title      = $("#title"),
        referred      = $("#referred"),
        address     = $("#addr"),
        people      = $("#people"),
        contact     = $("#contact"),
        tel         = $("#tel"),
        cityid      = $('#cityid');

    if(t.hasClass("disabled")) return;

    //店铺logo
    if(logo.val() == ''){
      showErrAlert('请上传店铺LOGO');
      return
    }

    //店铺名称
    if($.trim(title.val()) == ''){
        showErrAlert('请输入'+langData['siteConfig'][19][174]);
        return
    }
    // 所属行业
    if($.trim(industry.val()) == ''){
        showErrAlert('请选择所属行业');
        return
    }

    //区域
    if($.trim(addrid.val()) == "" || addrid.val() == 0){
      showErrAlert(langData['siteConfig'][20][68]);
      return
    }

    // 详细地址, 除快递之外 都需必填
    if($("#addr").text() == ''){
       showErrAlert('请输入详细地址');
      return
    }


    var rflag = 0;
    $('.qualityBox .img-box').each(function(){
      var inptxt = $(this).attr('data-title');
      var inpval =$(this).find('.compinut').val();
      if($(this).attr('data-required') == 1 && inpval ==''){//平台要求验证
        showErrAlert(inptxt);
        rflag =1;
        return false;
      }
    })
    if(rflag) return;

    var addrids = $('.chose_area').attr('data-ids');
    var cityid_ = addrids ? addrids.split(' ')[0] : 0;
    cityid.val(cityid_);

    var addressVal = $('#addr').html();
  var zizhiArr=[]
    $('.qualityBox .img-box').each(function(){
      var cominp = $(this).find('.compinut');
      var tid = cominp.attr('data-id'),tname = cominp.attr('data-name'),timg = cominp.val();
      zizhiArr.push({'id':tid,'typename':tname,'image':timg})
    })

    var form = $("#fabuForm"), action = form.attr("action");
    var data = form.serialize()+'&address='+addressVal+'&authattrparam='+JSON.stringify(zizhiArr);
    t.addClass('disabled').find('a').html('保存中');
    $.ajax({
      url: action,
      data: data,
      type: "POST",
      dataType: "json",
      success: function (data) {
        if(data && data.state == 100){
          showErrAlert(langData['siteConfig'][6][39])
          // 清除数据存储
          utils.removeStorage('modinfo');
          var locurl = '';
          if(profrom == '1'){//商家/b/index 过来的
              locurl = fanUrl2;
          }else if(profrom == '2'){//商家 /b/shop.html 过来的
            locurl = fanUrl3;
          }else{//基本配置过来的 /b/config-shop.html
            locurl = fanUrl3;
          }
          window.location.href = locurl;
        }else{
                    showErrAlert(data.info)
        }
        t.removeClass('disabled').find('a').html('保存设置');
      },
      error: function(){
        showErrAlert(langData['siteConfig'][20][183]);
        t.removeClass('disabled').find('a').html('保存设置');
      }
    });

  }


  // 上传LOGO
  var upPhoto = new Upload({
    btn: '#up_logo',
    bindBtn: '',
    title: 'Images',
    mod: 'shop',
    params: 'type=atlas',
    atlasMax: 1,
    deltype: 'delAtlas',
    replace: true,
    fileQueued: function(file){

    },
    uploadSuccess: function(file, response){
      if(response.state == "SUCCESS"){
        var dt = $('#up_logo').closest("dl").children("dt");
        var img = dt.children('img');
        if(img.length){
          var old = img.attr('data-url');
          upPhoto.del(old);
        }
        dt.html('<img src="'+response.turl+'" data-url="'+response.url+'" data-turl="'+response.turl+'"  alt=""><i class="del_btn"></i>').removeClass('fn-hide');
        dt.siblings('dd').addClass('fn-hide')
        $("#logo").val(response.url)
      }
    },
    showErr: function(info){
      showErrAlert(info);
    }
  });

  // 上传营业执照
 $('.qualityBox .img-box').each(function(){
    var tindex = $(this).index();
    var upImginput = $(this).find('.input-img');
    var cominput = $(this).find('.compinut');
    var upLicense = new Upload({
        btn: upImginput,
        bindBtn: '',
        title: 'Images',
        mod: 'shop',
        params: 'type=certificate',
        atlasMax: 1,
        deltype: 'delcertificate',
        replace: true,
        fileQueued: function(file){

        },
        uploadSuccess: function(file, response){
          if(response.state == "SUCCESS"){
            var dt = upImginput.closest("dl").children("dt");
            var img = dt.children('img');
            if(img.length){
              var old = img.attr('data-url');
              upLicense.del(old);
            }
            dt.html('<img src="'+response.turl+'" data-url="'+response.url+'" alt=""><i class="del_btn"></i>').removeClass('fn-hide');
            dt.siblings('dd').addClass('fn-hide')
            cominput.val(response.url)
          }
        },
        showErr: function(info){
          showErrAlert(info);
        }
      });

  })

  // 删除logo/营业执照/食品安全许可证
  $(".logoshow").delegate('.del_btn','click',function(){
    var t = $(this);
    var val = t.siblings('img').attr('data-url');
    t.closest('.logoshow').addClass('fn-hide').find('img').remove();
    t.closest('dl').find('dd').removeClass('fn-hide')
    if(t.closest('.logoshow').hasClass('logobox')){//logo
       upPhoto.del(val);
      $('#logo').val('');
    }else{//资质等
     	var par =$(this).closest('.img-box');
   	 	par.find('.compinut').val('');
      var g = {
        mod: 'shop',
        type: t.closest('.formWrap').hasClass('qualityBox') ? 'delcertificate' : 'delAtlas',
        picpath: val,
        randoms: Math.random()
      };
      $.ajax({
        type: "POST",
        cache: false,
        async: false,
        url: "/include/upload.inc.php",
        dataType: "json",
        data: $.param(g),
        success: function() {}
      });
    }

  })

})


// 扩展zepto
$.fn.prevAll = function(selector){
    var prevEls = [];
    var el = this[0];
    if(!el) return $([]);
    while (el.previousElementSibling) {
        var prev = el.previousElementSibling;
        if (selector) {
            if($(prev).is(selector)) prevEls.push(prev);
        }
        else prevEls.push(prev);
        el = prev;
    }
    return $(prevEls);
};

$.fn.nextAll = function (selector) {
    var nextEls = [];
    var el = this[0];
    if (!el) return $([]);
    while (el.nextElementSibling) {
        var next = el.nextElementSibling;
        if (selector) {
            if($(next).is(selector)) nextEls.push(next);
        }
        else nextEls.push(next);
        el = next;
    }
    return $(nextEls);
};
