$(function(){

     //套餐详情
     $('.open-wrap li').click(function(){
         var t = $(this), title = t.data('title'), privilege = t.data('privilege'), store = t.data('store');
         $('.mask_pop').show();
         $('.all-choo').html(title);

         var list = [];
         if(privilege){
             list.push('<dl class="fn-clear">');
             list.push('<dt>'+langData['siteConfig'][49][46]+'</dt>');  //商家特权
             list.push('<dd>'+privilege+'</dd>');
             list.push('</dl>');
         }
         if(store){
             list.push('<dl class="fn-clear">');
             list.push('<dt>'+langData['siteConfig'][49][46]+'</dt>');  //商家特权
             list.push('<dd>'+store+'</dd>');
             list.push('</dl>');
         }

         $('.timeList').html(list.join(''));

         $('.tl_box').animate({"bottom":'0'}, 200);
     });

     // 取消按钮
 	$('.cancel').click(function(){
 		var t = $(this);
 		t.parents('.pop_box').animate({"bottom":'-88%'},200);
 		$('.mask_pop').hide();
 	});

    //隐藏弹出层
	$('.mask_pop').click(function(){
		$(this).hide();
		$('.pop_box').animate({"bottom":'-88%'},200);
	});

    getList()
    function getList(){
        $(".open-wrap .loading").text('加载中...')
        $.ajax({
            url: '/include/ajax.php?service=member&action=joinOrder&page=1&pageSize=9999',
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data.state == 100){
                    let htmlArr = []
                    for(let i = 0; i < data.info.list.length; i++){
                        let list = data.info.list[i];
                        let html = `
                            <li data-title="${list.title}" >
                                <div class="con-top">
                                    <span class="title"><s></s>${list.title ? list.title : '未知数据'}</span><span class="time">${list.times}</span>
                                </div>
                                <div class="con-info">
                                    <div class="ul">
                                        <div class="li"><label for="">到期时间：</label><span>${list.expired ? huoniao.transTimes(list.expired,1) : '00:00:00'}</span></div class="li">
                                        <div class="li"><label for="">开通时间：</label><span>${huoniao.transTimes(list.paydate,1)}</span></div class="li">
                                        <div class="li"><label for="">订单编号：</label><span>${list.ordernum}</span></div>
                                    </div>
                                </div>
                            </li>`;
                        htmlArr.push(html);
                    }
                    if(htmlArr.length){
                        $(".open-wrap .loading").text('已显示全部')
                    }else{
                        $(".open-wrap .loading").text('暂无数据')
                    }
                    $(".open-wrap ul").html(htmlArr.join(''))
                }else{
                    $(".open-wrap .loading").text('暂无数据')
                }
            },
            error: function () { }
        })
    }

})
