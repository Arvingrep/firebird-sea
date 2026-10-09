var atpage = 1, pageSize = 10, totalCount = 0, container = $('.list');
$(function(){

	$('.people-list .talk').click(function(){
        $('.desk').show();
        $('.send-popup').show();
    })

    $('.chat-popup .chat-close').click(function(){
        $('.desk').hide();
        $('.chat-popup').hide();
    })
    //全选
    $(".selectAll").bind("click", function(){
        $(this).is(":checked") ? $(this).closest('table').find(".list input").attr("checked", true) : $(".list input").attr("checked", false);
    });

    //牵线状态-导航条
    $(".nav-tab ul li").click(function(){
        $(this).addClass("active").siblings().removeClass("active");
        var i=$(this).index();
        getList(1);
    });

    // 删除会员弹窗
    $('.delete').bind('click',function(){
        var id = [];
        $('.list input').each(function(){
            $(this).is(":checked") ? id.push($(this).val()) : "";
        })
        if (id.length == 0) {
            $.dialog.alert(langData['siteConfig'][29][131]);  //您没有选中任何信息
            return;
        }
        $('.desk').show();
        $('.delete-popup').show();
    })
    $('.delete-popup .sure').bind('click',function(){
        $('.desk').hide();
        $('.delete-popup').hide();
        $('.list input').each(function(){
            var inp = $(this);
            if(inp.is(':checked')){
                var item = inp.closest('tr'), id = item.attr('data-id');
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
                $.dialog.alert(langData['siteConfig'][6][203]);   //网络错误，请重试
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
    var t = $(this), p = t.closest('tr'), id = p.attr('data-id'), state = 0, tti = '';
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
    var t = $(this), p = t.closest('tr'), otherUid = p.attr('data-uid');

    $('.chat-popup .tel').text(langData['siteConfig'][29][26]+'...');  //正在获取
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
            $.dialog.alert(langData['siteConfig'][6][203]);  //网络错误，请重试
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
        var navActive = $(".nav-tab li.active"), id = navActive.attr("data-id");
        if(tr){
          atpage = 1;
        }

        if(isNaN(id)){
          data.push('spec='+id);
        }else{
          data.push('state='+id);
        }
    
        $(".nav-tab li span").hide();

        container.html('<tr class="loading"><td colspan="6">'+langData['siteConfig'][20][409]+'...</td></tr>'); //正在获取，请稍后

        $.ajax({
          url: masterDomain + '/include/ajax.php?service=dating&action=leadList&ishn=1'+'&page='+atpage+'&pageSize='+pageSize+'&'+data.join('&'),
          type: 'get',
          dataType: 'jsonp',
          success: function(data){

            if(data && data.state == 100){
              var list = data.info.list, len = list.length;
              var pageInfo = data.info.pageInfo;
              totalCount = pageInfo.totalCount;

              if(pageInfo.newLoadCount){
                $(".nav-tab .load span, .nav-tab .bd span").show().text(pageInfo.newLoadCount);
              }
              if(pageInfo.newSuccCount){
                $(".nav-tab .succ span").show().text(pageInfo.newSuccCount);
              }
              if(pageInfo.newFailCount){
                $(".nav-tab .fail span").show().text(pageInfo.newFailCount);
              }

              if(len){
                var html = [];
                for(var i = 0; i < len; i++){
                    var d = list[i],
                          uLeft,
                          uRight,
                          state,
                          btn;
                        //   if(d.zd == "ufrom"){
                        //     uLeft = d.utoUser;
                        //     uRight = d.ufromUser;
                        //   }else{
                        //     uLeft = d.ufromUser;
                        //     uRight = d.utoUser;
                        //   }
                          uLeft = d.ufromUser;
                          uRight = d.utoUser;
                      if(d.state == 1){
                        state = '<td class="state string-ing">'+langData['siteConfig'][29][20]+'</td>';   //牵线中
                        btn = '<a class="refuse" href="javascript:;">'+langData['siteConfig'][29][134]+'</a><a class="agree" href="javascript:;">'+langData['siteConfig'][29][133]+'</a>';  //拒绝牵线-同意牵线
                      }else if(d.state == 2){
                        state = '<td class="state string-success">'+langData['siteConfig'][29][135]+'</td>';  //牵线成功
                        btn = '<a class="ta" href="javascript:;">'+langData['siteConfig'][29][136]+'</a>';  //Ta的联系方式
                      }else if(d.state == 3){
                        state = '<td class="state string-fail">'+langData['siteConfig'][29][137]+'</td>';  //牵线失败
                      }
                    var photo = uLeft.phototurl ? uLeft.phototurl : staticPath + 'images/default_user.jpg';
                    html.push('<tr data-uid="'+uLeft.id+'" data-id="'+d.id+'">');
                    html.push('    <td class="fir"></td>');
                    html.push('    <td>');
                    html.push('        <input type="checkbox" type="checkbox">');
                    html.push('        <a class="name" href="'+uLeft.url+'" target="_blank">'+uLeft.nickname+'</a>');
                    html.push('        <a href="javascript:;" class="talk">'+langData['siteConfig'][29][138]+'</a>');   //发起会话
                    html.push('    </td>');
                    html.push('    <td>');
                    html.push('        <a class="name" href="javascript:;">'+uRight.nickname+'</a>');
                    html.push('        <a href="javascript:;" class="talk">'+langData['siteConfig'][29][138]+'</a>');    //发起会话
                    html.push('    </td>');
                    html.push('    <td class="name">'+huoniao.transTimes(d.pubdate, 2).replace(/-/g, '.')+'</td>');
                    html.push(state);
                    html.push('    <td>');
                    html.push(btn);
                    html.push('    </td>');
                    html.push('</tr>');
                }
                container.html(html.join(""));
              }else{
                container.html('<tr class="loading"><td colspan="6">'+langData['siteConfig'][20][126]+'</td></tr>');  //暂无相关信息
              }

            }else{
                totalCount = 0;
                container.html('<tr class="loading"><td colspan="6">'+langData['siteConfig'][20][126]+'</td></tr>');//暂无相关信息
            }
            showPageInfo();
          },
          error: function(){
            container.html('<tr class="loading"><td colspan="6">'+langData['siteConfig'][6][203]+'</td></tr>');//网络错误，请重试
          }
        })

    }