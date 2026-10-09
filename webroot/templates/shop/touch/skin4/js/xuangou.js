// 排序
function funcOrder(a,b){
	return a-b;
}
$(function(){
  var speCart = $('.speCart')
  var skflag =1;
  var listArr = [];
  console.log(window.location.href)
  //商品属性选择
  var SKUResult = {};  //保存组合结果
  var mpriceArr = [];  //市场价格集合
  var priceArr = [];   //现价集合
  var totalStock = 0;  //总库存
  var skuObj = $(".size-box .size-count"),
      mpriceObj = $(".size-box .size-selected .price .mprice"),          //原价
      priceObj = $(".size-box .size-selected p.price b"),    //现价
      stockObj = $(".size-box .count b"),                   //库存
      disabled = "disabled",                               //不可选
      selected = "selected";                               //已选
  //点击列表 加入购物车选择颜色、尺码
  var myscroll = null;
  $('body').delegate('.bIcart', 'touchend', function(){
    var t = $(this), li = t.closest('li'), id = li.attr('data-id');
    var thref = li.find('a').attr('href');
    location.href = thref;
    return false;

    var inventor = li.attr('data-inventor');
    //验证登录
    var userid = $.cookie(cookiePre+"login_user");
    if(userid == null || userid == ""){
       location.href = '/login.html';
       return false;
    }
    //商品单位
    var detunit = listArr[id].shopunit?listArr[id].shopunit:'件';

    var specification = listArr[id].specification, specificationArr = listArr[id].specificationArr,
        imgSrc = li.find('img').attr('src');

    $('.guige em').text();
    if(inventor<=0){
      var popOptions = {
          btnCancel:'确定',
          title:'商品已售完',
          btnColor:'#222',
          noSure:true,
          isShow:true
      }
      confirmPop(popOptions);
    	return false;
    }
    if($(".cart-con .cartlist li[data-id='"+id+"']").length>=1){
    	var limit = $(".cart-con .cartlist li[data-id='"+id+"']").attr('data-limit');
    	var nowCount = $(".cart-con .cartlist li[data-id='"+id+"']").attr('data-count');
    	if(limit && limit>0 && nowCount>=limit){
        var popOptions = {
            btnCancel:'确定',
            title:'此商品限购'+limit+detunit,
            btnColor:'#222',
            noSure:true,
            isShow:true
        }
        confirmPop(popOptions);
    		return false;
    	}
    	
    }
    li.addClass('layer').siblings('li').removeClass('layer');
    if (specification != "") {
      $('.mask').css({'opacity':'1','z-index':'10000000'});
      $('.size-box').addClass('sizeShow');
      $('.closed').removeClass('sizeHide');
      $('.size-count').show();//显示数量

      //商品属性选择
      SKUResult = {};  //保存组合结果
      mpriceArr = [];  //市场价格集合
      priceArr = [];   //现价集合
      totalStock = 0;  //总库存
      init.start(id);
      $('.size-html .sys_item').each(function(){
        var sizeAlen = $(this).find('a').length;
        if(sizeAlen ==1){
          $(this).find('a').click();
        }
      })
      if(myscroll == null){
        myscroll = new iScroll("scrollbox", {vScrollbar: false,});
      }

      $('.size-img img').attr('src', imgSrc);
      return false;

    }else {//无规格
      var cartNum = Number($('.shopgocart em').text()), detailUrl = $('.goodlist .layer a').attr('href'),
          layerId = $('.goodlist .layer').attr('data-id'), detailTitle = $('.goodlist .layer h4').text();
      var t = $(this).offset();
      var offset = $(".shopgocart").offset();
      var img = $(this).closest("li").find('img').attr('src'); //获取当前点击图片链接
      var flyer = $('<img class="flyer-img" src="' + img + '">'); //抛物体对象
      //var num=parseInt($(".shop-count").val());
      var scH = $(window).scrollTop();

      flyer.fly({
        start: {
          left: t.left - 50, //抛物体起点横坐标
          top: t.top - scH - 30, //抛物体起点纵坐标
          width: 30,
          height: 30
        },
        end: {
          left: offset.left + 12,//抛物体终点横坐标
          top: offset.top-scH, //抛物体终点纵坐标
          width:15,
          height:15
        },
        onEnd: function() {
          this.destroy(); //销毁抛物体
          $('.shopgocart').addClass('swing');

          setTimeout(function(){$('.shopgocart em').removeClass('swing')},300);
        }
      });

      var t=''; //该商品的属性编码 以“-”链接个属性
      $(".sys_item .selected").each(function(){
        var y=$(this).attr("attr_id");
        t=t+"-"+y;
      })
      var t=t.substr(1);
      //2021-9-13 增加最小起订量
      //如果购物车中已有此商品则加入购物车为装箱数量 如果没有此商品 则为最小起订量
      var mincout = listArr[id].smallCount;
      var eachcout = listArr[id].packingCount;
      if($('.cartlist li[data-id="'+layerId+'"]').size() > 0){
        var num = eachcout*1;
      }else{
        var num = mincout*1;
      }

      //操作购物车
      var data = [];
      data.id = id;
      data.specation = t;
      data.count = num;
      data.title = detailTitle;
      data.url = detailUrl;
      shopInit.add(data);

    }
    if(st){
      setTimeout(function(){
      	var href = window.location.href;
      	if(href.indexOf('currentPageOpen')>-1){
      		location.href = href ;
      	}else{
      		location.href = href+'?currentPageOpen=1'
      	}
          
      }, 1000);
    }


  })


  // 关闭规格弹出层
  $('.mask, .closed').click(function(){
      $('.mask').css({'opacity':'0','z-index':'-1'});
      $('.size-box').removeClass('sizeShow').addClass('sizeHide');
  })

  // 选择规格点击确定
  $('.size-confirm a').click(function(){

    var count = Number($('.shop-count').val()), cart = Number($('.shopgocart em').text());
    $('.shopgocart em').text(count + cart);
    var winWidth = $(window).width(), winHeight = $(window).height(), cartNum = Number($('.shopgocart em').text());
    var detailTitle, detailUrl,layerId;

    //加入购物车及加入购物车判断
    var $buy=$(this),$li=$(".sys_item"),$ul=$(".size-html"),n=$li.length;
    if($buy.hasClass("disabled")) return false;
    var len=$li.length;
    var spValue=parseInt($(".size-selected .count b").text()),inputValue;
    //传到数据库中的值
    if(skflag ==1){//从列表中添加
      inputValue=parseInt($(".shop-count").val());
      detailTitle = $('.goodlist .layer h3').text();
      detailUrl = $('.goodlist .layer a').attr('href');
      layerId = $('.goodlist .layer').attr('data-id');
    }else{//从购物车中添加
      inputValue = $('.cart-main .chooseli .num').find('em').text();
      detailTitle = $('.cart-main .chooseli').attr('data-title');
      detailUrl = $('.cart-main .chooseli').attr('data-href');
      layerId = $('.cart-main .chooseli').attr('data-id');
    }

    if($(".sys_item dd").find("a.selected").length==n && inputValue<=spValue){

      //加入购物车动画
      $(".size-html").removeClass("on");
      if(skflag == 1){//列表中加入购物车
        var offset = $(".shopgocart").offset();
        var detailThumb = $('.size-img img').attr('src');
        var flyer = $('<img class="flyer-img" src="' + detailThumb + '">'); //抛物体对象
        var t = $('.goodlist .layer .bIcart').offset();
        var scH = $(window).scrollTop();

        flyer.fly({
          start: {
            left: t.left - 50, //抛物体起点横坐标
            top: t.top - scH - 30, //抛物体起点纵坐标
            width: 30,
            height: 30
          },
          end: {
            left: offset.left + 12,//抛物体终点横坐标
            top: offset.top-scH, //抛物体终点纵坐标
            width: 15,
            height: 15

          },
          onEnd: function() {
            this.destroy(); //销毁抛物体
            $('.shopgocart').addClass('swing');
            setTimeout(function(){$('.shopgocart em').removeClass('swing')},300);
          }
        });
      }


      $('.mask').css({'opacity':'0','z-index':'-1'});
      $('.size-box').removeClass('sizeShow').addClass('sizeHide');

      var t=''; //该商品的属性编码 以“-”链接个属性
      $(".sys_item").each(function(){
        var $t=$(this),y=$t.find("a.selected").attr("attr_id");
         t=t+"-"+y;
      })
      t=t.substr(1);

      var num;
      if(skflag ==1){
        num=parseInt($(".shop-count").val());
      }else{
        num =$('.cart-main .chooseli .num').find('em').text();
      }
      var tArr = t.split('-').sort();
			var paramId = SKUResult[tArr.join(',')] ? SKUResult[tArr.join(',')].id : '';
      //操作购物车
      var data = [];
      data.id = layerId;
      data.specation = paramId;
      data.count = num;
      data.title = detailTitle;
      data.url = detailUrl;
      if(skflag ==0){//说明购物车重新选择了规格
        //删除相应的商品
        var sid=$('.cart-main .chooseli').attr('data-id');
        var sdpe=$('.cart-main .chooseli').attr('data-specation');
        speCart.find('li').each(function(){
          var t = $(this), tid = t.attr('data-id'), tspe = t.attr('data-specation');
          if(tid == sid && tspe == sdpe){
            t.remove();
            return false;
          }
        })
        // shopInit.update();
      }
      shopInit.add(data);

    }else{
      st = 0;
      $li.each(function(){
        var $dt = $(this).find('dt');
        var dtTxt = $dt.find('span').text()?$dt.find('span').text():$dt.text();
        if($(this).find('a.selected').length == 0){
          $dt.html('<span>'+dtTxt+'</span><em>'+langData['siteConfig'][7][2]+dtTxt+'</em>');//请选择
        }
      })
    }
    if(st){
      setTimeout(function(){
          location.reload();
      }, 1000);
    }
  })

  // 选择规格增加数量
  $('.sizeBtn .add').click(function(){
    var stockx = parseInt($(".size-selected .count b").text()),n=$(".sys_item").length;
    var $c=$(this),value;
    //2021-9-13 增加最小起订量和每次装箱数量
    //每次装箱数量
    var eachcout = $('.size-html').attr('data-eachcout');
    var mincout = $('.size-html').attr('data-mincout');//最小起订量
    value=parseInt($c.siblings(".shop-count").val());
    if(value<stockx){
      value=value+eachcout*1;
      $c.siblings(".shop-count").val(value);
      if(value>=stockx){}
      var spValue=parseInt($(".size-selected .count b").text()),
      inputValue=parseInt($(".shop-count").val());
      if($(".color-info-ul ul").find("li.active").length==n && inputValue<spValue){
      }
    }else{
      var popOptions = {
        btnCancel:'确定',
          title:langData['shop'][2][23],
          btnColor:'#222',
          noSure:true,
          isShow:true
      }
      confirmPop(popOptions);
    }
  })

  // 选择规格减少数量
  $('.sizeBtn .reduce').click(function(){
    var stockx = parseInt($(".size-selected .count b").text()),n=$(".sys_item").length;
    var $c=$(this),value;
    value=parseInt($c.siblings(".shop-count").val());
    //2021-9-13 增加最小起订量和每次装箱数量
    //每次装箱数量
    var eachcout = $('.size-html').attr('data-eachcout');
    var mincout = $('.size-html').attr('data-mincout');//最小起订量    
    //商品单位
    var detunit = $('.size-box .count em').text();
    if(value>mincout*1){
      value=value-eachcout*1;
      $c.siblings(".shop-count").val(value);
      if(value<=stockx){}
      var spValue=parseInt($(".size-selected .count b").text()),
      inputValue=parseInt($(".shop-count").val());
      if($(".color-info-ul ul").find("li.active").length==n && inputValue<=spValue){
      }
    }else{
      var popOptions = {
          btnCancel:'确定',
          title:'最少'+(mincout*1)+detunit+'起拍哦~',
          btnColor:'#222',
          noSure:true,
          isShow:true
      }
      confirmPop(popOptions);

    }
  })

  // 加入购物车的商品选择规格框
  var init = {

    //拼接HTML代码
    start: function(id){
      //最小起订量
      var mincout = listArr[id].smallCount;
      var eachcout = listArr[id].packingCount;//每次装箱数量
      var specification = listArr[id].specification, specificationArr = listArr[id].specificationArr, sizeHtml = [];
      for (var i = 0; i < specificationArr.length; i++) {
        sizeHtml.push('<dl class="sys_item"><dt><span>'+specificationArr[i].typename+'</span></dt>');
        var itemArr = specificationArr[i].item;
        sizeHtml.push('<dd class="fn-clear">');
        for (var j = 0; j < itemArr.length; j++) {
          sizeHtml.push('<a href="javascript:;" class="sku disabled" attr_id="'+itemArr[j].id+'">'+itemArr[j].name+'</a>');
        }
        sizeHtml.push('</dd>');
        sizeHtml.push('</dl>');
      }
      $('.size-html').html(sizeHtml.join(""));
      $('.size-html').attr('data-mincout',mincout);
      $('.size-html').attr('data-eachcout',eachcout);
      //2021-9-13 增加最小起订量
      //如果购物车中已有此商品则加入购物车为装箱数量 如果没有此商品 则为最小起订量
      //if($('.cartlist li[data-id="'+id+'"]').size() > 0){
      //  $('.shop-count').val(eachcout*1)
      //}else{
        $('.shop-count').val(mincout*1)
      //}

      init.initSKU(id);
    }


    //默认值
    ,defautx: function(){

      //市场价范围
      var maxPrice = Math.max.apply(Math, mpriceArr);
      var minPrice = Math.min.apply(Math, mpriceArr);
      mpriceObj.html(maxPrice > minPrice ? minPrice.toFixed(2) + "-" + maxPrice.toFixed(2) : maxPrice.toFixed(2));

      //现价范围
      var maxPrice = Math.max.apply(Math, priceArr);
      var minPrice = Math.min.apply(Math, priceArr);
      var maxP = maxPrice.toFixed(2).split('.')[0]+ "<em>."+maxPrice.toFixed(2).split('.')[1]+"</em>";
      var minP = minPrice.toFixed(2).split('.')[0]+ "<em>."+minPrice.toFixed(2).split('.')[1]+"</em>";
      priceObj.html(maxPrice > minPrice ? maxP + " - " + minP : maxP);
      //总库存
      stockObj.text(totalStock);

      //设置属性状态
      $('.sku').each(function() {
        SKUResult[$(this).attr('attr_id')] ? $(this).removeClass(disabled) : $(this).addClass(disabled).removeClass(selected);
      })

    }

    //初始化得到结果集
    ,initSKU: function(id) {
      var i, j, skuKeys = listArr[id].specification;

      for(i = 0; i < skuKeys.length; i++) {
        var _skuKey = skuKeys[i].spe.split("-");  //一条SKU信息value
        var skuKey = _skuKey.join(";");  //一条SKU信息key
        var sku = skuKeys[i].price; //一条SKU信息value
        var skuKeyAttrs = skuKey.split(";");  //SKU信息key属性值数组
        var len = skuKeyAttrs.length;

        //对每个SKU信息key属性值进行拆分组合
        var combArr = init.arrayCombine(skuKeyAttrs);

        for(j = 0; j < combArr.length; j++) {
          init.add2SKUResult(combArr[j], sku);
        }

        mpriceArr.push(sku[0]);
        priceArr.push(sku[1]);
        totalStock += parseInt(sku[2]);

        //结果集接放入SKUResult
        SKUResult[skuKey] = {
          stock: sku[2],
          prices: [sku[1]],
          mprices: [sku[0]]
        }
      }

      init.defautx();
    }

    //把组合的key放入结果集SKUResult
    ,add2SKUResult: function(combArrItem, sku) {
      var key = combArrItem.join(";");
      //SKU信息key属性
      if(SKUResult[key]) {
        SKUResult[key].stock = parseInt(SKUResult[key].stock) + parseInt(sku[2]);
        SKUResult[key].prices.push(sku[1]);
        SKUResult[key].mprices.push(sku[0]);
      } else {
        SKUResult[key] = {
          stock: sku[2],
          prices: [sku[1]],
          mprices: [sku[0]]
        };
      }
    }

    //从数组中生成指定长度的组合
    ,arrayCombine: function(targetArr) {
      if(!targetArr || !targetArr.length) {
        return [];
      }

      var len = targetArr.length;
      var resultArrs = [];

      // 所有组合
      for(var n = 1; n < len; n++) {
        var flagArrs = init.getFlagArrs(len, n);
        while(flagArrs.length) {
          var flagArr = flagArrs.shift();
          var combArr = [];
          for(var i = 0; i < len; i++) {
            flagArr[i] && combArr.push(targetArr[i]);
          }
          resultArrs.push(combArr);
        }
      }

      return resultArrs;
    }

    //获得从m中取n的所有组合
    ,getFlagArrs: function(m, n) {
      if(!n || n < 1) {
        return [];
      }

      var resultArrs = [],
        flagArr = [],
        isEnd = false,
        i, j, leftCnt;

      for (i = 0; i < m; i++) {
        flagArr[i] = i < n ? 1 : 0;
      }

      resultArrs.push(flagArr.concat());

      while (!isEnd) {
        leftCnt = 0;
        for (i = 0; i < m - 1; i++) {
          if (flagArr[i] == 1 && flagArr[i+1] == 0) {
            for(j = 0; j < i; j++) {
              flagArr[j] = j < leftCnt ? 1 : 0;
            }
            flagArr[i] = 0;
            flagArr[i+1] = 1;
            var aTmp = flagArr.concat();
            resultArrs.push(aTmp);
            if(aTmp.slice(-n).join("").indexOf('0') == -1) {
              isEnd = true;
            }
            break;
          }
          flagArr[i] == 1 && leftCnt++;
        }
      }
      return resultArrs;
    }

    // 将已选展示出来
    ,getSelected: function(){
      var selectedHtml = [];
      $('.size-html .sys_item').each(function(){
        var t = $(this), selected = t.find('.selected').text();
        if (selected) {
          selectedHtml.push('\"'+selected+'\"');
        }
        $('.guige em').text(selectedHtml.join(","));
      })
    }

  }
  var dskuResult = [];
  $(".cart-main .shop-list-li").each(function(){
    var dskuId = $(this).attr('data-id');
    var dsku = $(this).attr('data-specification');

    if(dsku != ''){
      var dskuSpe = JSON.parse(dsku);
      dskuResult[dskuId] = dskuSpe;

    }
  })
  console.log(dskuResult)
  //点击事件
  $('.sku').each(function() {
    var self = $(this);
    var attr_id = self.attr('attr_id');
    if(!SKUResult[attr_id]) {
      self.addClass(disabled);
    }
  })
  $('body').delegate('.sku', 'click', function() {

    var self = $(this);
    var skuParId = self.parents('.size-box').attr('data-id');

    if(self.hasClass(disabled)) return;

    //选中自己，兄弟节点取消选中
    self.toggleClass(selected).siblings("a").removeClass(selected);
    var spValue=parseInt($(".size-box .count b").text()),inputValue;
    if(skflag == 1){
        inputValue=parseInt($(".shop-count").val());
      }else{
        inputValue=1;
      }
    var n=$(".size-html .sys_item").length;

    if($(".size-html .sys_item").find("a.selected").length==n && inputValue<spValue){
      $('.sys_item dt em').remove();
    }else{
      var sizePar = $(".size-html a.selected").closest('.sys_item').find('dt');
      sizePar.find('em').remove();
    }

    //已经选择的节点
    var selectedObjs = $('.'+selected);
    init.getSelected();

    if(selectedObjs.length) {
      //获得组合key价格
      var selectedIds = [];
      selectedObjs.each(function() {
        selectedIds.push($(this).attr('attr_id'));
      });
      selectedIds.sort();
      var len = selectedIds.length;
      // if(skflag == 0){
      //   var dskus = dskuResult[skuParId]
      //   // console.log(dskus)
      //   for(i = 0; i < dskus.length; i++) {
      //     var _skuKey = dskus[i].spe.split("-");  //一条SKU信息value
      //     var skuKey = _skuKey.join(";");  //一条SKU信息key
      //     var sku = dskus[i].price; //一条SKU信息value
      //     var skuKeyAttrs = skuKey.split(";");  //SKU信息key属性值数组
      //     var len = skuKeyAttrs.length;

      //     //对每个SKU信息key属性值进行拆分组合
      //     // var combArr = init.arrayCombine(skuKeyAttrs);

      //     // for(j = 0; j < combArr.length; j++) {
      //     //   init.add2SKUResult(combArr[j], sku);
      //     // }
          
      //     // mpriceArr.push(sku[0]);
      //     // priceArr.push(sku[1]);
      //     totalStock += parseInt(sku[2]);

      //     //结果集接放入SKUResult
      //     SKUResult[skuKey] = {
      //       stock: sku[2],
      //       prices: [sku[1]],
      //       mprices: [sku[0]]
      //     }
      //   }
      // }
      // console.log(SKUResult)
  //     var prices = SKUResult[selectedIds.join(';')].prices;
  //     var maxPrice = Math.max.apply(Math, prices);
  //     var minPrice = Math.min.apply(Math, prices);
  //     var maxP = maxPrice.toFixed(2).split('.')[0]+ "<em>."+maxPrice.toFixed(2).split('.')[1]+"</em>";
  //     var minP = minPrice.toFixed(2).split('.')[0]+ "<em>."+minPrice.toFixed(2).split('.')[1]+"</em>";
  //     priceObj.html(maxPrice > minPrice ? maxP + " - " + minP : maxP);


  //     var mprices = SKUResult[selectedIds.join(';')].mprices;
  //     var maxPrice = Math.max.apply(Math, mprices);
  //     var minPrice = Math.min.apply(Math, mprices);
  //     mpriceObj.html(maxPrice > minPrice ? minPrice.toFixed(2) + "-" + maxPrice.toFixed(2) : maxPrice.toFixed(2));
	// console.log(SKUResult[selectedIds.join(';')].stock)

  //     stockObj.text(SKUResult[selectedIds.join(';')].stock);

        var currStock = 0;
        var priceArr = [],mpriceArr = [];
        for(var item in SKUResult){
          var testIds = item.split(',');
          var includeArr = selectedIds.filter(val => {
            return testIds.includes(val)
          })
          
          if(includeArr.length == selectedIds.length){
            testIdsArr = testIds.filter(val => {
              return !selectedIds.includes(val);
            });
            // 判断当前节点是否有库存
            $(".sku").not(selectedObjs).not(self).each(function () {
              var siblingsSelectedObj = $(this).siblings('.' + selected);
              var testAttrIds = []; //从选中节点中去掉选中的兄弟节点
              if (siblingsSelectedObj.length) {
                var siblingsSelectedObjId = siblingsSelectedObj.attr('attr_id');
                for (var i = 0; i < len; i++) {
                  (selectedIds[i] != siblingsSelectedObjId) && testAttrIds.push(selectedIds[i]);
                }
              } else {
                testAttrIds = selectedIds.concat();
              }
              testAttrIds = testAttrIds.concat($(this).attr('attr_id'));
              testAttrIds.sort();
              // if(SKUResult[testAttrIds.join(',')] && SKUResult[testAttrIds.join(',')].stock == 0){
              //   $(this).addClass('disabled').removeClass(selected)
              // }else{
              //   $(this).removeClass('disabled')
              // }
              var stockFlag = 0; 
              for(var iitem in SKUResult){
                var flag = 0;
                for(var mm = 0; mm < testAttrIds.length; mm++){
                  // console.log(iitem,testAttrIds[mm],iitem.split(';').includes(testAttrIds[mm]))
                  if(!iitem.split(',').includes(testAttrIds[mm])){
                    flag = 1;
                    break;
                  }
                }
                if(flag == 0 && SKUResult[iitem].stock != 0){
                  stockFlag = 1;
                }
              }

              if(!stockFlag){
                $(this).addClass('disabled').removeClass(selected)
              }else{
                $(this).removeClass('disabled')
              }
            })
            if(SKUResult[item].stock == 0){ //没有库存
              // 没有库存
            }else{
              currStock = SKUResult[item].stock * 1 + currStock;
              priceArr.push(SKUResult[item].prices[0])
              mpriceArr.push(SKUResult[item].mprices[0])
            }
          }
        }
        var min_price = Math.min.apply(null,priceArr);
        var max_price = Math.max.apply(null,priceArr);
        var min_mprice = Math.min.apply(null,mpriceArr);
        var max_mprice = Math.max.apply(null,mpriceArr);
        priceObj.text(min_price == max_price ? min_price : (min_price + '-' + max_price)); //价格填入
        mpriceObj.text(min_mprice == max_mprice ? min_mprice : (min_mprice + '-' + max_mprice))


        stockObj.text(currStock);

      //获取input的值
      var inputValue=parseInt($(".shop-count").val());
      // var inputTip=$(".singleGoods dd cite");

      if(inputValue > currStock){
        var popOptions = {
            btnCancel:'确定',
              title:langData['shop'][2][24],
              btnColor:'#222',
              noSure:true,
              isShow:true
        }
        confirmPop(popOptions);

      }


      // //用已选中的节点验证待测试节点 underTestObjs
      // $(".sku").not(selectedObjs).not(self).each(function() {
      //   var siblingsSelectedObj = $(this).siblings('.'+selected);
      //   var testAttrIds = [];//从选中节点中去掉选中的兄弟节点
      //   if(siblingsSelectedObj.length) {
      //     var siblingsSelectedObjId = siblingsSelectedObj.attr('attr_id');
      //     for(var i = 0; i < len; i++) {
      //       (selectedIds[i] != siblingsSelectedObjId && selectedIds[i] != undefined) && testAttrIds.push(selectedIds[i]);
      //     }
      //   } else {
      //     testAttrIds = selectedIds.concat();
      //   }
      //   testAttrIds = testAttrIds.concat($(this).attr('attr_id'));
      //   testAttrIds.sort(arrSortMinToMax);
      //   //点击某一个属性时 搭配的属性如果没有库存时 则不可点 disabled
      //   var defineArr = SKUResult[testAttrIds.join(';')]
      //   // var stockArr = defineArr.stock*1;
      //   if(!defineArr || defineArr.stock == 0) {
      //     $(this).addClass(disabled).removeClass(selected);
      //   } else {
      //     $(this).removeClass(disabled);
      //   }
      // });
    } else {
      init.defautx();
    }
  });
  
  //点击购物车列表里面的规格选择
  $('.cart-main').delegate('.shop-info-color','click',function(){
    skflag=0;//以此区分是点击了购物车列表里面的规格
    var t = $(this), li = t.closest('.shop-list-li'),
        id = li.attr('data-id'),
        tPrice = li.attr('data-price'),
        tprotype = li.attr('data-protype'),//是否团购商品
        tInventor = li.attr('data-inventor'),//库存
        specation = li.attr('data-specation'),//已选的属性
        specationArr = li.attr('data-specationarr'),//自带的全部属性
        shopunit = li.attr('data-shopunit');//商品单位
    
    var hasTxt=t.find('em').text();
    var imgSrc = li.find('.shop-info-img').find('img').attr('src');
    $('.shop-list-li').removeClass('chooseli');
    li.addClass('chooseli');
    $('.size-box .count em').text(shopunit);
    //显示出规格弹窗
    $('.mask').css({'opacity':'1','z-index':'10000000'});
    $('.size-box').addClass('sizeShow');
    $('.closed').removeClass('sizeHide');
    $('.size-count').hide();//隐藏数量
    //处理已选数据
    $('.guige em').text(hasTxt);
    $('.size-box .count b').text(tInventor);
    var tPriceArr = tPrice.split('.');
    if(tPriceArr.length > 1){
      $('.price b').html(tPriceArr[0]+'<em>.'+tPriceArr[1]+'</em>')
    }else{
      $('.price b').html(tPriceArr[0])
    }
    //绘制出 商品全部属性
    var spArr= JSON.parse(specationArr),sizeHtml = [];
    console.log(spArr)
    if(tprotype == '1'){//是否团购商品
      var tcSparr = [];
      var tcArr = [];
      for (var t = 0; t < spArr.length; t++) {
        tcArr = tcArr.concat(spArr[t].item);
      }
      tcSparr.push({'typename':'套餐多规格','item':tcArr});
      spArr = tcSparr;
    }
    
    for (var i = 0; i < spArr.length; i++) {
      sizeHtml.push('<dl class="sys_item"><dt>'+spArr[i].typename+'</dt>');
      var itemArr = spArr[i].item;
      sizeHtml.push('<dd class="fn-clear">');
      for (var j = 0; j < itemArr.length; j++) {
        console.log(itemArr[j])
      if(itemArr[j] && itemArr[j].pic){
        sizeHtml.push('<a href="javascript:;" class="sku" attr_id="'+itemArr[j].id+'"><i><img src="'+itemArr[j].pic+'"></i>'+itemArr[j].name+'</a>');
      }else{
        sizeHtml.push('<a href="javascript:;" class="sku" attr_id="'+itemArr[j].id+'"><i></i>'+itemArr[j].name+'</a>');
      }

      }
      sizeHtml.push('</dd>');
      sizeHtml.push('</dl>');
    }
    $('.size-box').attr('data-id',id)
    $('.size-html').html(sizeHtml.join(""));
    var dskus = dskuResult[id]
    // console.log(dskus)
    for(m = 0; m < dskus.length; m++) {
      var _skuKey = dskus[m].spe.split("-");  //一条SKU信息value
      var skuKey = _skuKey.join(";");  //一条SKU信息key
      var sku = dskus[m].price; //一条SKU信息value
      var skuKeyAttrs = skuKey.split(";");  //SKU信息key属性值数组
      var len = skuKeyAttrs.length;

      
      totalStock += parseInt(sku[2]);

      //结果集接放入SKUResult
      SKUResult[skuKey] = {
        id:dskus[m].id,
        stock: sku[2],
        prices: [sku[1]],
        mprices: [sku[0]]
      }
    }
    //画出已选择的属性
    var skArr = specation.split('-');
    // console.log(dskuResult[id])
    for(var k = 0;k<skArr.length;k++){
      var hasSku = skArr[k];
      var ind = dskuResult[id].findIndex(obj => {
        return obj.id == hasSku
      })
      $('.size-html .sku').each(function(){
        var atId = $(this).attr('attr_id');
        if(dskuResult[id][ind].spe.indexOf(atId) > -1){//已选
          // $(this).addClass('selected');
          $(this).click()
        }
        for(var item in SKUResult){
          if(item.indexOf(atId) > -1 && SKUResult[item].stock > 0){ //有该选项的商品 并且库存不为0
            $(this).removeClass('disabled')
            // break;
          }
        }
      
      })
    }
    //不可选的sku

    if(myscroll == null){
      myscroll = new iScroll("scrollbox", {vScrollbar: false,});
    }

    $('.size-img img').attr('src', imgSrc);

    return false;
  })

  $('.size-box').on('touchmove', function(e){
    e.preventDefault();
  })
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
                getList('',1)
            }else{
                userLng = data.lng;
                userLat = data.lat;
                getList();
                getList('',1)
            }
        })
    }
  
  //购物车列表

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
                      html1.push('<div class="pro_img"><img src="'+list[i].litpic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
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
                      html1.push('<div class="pro_img"><img src="'+list[i].litpic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
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


// 数字字母中文混合排序
function arrSortMinToMax(a, b) {
    // 判断是否为数字开始; 为啥要判断?看上图源数据
    if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
        // 提取起始数字, 然后比较返回
        return /^\d+$/.exec(a) - /^\d+$/.exec(b);
        // 如包含中文, 按照中文拼音排序
    } else if (isChinese(a) && a.indexOf('custom_') < 0 && isChinese(b) && b.indexOf('custom_') < 0) {
        // 按照中文拼音, 比较字符串
        return a.localeCompare(b, 'zh-CN')
    } else {
        // 排序数字和字母
        return a.localeCompare(b, 'en');
    }
}

// 检测是否为中文，true表示是中文，false表示非中文
function isChinese(str) {
    // 中文万国码正则
    if (/[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/.test(str)) {
        return true;
    } else {
        return false;
    }
}
