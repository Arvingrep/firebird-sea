function xiaoshu(obj){
    obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3'); //只能输入两个小数
}
function zhengshu(obj){
    obj.value = obj.value.replace(/[^0-9]/g,''); //只能整数
}
$(function () {

    toggleDragRefresh('off');  //取消下拉刷新
    
    $('.header .goBack').click(function(){
        window.location.href = backUrl;
    })
    var hdtype = $('#hdtype').val();//活动类型
    var hdtxt ='';
    if(hdtype == 'tuan'){
        hdtxt = '拼购价';
    }else if(hdtype == 'secKill'){
        hdtxt = '秒杀价';
    }else if(hdtype == 'qianggou'){
        hdtxt = '抢购价';
    }else{
        hdtxt = '底价';
    }
    var sFlag = false;//判断是否有规格 用于表单提交判断
    var chosegoods = utils.getStorage('chosegoods');
    var ttid = 0;
  console.log(chosegoods)
    if(chosegoods){
        ttid = chosegoods.id;
        $('#goodsId').val(ttid);
        $('.info').removeClass('disabled');
        createSpecifi(ttid)

    }else{
        if (goodidVal) {
            ttid = goodidVal;
            $('#goodsId').val(ttid);
            $('.info').removeClass('disabled');
            createSpecifi(ttid)
        }
    }
    //编辑活动
    var fspecifiVal = JSON.parse(specifiVal);
    // if(fspecifiVal.length > 0){
    //     createSpecifi(id);
    // }
    function createSpecifi(tid){
        console.log(tid)
        $.ajax({
            url: '/include/ajax.php?service=shop&action=detail&id='+tid,
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    var info = data.info,html = [],specHtml = [];
                    var litpic = info.litpic == "" ? staticPath+'images/noPhoto_40.jpg' : info.litpic;
                    huodongArr = info.huodongarr;
                    html.push('<div class="goodItem">');
                    html.push('<div class="goodImg"><img src="'+litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
                    html.push('<div class="goodInfo">');
                    html.push('<h4>'+info.title+'</h4>');
                    html.push('</div>');
                    html.push('<i class="arr"></i>');
                    html.push('</div>');
                    $('.chooseGoods').html(html.join(""));
                    //数据填充
                    var sku = info.specification,skuArr = info.specificationArr,skuList = info.specification;
                    var cunArr = [],priceArr = [],priceArr2 = [];
                    if(skuArr.length > 0){
                        $('.yuanLi').remove();
                        sFlag = true;
                        $('.pintuanPrice').html('<a href="javascript:;">批量设定</a>');
                        $('.kucun').hide();

                        // var s1 = skuList.split("|");
                        
                        var s1 = typeof(skuList) == 'string' ? JSON.parse(skuList) : skuList;
                        var foArrObj = {}
                        for(var i = 0; i < s1.length; i++){
                            var cidArr = s1[i]['spe'].split(',')
                            if(foArrObj[cidArr] && foArrObj[cidArr].length){
                                foArrObj[cidArr].push(s1[i])
                            }else{
                                foArrObj[cidArr] = [s1[i]]
                            }
                        }

                    


                        specHtml.push('<h2>多规格商品需单个设置'+hdtxt+'与活动库存</h2>');
                        specHtml.push('<div class="pinWrap">');
                        console.log(skuArr)
						skuArr.forEach(function(item,index){
                          if(item.itemtype == 0){//原有规格
                            item.item.forEach(function(opt){
                              specHtml.push('<input type="hidden" name="spe'+item.id+'[]" value="'+opt.id+'">')
                            })
                          }else{//自定义规格
                            item.item.forEach(function(opt){
                              specHtml.push('<input type="hidden" name="speNew['+item.id+'][]" value="'+opt.id+'">')
                            })
                          }
                        });
                        var count = 0;
                        
                        
                        for( var spe in foArrObj){
                            specHtml.push('<div class="pinItem">');
                            for( var m = 0; m < foArrObj[spe].length; m++){
                                var f_inventory = "",f_price ="";
                                if(fspecifiVal.length > 0){
                                    f_price = fspecifiVal[count].price[1];
                                    f_inventory = fspecifiVal[count].price[2];
                                }
                                specHtml.push('<dl>');
                                specHtml.push('<dt>'+(foArrObj[spe][m].name.join('+'))+'</dt>');
                                specHtml.push('<dd>');
                                specHtml.push('<span>原价: <em>'+echoCurrency('symbol')+foArrObj[spe][m].price[1]+'</em></span>');
                                specHtml.push('<input type="hidden" name="hd_mprice_'+foArrObj[spe][m].id+'" value="'+foArrObj[spe][m].price[1]+'">');
                                specHtml.push('<div><input type="number" class="ptinventory" id="hd_inventory_'+(foArrObj[spe][m].id)+'" name="hd_inventory_'+(foArrObj[spe][m].id)+'" placeholder="输入活动库存" onkeyup="zhengshu(this)" value="'+f_inventory+'"><i>件</i></div>');
                                specHtml.push('<div><input type="number" class="ptprice" id="hd_price_'+(foArrObj[spe][m].id)+'" name="hd_price_'+(foArrObj[spe][m].id)+'" placeholder="输入'+hdtxt+'" onkeyup="xiaoshu(this)"  value="'+f_price+'"><i>'+echoCurrency('short')+'</i></div>');
                                specHtml.push('</dd>');
                                specHtml.push('</dl>');
                                count ++ ;
                            }
                            specHtml.push('</div>');

                        }
                        // console.log(foArr)
                        // for (var m = 0; m < foArr.length; m++) {
                        //     if(m >= 1){
                        //         if(foArr[m].color != foArr[m-1].color){
                        //            specHtml.push('</div>');
                        //            specHtml.push('<div class="pinItem">');
                        //         }
                        //     }
                        //   var f_inventory = "",f_price ="";

                        //    if(fspecifiVal.length > 0){

                        //        	f_price = fspecifiVal[m][0];
						// 		f_inventory = fspecifiVal[m][1];


                        //    }

                        //     specHtml.push('<dl>');
                        //     specHtml.push('<dt>'+(foArr[m].name?foArr[m].name:foArr[m].color)+'</dt>');
                        //     specHtml.push('<dd>');
                        //     specHtml.push('<span>原价: <em>'+echoCurrency('symbol')+foArr[m].mprice+'</em></span>');
                        //     specHtml.push('<input type="hidden" name="hd_mprice_'+foArr[m].spe+'" value="'+foArr[m].mprice+'">');
                        //     specHtml.push('<div><input type="number" class="ptinventory" id="hd_inventory_'+foArr[m].spe+'" name="hd_inventory_'+foArr[m].spe+'" placeholder="输入活动库存" onkeyup="zhengshu(this)" value="'+f_inventory+'"><i>件</i></div>');
                        //     specHtml.push('<div><input type="number" class="ptprice" id="hd_price_'+foArr[m].spe+'" name="hd_price_'+foArr[m].spe+'" placeholder="输入'+hdtxt+'" onkeyup="xiaoshu(this)"  value="'+f_price+'"><i>'+echoCurrency('short')+'</i></div>');
                        //     specHtml.push('</dd>');
                        //     specHtml.push('</dl>');

                        // }

                        $('.pinBot').html(specHtml.join(""));
                       if(fspecifiVal.length > 0){
                         $('.info .pinBot .pinItem div i').show();
                       }
                        $(".ptinventory,.ptprice").bind('input propertychange', function() {
                            var b = $(this).val();
                            if(b!=''){
                                $(this).siblings('i').show();
                            }else{
                                $(this).siblings('i').hide();
                            }

                        })
                      	utils.removeStorage('chosegoods');

                    }else{
                       //原价
                        $('#market').val(echoCurrency('symbol')+info.price);
                        $('#marketVal').val(info.price);
                        utils.removeStorage('chosegoods');
                    }




                }
            }
        });
    }
    //判断是否选择商品
    $('.info li').click(function(){
        if($('.info').hasClass('disabled')){
            showErr('请先选择商品');//请先选择商品
            $('.info li input').attr('readonly',true);
            return false;
        }
    })


    /*********************多规格--批量设定 s*****************************/
    //批量设定--打开
    $('.pintuanPrice').delegate('a','click',function(){
        $('.commask').show();
        $('.batch').addClass('show');
        $('.bargainAlert').hide();
    })
    //批量设定--取消
    $('.batch .cancelbatch').click(function(){
        $('.commask').hide();
        $('.batch').removeClass('show');
    })
    //批量设定--关闭
    $('.commask').click(function(){
        $('.commask').hide();
        $('.batch').removeClass('show');
    })

    //批量设定--监听输入
    $("#batchprice,#batchinventory").bind('input propertychange', function() {
        var sval = $(this).val();
        if(sval!=''){
            $(this).siblings('i').show();
        }else{
            $(this).siblings('i').hide();
        }

    })
    //批量设定--确定
    $('.batch .surebatch').click(function(){
        $('.commask').hide();
        $('.batch').removeClass('show');
        var batchprice = $('#batchprice').val(),batchinventory = $('#batchinventory').val();
        if(batchprice != ''){
            if(batchprice*1 > ($('#marketVal').val())*1){
                showErr(hdtxt+'不得高于原价');//团购/秒杀/抢购 价不得高于原价
                return false;
            }
            $('.info .pinBot input.ptprice').val(batchprice);
            $('.info .pinBot input.ptprice').siblings('i').show();
        }
        if(batchinventory != ''){
            $('.info .pinBot input.ptinventory').val(batchinventory);
            $('.info .pinBot input.ptinventory').siblings('i').show();
        }
    })
    /*********************多规格--批量设定 e*****************************/

    /*********************选择报名商品 s*****************************/
    //选择报名商品
    $('.chooseGoods').bind('click',function(){
      	if(goodidVal){//编辑状态
          return false;
        }else{
          var turl =$(this).attr('data-url');
          var sArr = {'id': ttid, 'type': hdtype};
          if(ttid == 0){//第一次跳转
              utils.setStorage('chosegoods', JSON.stringify(sArr));
              window.location.href = turl;
          }else{//商品已存在
              $('.commask2').show();
              $('.jumpAlert').addClass('show');
          }
        }

    });
    //重新选择商品 -- 关闭
    $('.commask2,.jumpAlert .canceljump').click(function(){
        $('.commask2').hide();
        $('.jumpAlert').removeClass('show');
    })

    //重新选择商品 --确定
    $('.jumpAlert .surejump').click(function(){
        $('.commask2').hide();
        $('.jumpAlert').removeClass('show');
        var turl =$('.chooseGoods').attr('data-url');
        var sArr = {'id': ttid, 'type': hdtype};

        utils.setStorage('chosegoods', JSON.stringify(sArr));
        window.location.href = turl;
    })
    /*********************选择报名商品 e*****************************/


    /*********************砍价--砍价示例 s*****************************/
    $('.contentWrap').click(function(){
        if($('.info').hasClass('disabled')){
            showErr('请先选择商品');//请先选择商品
            $('.contentWrap input').attr('readonly',true);
            return false;
        }
    })
    //砍价规则切换
    $('.bargainrule .active').bind('click',function(){
        if($('.info').hasClass('disabled')){
            showErr('请先选择商品');//请先选择商品
            return false;
        }

        var chid = $(this).find('a').data('id');
        if(chid == 1){//自由设置
            if($('#hdprice').val() == ''){
                showErr('请输入底价');//请输入底价
                return false;
            }else if(($('#hdprice').val())*1 > ($('#marketVal').val())*1){
                showErr('底价不得高于原价');//底价不得高于原价
                return false;
            }
            if($('#allnum').val() == ''){
                showErr('请输入需砍总次数');//请输入需砍总次数
                return false;
            }
            inputChange();
            $('.bargain-info2').removeClass('fn-hide');
            $('.bargain-info3').addClass('fn-hide');
        }else{
            $('.bargain-info3').removeClass('fn-hide');
            $('.bargain-info2').addClass('fn-hide');
        }
        $(this).addClass('chose_btn').siblings('.active').removeClass('chose_btn');
        $('#bargainrule').val(chid);
    });

    //自由设置-- 查看示例
    $('.bargain-info2 h2 a').click(function(){
        if($('.info').hasClass('disabled')){
            showErr('请先选择商品');//请先选择商品
            return false;
        }
        $('.commask').show();
        $('.bargainAlert').show();
    })
    //查看示例--关闭
    $('.bargainAlert a.closeBargain').click(function(){
        $('.commask').hide();
        $('.bargainAlert').hide();
    })
    /*********************砍价--砍价示例 e*****************************/

    /*********************砍价--设置砍价规则 s*****************************/
    function inputChange(){
        var spar = $('.kanWrap li:last-child');
        var endInput = spar.find('.endKan');
        var priceInput = spar.find('.priceKan');
        var oval = $('#marketVal').val();//原价
        var dval = $('#hdprice').val();//底价
        var siVal = spar.find('.kanspan').text();
        //砍至刀数监听
        endInput.blur(function(){
            var allnum =$('#allnum').val();//总次数
            var liLen = $('.kanWrap li').length;
            var tval = $(this).val();
            //下一条数据
            if(liLen > 1){
                var nextLi = $(this).closest('li').next('li'),
                    nextKanInput = nextLi.find('.endKan'),
                    nextKan = nextKanInput.val(),
                    nextSpan = nextLi.find('.kanspan'),
                    nextSpanTxt = nextSpan.text();

            }

            if(tval==''){
                showErr('请输入砍至刀数');//请输入砍至刀数
            }else if(tval*1 < siVal*1){
                $(this).val("");
                showErr('请按顺序输入砍至刀数');//请按顺序输入砍至刀数
            }else if(tval*1 > allnum*1){
                $(this).val(allnum);
                showErr('已超过需砍总次数');//已超过需砍总次数
            }else if( liLen > 1){//大于后面一条的一刀
                nextSpan.text(tval*1 +1);
                setTimeout(function(){
                    if(nextKan*1 < (nextSpan.text())*1){
                        //nextKanInput.focus();
                        showErr('请按顺序输入砍至刀数');//请按顺序输入砍至刀数
                    }
                },100)

            }

        })
        //砍至价格
        var clickFlag = false;
        priceInput.blur(function(){
            var allnum =$('#allnum').val();//总次数
            var tval = $(this).val();
            var endInputVal = endInput.val();
            var liLen = $('.kanWrap li').length;
            //前一条数据
            var prevPrice = 0,nextPrice = 0;
            if(liLen == 1){
                prevPrice =  $('.kanWrap li').eq(0).find('.priceKan').val();
            }else{
                prevPrice = $(this).closest('li').prev('li').find('.priceKan').val();
            }
            //下一条数据
            if(liLen > 1){
                var nextLi = $(this).closest('li').next('li');
                nextPrice = nextLi.find('.priceKan').val();
                var nextInput = nextLi.find('.priceKan');
            }

            if(tval==''){
                showErr('请输入砍至价格');//请输入砍至价格
            }else if(tval*1 > oval*1){
                $(this).val('');
                showErr('不得超过原价');//不得超过原价
            }else if(tval*1 < dval*1){
                $(this).val('');
                showErr('不得低于底价');//不得低于底价
            }else if(tval*1 <= nextPrice*1 && liLen > 1){//小于后一条数据 -- 则修改后一条
                if(tval*1 == dval*1){
                    $(this).val('');
                    showErr('需最后一刀才可砍至底价');//需最后一刀才可砍至底价
                }else{
                    //nextInput.focus();
                    showErr('请按顺序输入砍至价格');//请按顺序输入砍至价格
                }

            }else if(tval*1 >=prevPrice*1 && liLen > 1){//大于前一条数据

                $(this).val('');
                showErr('请按顺序输入砍至价格');//请按顺序输入砍至价格

            }else if(tval*1 == dval*1 && endInputVal*1 < allnum){
                $(this).val('');
                showErr('需最后一刀才可砍至底价');//需最后一刀才可砍至底价
            }else if(endInputVal*1 == allnum && tval*1 > dval*1 ){
                $(this).val(dval);
                if(!clickFlag){
                   showErr('最后一刀为底价');//最后一刀为底价
                }
            }
        })

    }

    //添加区间
    $('.addKan a').click(function(){
        console.log(33333)
        var allnum =$('#allnum').val();//总次数
        var liLen = $('.kanWrap li').length;
        var par = $('.kanWrap li:last-child');
        var endKanValue = par.find('.endKan').val();
        var priceKanValue = par.find('.priceKan').val();
        var stKanValue = par.find('.kanspan').text();
        //判断第一刀数据
        var oval = $('#marketVal').val();//原价
        var dval = $('#hdprice').val();//底价
        var firstPrice =  $('.kanWrap li').eq(0).find('.priceKan').val();
        //倒数第二条数据
        var secondPrice = 0;
        if(liLen == 1){
            secondPrice =  $('.kanWrap li').eq(0).find('.priceKan').val();
        }else{
            secondPrice = $('.kanWrap li').eq(-2).find('.priceKan').val();
        }

        console.log(allnum)
        if(!endKanValue){
            par.find('.endKan').focus();
            showErr('请输入砍至刀数');//请输入砍至刀数
        }else if(endKanValue*1 < stKanValue*1){
            par.find('.endKan').focus();
            showErr('请按顺序输入砍至刀数');//请按顺序输入砍至刀数
        }else if(endKanValue*1 > allnum){
            par.find('.endKan').val(allnum);
            showErr('已超过需砍总次数');//已超过需砍总次数
        }else if(!priceKanValue){
            par.find('.priceKan').focus();
            showErr('请输入砍至价格');//请输入砍至价格
        }else if(firstPrice*1 > oval*1 && liLen == 1){
            par.find('.priceKan').focus();
            showErr('不得超过原价');//不得超过原价
        }else if(priceKanValue*1 < dval*1){
            par.find('.priceKan').focus();
            showErr('不得低于底价');//不得低于底价
        }else if(priceKanValue*1 >=secondPrice*1 && liLen > 1){
            par.find('.priceKan').focus();
            showErr('请按顺序输入砍至价格');//请按顺序输入砍至价格
        }else if(priceKanValue*1 == dval*1 && endKanValue*1 < allnum){
            par.find('.priceKan').focus();
            showErr('需最后一刀才可砍至底价');//需最后一刀才可砍至底价
        }else if(endKanValue*1 == allnum){
            if(priceKanValue*1 > dval*1){
                par.find('.priceKan').val(dval);
                showErr('最后一刀为底价');//最后一刀为底价
            }else{
                showErr('已到达需砍总次数');//已到达需砍总次数
            }

        }else{

            var kanHtml = [];
            kanHtml.push('<li>');
            kanHtml.push('<div>');
            kanHtml.push('<input type="hidden" class="startKan" value="'+(endKanValue*1+1)+'">');
            kanHtml.push('<span class="kanspan">'+(endKanValue*1+1)+'</span><span class="dao">刀</span>');
            kanHtml.push('</div>');
            kanHtml.push('<em>至</em>');
            kanHtml.push('<p class="endP"><input type="number" class="endKan"  onkeyup="zhengshu(this)"><i>刀</i></p>');

            kanHtml.push('<em>砍至</em>');
            kanHtml.push('<p class="priceP"><i>'+echoCurrency('symbol')+'</i><input type="number" class="priceKan"  onkeyup="xiaoshu(this)"></p>');
            kanHtml.push('</li>');
            $('.kanWrap ul').append(kanHtml.join(''));
            $('.kanWrap .deleteKan').show();
            inputChange();
        }
    })
    //删除砍刀规则
    $('.kanWrap .deleteKan').click(function(){
        if($('.kanWrap li').length >= 2){
            if($('.kanWrap li').length == 2){
                $(this).hide();
            }
            $('.kanWrap li:last-child').remove();
        }

    })
    /*********************砍价--设置砍价规则 e*****************************/

    /*********************团购/砍价/秒杀 活动时间 s*****************************/
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
	var hourSelect,seFlag = false;
    var hourArr = [];

// 验证是否处于已报名的活动时间段中
    function checkHuodongIn(startTimestr,endTumeStr){
        var huodongIn = false;
        startTimestr = startTimestr ? startTimestr : 0;
        endTumeStr = endTumeStr ? endTumeStr : 0;
        for(var i = 0 ; i < huodongArr.length; i++){
            var  hd = huodongArr[i]

            if(startTimestr >  hd.ktime && startTimestr < hd.etime || (endTumeStr >  hd.ktime && endTumeStr < hd.etime)){
                huodongIn = true;
                break;
            }

            if(startTimestr && endTumeStr && ((startTimestr <= hd.ktime &&  endTumeStr >= hd.etime) || (startTimestr >= hd.ktime &&  endTumeStr <= hd.etime))){
                huodongIn = true;
                break;
            }
        }

        return huodongIn;
    }

    if(!$('.info').hasClass('disabled')){
        if(hdtype != "qianggou"){
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
                    var startdate = event.valueText;
                    var startTimestr = Math.round(new Date(event.valueText.replace(/-/g,'/')) / 1000);
                    if(checkHuodongIn(startTimestr)){
                        showErrAlert('该时间已在活动中，请重新选择');
                    }

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

                    var enddate = event.valueText;
                    var startdate = $("#startdate").val();
                    var endTimestr = Math.round(new Date(enddate.replace(/-/g,'/')) / 1000);
                    var startTimestr = Math.round(new Date(startdate.replace(/-/g,'/')) / 1000);
                   if(new Date(stDate) > new Date(event.valueText)){
                        showErr('请重新选择结束时间');//请重新选择结束时间
                   }else if(checkHuodongIn((startdate ? startTimestr : "") ,endTimestr)){
                        showErrAlert('该时间已在活动中，请重新选择');
                    
                   }

                }
            });
        }else{

            //选择开始活动时间
            mobiscroll.date('.hdTime', {
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
                    seFlag = false;
                    console.log(333)
                    $('#huodongtime').val(event.valueText)
                    choseHour(event.valueText);


                }
            });
        }

    }
	//编辑抢购
    var qgtimeClock  = $('#huodongtime').val();
    if(hdtype == "qianggou" && qgtimeClock!=""){//抢购专属 -- 整点场
        choseHour(qgtimeClock);
    }
    if(editId){
        seFlag = true;
    }else{
        seFlag = false;
    }
    function choseHour(choseday){
        $.ajax({
            url: "/include/ajax.php?service=shop&action=getConfigtime&huodongtime="+choseday,
          type: "GET",
          dataType: "jsonp",
          async:false,
          success: function (data) {
            if(data.state == 100){
                var list = data.info;
                hourArr = [];
                for(var i = 0;i<list.length;i++){
                    var hourTxt = '<span>（剩余'+list[i].shengyunum+'个名额）</span>';
                    if(list[i].shengyunum == 0){
                       hourTxt = '<span class="red">（本场已满）</span>'
                    }
                    hourArr.push({'id':i,'time':list[i].title+hourTxt,'qstime':list[i].ktime,'qetime':list[i].etime,'title':list[i].title,'changci':list[i].changci})
                }
                // if(seFlag){
                //     hourSelect.updateWheel(0,hourArr);
                //     hourSelect.show();
                // }
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
                              	$('#qghour').text(data[0].title);
                                var ss = $('#huodongtime').val();
                                //活动开始时间--结束时间
                                $('#startdate').val(ss+' '+data[0].qstime+':00');
                                $('#enddate').val(ss+' '+data[0].qetime+':00');
                                $('#changci').val(data[0].changci);
                               $('#huodongtime').addClass('hasc');

                            }
                            ,triggerDisplayData:false,
                        });
                        hourSelect.show();
                    }


                }

            }
          }
        });
    }
    /*********************团购/砍价/秒杀 活动时间 e*****************************/

    // 表单验证
    $('.fabu_btn .btn').click(function () {
        clickFlag = true;
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
                if($(this).find('.ptprice').val() == ''){
                   showErr('请输入'+hdtxt);//请输入**价
                   $(this).find('.ptprice').focus();
                   tj = false;
                   return false;

                }else if(($(this).find('.ptprice').val())*1 > ($('#marketVal').val())*1){
                    showErr(hdtxt+'不得高于原价');//**价不得高于原价
                   $(this).find('.ptprice').focus();
                   tj = false;
                   return false;
                }else if($(this).find('.ptinventory').val() == ''){
                    showErr('请输入活动库存');//请输入活动库存
                   $(this).find('.ptinventory').focus();
                   tj = false;
                   return false;
                }
            })

        }else{//无规格
            if($('#hdprice').val() == '' && hdtype != "bargain"){//砍价的 下面验证
                showErr('请输入'+hdtxt);//请输入拼团价
                tj = false;
                return false;
            }else if((($('#hdprice').val())*1 > ($('#marketVal').val())*1) &&  hdtype != "bargain"){
                showErr(hdtxt+'不得高于原价');//拼团价不得高于原价
                tj = false;
                return false;
            }else if($('#inventory').val() == ''){
                showErr('请输入活动库存');//请输入活动库存
                tj = false;
                return false;
            }
        }
        if(!tj) return;
        if($('#pinpeople').val() == '' && hdtype == "tuan"){
            showErr('请输入拼团人数');//请输入拼团人数
            tj = false;
        }else if($('#pinpeople').val() <=1 && hdtype == "tuan"){
            showErr('活动人数不得小于2人');//请输入拼团人数
            tj = false;
        }else if($('#pintime').val() == '' && hdtype == "tuan"){
            showErr('请输入拼团时长');//请输入拼团时长
            tj = false;
        }else if($('#maxnum').val() == ''){
            if(hdtype != "bargain"){
                showErr('请输入限购数量');//请输入限购数量
                tj = false;
            }else{
                showErr('请输入限购次数');//请输入限购次数
                tj = false;
            }

        }else if(hdtype == "qianggou"){//抢购专有
            if($('#huodongtime').val() == ''){
                showErr('请选择活动时间');//请选择活动时间
                tj = false;
            }else if($('#qghour').text() == ''){
                showErr('请选择场次');//请选择场次
                choseHour($('#huodongtime').val());
                tj = false;
            }
        }else{

            if($('#startdate').val() == ''){
                showErr('请选择开始时间');//请选择开始时间
                tj = false;
                return false;
            }else if($('#enddate').val() == ''){
                showErr('请选择结束时间');//请选择结束时间
                tj = false;
                return false;
            }else if(new Date($('#startdate').val()) >= new Date($('#enddate').val())){
                showErr('请重新选择结束时间');//请重新选择结束时间
                tj = false;
                return false;
            }

            if(hdtype == "bargain"){//砍价专有
                if($('#hdprice').val() == ''){
                    showErr('请输入'+hdtxt);//
                    tj = false;
                }else if(($('#hdprice').val())*1 > ($('#marketVal').val())*1){
                    showErr(hdtxt+'不得高于原价');//
                    tj = false;
                }else if($('#allnum').val() == ''){
                    showErr('请输入需砍总次数');//请输入需砍总次数
                    tj = false;
                }else if($('.bargainrule .chose_btn').find('a').attr('data-id') == 1){//自由设置规则
                    var allnum =$('#allnum').val();//总次数
                    var liLen = $('.kanWrap li').length;
                    var par = $('.kanWrap li:last-child');
                    var endKanValue = par.find('.endKan').val();
                    var priceKanValue = par.find('.priceKan').val();
                    var stKanValue = par.find('.kanspan').text();
                    //判断第一刀数据
                    var oval = $('#marketVal').val();//原价
                    var dval = $('#hdprice').val();//底价
                    //倒数第二条数据
                    var secondPrice = 0;
                    var firstPrice =  $('.kanWrap li').eq(0).find('.priceKan').val();
                    if(liLen == 1){
                        secondPrice =  $('.kanWrap li').eq(0).find('.priceKan').val();
                    }else{
                        secondPrice = $('.kanWrap li').eq(-2).find('.priceKan').val();
                    }

                    if(!endKanValue){
                        par.find('.endKan').focus();
                        showErr('请输入砍至刀数');//请输入砍至刀数
                        tj = false;
                    }else if(endKanValue*1 < stKanValue*1){
                        par.find('.endKan').focus();
                        showErr('请按顺序输入砍至刀数');//请按顺序输入砍至刀数
                        tj = false;
                    }else if(endKanValue*1 > allnum){
                        par.find('.endKan').val(allnum);
                        showErr('已超过需砍总次数');//已超过需砍总次数
                        tj = false;
                    }else if(!priceKanValue){
                        par.find('.priceKan').focus();
                        showErr('请输入砍至价格');//请输入砍至价格
                        tj = false;
                    }else if(firstPrice*1 > oval*1 && liLen == 1){
                        par.find('.priceKan').focus();
                        showErr('不得超过原价');//不得超过原价
                        tj = false;
                    }else if(priceKanValue*1 < dval*1){
                        par.find('.priceKan').focus();
                        showErr('不得低于底价');//不得低于底价
                        tj = false;
                    }else if(priceKanValue*1 >=secondPrice*1 && liLen > 1){
                        par.find('.priceKan').focus();
                        showErr('请按顺序输入砍至价格');//请按顺序输入砍至价格
                        tj = false;
                    }else if(priceKanValue*1 == dval*1 && endKanValue*1 < allnum){
                        par.find('.priceKan').focus();
                        showErr('需最后一刀才可砍至底价');//需最后一刀才可砍至底价
                        tj = false;
                        return false;
                    }else if(endKanValue*1 == allnum){
                        if(priceKanValue*1 > dval*1){
                            par.find('.priceKan').val(dval);
                            showErr('最后一刀为底价');//最后一刀为底价
                            tj = false;
                        }

                    }
                }
            }

        }

        if(!tj) return;
      	//砍价规则

       var barRule = [],data;
       if($('.bargainrule .chose_btn').find('a').attr('data-id') == 1){//自由设置规则
         $('.kanWrap li').each(function(){
           var kanstartDao = $(this).find('.startKan').val();
           var kanendDao = $(this).find('.endKan').val();
           var kanpriceDao = $(this).find('.priceKan').val();
           var barRuleArr = {min:kanstartDao,max:kanendDao,money:kanpriceDao};
           barRule.push(barRuleArr);
         })
         data = form.serialize()+'&barRule='+JSON.stringify(barRule);
       }else{
         data = form.serialize();
       }
		utils.removeStorage('chosegoods');

        $('.fabu_btn .btn').addClass("disabled").html(langData['siteConfig'][6][35]+"...");	//提交中
        $.ajax({
	        url: action,
	        data: data,
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
