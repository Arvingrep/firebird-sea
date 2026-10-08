
function xiaoshu(obj){
    obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3'); //只能输入两个小数
}
function zhengshu(obj){
    obj.value = obj.value.replace(/[^0-9]/g,''); //只能整数
}
$(function () {
    $('.header .goBack').click(function(){
        window.location.href = backUrl;
    })
    var sFlag = false;//判断是否有规格 用于表单提交判断
    var chosegoods = utils.getStorage('chosegoods');
    var ttid = 0;
    if(chosegoods){
        ttid = chosegoods.id;
        $('#goodsId').val(ttid);
        $('.info').removeClass('disabled');
        $.ajax({
            url: '/include/ajax.php?service=shop&action=detail&id='+chosegoods.id,
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    var info = data.info,html = [],specHtml = [];
                    var litpic = info.litpic == "" ? staticPath+'images/noPhoto_40.jpg' : info.litpic;
                    html.push('<div class="goodItem">');
                    html.push('<div class="goodImg"><img src="'+litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
                    html.push('<div class="goodInfo">');
                    html.push('<h4>'+info.title+'</h4>');
                    html.push('</div>');
                    html.push('<i class="arr"></i>');
                    html.push('</div>');
                    $('.chooseGoods').html(html.join(""));
                    
                    var sku = info.specification,skuArr = info.specificationArr,skuList = info.specifiList;
                    var cunArr = [],priceArr = [],priceArr2 = [];
                    if(skuArr.length > 0){
                        $('.yuanLi').remove();
                        sFlag = true;
                        $('.pintuanPrice').html('<a href="javascript:;">批量设定</a>');
                        $('.kucun').hide();

                        var s1 = skuList.split("|");

                        
                        for (var i = 0; i < s1.length; i++) {
                            var s2 = s1[i].split(',');
                            cunArr.push(s2[0]);
                            priceArr.push(s2[1]); 
                        }

                        for (var j = 0; j < priceArr.length; j++) {
                            var s3 = priceArr[j].split('#');
                            priceArr2.push(s3[0]);
                        }

                        var txtArr = [],arrTo = [],arrColor = [];
                        cunArr.forEach(function(val){
                           var arr = val.split('-');                          
                           var arr1 = [];
                           var jsonArr1 = [];
                           arrColor.push(arr[0])

                           skuArr.forEach(function(item,index){
                                item.item.forEach(function(opt){
                                    if(arr[index] == opt.id){
                                        var nowOpt = opt.name
                                        arr1.push(nowOpt);
                                    }
                                });
                             
                           });
                             txtArr.push(arr1.join('+'))
                        });

                        var foArr = [];
                        priceArr2.forEach(function(txt,index){
                            foArr.push({'color':arrColor[index],'name':txtArr[index],'mprice':priceArr2[index],'spe':cunArr[index]})
                        })
                        specHtml.push('<h2>多规格商品需单个设置抢购价与活动库存</h2>');
                        specHtml.push('<div class="pinWrap">');

                        specHtml.push('<div class="pinItem">');
                        for (var m = 0; m < foArr.length; m++) {
                            if(m > 1){
                                if(foArr[m].color != foArr[m-1].color){
                                   specHtml.push('</div>');
                                   specHtml.push('<div class="pinItem">'); 
                                }
                            }
                            specHtml.push('<dl>');
                            specHtml.push('<dt>'+foArr[m].name+'</dt>');
                            specHtml.push('<dd>');
                            specHtml.push('<span>原价: <em>'+echoCurrency('symbol')+foArr[m].mprice+'</em></span>');
                            specHtml.push('<input type="hidden" name="hd_mprice_'+foArr[m].spe+'" value="'+foArr[m].mprice+'">');
                            specHtml.push('<div><input type="number" class="qianginventory" id="hd_inventory_'+foArr[m].spe+'" name="hd_inventory_'+foArr[m].spe+'" placeholder="输入活动库存" onkeyup="zhengshu(this)"><i>件</i></div>');
                            specHtml.push('<div><input type="number" class="qiangprice" id="hd_price_'+foArr[m].spe+'" name="hd_price_'+foArr[m].spe+'" placeholder="输入抢购价" onkeyup="xiaoshu(this)"><i>'+echoCurrency('short')+'</i></div>');
                            specHtml.push('</dd>');
                            specHtml.push('</dl>');                           
                            
                        }
                        specHtml.push('</div>');
                        
                        $('.pinBot').html(specHtml.join(""));
                        $(".qianginventory,.qiangprice").bind('input propertychange', function() {
                            var b = $(this).val();
                            if(b!=''){
                                $(this).siblings('i').show(); 
                            }else{
                                $(this).siblings('i').hide();
                            }
                            
                        })

                    }else{
                       //原价
                        $('#market').val(echoCurrency('symbol')+info.mprice);
                        $('#marketVal').val(info.mprice); 
                    }
                    utils.removeStorage('chosegoods');



                }
            }
        });
    }


    //批量设定
    $('.pintuanPrice').delegate('a','click',function(){
        $('.commask').show();
        $('.batch').addClass('show');
    })
    //取消
    $('.batch .cancelbatch').click(function(){
        $('.commask').hide();
        $('.batch').removeClass('show');
    })

    $('.commask').click(function(){
        $('.commask').hide();
        $('.batch').removeClass('show');
    })
    $("#batchprice,#batchinventory").bind('input propertychange', function() {
        var sval = $(this).val();
        if(sval!=''){
            $(this).siblings('i').show(); 
        }else{
            $(this).siblings('i').hide();
        }
        
    })

    //确定
    $('.batch .surebatch').click(function(){
        $('.commask').hide();
        $('.batch').removeClass('show');
        var batchprice = $('#batchprice').val(),batchinventory = $('#batchinventory').val();
        if(batchprice != ''){
            if(batchprice*1 > ($('#marketVal').val())*1){
                showErr('抢购价不得高于原价');//抢购价不得高于原价
                return false;
            }
            $('.info .pinBot input.qianginventory').val(batchprice);
            $('.info .pinBot input.qianginventory').siblings('i').show();

        }
        if(batchinventory != ''){
            $('.info .pinBot input.qiangprice').val(batchinventory);
            $('.info .pinBot input.qiangprice').siblings('i').show();
        }

    })

    //选择报名商品
    $('.chooseGoods').bind('click',function(){
        var turl =$(this).attr('data-url');
        var sArr = {'id': ttid, 'type': 'qianggou'};
        if(ttid == 0){//第一次跳转
            utils.setStorage('chosegoods', JSON.stringify(sArr));
            window.location.href = turl;
        }else{//商品已存在
            $('.commask2').show();
            $('.jumpAlert').addClass('show');
        }
        

    });
    //关闭跳转弹窗
    $('.commask2,.jumpAlert .canceljump').click(function(){
        $('.commask2').hide();
        $('.jumpAlert').removeClass('show');
    })

    //确定跳转
    $('.jumpAlert .surejump').click(function(){
        $('.commask2').hide();
        $('.jumpAlert').removeClass('show');
        var turl =$('.chooseGoods').attr('data-url');
        var sArr = {'id': ttid, 'type': 'bargain'};

        utils.setStorage('chosegoods', JSON.stringify(sArr));
        window.location.href = turl;
    })

    $('.info li').click(function(){
        if($('.info').hasClass('disabled')){
            showErr('请先选择商品');//请先选择商品
            $('.info li input').attr('readonly',true);
            return false;
        }
    })


    //活动 时间
    function DateAdd(stype,number, date) {
        switch (stype) {
            case "d": {
                date.setDate(date.getDate() + number);
                return date;
                break;
            }
            case "h": {
                date.setHours(date.getHours() + number);
                return date;
                break;
            }
            default: {
                date.setDate(date.getDate() + number);
                return date;
                break;
            }
        }        
    } 
    var now = new Date();
    var addDate = DateAdd("d",beforeDays,now);
    console.log(addDate)
    mobiscroll.settings = {
        theme: 'ios',
        themeVariant: 'light',
        height:40
    };  

    var hourSelect,seFlag = false;
    var hourArr = [];
    if(!$('.info').hasClass('disabled')){
        //选择开始活动时间
        mobiscroll.date('#huodongtime', {
            controls: ['date'],
            display: 'bottom',
            touchUi: false,
            min: new Date(),
            max: new Date(addDate),
            headerText:'请选择活动日期',
            lang:'zh',
            dateFormat: 'yy-mm-dd',
            daySuffix:'日',
            yearSuffix:'年',
            onSet: function (event, inst) {
                choseHour(event.valueText);
                if(!seFlag){
                   hourSelect.show(); 
                }
                
            }
        });
    }
    
    choseHour('');
    function choseHour(choseday){
        $.ajax({
          url: "/include/ajax.php?service=shop&action=getConfigtime&huodongtime="+choseday,
          type: "GET",
          dataType: "jsonp",
          async:false,
          success: function (data) {
            if(data.state == 100){
                var list = data.info.list, now = data.info.now, nowTime = data.info.nowTime;
                hourArr = [];
                for(var i = 0;i<list.length;i++){
                    if(list[i].nowTime < 10 ){
                        list[i].nowTime = '0'+list[i].nowTime
                    }
                    var hourTxt = '<span>（剩余1个名额）</span>'
                    if(i ==  0){
                        hourTxt = '<span class="red">（本场已满）</span>'
                    }
                    if(choseday == '2020-12-31'){
                       hourTxt = '<span class="red">（本场已满）</span>' 
                    }
                    hourArr.push({'id':list[i].nowTime,'time':list[i].nowTime+'点场'+hourTxt})
                }
                if(seFlag){
                    hourSelect.updateWheel(0,hourArr);
                    hourSelect.show();
                }
                if(list.length > 0){
                    if(!seFlag){
                        seFlag = true;
                        hourSelect = new MobileSelect({
                            trigger: '.hourchose',
                            title: '请选择场次',
                            wheels: [
                                {data:hourArr}
                            ],
                            keyMap: {
                                id: 'id',
                                value: 'time'
                            },
                            position:[0, 0],
                            callback:function(indexArr, data){
                                $('#qghour').val(data[0].id);
                                var ss = $('#huodongtime').val();                                
                                $('#huodongtime').val(ss+' '+data[0].id+'点场');
                                //活动开始时间
                                $('#startdate').val(ss+' '+data[0].id+':00');
                                //活动结束时间 --endHour时候后
                                var endDate = DateAdd('h',endHour,new Date($('#startdate').val()));
                                var sjc = (new Date(endDate).getTime())/1000
                                var endd = huoniao.transTimes(sjc,1)
                                $('#enddate').val(endd)
                                
                            }
                            ,triggerDisplayData:false,
                        });
                    }
                    
                    
                }
               
            }
          }
        });
    }

    

    

    // 表单验证
    $('.fabu_btn .btn').click(function () {
        var t = $(this),thistxt = t.text();
        if(t.hasClass('disabled')) return;
        var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;

        if($('#goodsId').val() == ''){
            showErr('请选择商品');//请选择商品
            tj = false;
            return false;
        }
        
        if(sFlag){//有规格

            $('.pinBot dl').each(function(){
                if($(this).find('.qiangprice').val() == ''){
                   showErr('请输入抢购价');//请输入抢购价 
                   $(this).find('.qiangprice').focus();
                   tj = false;
                   return false;
                   
                }else if(($(this).find('.qiangprice').val())*1 > ($('#marketVal').val())*1){
                    showErr('抢购价不得高于原价');//抢购价不得高于原价 
                   $(this).find('.qiangprice').focus();
                   tj = false;
                   return false;
                }else if($(this).find('.qianginventory').val() == ''){
                    showErr('请输入活动库存');//请输入活动库存 
                   $(this).find('.qianginventory').focus();
                   tj = false;
                   return false;
                }
            })

        }else{//无规格
            if($('#hdprice').val() == ''){
                showErr('请输入抢购价');//请输入抢购价 
                tj = false;
                return false;
            }else if(($('#hdprice').val())*1 > ($('#marketVal').val())*1){
                showErr('抢购价不得高于原价');//抢购价不得高于原价 
                tj = false;
                return false;
            }else if($('#inventory').val() == ''){
                showErr('请输入活动库存');//请输入活动库存 
                tj = false;
                return false;
            }
        }

        if(!tj) return;

        if($('#maxnum').val() == ''){
            showErr('请输入限购数量');//请输入限购数量
            tj = false;
        }else if($('#startdate').val() == ''){
            showErr('请选择开始时间');//请选择开始时间
            tj = false;
        }else if($('#enddate').val() == ''){
            showErr('请选择结束时间');//请选择结束时间
            tj = false;
        }else if(new Date($('#startdate').val()) >= new Date($('#enddate').val())){
            showErr('请重新选择结束时间');//请重新选择结束时间
            tj = false;
        }



        if(!tj) return;

        $('.fabu_btn .btn').addClass("disabled").html(langData['siteConfig'][6][35]+"...");	//提交中

        $.ajax({
	        url: action,
	        data: form.serialize(),
	        type: "POST",
	        dataType: "json",
	        success: function (data) {
	            if(data && data.state == 100){
	            	var tip = langData['siteConfig'][20][341];
                    if(id != undefined && id != "" && id != 0){
                        tip = langData['siteConfig'][20][229];
                    }
                    showErrAlert('报名成功');
                    setTimeout(function(){
                        location.href = url;
                    },1500)
	            }else{
					showErr(data.info);
	            	t.removeClass("disabled").html(thistxt);		//
	            }
	        },
	        error: function(){
				showErr(langData['siteConfig'][20][183]);
	            t.removeClass("disabled").html(thistxt);		//
	        }
        });
        
    });


    

});
//错误提示框
var showErrTimer;
function showErr(txt){
    showErrTimer && clearTimeout(showErrTimer);
    $(".popErr").remove();
    $("body").append('<div class="popErr"><p>'+txt+'</p></div>');
    $(".popErr").css({"visibility": "visible"});
    showErrTimer = setTimeout(function(){
        $(".popErr").fadeOut(300, function(){
            $(this).remove();
        });
    }, 1500);
}