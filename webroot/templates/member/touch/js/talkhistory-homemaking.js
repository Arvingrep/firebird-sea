/*订单退款协商历史*/

$(function () {
    var objId = $('.container ul');
    var orderpage = 1, pageSize = 10, isload = false;
    getList(objId);

    // 下拉加载
    $(window).scroll(function () {
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - 60;
        if ($(window).scrollTop() >= scroll && !isload) {
            orderpage++;
            getList();
        };
    });

    function getList(tr) {
        if (tr) {
            orderpage = 1;
            objId.html('');
        }
        if (isload) return false;
        isload = true;
        objId.append('<div class="loading"><img src="' + templatePath +
            'images/refund/loading.png"></div>');//加载中，请稍候
        $.ajax({
            url: "/include/ajax.php?service=homemaking&action=getrefund&page=" + orderpage + "&pageSize=" + pageSize + "&id=" + id,
            type: "GET",
            dataType: "json",
            success: function (data) {

                isload = false;
                if (data && data.state == 100) {
                    var list = data.info.list, html = [], pageInfo = data.info.pageInfo;
                    totalpage = pageInfo.totalPage;
                    if (list.length > 0) {
                        $('.loading').remove();
                        for (var i = 0; i < list.length; i++) {

                            retokdate = huoniao.transTimes(list[i].retokdate, 1),

                            html.push('<li>');
                            html.push('<div class="infoTop">');
                            html.push('<div class="peoimg ' + (i == 1 ? 'spe' : '') + '">');
                            if (list[i].type == 2) {
                                html.push('<img src="' + templatePath +
                                    'images/refund/kefu.png" alt="" onerror="javascript:this.src=\'' + staticPath + 'images/noPhoto_100.jpg\';this.onerror=this.src=\'' + staticPath + 'images/404.jpg\';" class="kefuimg">')
                            } else {
                                html.push('<img src="' + list[i].litpic + '" alt="" onerror="javascript:this.src=\'' + staticPath + 'images/noPhoto_100.jpg\';this.onerror=this.src=\'' + staticPath + 'images/404.jpg\';">');
                            }

                            html.push('</div>');
                            html.push('<div class="peoInfo">');
                            if (list[i].type == 2) {
                                html.push('<h3>平台客服</h3>');
                            } else {
                                html.push('<h3>' + list[i].nickname + '</h3>');
                            }

                            html.push('<p>' + retokdate + '</p>');
                            html.push('</div>');
                            html.push('</div>');

                            if(list[i].service == 1){
                                html.push('<div class="infoBot">');
                                html.push('<p>您申请了平台介入处理 </p>');
                                html.push('</div>');
                            }else{
                                if (list[i].refundnumber != 2 && list[i].orderstate == 9) {
                                    html.push('<div class="infoBot">');
                                    html.push('<p>商家已经同意退款 </p>');
                                    html.push('<p>退款成功 </p>');
                                    html.push('</div>');
                                } else if (list[i].refundnumber != 0 && list[i].status == 2) {
                                    html.push('<div class="infoBot">');
                                    html.push('<p>商家拒绝退款 </p>');
                                    html.push('<p>原因：'+list[i]['retnote']+' </p>');
                                    html.push('</div>');
                                } else if (list[i].type == 2 && list[i].status == 1) {
                                    html.push('<div class="infoBot">');
                                    html.push('<p>平台客服介入处理完成：已退款￥' + list[i].price + '</p>');
                                    html.push('<p>退回至您的账户余额</p>');
                                    html.push('</div>');
                                } else if (list[i].type == 1) {
                                    html.push('<div class="infoBot">');
                                    html.push('<p>您提交了退款申请 </p>');
                                    html.push('<dl><dt>退款原因：</dt><dd>' + list[i].rettype + '</dd></dl>');
                                    html.push('<dl><dt>退款金额：</dt><dd>' + echoCurrency('symbol') + '' + list[i].price + '</dd></dl>');
                                    html.push('<dl><dt>退款说明：</dt><dd>' + list[i].retnote + '</dd></dl>');
                                    html.push('</div>');
                                }
                            }
                            html.push('</li>');
                        }
                        objId.append(html.join(""));
                        isload = false;
                        if (orderpage >= totalpage) {
                            isload = true;
                            objId.append('<div class="loading">' + langData['renovation'][2][25] + '</div>');   //已显示全部
                        }
                    } else {
                        objId.find(".loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }
                } else {
                    objId.find(".loading").html(data.info);
                }
            },
            error: function () {
                isload = false;
                objId.find(".loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
            }
        })
    }

})




