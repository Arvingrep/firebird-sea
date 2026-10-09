$(function(){
    // 显示/隐藏管理地址
    $('.manage_btn').click(function(){
        $(".wrap").addClass('editwrap')
    })
    $('.finish_btn').click(function(){
        $(".wrap").removeClass('editwrap')
    });

    $(".a_set_addr,.edit_btn a,.add_btn,.link").each(function(){
        let t = $(this),url =  t.attr('href')
        if(url != 'javascript:;'){
            let logitcprosStr = urlParam.replace(logitcpros_str,'')
            if(logitcprosStr){
                logitcprosStr = url.indexOf('?') > -1 ? ('&' + logitcprosStr) : ('?' + logitcprosStr)
                url = url + logitcprosStr;
            }
            if(logitcpros){
                url = url + (url.indexOf('?') > -1 ? ('&' + logitcpros) : ('?' + logitcpros))
            }

            t.attr('href',url) 
        }
        
    })

    var popOptions = {
        title:'确定删除该地址',
        confirmTip:'地址删除后无法恢复',
        isShow:true,
        btnSure:'确定'
      }
    $("body").delegate('.del_btn','click',function(){
        var t = $(this),obj = t.closest('.item'),id = obj.find('.a_set_addr').attr('data-id');
        confirmPop(popOptions,function(){
            $.ajax({
                url: masterDomain + "/include/ajax.php?service=member&action=addressDel",
                data: "id="+id,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    if(data && data.state == 100){
                        obj.hide(300, function(){
                            showErrAlert('删除成功')
                            obj.remove();
                            if($(".addresslist .item").length == 0){
                                $(".noData").removeClass('fn-hide')
                            }
                            
                        });
                    }else{
                        showErrAlert(data.info);
                    }
                },
                error: function(){
                    showErrAlert(langData['siteConfig'][20][183]);
                }
            });
        })
    })


    if(getQueryVariable('from') && getQueryVariable('from') != 'order'){
        var param = getQueryVariable('from');
        $(".add_btn").attr('href',address_add + '&url=' + param)
    }
})

var addridsArr = [];
var lnglat = '';
var isload_addr = false
// 新增地址
$('.add_btn').click(function(){
    console.log(navigator.userAgent.toLowerCase().match(/micromessenger/) && typeof (wx) != 'undefined' && !wx_miniprogram)
    if(navigator.userAgent.toLowerCase().match(/micromessenger/) && typeof (wx) != 'undefined' && !wx_miniprogram){  //只在微信浏览器

        $('.bottomPop').css({
            display:'block'
        })
        setTimeout(function(){
            $('.bottomPopBox').addClass('show')
        },100)
       return false;
    }
})
$('.bottomPopBox .bp_mask').click(function(){
    $('.bottomPopBox').removeClass('show')
    setTimeout(function(){
       $('.bottomPop').css({
            display:'none'
        })
    },300)
})

$('.bottomPopBox .bottomPop li a').click(function(){
    $('.bottomPopBox').removeClass('show')
    if($(this).hasClass('fromWx')){
        wx.config({
            debug: false,
            appId: wxconfig.appId,
            timestamp: wxconfig.timestamp,
            nonceStr: wxconfig.nonceStr,
            signature: wxconfig.signature,
            jsApiList: ['openAddress'],
            // openTagList: ['wx-open-launch-app','wx-open-launch-weapp'] // 可选，需要使用的开放标签列表，例如['wx-open-launch-app']
        });
        wx.ready(function () {
            wx.openAddress({
                success: function (res) {
                  var userName = res.userName; // 收货人姓名
                  var postalCode = res.postalCode; // 邮编
                  var provinceName = res.provinceName || res.provinceFirstStageName; // 国标收货地址第一级地址（省）
                  var cityName = res.cityName || res.citySecondStageName; // 国标收货地址第二级地址（市）
                  var countryName = res.countryName|| res.countiesThirdStageName; // 国标收货地址第三级地址（国家）
                  var detailInfo = res.detailInfo || res.detailInfoNew; // 详细收货地址信息
                  var nationalCode = res.nationalCode; // 收货地址国家码
                  var telNumber = res.telNumber; // 收货人手机号码


                    var myprovince = provinceName && provinceName.replace('省','') || ''
                    var mycity = cityName && cityName.replace('市','')|| ''
                    var mydistrict = countryName && countryName.replace('区','')|| ''
                    let addrObj = {
                        ...res,
                        provinceName,
                        cityName,
                        countryName,
                        detailInfo
                    }
                    localStorage.setItem("wxAddress", JSON.stringify(addrObj));
                    let logitcprosStr = urlParam && urlParam.replace(logitcpros_str,'') || ''
                    let urlTo =  address_add_1 +'?'+(logitcprosStr) + (logitcpros ? '&' + logitcpros : '')

                    setTimeout(() => {
                        location.href = urlTo
                    },100)
                },
                fail:function(res){
                    console.log(res)
                    console.log(wxconfig)
                    console.log(wx)
                }
              
              });
        })
        
    }
})

