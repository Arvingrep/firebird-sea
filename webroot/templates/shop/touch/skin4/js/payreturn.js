$(function(){
    var listArr = [];
     //初始加载
    var userLat = '',userLng = '';
  // 定位
    var localData = utils.getStorage('user_local');
    if(localData){
        userLat = localData.lat;
        userLng = localData.lng;
        console.log(localData)
        //初始加载
        
        getList();
        getList('',1)
        
    }else{
        HN_Location.init(function(data){
            if (data == undefined ||  data.lat == "" || data.lng == "") {
                showErrAlert(langData['siteConfig'][27][136]);
                //初始加载
                getList();
            }else{
                userLng = data.lng;
                userLat = data.lat;
                getList();
                getList('',1)
            }
        })
    }
  
    getList(1,1)
     //推荐列表
  function getList(tr,type){
    if(type){
       $(".listbox:nth-child(2) .loading").html(langData['siteConfig'][20][184]);
     
     }else{
       $(".listbox:nth-child(1) .loading").html(langData['siteConfig'][20][184]);
     }
    var moduleType = type ? '&moduletype=4':'&moduletype=3'
    var arrData = [];
    arrData.push("userlng="+userLng);
       arrData.push("userlat="+userLat);
   //请求数据
   $.ajax({
     url: "/include/ajax.php?service=shop&action=slist&page=1&pageSize=10"+moduleType,
     type: "GET",
     dataType: "jsonp",
     data:arrData.join('&'),
     success: function (data) {
       if(data){
         if(data.state == 100){
           var list = data.info.list, lr, html = [];
           if(list.length > 0){
             $(".listbox:not(.fn-hide) .loading").html('');
             var html1 = [],html2 = [];
             for(var i = 0; i < list.length; i++){
               lr = list[i];
               var pic = lr.litpic == false || lr.litpic == '' ? '/static/images/blank.gif' : lr.litpic;
               var specification = lr.specification
               if(type){
                 var tcs = '';
                     if(list[i].typesalesarr.indexOf('2') || list[i].typesalesarr.indexOf('3')  || list[i].typesalesarr.indexOf('4')) {
                         tcs = "<span>同城送</span>";
                     }
                 if(i%2 == 0){
                     html1.push('<li class="shopPro"><a href="'+list[i].url+'" class="proLink">');
                     html1.push('<div class="pro_img"><img src="'+huoniao.changeFileSize(list[i].litpic,684,684)+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
                     html1.push('<div class="pro_info">');
                     html1.push('<h4>'+list[i].title+'</h4>');
                     // html1.push('<p class="sale_info"><span>已售'+list[i].sales+'</span><em>|</em><span>2.5km</span></p>');
                     var price = list[i].price ? list[i].price : '';
                         price = parseFloat(price).toString()
                     var priceArr = price.split('.')
                     html1.push('<div class="pro_price">');
                     html1.push('<div class="price"><span class="symbol">'+echoCurrency("symbol")+'</span><span class="num">'+priceArr[0]+'<em>'+(priceArr.length > 1 ? "." + priceArr[1] : "")+'</em></span></div>');
                     if(list[i].sales > 0){
                       html1.push('<span class="sale">'+list[i].sales+'件已售</span>');
                     }
                     html1.push('</div><p class="sale_lab">'+tcs+(list[i].youhave?"<span>包邮</span>":"")+'</p>');
                     html1.push('</div></a></li>');
                 }else{
                     html2.push('<li class="shopPro"><a href="'+list[i].url+'" class="proLink">');
                     html2.push('<div class="pro_img"><img src="'+list[i].litpic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
                     html2.push('<div class="pro_info">');
                     html2.push('<h4>'+list[i].title+'</h4>');
                     // html2.push('<p class="sale_info"><span>已售'+list[i].sales+'</span><em>|</em><span>2.5km</span></p>');
                     
                     var price = list[i].price ? list[i].price : '';
                     price = parseFloat(price).toString()
                     var priceArr = price.split('.')
                     html2.push('<div class="pro_price">');
                     html2.push('<div class="price"><span class="symbol">'+echoCurrency("symbol")+'</span><span class="num">'+priceArr[0]+'<em>'+(priceArr.length > 1 ? "." + priceArr[1] : "")+'</em></span></div>');
                     if(list[i].sales > 0){
                       html2.push('<span class="sale">'+list[i].sales+'件已售</span>');
                     }
                     html2.push('</div><p class="sale_lab">'+tcs+(list[i].youhave?"<span>包邮</span>":"")+'</p>');
                     html2.push('</div></a></li>');
                 }
               }else{

                 if(i%2 == 0){
                     html1.push('<li class="tuanPro"><a href="'+list[i].url+'" class="proLink">');
                     html1.push('<div class="pro_img"><img src="'+huoniao.changeFileSize(list[i].litpic,684,684)+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
                     html1.push('<div class="pro_info">');
                     html1.push('<h4>'+list[i].title+'</h4>');
                     html1.push('<p class="sale_info">');
                     if(list[i].sales > 0){
                       html1.push('<span>已售'+list[i].sales+'</span><em>|</em>');
                     }
                     html1.push('<span>'+(list[i].julishop > 1 ? (parseFloat(list[i].julishop.toFixed(2)) +"km") : (list[i].julishop * 1000 +"m"))+'</span></p>');
                     var price = list[i].price ? list[i].price : '';
                     price = parseFloat(price).toString()
                     var priceArr = price.split('.')
                     html1.push('<p class="pro_price"><span class="symbol">'+echoCurrency("symbol")+'</span><span class="num">'+priceArr[0]+'<em>'+(priceArr.length > 1 ? "." + priceArr[1] : "")+'</em></span></p>');
                     html1.push('</div></a></li>');
                 }else{
                     html2.push('<li class="tuanPro"><a href="'+list[i].url+'" class="proLink">');
                     html2.push('<div class="pro_img"><img src="'+list[i].litpic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
                     html2.push('<div class="pro_info">');
                     html2.push('<h4>'+list[i].title+'</h4>');
                     html2.push('<p class="sale_info">');
                     if(list[i].sales > 0){
                       html2.push('<span>已售'+list[i].sales+'</span><em>|</em>');
                     }
                     html2.push('<span>'+(list[i].julishop > 1 ? (parseFloat(list[i].julishop.toFixed(2)) +"km") : (list[i].julishop * 1000 +"m"))+'</span></p>');
                     var price = list[i].price ? list[i].price : '';
                     price = parseFloat(price).toString()
                     var priceArr = price.split('.')
                     html2.push('<p class="pro_price"><span class="symbol">'+echoCurrency("symbol")+'</span><span class="num">'+priceArr[0]+'<em>'+(priceArr.length > 1 ? "." + priceArr[1] : "")+'</em></span></p>');
                     html2.push('</div></a></li>');
                 }
               }

               listArr[lr.id] = lr;
             }
             if(type){
               $(".listbox:nth-child(2) .goodlist").eq(0).append(html1.join(""));
               $(".listbox:nth-child(2) .goodlist").eq(1).append(html2.join(""));
             }else{
               $(".listbox:nth-child(1) .goodlist").eq(0).append(html1.join(""));
               $(".listbox:nth-child(1) .goodlist").eq(1).append(html2.join(""));
             }
           //没有数据
           }else{
              if(type){
               $(".listbox:nth-child(2) .loading").html(langData['siteConfig'][20][126]);
             
             }else{
               $(".listbox:nth-child(1) .loading").html(langData['siteConfig'][20][126]);
             }
            
           }

         //请求失败
         }else{
           if(type){
             $(".listbox:nth-child(2) .loading").html(data.info);
           
           }else{
             $(".listbox:nth-child(1) .loading").html(data.info);
           }
         }
       //加载失败
       }else{
         if(type){
             $(".listbox:nth-child(2) .loading").html(langData['siteConfig'][20][462]);
           
           }else{
             $(".listbox:nth-child(1) .loading").html(langData['siteConfig'][20][462]);
           }
       }
     },
     error: function(){
       if(type){
         $(".listbox:nth-child(2) .loading").html(langData['siteConfig'][20][227]);
       
       }else{
         $(".listbox:nth-child(1) .loading").html(langData['siteConfig'][20][227]);
       }
     }
   });
 }

})