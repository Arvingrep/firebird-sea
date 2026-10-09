/**
 * 会员中心——经纪人套餐记录
 * by guozi at: 20150627
 */

var objId = $("#list");
$(function(){

	$(".main-tab li[data-id='"+state+"']").addClass("curr");

	getList(1);

	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest("tr"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][543], function(){   //你确定要删除这条信息吗？
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=house&action=delMealOrder&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							par.slideUp(300, function(){
								par.remove();
								setTimeout(function(){getList(1);}, 200);
							});

						}else{
							$.dialog.alert(data.info);
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);   //网络错误，请稍候重试！
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			});
		}
	});

    $(".main-sub-tab li").click(function () {
    	var t = $(this);
    	t.addClass('curr').siblings('li').removeClass('curr');
    	atpage = 1;
    	getList();
    });

    //打印确认单
    $('#list').delegate('.printVisitConfirm', 'click', function(){
        var hasPrint = false;
        $.dialog.tips('<span style="padding-top: 8px; display: block;">加载中...</span>', 2, 'loading.gif');
        $('#printVisitConfirm').attr('src', 'house_loupan_printVisitConfirm.html?id=' + $(this).attr('data-id'));
        $('#printVisitConfirm').load(function(){
            setTimeout(function(){
                if(!hasPrint){
                    document.getElementById('printVisitConfirm').contentWindow.printPage();
                    hasPrint = true;
                }
            }, 1000);
        })
    });


});

function getList(is,keywords){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	if(!keywords){
		keywords = '';
	}
	var state = $('.main-sub-tab li.curr').attr('data-id');
	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');   //加载中，请稍候
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=house&action=loupanFenxiaoList&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
        data:"keywords="+keywords,
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					$("#total").html(0);
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");   //暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item     = [],
									id       = list[i].id,
									date     = list[i].date,
								username     = list[i].username,
								usertel      = list[i].usertel,
								loupantitle  = list[i].loupantitle,
								fenxiaotitle  = list[i].fenxiaotitle,
								note     = list[i].note,
								pubdate = list[i].pubdate,
								yxtime = list[i].yxtime;

							var statetitle = '';
							switch (list[i].state) {
								case '0':
									statetitle = '待核实';
									break;
								case '1':
									statetitle = '报备有效';
									break;
								case '2':
									statetitle = '报备无效';
									break;
								case '3':
									statetitle = '已成交';
									break;
								case '4':
									statetitle = '佣金已发放';
									break;
								case '5':
									statetitle = '已失效';
									break;
							}
							if(i == 0){
								html.push('<table class="oh" style="table-layout:fixed"> <colgroup> <col style="width:12%;"> <col style="width:25%;"> <col style="width:18%;"> <col style="width:15%;"><col style="width:15%;"> </colgroup> <thead> <th class="tl">客户资料</th><th class="tl">备注内容</th> <th class="tl">楼盘名称</th> <th class="tl">报备时间/有效时间</th> <th class="tl">报备状态</th> </thead> <tbody>');
								//订单号---金额---套餐---套餐时长---下单时间---支付方式---操作
							}

                            var copy = '<textarea style="font-size: 0; display: inline-block; opacity: 0; width: 0; height: 0; padding: 0; margin: 0;" id="copy_txt'+id+'">报备楼盘：'+loupantitle+'\r\n客户姓名：'+username+'\r\n电话号码：'+usertel+'\r\n报备渠道：'+cfg_shortname+'\r\n渠道销售：'+list[i].bbusername+'\r\n报备时间：'+pubdate+'</textarea>';

							html.push('<tr data-id="'+id+'">');
							  html.push('	<td class="tl" style="width:12%;"><h2>'+username+'<small title="复制客户报备信息"><a href="javascript:;" data-id="'+id+'" class="copy copy_btn'+id+' link" data-clipboard-target="#copy_txt'+id+'">[复制]</a></small></h2><p>'+usertel+copy+'</p></td>');
										html.push('	<td class="tl"  style="width:25%; white-space: normal;">'+note+'</td>');
							  html.push('	<td class="tl"  style="width:18%;"><h2><a href="'+list[i].loupanurl+'" target="_blank">'+loupantitle+'</a></h2><p>'+fenxiaotitle+'</p></td>');


					  	html.push('	<td class="tl grey"><p>'+pubdate+'</p><p>'+yxtime+'</p></td>');
					  	html.push('	<td class="tl">');
					  	html.push('		<a href="javascript:;" class="link" style="margin-left:0; cursor: default;">'+statetitle+'</a>');

                        if (!!window.ActiveXObject || "ActiveXObject" in window) {
                            console.log('ie不支持');
                        }else{
                            if(list[i].loupanprint){
                                html.push('<br /><a href="javascript:;" class="link printVisitConfirm" data-id="'+id+'"><u>打印确认单</u></a>');
                            }
                        }

				  		html.push('	</td>');
					  	html.push('</tr>');

					  	if(i + 1 == list.length){
						  	html.push('</tobdy>');
						  	html.push('</table>');
						  }

						}
						objId.html(html.join(""));

                        $("#list .copy").each(function(){
            				var t = $(this), id = t.data("id");

            				var clipboardShare = new ClipboardJS('.copy_btn'+id);
            				clipboardShare.on('success', function(e) {
                                $.dialog.tips('<span style="padding-top: 8px; display: block;">复制成功！</span>', 2, 'success.png');
            				});
            			});

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息！
					}

					$("#total").html(pageInfo.totalCount);
					$("#gray").html(pageInfo.state0);
					$("#audit").html(pageInfo.state1);
					$("#refuse").html(pageInfo.state2);
					$("#success").html(pageInfo.state3);
					$("#yongjin").html(pageInfo.state4);
					$("#shixiao").html(pageInfo.state5);

					showPageInfo();
				}
			}else{
				$("#total").html(0);
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
			}
		}
	});
}


// 搜索
$(".search_btn").click(function(){
  var keyword = $("#search").val()
  getList(1,keyword)
})
