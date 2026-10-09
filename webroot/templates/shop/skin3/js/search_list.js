$(function () {
    var atpage = 1,pageSize = 20;





    /*****************20220422新增s*********************/ 

    // 判断分类是否选中
    if($(".daodianType a.on").length == 0){
        $(".daodianType a[data-id='0']").addClass('on')
    }

     $('.daodianType .downFilter').attr('data-pid',parentid)

    // 获取分类

    function getType(t,id){
        $(".daodianType .downFilter").css('height','30px');
        $.ajax({
          url: '/include/ajax.php?service=shop&action=type&type='+id,
          type: "POST",
          dataType: "json",
          success: function (data) {
            if(data.state == 100){
                var html = [];
                var typelist = data.info;
                if(typelist.length > 0){
                    html.push('<a class="on" href="javascript:;" data-id="0">'+langData['siteConfig'][22][96]+'</a>');
                    for(var i = 0; i　< typelist.length; i++){
                        html.push('<a href="javascript:;" data-id="'+typelist[i].id+'">'+typelist[i].typename+'</a>');
                    }
                    $('.daodianType .downFilter p').html(html.join(''));
                    $('.daodianType .downFilter').attr('data-pid',id)
                    if(t){
                        $(".typeArr").append('<span data-id="'+id+'">'+t.text()+'<s></s></span>')
                    }
                    

                }else{
                    t.addClass('on').siblings('a').removeClass('on');
                }
                var hh = $('.daodianType .downFilter p').height();
                if(hh <= 30){
                    $('.daodianType .seeMore').hide()
                }else{
                    $('.daodianType .show').hide()
                }
                atpage = 1;
                getList(1);
            }else{
                t.addClass('on').siblings('a').removeClass('on');
                atpage = 1;
                getList(1);
            }
          },
          error: function(){}
        });
    }


    //获取url中的参数
    function getUrlParam(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if ( r != null ){
         return decodeURI(r[2]);
      }else{
         return false;
      }
    }


 
    if(getUrlParam('keywords')){
        var nowkeywords = decodeURI(getUrlParam('keywords'));
        console.log(nowkeywords)
        $("strong.keywords").html('"'+nowkeywords+'"')
        $("#search_keyword").val(nowkeywords)
    }
    



// 删除分类
$(".typeArr").delegate('s','click',function(){
    // var del = $(this) ,delObj = del.closest('span') ,id = del.closest('span').attr('id'),
    // parObj = delObj.prev('span'),parid = parObj.attr('data-id');
    // parObj.attr('data-id',parid)
    // parid = parid ? parid : '';
    // getType('',parid);
    // delObj.nextAll().remove()
    // delObj.remove();
    if(parentid === '0'){
        location.href = slistUrl + '?ctype=' + currType + '&typeid=';
    }else{
        location.href = slistUrl + '?ctype=' + currType + '&typeid=' + parentid;
    }
})











    /******************20220422新增e********************/ 
    $('.tab').each(function(){
        var hh = $(this).find('.downFilter p').height();
        if(hh <= 30){
            $(this).find('.seeMore').hide();
        }

    })
    $('.select .seeMore').click(function () {
        var par = $(this).closest('.tab');
        if(!par.hasClass('brand')){
            var h1 = par.find('.downFilter p').height();

            if(!$(this).hasClass('active')){
                $(this).addClass('active');
                $(this).html('收起<i></i>');
                par.find('.downFilter').css('height',h1+'px');
            }else{
                $(this).removeClass('active');
                $(this).html('更多<i></i>');
                par.find('.downFilter').css('height','30px');
            }
        }else{
            var h1 = par.find('.downFilter').height();
            if(!$(this).hasClass('active')){
                 $(this).addClass('active');
                 $(this).html('收起<i></i>');
                 par.find('.downFilter').css('height','auto');
            }else{
                 $(this).removeClass('active');
                $(this).html('更多<i></i>');
                par.find('.downFilter').css('height','100px');
            }

        }
        
        
    });
    //到店--分类
    // $('.daodianType .downFilter').delegate('a','click',function(){
    //     var t = $(this);
    //     var id = t.attr('data-id');
    //     var tname = t.text();
    //     var typeArr = $('.typeArr').attr('typeid');
    //     $('.typeArr').attr('data-id',id);
    //     // if(typeid == '0' &&  typeArr != 'undefined'){
    //     //     $('.typeArr').append('<em>'+tname+'</em>');
    //     // }
    //     if(t.hasClass('on')) return false;
    //     var curr = $(".daodianType .downFilter a.on").attr('data-id');
    //     if(id != '0' && stype != 'shop'){
    //         getType(t,id) 
    //     }else{
    //         t.addClass('on').siblings('a').removeClass('on');
    //         atpage = 1;
    //         getList(1);
    //     }


    //     // if(curr == typeid && id == '0'){ //选择最后一层分级
    //     //     t.addClass('on').siblings('a').removeClass('on');
    //     //     atpage = 1;
    //     //     getList(1);
    //     // }else{
            
            
            
    //     // }
         
    // }); 









    // 二级地域切换
    $('.comAddr .downFilter a').click(function(){
        var t = $(this);
        t.addClass('on').siblings('a').removeClass('on');
        var i = t.index();
        var id = t.attr('data-id'), typename = $(this).text();
        var lower = t.attr('data-lower');
        if(lower == 0){
            $('.tab.comAddr').attr('data-id',id);
            atpage = 1;
            getList(1);
            $('.adrsubTab').hide();
        }else{
            $.ajax({
                url: "/include/ajax.php?service=shop&action=addr&type="+id,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    if(data && data.state == 100){
                        var html = [], list = data.info;
                        html.push('<a href="javascript:;" data-id="'+id+'">'+langData['siteConfig'][22][96]+'</a>');
                        for (var i = 0; i < list.length; i++) {
                            html.push('<a href="javascript:;" data-id="'+list[i].id+'">'+list[i].typename+'</a>');

                        }
                        $(".adrsubTab .downFilter p").html(html.join(""));
                        $('.adrsubTab').show();
                    }
                },
                error: function(){

                }
            });
        }
        

    });
    //选择二级
    $('.adrsubTab .downFilter').delegate('a','click',function(){
        var t = $(this);
        t.addClass('on').siblings('a').removeClass('on');
        var id = t.attr('data-id');
        $('.tab.comAddr').attr('data-id',id);
        atpage = 1;
        getList(1);
    }); 

     //自定义价格
    $(".inp_price input").blur(function () {
        var pri_1 = $(".inp_price .p1").val();
        var pri_2 = $(".inp_price .p2").val();
        if(pri_1 != "" || pri_2 != ""){
            atpage = 1;
            getList(1);
        }


    })
    //头部切换
    $('.seTab li').click(function() {
        // var ind = $(this).index();
        // if (!$(this).hasClass('curr')) {
        //     $(this).addClass('curr').siblings().removeClass('curr');
        //     $('.otherFilter').removeClass('show');
        //     $('.otherFilter[data-sx="'+ind+'"]').addClass('show');
        //     $(".priceFilter").show()
        //     if(ind == 2){//商家
        //         $('.resultWrap .resultList').addClass('reLeft');
        //         $('.resultWrap .reRight').show();
        //         $('.tab.yingye').removeClass('fn-hide');
        //         $('.tab.daodianAddr,.tab.brand,.tab.adrsubTab,.inp_price').addClass('fn-hide')
        //         $(".priceFilter").hide()
        //     }else{
        //         $('.resultWrap .resultList').removeClass('reLeft');
        //         $('.resultWrap .reRight').hide();
        //         $('.tab.yingye').addClass('fn-hide');
        //         if(ind == 0){//到店
        //             $('.tab.daodianAddr,.tab.adrsubTab,.inp_price').removeClass('fn-hide');
        //             $('.tab.brand').addClass('fn-hide');
        //         }else{//送到家
        //             $('.tab.daodianAddr,.tab.adrsubTab,.inp_price').addClass('fn-hide');
        //             $('.tab.brand').removeClass('fn-hide');
        //         }
        //     }
        //     atpage = 1;
        //     getList(1);
        // }

    })
    //其他筛选切换
    $('.otherFilter a').click(function() {
        if($(this).hasClass('oping')){
            $('.yingye a').removeClass('on');
        }
        // $(this).addClass('curr').siblings().removeClass('curr');
        $(this).toggleClass('curr')
        atpage = 1;
        getList(1);
    })
    //选择品牌
    $('.brand').delegate('a','click',function(){
        $(this).addClass('on').siblings().removeClass('on');
    })
    /*品牌 -- 送到家专有*/
    function pinpai(){        
        var data = [];
        var skeyword  = $('#search_keyword').val();
        var orderbyId = $('.orderby .curr a').attr('data-id');
        var fenleiId  = $('.daodianType .on').attr('data-id');
        data.push("title="+skeyword);
        if($('.otherFilter .tcg').hasClass('curr')){
            data.push("cityid="+cityid);
        }
        data.push("orderby="+orderbyId);
        data.push("typeid="+fenleiId);
        data.push("moduletype=4");

        if (hottuan != '0' && hottuan != undefined) {
            data.push("hottuan="+hottuan);
        }

        url = "/include/ajax.php?service=shop&action=probrand"
        $.ajax({
            url: url,
            data: data.join("&"),
            type: "GET",
            dataType: "jsonp",
            async: false,
            success: function (data) {
                if (data && data.state == 100) {
                    var list = data.info.list;
                    var html = [];
                    for(var i = 0; i < list.length; i++) {
                        html.push('<a href="javascript:;" data-id="'+list[i].id+'">'+list[i].title+'</a>');
                    }
                    $('.brand .downFilter').html(html.join(""));
                    var hp = $('.brand .downFilter').height()
                    console.log(hp)
                    if(hp >= 100){
                        $('.tab.brand').find('.seeMore').show();
                    }
                        
                }else{
                    $('.tab.brand').hide()
                }
            }
        })
        
    }

    //筛选处分页加减
    $('.filterPage .addPa').click(function(){
        if($(this).hasClass('disabled')) return;
        atpage =  ($('.filterPage .currPa').html())*1+1;
        getList();
    })

    $('.filterPage .recPa').click(function(){
        if($(this).hasClass('disabled')) return;
        atpage =  ($('.filterPage .currPa').html())*1-1;
        getList();
    })

    //orderby筛选
    $('.orderby li').click(function(){
        var t = $(this);
        var tindex = t.index();     
        if(tindex == 2){//价格
            if(t.hasClass('up')){
                t.addClass('down').removeClass('up');
                t.attr('data-id',4);
            }else{
                t.addClass('up').removeClass('down');
                t.attr('data-id',3);
            }
            t.addClass('curr').siblings('li').removeClass('curr');
            getList(1);
        }else{
            if(!t.hasClass('curr')){
                t.addClass('curr').siblings('li').removeClass('curr');
                $('.chosePrice').removeClass().addClass('chosePrice');
                getList(1);
            }
        }
        
        
    })

     //点击list中的聊天
    var userid = typeof cookiePre == "undefined" ? null : $.cookie(cookiePre+"login_user");
    $('.goodList').delegate('.online_contact','click',function(){
        if(userid==null||userid==undefined){
            huoniao.login();
            return false;
        }
        var url = $(this).parents('li').find('.fira').attr('href');
        var chatid = $(this).attr('data-id');
        var mod = 'shop';
        var title = $(this).parents('li').find('.goodTit').text();
        var imgUrl = $(this).parents('li').find('.goodImg img').attr('src');
        var price = $(this).parents('li').find('.newPrice').attr('data-price');
        var type = $(this).attr('data-type')
        imconfig = {
            'mod':'shop',
            'chatid':chatid,
            'title': title,
             "price": price,
            "imgUrl": imgUrl,
            "link": url,
        }
        sendLink(type);
        setTimeout(function(){
          $(".im-textarea").focus();
        },4000)
    });




if(stype == 'shop'){
    $(".seTab li").eq(2).click()
}else{
    if($('.seTab li.curr').length){
            getList(1);
    }else{
        let url = $(".seTab li").eq(0).find('a').attr('href')
        location.href = url
    }
}


$('.yingye .downFilter a').click(function(){
    $(this).addClass('on').siblings('a').removeClass('on');
    atpage = 1;
    getList(1);
})

function getList(is){
    $('.seResult span.result').html('0')
    $('.goodList ul').html('');
    $('.goodList .loading').remove();
    $('.goodList').append('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');
    $(".sepagination").hide();
    if(is){
        atpage = 1;
    }
    var orderbyitem = $('.orderby .curr').attr('data-id');
    var tindex = parseInt($('.seTab li.curr').attr('data-id'));
    var skeyword = $('#search_keyword').val();
    var typeitem = $('.daodianType .on').attr('data-id');//分类
    var typePItem = $('.daodianType .downFilter').attr('data-pid');//分类
    if(typeitem == '0' && typePItem == "0"  && typeid ){
        typeitem = typeid;
    }else if(typePItem != '0' && typeitem == '0'){
        typeitem = typePItem
    }
   
    var pinpaitem = $('.brand .on').attr('data-id')?$('.brand .on').attr('data-id'):'';//品牌
    var yyitem = $('.yingye .on').attr('data-id');//营业时间
    var choseOth = $('.otherFilter.show .curr');
    // var discount = choseOth.attr('data-id');//其他筛选\
    var minprice = $('#priceLow').val();
    var maxprice = $('#priceTop').val();

    var dataArr = [];
    if(choseOth.length > 0){
        var disArr = [];
        choseOth.each(function(){
            var chosed = $(this);
            if(chosed.hasClass("tcg")){
                dataArr.push('tc=1') 
            }else if(chosed.hasClass("sameCity")){
                dataArr.push("tc=1");
                dataArr.push("area="+cityid);
            }else if(chosed.hasClass("oping")){
                dataArr.push("opentime=1");
            }else{
                disArr.push($(this).attr('data-id'))
            }

        })

        if(disArr.length > 0){
            dataArr.push('discount='+disArr.join(','))
        }
    
    }
    
    //请求数据
    // var data = [];
    var data = dataArr; 
    data.push("pageSize=20");
    data.push("page="+atpage);
    data.push("title="+skeyword);
    data.push("orderby="+orderbyitem);
    data.push("cityid="+cityid);

    if(tindex == 1){//到店优惠
        
        var daodAdr = $('.tab.comAddr').attr('data-id');
        data.push("typeid="+typeitem);
        data.push("addrid="+daodAdr);
        //其他筛选
        // if(choseOth.length > 0){
        //     data.push("discount="+discount);
        // }
        if(minprice || maxprice){
            data.push('price='+minprice+','+maxprice);
        }
        
        data.push("moduletype=3");
    }else if(tindex == 2){//送到家
        data.push("typeid="+typeitem);
        data.push("brand="+pinpaitem);
        if(minprice || maxprice){
            data.push('price='+minprice+','+maxprice);
        }
        // if(choseOth.length > 0){
        //     if(choseOth.hasClass('tcg')){//同城配送
        //         data.push("tc="+discount);
        //     }else{
        //         data.push("discount="+discount);
        //     }
        // }
        data.push("moduletype=4");
    }else{//商家
        // if(choseOth.length > 0){
        //     if(choseOth.hasClass('sameCity')){//同城配送
        //         data.push("tc=1");
        //         data.push("area="+cityid);

        //     }else if(choseOth.hasClass('oping')){//营业中
        //         data.push("opentime=1");

        //     }
        // }
        // if(!choseOth.hasClass('oping')){

        //     data.push("opentime="+yyitem);
        // }
        
        var daodAdr = $('.tab.comAddr').attr('data-id');
        data.push("addrid="+daodAdr);

        if(!$(".oping").hasClass('chosed') && yyitem){
            data.push('opentime=' + yyitem)
        }
        data.push("industry="+typeitem);
    }
    
    if (hottuan != '0' && hottuan != undefined) {
        data.push("hottuan="+hottuan);
    }


    
    var url="";
    if(tindex == 3){//商家
        url= "/include/ajax.php?service=shop&action=store&pagetype="+pagetype
        $(".stype").text('商家')
    }else{//
        $(".stype").text('商品')
        url = "/include/ajax.php?service=shop&action=slist&pagetype="+pagetype
    }
    $.ajax({
        url: url,
        data:data.join("&"),
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
            if(data && data.state != 200){
                if(data.state == 101){
                    //$('.goodList .loading').html(data.info)
                     $(".filterPage").hide();
                    $('.emptyData').show();
                    $('.resultWrap .goodList').hide();
                    // if(tindex == 2){
                    //     $(".resultWrap .reRight").hide()
                    // }
                }else{
                    var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
                    totalCount = pageInfo.totalCount;
                    var totalPage = pageInfo.totalPage;
                    if(totalCount>0){
                        $('.seResult span.result').html(totalCount)
                        $(".filterPage").show();
                        $('.filterPage .currPa').html(atpage);
                        $('.filterPage .allP').html(totalPage);
                        if(totalPage == atpage){
                            $('.filterPage .addPa').addClass('disabled');
                        }else if(atpage == 1){
                            $('.filterPage .recPa').addClass('disabled');
                        }else{
                            $('.filterPage .addPa,.filterPage .recPa').removeClass('disabled');
                        }
                    }else{
                        $(".filterPage").hide();
                    }
                    
                    //拼接列表
                    if(list.length > 0){

                        for(var i = 0; i < list.length; i++){
                            var item      = [],
                                    id        = list[i].id,
                                    title     = list[i].title,
                                    url       = list[i].url,
                                    sales     = list[i].sales,
                                    huodongarr     = list[i].huodongarr,
                                    price     = list[i].price,
                                    huodongprice     = list[i].huodongprice,
                                    mprice     = list[i].mprice,
                                    litpic    = list[i].litpic;
                            
                            if(tindex == 1){//到店优惠
                                var cla='proLi';
                                if(huodongarr == 1||huodongarr ==4){
                                    cla ='proLi hdLi';
                                }
                                html.push('<li class="'+cla+'"><a href="'+url+'">');
                                html.push('    <div class="goodImg"><img src="'+(huoniao.changeFileSize(litpic,450,450))+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';"></div>');
                                html.push('    <div class="goodInfo"> ');   
                                html.push('        <h2 class="goodTitle">'+title+'</h2>');   
                                if(huodongarr ==4){
                                html.push('        <div class="tuanhd comhd"><span class="active">拼团</span><span class="nextc">'+list[i].huodongnumber+'人拼</span></div>');
                                }else if(huodongarr ==1){
                                    var huodongktime = myTime.transTimes(list[i].huodongktime,4);
                                html.push('        <div class="qghd comhd"><span class="active">限时抢购</span><span class="nextc">'+huodongktime+'场</span></div>');
                                }else{
                                   html.push('        <p class="xf">'+list[i].alladdr[list[i].alladdr.length-1]+'<em></em>消费'+sales+'</p>'); 
                                }
                                
                                html.push('        <div class="goodPrice ">  ');

                                var nPrice = price;
                                if(huodongarr == 1||huodongarr ==4){
                                    nPrice = huodongprice;
                                }
                                var npriceArr = nPrice.split('.');
                                html.push('            <span class="newPrice">'+echoCurrency('symbol')+'<strong>'+npriceArr[0]+'</strong>'+(npriceArr[1]?'<em>.'+npriceArr[1]+'</em>':'')+'</span>'); 
                                html.push('        </div> '); 
                                html.push('        <div class="goodStore">'+list[i].storeTitle+'</div> '); 
                                html.push('    </div>');
                                html.push('</a></li>');
                            }else if(tindex == 2){//送到家
                                html.push('<li class="proLi daojLi"><a href="'+url+'" class="fira">');
                                html.push('    <div class="goodImg"><img src="'+litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';"></div>');
                                html.push('    <div class="goodInfo"> ');   
                                
                                
                                html.push('        <div class="goodPrice ">  ');

                                var nPrice = price;
                                if(huodongarr == 1||huodongarr ==4){
                                    nPrice = huodongprice;
                                }
                                var npriceArr = nPrice.split('.');
                                html.push('            <span class="newPrice" data-price="'+nPrice+'">'+echoCurrency('symbol')+'<strong>'+npriceArr[0]+'</strong>'+(npriceArr[1]?'<em>.'+npriceArr[1]+'</em>':'')+'</span>'); 
                                html.push('        </div> '); 
                                html.push('        <h2 class="goodTit">'+title+'</h2>');
                                html.push('        <p class="hasale">'+sales+'件已售</p>'); 
                                html.push('    </a></div>');
                                html.push('        <div class="contactStore"><a href="javascript:;" class="online_contact" data-type="detail" data-id="15659"><span>'+list[i].storeTitle+'</span><i></i></a></div> '); 
                                
                                html.push('</li>');
                            }else if(tindex == 3){//商家
                                html.push('<li class="storeLi fn-clear">');
                                html.push('    <div class="storeImg">');
                                html.push('        <a href="'+list[i].url+'">');
                                html.push('        <img src="'+(huoniao.changeFileSize(list[i].logo,340,340))+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/bus_default.png\';"></a>');
                                html.push('    </div>');
                                html.push('    <div class="storeInfo">');
                                html.push('        <h2 class="storeTit">');
                                html.push('            <a href="'+list[i].url+'">');
                                var tuanstr = '';
                                if (list[i].shoptype == 1) {
                                    tuanstr = "<em>团</em>";
                                }
                                html.push('          <strong>'+list[i].title+'</strong>'+tuanstr+'</a></h2>');
                                html.push('        <div class="pinf">');
                                console.log(list[i].rating)
                                var rateArr = list[i].rating.split('%');
                                var rating =  ((rateArr[0]/20).toFixed(1))>0?'<em>'+((rateArr[0]/20).toFixed(1))+'</em>':'<s class="noHaopin">暂无评分</s>';
                                html.push('          <p class="haoping"><i></i>'+rating+'</p>');
                                var collectText = '';
                                if(list[i].quanhave){
                                    collectText = '优惠券'
                                }else if(list[i].dealShop >= 50){
                                    collectText = list[i].dealShop + '人已下单'
                                }else if(list[i].collectnum){
                                    collectText = list[i].collectnum + '人已关注'
                                }
                                html.push('         <span class="storeCollect">'+collectText+'</span>'); 
                                
                                if(list[i].merchant_deliver == '1'){
                                    html.push('          <span class="tcps">同城配送</span>');
                                }else if(list[i].express == '1'){
                                    html.push('          <span class="qgkd">全国快递</span>');
                                }
                                
                                html.push('        </div>');

                                var feature = [];
                                if(list[i].cusShoptag && list[i].cusShoptag.length > 0){
                                    
                                    for(var m = 0; m< list[i].cusShoptag.length; m++){
                                        if(m < 3){
                                            feature.push(' · ' + list[i].cusShoptag[m])
                                        }
                                        
                                    }
                                }
                                html.push('        <div class="otTs">'+list[i].industry+ feature.join('') +'</div>');
                                html.push('        <div class="storeAdr">');

                                var adrtxt = '', disText = '';
                                if(list[i].address != '' && list[i].shoptype == '1'){
                                   adrtxt = list[i].address; 
                                }else{
                                    if(list[i].shoptype != '1'){
                                        adrtxt = (list[i].addr[0]+' '+(list[i].addr[1] ? list[i].addr[1] : ''))
                                    }else{
            
                                     adrtxt = (list[i].addr[list[i].addr.length-2]?list[i].addr[list[i].addr.length-2]:'')+(list[i].addr[list[i].addr.length-1]?list[i].addr[list[i].addr.length-1]:'')
                                    }
                                }

                                if(list[i].shoptype != '1'){
                                    disText = list[i].minlogistic >= 0 ? '运费'+list[i].minlogistic + echoCurrency("short") +'起' : '全店包邮'
                                }

                                html.push('            <i></i><span>'+adrtxt+'</span><em>'+disText+'</em>');
                                html.push('        </div>');
                                html.push('  <div class="choiceStore">');
                                html.push('    <a  href="'+list[i].url+'">进店看看</a></div>');
                                        
                                html.push('    </div>');
                                html.push('      <div class="storeBot fn-clear">');      
                                var xiaoliang =  list[i].xiaoliangarr;
                                for(var a = 0; a < xiaoliang.length; a++){
                                    var myurl = detailUrl.replace('%id%',xiaoliang[a].id);
                                    var photo = (xiaoliang[a].litpicpath == "" || xiaoliang[a].litpicpath == undefined) ? staticPath+'images/404.jpg' : xiaoliang[a].litpicpath ;   
                                    
                                    html.push('        <dl>');
                                    html.push('          <a href="'+myurl+'">');
                                    html.push('            <dt>');
                                    html.push('              <img src="'+(huoniao.changeFileSize(photo, 280,280))+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';">');
                                    html.push('              <h2><span>'+xiaoliang[a].title+'</span></h2>');
                                    html.push('            </dt>');
                                    html.push('            <dd>'+echoCurrency('symbol')+xiaoliang[a].price+'</dd>');
                                    html.push('          </a>');
                                    html.push('        </dl>');
                                }    
                                       
                                html.push('      </div>');
                                html.push('</li>');
                            }
                            

                        }
                        $('.goodList .loading').remove();
                        $('.resultWrap .goodList').show();
                        if(tindex == 3){
                            $(".resultWrap .reRight").show()
                        }
                        $('.emptyData').hide();
                        $('.goodList ul').html(html.join(""));

                    }else{
                        $('.resultWrap .goodList').hide();
                        // if(tindex == 2){
                        //     $(".resultWrap .reRight").hide()
                        // }
                        $('.emptyData').show();
                        //$('.goodList .loading').html(langData['siteConfig'][20][126])

                    }

                    
                    showPageInfo();
                }
            }else{
                $('.resultWrap .goodList').hide();
                // if(tindex == 2){
                //     $(".resultWrap .reRight").hide()
                // }
                $('.emptyData').show();
                $('.emptyData p').html(langData['siteConfig'][20][126]);
                //$('.goodList .loading').html(langData['siteConfig'][20][126]);
            }
        }
    });

    if(tindex == 2){//送到家
        pinpai()
    }
}

