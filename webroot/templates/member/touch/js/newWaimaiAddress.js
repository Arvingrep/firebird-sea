toggleDragRefresh('off');
new Vue({
  el:'#page',
  data:{
    swicthVal:Number(hasDefault) ? 0 : 1,
    areaCode:86,
    addrArr:'',  //选择的地址
    address:'', //自己填写的
    mobile:'', //手机号
    people:'', //联系人
    waimaiData:'',
    from:'index',
    shopid:0, //店铺ID 从地址列表中进来
    addressid:0, //地址ID，编辑地址时用到,
    hasDefault:Number(hasDefault), //是否设置过默认地址
    cityInfo:siteCityInfoCurr && JSON.parse(siteCityInfoCurr) ||'', //城市
  },
  computed:{
    lnglat:function(){
      return function(lnglat){
        lnglat = lnglat.split(',');
        return lnglat;
      }
    }
  },
  mounted(){
    var tt = this;
    $('body').delegate('.Ju_areaList li','click',function(){
      var t = $(this),areaCode = t.attr('data-code');
      tt.areaCode = areaCode;
    });

    // 隐藏遮罩
    $(".phoneCodePop .back,.phoneCodeMask").click(function() {
      // body...
      $('.phoneCodeMask').removeClass('show');
      $(".phoneCodePop").hide();
      $(".phoneCodePop").css('transform', 'translateY(100%)');
    })
    tt.from = tt.getParam('from');
    tt.shopid = tt.getParam('shopid')
    if(tt.getParam('id')){
      tt.addressid = tt.getParam('id');
      $(".header-address").text('修改地址')
      tt.getAddressDetail();
    }
    // 确认是否填写过相关内容
    var waimaiData = localStorage.getItem('waimaiData');
    if(waimaiData){
      tt.addrArr = {};
      waimaiData = JSON.parse(waimaiData);
      waimaiData.forEach(function(val){
        if(val.name == 'addr' || val.name == 'detailAddr' || val.name == 'lnglat'){
          tt.addrArr[val.name] = val.value;
        }else if(val.name == "default"){
          tt.swicthVal = val.value;
        }else{
          tt[val.name] = val.value
        }
      });
      if(tt.addrArr['lnglat']){

        var lng = tt.addrArr['lnglat'].split(',')[0],lat = tt.addrArr['lnglat'].split(',')[1]
        tt.checkCity({'lng':lng,'lat':lat});  //获取城市乡镇
      }
      localStorage.removeItem('waimaiData');
    }else if(!tt.addressid){
      //新增时自动定位
      HN_Location.init(function(data){
        if (data == undefined || data.name == "" || data.lat == "" || data.lng == "") {
        }else{
            tt.addrArr = {
              addr: data.name,
              detailAddr: data.address,
              lnglat: data.lng + ',' + data.lat
            }          
        }
      }, device.indexOf('huoniao') > -1 ? false : true);
    }

  },
  methods:{
    // 获取url参数
    getParam(paramName){
  		paramValue = "", isFound = !1;
  		if (window.location.search.indexOf("?") == 0 && window.location.search.indexOf("=") > 1) {
  			arrSource = unescape(window.location.search).substring(1, window.location.search.length).split("&"), i = 0;
  			while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
  		}
  		return paramValue == "" && (paramValue = null), paramValue
  	},
    // 选择手机区号
    showPhoneCode(){
      $(".phoneCodeMask").addClass('show')
		  $(".phoneCodePop").show().css('transform', 'translateY(0)');
    },

    // 保存数据
    saveData(){
      var tt = this;
      var form = $('.formBox');
      var addr = $("#addr").val();
      var detailAddr = $("#detailAddr").val();
      var people = $('input[name="people"]').val();
      var tel = $("#mobile").val();
      if(addr == ''){
        showErrAlert('请选择收货地址');
        return false;
      }

      if(people == ''){
        showErrAlert('请填写联系人');
        return false;
      }

      if(tel == ''){
        showErrAlert('请填写手机号');
        return false;
      }

      if(!(/^1[3|4|5|6|7|8|9]\d{9}$/.test(tel))){
        showErrAlert('请填写正确手机号');
        return false;
      }

      var addr_id = $("#addressid").val() && Number($("#addressid").val()) || '';
      $.ajax({
           url: "/include/ajax.php?service=waimai&action=operAddress",
           data: form.serialize(),
           dataType: "json",
           success: function (data) {
             if(data.state == 100){
               var time  = Date.parse(new Date());
               utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': $("#lnglat").val().split(',')[0], 'lat': $("#lnglat").val().split(',')[1], 'address':addr, 'cityid':tt.cityInfo.cityid, 'cityname':tt.cityInfo.name}));
               if(tt.from == 'index'){
                 if(wx_miniprogram){
                   wx.miniProgram.redirectTo({
                   	// 'cityid':tt.cityInfo.cityid, 'cityname':tt.cityInfo.name
                     url:'/pages/packages/waimai/index/index?cityid='+tt.cityInfo.cityid+'&cityname='+tt.cityInfo.name+'&waimai_local='+JSON.stringify({'time': time, 'lng': $("#lnglat").val().split(',')[0], 'lat': $("#lnglat").val().split(',')[1], 'address':addr ,})
                   })
                 }else if(device.indexOf('huoniao_Android') > -1){
                  setupWebViewJavascriptBridge(function(bridge) {
                    bridge.callHandler("goBack", {"from": "new_address_waimai"}, function(responseData){});
                   })
                 }else{
                   window.location.replace(waimaiIndex);
                 }

               }else if(tt.from == 'address'){
                 window.location.replace(waimaiIndex.split('?')[0]+'/address-'+tt.shopid+'.html'+(waimaiIndex.split('?').length > 1 ? ('?' + waimaiIndex.split('?')[1] ): '' ));
                }else if(tt.shopid){
                  let url = `${waimaiIndex.split('?')[0]}/cart-${tt.shopid}.html?address=${addr_id || data.info}${waimaiIndex.split('?').length > 1 ? ('&' + waimaiIndex.split('?')[1] ): '' }`
                  window.location.replace(url) ;

               }else if(tt.from == 'user'){
                 window.location = waimaiAddress;
               }
             }else{
               showErrAlert(data.info)
             }
           },
           error:function(){},
      })

    },

    toMapPosi_waimai(){
      var tt = this;
      var form = $(".formBox");
      tt.waimaiData = form.serializeArray();
      tt.waimaiData.push({'name':'returnUrl','value': window.location.href})
      localStorage.setItem('waimaiData', JSON.stringify(tt.waimaiData));
      window.location.href = memberUrl;
    },

    // 删除地址
    delAddr(id){
      var tt = this;
      $.ajax({
          url: "/include/ajax.php?service=waimai&action=delAddress",
          data: {
              id: id
          },
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
            if(data.state == 100){
                
               showErrAlert('删除成功');
               if(tt.from == 'address' || tt.shopid){
                window.location.replace(waimaiIndex.split('?')[0]+'/address-'+tt.shopid+'.html'+(waimaiIndex.split('?').length > 1 ? ('?' + waimaiIndex.split('?')[1] ): '' ));
               }else if(tt.from == 'user'){
                window.location = waimaiAddress;
               }
            //   window.location.replace(waimaiIndex.split('?')[0]+'/address-'+tt.shopid+'.html'+(waimaiIndex.split('?').length > 1 ? ('?' + waimaiIndex.split('?')[1] ): '' ));
            }
          },
          error: function (data) {},
        })
    },

    // 地址详情
    getAddressDetail(){
      var tt = this;
      $.ajax({
           url: "/include/ajax.php?service=waimai&action=getAddressDetail&id="+tt.addressid,
           dataType: "json",
           success: function (data) {
             if(data.state == 100){
               var addrDetail = data.info
               tt.mobile = addrDetail.tel;
               tt.address = addrDetail.address;
               tt.people = addrDetail.person;
               tt.swicthVal = addrDetail.def == '1' ? 1 : 0;
               tt.addrArr = {
                 addr:addrDetail.street,
                 lnglat:addrDetail.lng+','+addrDetail.lat
               };
             }
           },
           error:function(){},
      })
    },

     // 获取城市id
     // 验证城市
    checkCity(data){
      var tt = this;
      //判断当前城市
      HN_Location.lnglatGetTown(data,function(){
        var siteCityInfo = $.cookie("HN_siteCityInfo");
        var province = data.province, city = data.city, district = data.district, town = data.town;
        $.ajax({
            url: "/include/ajax.php?service=siteConfig&action=verifyCity&region="+province+"&city="+city+"&district="+district+"&module=waimai"+"&town="+town,
            type: "POST",
            dataType: "json",
            success: function(data){
              if(data && data.state == 100){
                console.log(data,siteCityInfo)
                var siteCityInfo_ = JSON.parse(siteCityInfo);
                var nowCityInfo = data.info;
                tt.cityInfo = nowCityInfo
                // if(!siteCityInfo_ || siteCityInfo_.cityid != nowCityInfo.cityid){


                // }
              }
            }
        })
      })
    },

    // 删除确认
    sureDelAddr(){
      var tt = this;
      var alertpopOptions = {
        btnCancel:'取消',
        title:'确认删除该地址？',
        btnColor:'rgb(255 174 0)',
        confirmTip:'一经删除，不可恢复',
        // noSure:true,
        isShow:true
      }
      confirmPop(alertpopOptions,function(){
        tt.delAddr(tt.addressid)
      });
    }
  }
})
