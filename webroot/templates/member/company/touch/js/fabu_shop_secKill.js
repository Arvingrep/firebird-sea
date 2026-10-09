
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
                    //数据填充
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

                        specHtml.push('<h2>多规格商品需单个设置秒杀价与活动库存</h2>');
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
                            specHtml.push('<div><input type="number" class="msinventory" id="hd_inventory_'+foArr[m].spe+'" name="hd_inventory_'+foArr[m].spe+'" placeholder="输入活动库存" onkeyup="zhengshu(this)"><i>件</i></div>');
                            specHtml.push('<div><input type="number" class="msprice" id="hd_price_'+foArr[m].spe+'" name="hd_price_'+foArr[m].spe+'" placeholder="输入秒杀价" onkeyup="xiaoshu(this)"><i>'+echoCurrency('short')+'</i></div>');
                            specHtml.push('</dd>');
                            specHtml.push('</dl>');                           
                            
                        }
                        specHtml.push('</div>');
                        
                        $('.pinBot').html(specHtml.join(""));
                        $(".msinventory,.msprice").bind('input propertychange', function() {
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
                showErr('秒杀价不得高于原价');//秒杀价不得高于原价
                return false;
            }
            $('.info .pinBot input.msprice').val(batchprice);
            $('.info .pinBot input.msprice').siblings('i').show();
        }
        if(batchinventory != ''){
            $('.info .pinBot input.msinventory').val(batchinventory);
            $('.info .pinBot input.msinventory').siblings('i').show();
        }
    })

    //选择报名商品
    $('.chooseGoods').bind('click',function(){
        var turl =$(this).attr('data-url');
        var sArr = {'id': ttid, 'type': 'secKill'};
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
    function DateAdd(number, date) {
        date.setDate(date.getDate() + number);
        return date;          
    }   
    var now = new Date();
    var addDate = DateAdd(beforeDays,now);
    mobiscroll.settings = {
        theme: 'ios',
        themeVariant: 'light',
        height:40
    };

    var now2 = new Date();
    var jiange = 15;//间隔时间
    var fen = now.getMinutes();
    var sfen = (fen%jiange) == 0 ?fen:(Math.floor(fen/jiange)+1)*jiange;
    var minDate = now2.setMinutes(sfen);

    if(!$('.info').hasClass('disabled')){

        //选择开始活动时间
        var startChose,endChose;
        startChose = mobiscroll.datetime('#startdate', {
            controls: ['datetime'],
            display: 'bottom',
            min: new Date(minDate),
            max: new Date(addDate),
            headerText:'请选择开始时间',
            lang:'zh',
            dateFormat: 'yy-mm-dd',
            stepMinute: jiange,
            timeFormat:'HH:ii',
            daySuffix:'日',
            yearSuffix:'年',
            minuteText:'分',
            hourText:'时',
            disabledTime:true,
            onSet: function (event, inst) {
            }
        });

        //选择开始结束时间
 
        endChose = mobiscroll.datetime('#enddate', {
            controls: ['datetime'],
            display: 'bottom',
            min: new Date(minDate),
            max: new Date(addDate),
            headerText:'请选择结束时间',
            lang:'zh',
            dateFormat: 'yy-mm-dd',
            stepMinute: jiange,
            timeFormat:'HH:ii',
            daySuffix:'日',
            yearSuffix:'年',
            minuteText:'分',
            hourText:'时',
            disabledTime:true,
            onSet: function (event, inst) {
               var stDate = $('#startdate').val();
               if(new Date(stDate) > new Date(event.valueText)){
                    showErr('请重新选择结束时间');//请重新选择结束时间
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
                if($(this).find('.msprice').val() == ''){
                   showErr('请输入秒杀价');//请输入秒杀价 
                   $(this).find('.msprice').focus();
                   tj = false;
                   return false;
                   
                }else if(($(this).find('.msprice').val())*1 > ($('#marketVal').val())*1){
                    showErr('秒杀价不得高于原价');//秒杀价不得高于原价 
                   $(this).find('.msprice').focus();
                   tj = false;
                   return false;
                }else if($(this).find('.msinventory').val() == ''){
                    showErr('请输入活动库存');//请输入活动库存 
                   $(this).find('.msinventory').focus();
                   tj = false;
                   return false;
                }
            })

        }else{//无规格
            if($('#hdprice').val() == ''){
                showErr('请输入秒杀价');//请输入秒杀价 
                tj = false;
                return false;
            }else if(($('#hdprice').val())*1 > ($('#marketVal').val())*1){
                showErr('秒杀价不得高于原价');//秒杀价不得高于原价 
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

});