//打印分页
function showPageInfo() {
    var info = $(".sepagination");
    var nowPageNum = atpage;
    var allPageNum = Math.ceil(totalCount/pageSize);
    var pageArr = [];

    info.html("").hide();

    var pages = document.createElement("div");
    pages.className = "pagination-pages fn-clear";
    info.append(pages);

    //拼接所有分页
    if (allPageNum > 1) {

        //上一页
        if (nowPageNum > 1) {
            var prev = document.createElement("a");
            prev.className = "prev";
            prev.innerHTML = langData['siteConfig'][6][33];
            prev.onclick = function () {
                atpage = nowPageNum - 1;
                getList();
            }
            info.find(".pagination-pages").append(prev);
        }

        //分页列表
        if (allPageNum - 2 < 1) {
            for (var i = 1; i <= allPageNum; i++) {
                if (nowPageNum == i) {
                    var page = document.createElement("span");
                    page.className = "curr";
                    page.innerHTML = i;
                } else {
                    var page = document.createElement("a");
                    page.innerHTML = i;
                    page.onclick = function () {
                        atpage = Number($(this).text());
                        getList();
                    }
                }
                info.find(".pagination-pages").append(page);
            }
        } else {
            for (var i = 1; i <= 2; i++) {
                if (nowPageNum == i) {
                    var page = document.createElement("span");
                    page.className = "curr";
                    page.innerHTML = i;
                }
                else {
                    var page = document.createElement("a");
                    page.innerHTML = i;
                    page.onclick = function () {
                        atpage = Number($(this).text());
                        getList();
                    }
                }
                info.find(".pagination-pages").append(page);
            }
            var addNum = nowPageNum - 4;
            if (addNum > 0) {
                var em = document.createElement("span");
                em.className = "interim";
                em.innerHTML = "...";
                info.find(".pagination-pages").append(em);
            }
            for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
                if (i > allPageNum) {
                    break;
                }
                else {
                    if (i <= 2) {
                        continue;
                    }
                    else {
                        if (nowPageNum == i) {
                            var page = document.createElement("span");
                            page.className = "curr";
                            page.innerHTML = i;
                        }
                        else {
                            var page = document.createElement("a");
                            page.innerHTML = i;
                            page.onclick = function () {
                                atpage = Number($(this).text());
                                getList();
                            }
                        }
                        info.find(".pagination-pages").append(page);
                    }
                }
            }
            var addNum = nowPageNum + 2;
            if (addNum < allPageNum - 1) {
                var em = document.createElement("span");
                em.className = "interim";
                em.innerHTML = "...";
                info.find(".pagination-pages").append(em);
            }
            for (var i = allPageNum - 1; i <= allPageNum; i++) {
                if (i <= nowPageNum + 1) {
                    continue;
                }
                else {
                    var page = document.createElement("a");
                    page.innerHTML = i;
                    page.onclick = function () {
                        atpage = Number($(this).text());
                        getList();
                    }
                    info.find(".pagination-pages").append(page);
                }
            }
        }

        //下一页
        if (nowPageNum < allPageNum) {
            var next = document.createElement("a");
            next.className = "next";
            next.innerHTML = langData['siteConfig'][6][34];
            next.onclick = function () {
                atpage = nowPageNum + 1;
                getList();
            }
            info.find(".pagination-pages").append(next);
        }

        //输入跳转
        var insertNum = Number(nowPageNum + 1);
        if (insertNum >= Number(allPageNum)) {
            insertNum = Number(allPageNum);
        }

        var redirect = document.createElement("div");
        redirect.className = "redirect";
        redirect.innerHTML = '<i>'+langData['siteConfig'][13][51]+'</i><input id="prependedInput" type="number" placeholder="'+langData['siteConfig'][26][174]+'" min="1" max="'+allPageNum+'" maxlength="4"><i>'+langData['siteConfig'][13][54]+'</i><button type="button" id="pageSubmit">'+langData['siteConfig'][6][1]+'</button>';
        info.find(".pagination-pages").append(redirect);

        //分页跳转
        info.find("#pageSubmit").bind("click", function(){
            var pageNum = $("#prependedInput").val();
            if (pageNum != "" && pageNum >= 1 && pageNum <= Number(allPageNum)) {
                atpage = Number(pageNum);
                getList();
            } else {
                $("#prependedInput").focus();
            }
        });

        info.show();

    }else{
        info.hide();
    }
}

    var myTime = {

      //转换PHP时间戳
      transTimes: function(timestamp, n){
        
        const dateFormatter = huoniao.dateFormatter(timestamp);
        const year = dateFormatter.year;
        const month = dateFormatter.month;
        const day = dateFormatter.day;
        const hour = dateFormatter.hour;
        const minute = dateFormatter.minute;
        const second = dateFormatter.second;
        
        if(n == 1){
          return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
        }else if(n == 2){
          return (year+'-'+month+'-'+day);
        }else if(n == 3){
          return (month+'-'+day);
        }else if(n == 4){
          return (hour+':'+minute);
        }else{
          return 0;
        }
      }
  }




});