// 根据返回的地址信息  获取

// // 获取当前定位的城市id，区域id
// function calcAddrid(myprovince,mycity,mydistrict,param){  param

//     var cityArr = [myprovince,mycity,mydistrict]
//     if(myprovince == mycity){
//         cityArr = [myprovince,mydistrict]
//     }
//     addridsArr = [];
//     checkCityid(cityArr,0,param)

// }

// 	function checkCityid(strArr,type,param){
// 		// var promise = new promise((resolve, reject) => {
			
// 		// })
// 		$('.loadIcon').removeClass('fn-hide')
// 		var id = 0;
// 		switch(type){
// 			case 0 : 
// 				id = 0;
// 				break;
// 			case 1 : 
// 				id = pid;
// 				break;
// 			case 2 : 
// 				id = cid;
// 				break;
// 			case 3 : 
// 				id = did;
// 				break;
// 		}
// 		var typeStr = '&type='+id;
// 		$.ajax({
// 			url: "/include/ajax.php?service=siteConfig&action=area" + typeStr,
// 			type: "POST",
// 			dataType: "jsonp",
// 			success: function(data){
// 				if(data && data.state == 100){
// 					var city = data.info;
// 					for(var i=0; i<city.length; i++){
// 						if(city[i].typename == strArr[type] || (city[i].typename == strArr[type] + '区') ||  city[i].typename == strArr[type] + '省' || (city[i].typename && city[i].typename.indexOf(strArr[type]) > -1) || (strArr[type] && strArr[type].indexOf(city[i].typename) > -1) ||  (city[i].typename == strArr[type] + '市') ||  (city[i].typename == strArr[type] + '镇') ){
// 							switch(type){
// 								case 0 : 
// 									pid = city[i].id;
// 									break;
// 								case 1 : 
// 									cid = city[i].id;
// 									break;
// 								case 2 : 
// 									did = city[i].id;
// 									break;
// 								case 3 : 
// 									tid = city[i].id;
// 									break;
// 							}
// 							type++;
// 							addridsArr.push(city[i].id)
//                             lnglat = city[i].longitude + ',' + city[i].latitude
// 							if(type < strArr.length){
// 								checkCityid(strArr,type,param)
// 							}else{
//                                 // 已经获取了省市区的cityid
//                                 console.log('此处可以添加地址',lnglat)
//                                 var userName = param.userName; // 收货人姓名
//                                 var postalCode = param.postalCode; // 邮编
//                                 var provinceName = param.provinceName; // 国标收货地址第一级地址（省）
//                                 var cityName = param.cityName; // 国标收货地址第二级地址（市）
//                                 var countryName = param.countryName; // 国标收货地址第三级地址（国家）
//                                 var detailInfo = param.detailInfo; // 详细收货地址信息
//                                 var nationalCode = param.nationalCode; // 收货地址国家码
//                                 var telNumber = param.telNumber; // 收货人手机号码
//                                 let data = [];
//                                 data.push('addrid=' + addridsArr[addridsArr.length - 1]);
//                                 data.push('address=' + encodeURIComponent(detailInfo));
//                                 data.push('person=' + encodeURIComponent(userName));
//                                 data.push('mobile=' + telNumber);
//                                 data.push('areaCode=86');
//                                 data.push('lnglat=' + lnglat)
//                                 addAddress(data); //添加地址
// 								break;
// 							}
// 						}

// 					}
					
// 				}else{
// 					$('.loading').hide()
// 				}
// 			}
// 		})
		
// 	}



// // 新增地址
// function addAddress(data){
//     $.ajax({
//         url: "/include/ajax.php?service=member&action=addressAdd",
//         data: data.join("&"),
//         type: "GET",
//         dataType: "json",
//         success: function (data) {
//             $('.loading').hide();
//             if(data && data.state == 100){
//                 showErrAlert('保存成功');
//                 setTimeout(function(){
//                    location.reload() 
//                 },1500)
                

//             }else{
//                 var popOptions = {
//                     btnCancel:'确定',
//                       title:data.info,
//                       btnColor:'#222',
//                       noSure:true,
//                       isShow:true
//                 }
//                 confirmPop(popOptions);
//             }
//         },
//         error: function(){
//             var popOptions = {
//                 btnCancel:'确定',
//                   title:langData['siteConfig'][20][183],
//                   btnColor:'#222',
//                   noSure:true,
//                   isShow:true
//             }
//             confirmPop(popOptions);
//         }
//     });
// }

// 获取url参数
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}