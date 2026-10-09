// 商城 退款/售后列表
var objId = $('.refundlist'),atpage = 1,pageSize =10;
$(function () {
    // 下拉加载
    $(window).scroll(function() {
        var h = $('.myitem').height();
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - h;
        if ($(window).scrollTop() > scroll && !isload) {
            atpage++;
            getList();
        };
    });
    getList();
});

function getList(is){

  isload = true;

    if(is != 1){
        // $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
    }

    objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
    $(".pagination").hide();
    var state ="4,7"
    $.ajax({
        url: masterDomain+"/include/ajax.php?service=shop&action=orderList&state="+state+"&page="+atpage+"&pageSize="+pageSize,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
            if(data && data.state != 200){
                if(data.state == 101){
                    objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
                }else{
                    var list = data.info.list, pageInfo = data.info.pageInfo, html = [],totalPage = pageInfo.totalPage;
                    switch(state){
                        case "":
                            totalCount = pageInfo.totalCount;
                            break;
                        case "0":
                            totalCount = pageInfo.unpaid;
                            break;
                        case "1":
                            totalCount = pageInfo.ongoing;
                            break;
                        case "3":
                            totalCount = pageInfo.success;
                            break;
                        case "4":
                            totalCount = pageInfo.refunded;
                            break;
                        case "5":
                            totalCount = pageInfo.rates;
                            break;
                        case "6":
                            totalCount = pageInfo.recei;
                            break;
                        case "7":
                            totalCount = pageInfo.closed;
                            break;
                        case "10":
                            totalCount = pageInfo.cancel;
                            break;
                    }

                    var msg = totalCount == 0 ? langData['siteConfig'][20][126] : langData['siteConfig'][20][185];
                    //拼接列表
                    if(list.length > 0){
                        $('.no-data').hide();
                        for(var i = 0; i < list.length; i++){
                            var item       = [],
                                    id         = list[i].id,
                                    ordernum   = list[i].ordernum,
                                    orderstate = list[i].orderstate,
                                    retState   = list[i].retState,
                                    orderdate  = huoniao.transTimes(list[i].orderdate, 1),
                                    expDate    = list[i].expDate,
                                    payurl     = list[i].payurl,
                                    common     = list[i].common,
                                    commonUrl  = list[i].commonUrl,
                                    paytype    = list[i].paytype,
                                    paytypeold    = list[i].paytypeold,
                                    totalPayPrice  = list[i].totalPayPrice,
                                    store      = list[i].branch ? list[i].branch : list[i].store,
                                    product    = list[i].product;
                                    is_tuikuan = product[0].is_tuikuan;

                                    totalPayPrice_str = totalPayPrice.toString();
                                    if(totalPayPrice_str.split('.').length > 1 && totalPayPrice_str.split('.')[1].length>2){
                                        totalPayPrice = totalPayPrice.toFixed(2);
                                    }
                            var detailUrl = durl.replace("%id%", id);
                            var rUrl = refundurl.replace("%id%", id);
                            var stateInfo = btn = "";

                            switch(orderstate){

                                case "4":
                                    stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][27]+'</span></p>';   //退款中
                                    break;
                                case "6":

                                    //申请退款
                                    if(retState == 1){

                                        //待处理
                                        if(list[i].ret_audittype == 0){
                                            //还未发货
                                            if(expDate == 0){
                                                stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][43]+'</span></p>';  //未发货  申请退款

                                            //已经发货
                                            }else{
                                                stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][42]+'</span></p>';   //已发货  退款
                                            }
                                        }
                                        else if(list[i].ret_audittype == 1){
                                            stateInfo = '<p class="order-state"><span>卖家拒绝退款</span></p>';
                                        }

                                    }
                                    break;
                                case "7":
                                    stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][34]+'</span></p>';  //退款成功
                                    break;
                            }

                            
                                html.push('<dl class="myitem" data-id="'+id+'">');
                                html.push('<dt><a href="'+store.domain+'"><p class="shop_name"><i></i><span>'+store.title+'</span></p></a></dt>')
                                html.push('<dd class="order-content">');
                                var totalCount = 0;
                                for(var p = 0; p < product.length; p++){
                                    html.push('<a href="'+detailUrl+'"><div class="fn-clear">');
                                    html.push('<div class="imgbox-l"><img src="'+product[p].litpic+'" alt="" /></div>');
                                    var specTxt = ''
                                    if(product[p].specation !=""){
                                        var speArr = product[p].specation.split('$$$');
                                        var shtml = [];
                                        for(var j = 0;j<speArr.length;j++){
                                            var speArr1 = speArr[j].split('：');
                                            shtml.push(speArr1[1])
                                            
                                        }
                                        specTxt ='<h3 class="spec">'+shtml.join('+')+'</h3>'

                                    }
                                    
                                    html.push('<div class="txtbox-c"><p>'+product[p].title+'</p>'+specTxt+'<h4 class="tkp">退款:'+(echoCurrency('symbol'))+totalPayPrice+'</h4></div>');
                                    html.push('</div></a>');
                                }
                                html.push('<div class="tk-type"><strong>【仅退款】</strong>'+stateInfo+'</div>')
                                html.push('<div class="btn-group" data-action="shop"><a href="'+rUrl+'" class="btn-borbg">查看详情</a></div>');
                                html.push('</dd>');
                                html.push('</dl>');
                            

                        }

                        objId.append(html.join(""));
                        $('.loading').remove();
                        isload = false;
                        if(atpage >= totalPage){
                            isload = true;
                            objId.append("<p class='loading'>"+msg+"</p>");
                        }

                    }else{
                        $('.loading').remove();
                        if(totalCount==0){
                            $('.no-data').show();
                        }else{
                            objId.append("<p class='loading'>"+msg+"</p>");
                        }
                    }

                    $("#total").html(pageInfo.totalCount);
                }
            }else{
                objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
            }
        }
    });
}