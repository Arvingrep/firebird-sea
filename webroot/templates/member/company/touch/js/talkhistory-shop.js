$(function(){
    var objId = $('.container ul');
    objId.append('<div class="loading"><img src="' + templatePath +
        'images/refund/loading.png"></div>');//加载中，请稍候
    var list =  ret_negotiatearr ? (JSON.parse(ret_negotiatearr)).refundinfo : [];

    // for (var j in arr) {
    //     list.push({'refundinfo':arr[j].refundinfo,'refundtype':arr[j].refundtype,'tuikuanmoney':arr[j].tuikuanmoney,'type':arr[j].type,'typename':arr[j].typename,'datetime':arr[j].datetime})
    // }
    console.log(list)
    var html=[];
    list = list.reverse();
    for(var i=0;i<list.length;i++){
        datetime =  huoniao.transTimes(list[i].datetime, 1)
        //
        html.push('<li>');
        html.push('<div class="infoTop">');
        html.push('<div class="peoimg '+(list[i].type == 3== 1?'spe':'')+'">');
        if(list[i].typestatus ==2){
            html.push('<img src="'+templatePath +
                'images/refund/kefu.png" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';" class="kefuimg">')
        }else if(list[i].typestatus ==1){
            html.push('<img src="'+logo+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">');
        }else{
            html.push('<img src="'+photo+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">');
        }
        html.push('</div>');
        html.push('<div class="peoInfo">');
        html.push('<h3>'+list[i].typename+'</h3>');
        html.push('<p>'+ datetime+'</p>');
        html.push('</div>');
        html.push('</div>');
        html.push('<div class="infoBot">');
        if (list[i].typestatus == 0) {//买家方 申请、修改申请、客服介入
            if (!list[i].expcompany){
                typeinfo = '';
                if (list[i].type == 1){
                    typeinfo = '退货退款';
                }else {
                    typeinfo = '仅退款';
                }
                html.push('<p>'+list[i].typename+'</p>');
                //买家申请或者修改申请
                html.push('<dl><dt>退款类型：</dt><dd>'+typeinfo+'</dd></dl>');
                html.push('<dl><dt>退款原因：</dt><dd>'+list[i].refundinfo+'</dd></dl>');
                html.push('<dl><dt>退款金额：</dt><dd>'+echoCurrency('symbol')+''+list[i].tuikuanmoney +'</dd></dl>');
            }

            if (list[i].expcompany){
                //买家退货 -- 寄快递
                html.push('<dl><dt>物流公司：</dt><dd>'+list[i].expcompany+'</dd></dl>');
                html.push('<dl><dt>物流单号：</dt><dd>'+list[i].expnumber+'</dd></dl>');
                html.push('<dl><dt>快递方式：</dt><dd>快递</dd></dl>');
            }else if(list[i].selftype){
                //买家退货 -- 自行送达
                selfinfo = '';
                if (list[i].selftype == 1){
                    selfinfo = '待送达';
                }
                if (list[i].selftype == 2){
                    selfinfo = '已送达';
                }
                html.push('<dl><dt>退货状态：</dt><dd>'+selfinfo+'</dd></dl>');
                html.push('<dl><dt>退货方式：</dt><dd>买家自行送货</dd></dl>');
            }else if(list[i].service){
                //买家申请客服介入
                html.push('<dl><dt>申请原因：</dt><dd>'+list[i].refundinfo+'</dd></dl>');
                html.push('<dl><dt>退款金额：</dt><dd>'+echoCurrency('symbol')+''+list[i].tuikuanmoney +'</dd></dl>');
                html.push('<dl><dt>申请说明：</dt><dd>'+typeinfo+'</dd></dl>');
            }





        }else if (list[i].typestatus == 1) {//卖家  拒绝或同意 退款或者退货
            if (list[i].status == 2){
                html.push('<p>'+list[i].typename+'</p>');
                //卖家拒绝退款时
                html.push('<dl><dt>拒绝原因：</dt><dd>'+list[i].refundinfo+'</dd></dl>');
            }
            if (list[i].returngoods == 1){
                //卖家同意退货时
                html.push('<dl><dt>商家收货地址：</dt><dd>'+list[i].refundinfo+'。</dd></dl>');
            }else{
                //卖家同意退款时
                html.push('<p>'+list[i].refundinfo+'</p>');
            }
        } else if(list[i].typestatus ==2){//平台客服处理结果
            //平台同意
            if (list[i].isCheck == 1){
                html.push('<p>平台客服介入处理完成：已退款￥331.84</p>');
                html.push('<p>退回至您的'+list[i].payname+'账户</p>');
            }else if (list[i].isCheck == 2){
                //平台拒绝
                html.push('<p>平台客服介入处理完成：此次不予退款</p>');
                html.push('<p>因商品不支持七天无理由退款，协商完成，不予退款</p>');
            }


        }

        if(list[i].pics){
            var picArr = [];
            var pics = list[i].pics.split(',');
            if(pics){
                for(var p = 0; p < pics.length; p++){
                    picArr.push('<a href="/include/attachment.php?f='+pics[p]+'" target="_blank"><img src="/include/attachment.php?f='+pics[p]+'" /></a>')
                }
            }
            html.push('<div class="images">'+picArr.join('')+'</div>');
        }

        html.push('</div>');

        html.push('</li>');
    }
    objId.html(html.join(""));
})