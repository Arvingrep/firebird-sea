 var carOpenMap_URL = "";//跳转链接路径
var MapImg_URL2 = ""; //根据经纬度获取地图IMG
var pageData2={};
if(pageData2.lnglat){
  var lnglatArr2 = pageData2.lnglat.split(',');
  pageData2.lng = lnglatArr2[0];
  pageData2.lat = lnglatArr2[1];
}
var userAgent1 = navigator.userAgent;
var ua2 = navigator.userAgent.toLowerCase();//获取判断用的对象
function carMap_url(pageData){
	//跳转链接路径
	if (ua2.match(/MicroMessenger/i) == "micromessenger") {
	    carOpenMap_URL = "javascript:;";
	    if (pageData2.mapType == "baidu") {
	        var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
	        var x = pageData2.lng - 0.0065;
	        var y = pageData2.lat - 0.006;
	        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
	        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
	         pageData2.lng = z * Math.cos(theta);
	         pageData2.lat = z * Math.sin(theta);
	    }
	}else if (pageData2.mapType == "baidu") {
	    carOpenMap_URL = "https://api.map.baidu.com/marker?location="+pageData2.lat+","+pageData2.lng+"&title="+pageData2.title+"&content="+pageData2.address+"&output=html"
	}else if (pageData2.mapType == "google") {
	    carOpenMap_URL = "https://www.google.com/maps/place/"+pageData2.cityName+""+pageData2.title+""
	}else if (pageData2.mapType == "amap") {
	    carOpenMap_URL = "https://m.amap.com/search/mapview/keywords="+pageData2.title+"&city="+pageData2.cityName+""
	}else if (pageData2.mapType == "qq") {
	    carOpenMap_URL = "http://apis.map.qq.com/tools/poimarker?type=0&marker=coord:"+pageData2.lat+","+pageData2.lng+";title:"+pageData2.title+"&key="+pageData2.mapKey+"&referer=myapp"
	}
	

}




$(function(){

    $('.list_li').each(function(){     
       var t =$(this).find('.appMapBtn2');
       pageData2 = {
         mapType:'baidu',
         lng    : t.attr('data-lng'),
         lat    : t.attr('data-lat'),
         title  : t.attr('data-title'),
         address: t.attr('data-address'),
         lnglat:[t.attr('data-lng'),t.attr('data-lat')],
       }
       
       carMap_url(pageData2);
      
       console.log(carOpenMap_URL);
        t.attr('href',carOpenMap_URL);
    })

});
