var atpage = 1, pageSize = 10, totalCount = 0, container = $('.all-con');
$(function(){

	if($.browser.msie && parseInt($.browser.version) >= 8){
    	$('.all-con .all-list:last-child').css('border-bottom','none');
    }
    //全选
	$(".select-tab .selectAll").bind("click", function(){
		$(this).is(":checked") ? $(this).closest('.select-tab').find(".all-list input").attr("checked", true) : $(".all-list input").attr("checked", false);
	});
	//牵线-导航条
    $(".main-tab li").click(function(){
        $(this).addClass("curr").siblings().removeClass("curr");
        var i=$(this).index();
        getList(1);
    });


    // 删除会员弹窗
    $('.select-delete').bind('click',function(){
        var id = [];
        $('.all-con .all-list input').each(function(){
            $(this).is(":checked") ? id.push($(this).val()) : "";
        })
        if (id.length == 0) {
            $.dialog.alert(langData['siteConfig'][29][131]);   //您没有选中任何信息
            return;
        }
        $('.desk').show();
        $('.delete-popup').show();
    })
    $('.delete-popup .sure').bind('click',function(){
        $('.desk').hide();
        $('.delete-popup').hide();
        $('.all-con .all-list input').each(function(){
            var inp = $(this);
            if(inp.is(':checked')){
                var item = inp.closest('.all-list'), id = item.attr('data-id');
                $.post(masterDomain+'/include/ajax.php?service=dating&action=leadOper&state=4&id='+id);
                item.remove();
            }
        })
        getList(1);
    })
    $('.hello-popup-delete, .delete-popup .cancel').click(function(){
        $('.desk').hide();
        $('.delete-popup').hide();
    })

    // 取消牵线
    function cancelLead(){
        var item = $('.no-popup').data('item'), id = $('.no-popup').data('id');
        $.ajax({
            url: masterDomain+'/include/ajax.php?service=dating&action=leadOper&state=4&id='+id,
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                $('.desk').hide();
                $('.no-popup').hide();
                if(data && data.state == 100){
                    item.remove();
                }else{
                    $.dialog.alert(data.info);
                }
            },
            error: function(){
                $('.desk').hide();
                $('.no-popup').hide();
                $.dialog.alert(langData['siteConfig'][6][203]);   //您没有选中任何信息
            }
        })
    }   
    // 取消牵线-主动方
      container.delegate('.cancel', 'click', function(){
        var t = $(this), p = t.closest('.all-list'), id = p.attr('data-id');
        $('.desk').show();
        $('.no-popup').show().data({'item':p, 'id':id});
      })

    // 关闭取消牵线窗口
    $('.no-popup .hello-popup-delete, .no-popup .cancel').click(function(){
        $('.desk').hide();
        $('.no-popup').hide();
    })
    // 确认取消牵线按钮
    $('.no-popup .sure').click(function(){
        cancelLead();
    })


    // 关闭同意/拒绝牵线弹窗
    $('.yes-popup .hello-popup-delete, .yes-popup .cancel').click(function(){
        $('.desk').hide();
        $('.yes-popup').hide();
    })
    // 确定同意/拒绝牵线
    $('.yes-popup .sure').click(function(){
        $('.desk').hide();
        $('.yes-popup').hide();
        agreeRefuseLead();
    })
  // 同意牵线/拒绝牵线
  container.delegate('.agree, .refuse', 'click', function(){
    var t = $(this), p = t.closest('.all-list'), id = p.attr('data-id'), state = 0, tti = '';
    if(t.hasClass('agree')){
        tit = langData['siteConfig'][29][27];   //确定同意牵线？
        state = 2;
    }else{
        tit = langData['siteConfig'][29][132];   //确定拒绝牵线？
        state = 3;
    }
    $('.yes-popup .delete-sure').text(tit);
    $('.desk').show();
    $('.yes-popup').show().data({'item':p, 'id':id, 'state': state});
  })
  function agreeRefuseLead(){
    var item = $('.yes-popup').data('item'), id = $('.yes-popup').data('id'), state = $('.yes-popup').data('state');
    $.ajax({
        url: masterDomain+'/include/ajax.php?service=dating&action=leadOper&state='+state+'&id='+id,
        type: 'get',
        dataType: 'jsonp',
        success: function(data){
            if(data && data.state == 100){
                getList(1);
            }else{
                $('.yes-popup .cancel').click();
                $.dialog.alert(data.info);
            }
        },
        error: function(){
            $('.yes-popup .cancel').click();
            $.dialog.alert(data.info);
        }
    })
  }
  // 查看联系方式
  container.delegate('.ta', 'click', function(){
    var t = $(this), p = t.closest('.all-list'), otherUid = p.attr('data-uid');

    $('.chat-popup .tel').text(langData['siteConfig'][29][26]+'...'); //正在获取
    $('.desk').show();
    $('.chat-popup').show();

    $.ajax({
        url: masterDomain+'/include/ajax.php?service=dating&action=getMemberSpecInfo&name=contact&id='+otherUid,
        type: 'get',
        dataType: 'jsonp',
        success: function(data){
            if(data && data.state == 100){
                $('.chat-popup .phone').text(data.info.phone);
                $('.chat-popup .qq').text(data.info.qq);
                $('.chat-popup .wechat').text(data.info.wechat);
            }else{
                $('.chat-close').click();
                $.dialog.alert(data.info);
            }
        },
        error: function(){
            $('.chat-close').click();
            $.dialog.alert(langData['siteConfig'][6][203]);   //网络错误，请重试
        }
    })

  })
    // 关闭联系方式弹窗
    $('.chat-close').click(function(){
        $('.desk').hide();
        $('.chat-popup').hide();
    })


    getList();
})
    function getList(tr){

        var data = [], state = 0, spec = '';
        var navActive = $(".main-tab li.curr"), id = navActive.attr("data-id");
        if(tr){
          atpage = 1;
        }

        if(isNaN(id)){
          data.push('spec='+id);
        }else{
          data.push('state='+id);
        }

        $(".main-tab li span").hide();

        container.html('<div class="loading">'+langData['siteConfig'][20][409]+'...</div>');   //正在获取，请稍后

        $.ajax({
          url: masterDomain + '/include/ajax.php?service=dating&action=leadList'+'&page='+atpage+'&pageSize='+pageSize+'&'+data.join('&'),
          type: 'get',
          dataType: 'jsonp',
          success: function(data){

            if(data && data.state == 100){
              var list = data.info.list, len = list.length;
              var pageInfo = data.info.pageInfo;
              totalCount = pageInfo.totalCount;

              if(pageInfo.newLoadCount){
                $(".main-tab .load span, .main-tab .bd span").show().text(pageInfo.newLoadCount);
              }
              if(pageInfo.newSuccCount){
                $(".main-tab .succ span").show().text(pageInfo.newSuccCount);
              }
              if(pageInfo.newFailCount){
                $(".main-tab .fail span").show().text(pageInfo.newFailCount);
              }

              if(len){
                var html = [];
                for(var i = 0; i < len; i++){
                    var d = list[i];
                    var photo = d.user.photo ? d.user.photo : staticPath + 'images/default_user.jpg';
                    html.push('<div class="all-list fn-clear" data-id="'+d.id+'" data-uid="'+d.user.id+'">');
                    html.push('    <div class="member fn-left">');
                    html.push('        <input type="checkbox" value="'+d.id+'" class="fn-left">');
                    html.push('        <a href="'+d.user.url+'" target="_blank"><img src="'+photo+'" class="mem-img fn-left" alt=""></a>');
                    html.push('        <div class="mem-right fn-left">');
                    html.push('            <p class="name fn-clear"><a href="'+d.user.url+'" target="_blank">'+d.user.nickname+'</a>'+(d.user.online ? '<span>'+langData['siteConfig'][29][139]+'</span>' : '<span class="away">'+langData['siteConfig'][29][140]+'</span>')+'</p>');  
                    //在线-离线
                    var s = [];
                    if(d.user.age){
                        s.push(d.user.age+langData['siteConfig'][13][29]);//岁
                    }
                    if(d.user.heightName){
                        s.push(d.user.heightName);
                    }
                    if(s){
                        html.push('            <p class="year fn-clear">'+s.join('&nbsp;')+'</p>');
                    }
                    html.push('        </div>');
                    html.push('    </div>');
                    if(d.user.hn){
                        html.push('    <div class="maker fn-left"><a href="'+d.user.hn.url+'" target="_blank">'+d.user.hn.nickname+'</a><span>'+(d.user.hn.store ? '（'+d.user.hn.store.nickname+'）' : '')+'</span></div>');
                    }
                    html.push('    <div class="time fn-left">'+huoniao.transTimes(d.pubdate, 2).replace(/-/g, '/')+'</div>');
                    html.push('    <div class="way fn-left">'+(d.zd ? langData['siteConfig'][29][141] : langData['siteConfig'][29][142])+'</div>');//'主动牵线' : '被动牵线'
                    var state = '';
                    if(d.state == 1){
                        html.push('    <div class="state state-ing fn-left">'+langData['siteConfig'][29][20]+'</div>');   //牵线中
                        html.push('    <div class="operation fn-left">');
                        if(d.zd){
                          html.push('    <a href="javascript:;" class="btn no cancel">'+langData['siteConfig'][29][143]+'</a>');  //取消牵线
                        }else{
                          html.push('    <a href="javascript:;" class="btn no refuse">'+langData['siteConfig'][29][134]+'</a><a href="javascript:;" class="btn yes agree">'+langData['siteConfig'][29][133]+'</a>'); 
                          //拒绝牵线-同意牵线
                        }
                        html.push('    </div>');
                    }else if(d.state == 2){
                        html.push('    <div class="state state-success fn-left">'+langData['siteConfig'][29][135]+'</div>');  //牵线成功
                        html.push('    <div class="operation fn-left">');
                        html.push('    <a href="javascript:;" class="ta">'+langData['siteConfig'][29][136]+'</a>');  //Ta的联系方式
                        html.push('    </div>');
                    }else if(d.state == 3){
                        html.push('    <div class="state state-fail fn-left">'+langData['siteConfig'][29][137]+'</div>');  //牵线失败
                        html.push('<div class="operation fn-left"></div>');
                    }
                    html.push('    </div>');
                }
                container.html(html.join(""));
              }else{
                container.html('<div class="loading">'+langData['siteConfig'][20][126]+'</div>'); //暂无相关信息
              }

            }else{
                totalCount = 0;
                container.html('<div class="loading">'+langData['siteConfig'][20][126]+'</div>'); //暂无相关信息
            }
            showPageInfo();
          },
          error: function(){
            container.html('<div class="loading">'+langData['siteConfig'][6][203]+'</div>');  //网络错误，请重试
          }
        })

    }