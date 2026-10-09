$(function(){
  var needCheck = false;

  $('#editform input').on('input propertychange', function(){
    $('#checkES').text('点击检测是否可用');
    needCheck = true;
    var t = $(this), val = t.val(), type = t.attr('type');
    if(type == 'ip'){
      var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
      reg.test(val);
      t.val(val);
    }
  })
  $('#checkES').click(function(){
    var t = $(this);
    if (t.text() == "正在连接...") return false;
    var server = $('#server').val(),
        port = $('#port').val(),
        requirepass = $('#requirepass').val();
    if(server == '' || port == '' || requirepass == ''){
      $.dialog.alert('请填写完整');
    }
    var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    if(!reg.test(server)){
      $.dialog.alert('服务器地址不正确');
      return false;
    }

    t.html("<font class='muted'>正在连接...</font>");
    huoniao.operaJson("?action=check", $('#editform').serialize(), function (val) {
        if (!val) t.html("点击检测是否可用");
        var info = val.info;
        if (val.state == 100) {
            info = '<font class="text-success">' + info + '</font>';
            needCheck = false;
        } else {
            info = '<font class="text-error">' + info + '</font>';
        }
        t.html(info + "&nbsp;&nbsp;<font size='1'>返回重试</font>");
    });
  })

  $('#editform').submit(function(e){
    e.preventDefault();
    let state = $("input[name='open']:checked").val()
      state = parseInt(state);
    if(state && needCheck){
      $.dialog.alert('请检测配置是否可用');
      return;
    }
    huoniao.operaJson("?action=save", $('#editform').serialize(), function (val) {
      var info = val.info;
      if (val.state == 100) {
          huoniao.showTip('success', info);
          setTimeout(function(){
            location.reload();
          }, 1000)
      } else {
          huoniao.showTip('error', info, 1000);
      }
    });
  })
  
    // 创建、重建索引
    $("#build").click(function (){
        $.get("?action=build",function (r){
            var info = r.info;
            if (r.state === 100) {
                huoniao.showTip('success', info);
                setTimeout(function(){
                    location.reload();
                }, 1000)
            } else {
                huoniao.showTip('error', info, 1000);
            }
            setTimeout(function(){
                huoniao.hideTip();
            }, 1000)
        },"json");
    });
    // 同步按钮操作
    $("#syncTable>tr>td>button").click(function(){
        let module = $(this).parent().parent().attr("module");
        let second = $(this).parent().parent().attr("second");
        let ss = $(this).parent().parent().children("td:first-child").text();
        if(!module){ return; }
        let operation = this.innerText;
        if(!operation){return;}
        let that = this;
        BootstrapDialog.show({
            title:"把数据从数据库同步到ES中",
            message: '确定要开始同步吗？【'+ss+'】',
            buttons: [{
                label: '开始同步',
                cssClass: 'btn-primary btn-mini',
                autospin: true,
                action: function(dialogRef){
                    dialogRef.enableButtons(false);
                    dialogRef.setClosable(false);
                    dialogRef.getModalBody().html('<p class="text-info">请不要关闭或刷新本页面，数据正在同步中...【'+ss+'】</p>');
                    var page = 1;
                    var total = 0;

                    // 循环发送ajax请求
                    sendAjax(module,operation,second,page,1,"");
                    function sendAjax(module,operation,second,page,hasNext,result)
                    {
                        if(!hasNext)
                        {
                            dialogRef.getModalBody().append(`<p class="text-warning">${result.info}，总计：${total}条</p>`);
                            dialogRef.getModalBody()[0].scrollTop = dialogRef.getModalBody()[0].scrollHeight;
                            let parent = $(that).parent();
                            $(parent).prev().text(result.time);
                            dialogRef.enableButtons(true);
                            dialogRef.setClosable(true);
                            // setTimeout(function(){
                            //     dialogRef.close();
                            // }, 2000);
                            return;
                        }
                        $.ajax(
                            {
                                url : "?action=async",
                                type : "POST",
                                async:true,
                                data :
                                    {
                                        "module" :module,
                                        "operation":operation,
                                        "second":second,
                                        "page":page
                                    },
                                success : function(data)
                                {
                                    data = JSON.parse(data);
                                    if(data.state===100){
                                        // 追加内容
                                        total += data.pageInfo.size;
                                        dialogRef.getModalBody().append(`<p class="text-success">本次成功条数：${data.pageInfo.size}，已完成${page}/${data.pageInfo.totalPage}</p>`);
                                        // 滚动窗口
                                        dialogRef.getModalBody()[0].scrollTop = dialogRef.getModalBody()[0].scrollHeight;
                                        // 循环发送
                                        sendAjax(module,operation,second,page+1,page<data.pageInfo.totalPage,data);

                                    }else{
                                        dialogRef.getModalBody().append(`<p class="text-warning">${data.info}</p>`);
                                        setClosable(true);

                                        // setTimeout(function(){
                                        //     dialogRef.close();
                                        // }, 2000);
                                    }
                                },
                                error : function(data)
                                {
                                    dialogRef.getModalBody().append(`<p class="text-warning">${data.info}</p>`);
                                    setTimeout(function(){
                                        dialogRef.close();
                                    }, 2000);
                                }
                            });
                    }
                }
            }, {
                label: '关闭',
                cssClass: 'btn-default btn-mini',
                action: function(dialogRef){
                    dialogRef.close();
                }
            }]
        });
    });

    // 同步所有数据
    $("#asyncAllData").click(function (){
        BootstrapDialog.show({
            title:"同步历史数据",
            draggable: true,
            message: '首次配置或者搜索结果与后台数据不匹配时，建议进行数据同步！',
            buttons: [{
                label: '开始同步',
                cssClass: 'btn-primary btn-mini',
                autospin: true,
                action: function(dialogRef){
                    dialogRef.enableButtons(false);
                    dialogRef.setClosable(false);
                    dialogRef.getModalBody().html('<p class="text-info">数据正在同步中，请不要关闭或刷新本页面...</p>');
                    var page = 1;
                    var total = 0;
                    // 循环发送ajax请求
                    sendAjax(1,page,1,"");
                    function sendAjax(mdpage,page,hasNext,result)
                    {
                        if(!hasNext)
                        {
                            dialogRef.getModalBody().append(`<p class="text-warning">${result.info}，总计：${total}条</p>`);
                            dialogRef.getModalBody()[0].scrollTop = dialogRef.getModalBody()[0].scrollHeight;
                            dialogRef.enableButtons(true);
                            dialogRef.setClosable(true);
                            return;
                        }
                        $.ajax(
                            {
                                url : "?action=asyncAll",
                                type : "POST",
                                async:true,
                                data :
                                    {
                                        "mdpage" :mdpage,
                                        "page":page
                                    },
                                success : function(data)
                                {
                                    data = JSON.parse(data);
                                    if(data.state===100){
                                        // 追加内容
                                        total += data.pageInfo.size;
                                        dialogRef.getModalBody().append('<p class="text-success">'+(data.pageInfo.mdpage < 10 ? '0' + data.pageInfo.mdpage : data.pageInfo.mdpage)+'/'+data.pageInfo.moduleCount+'. '+data.pageInfo.description+'：同步成功'+data.pageInfo.size+'条'+(data.pageInfo.totalPage > 1 ? '，共'+data.pageInfo.totalPage+'页，已完成'+page+'页' : '')+'</p>');
                                        // 滚动窗口
                                        dialogRef.getModalBody()[0].scrollTop = dialogRef.getModalBody()[0].scrollHeight;
                                        // 循环发送
                                        let hasNext = true;
                                        let nextMdpage = mdpage;
                                        let nextPage = page;
                                        if(page<data.pageInfo.totalPage){ // 当前模块还未结束
                                            nextPage = page+1;
                                        }else{
                                            if(mdpage<data.pageInfo.moduleCount){  // 当前模块已经结束，但还有下一个模块，从下一个模块的第一页开始
                                                nextMdpage = mdpage+1;
                                                nextPage = 1;
                                            }else{  // 所有的模块都已同步
                                                hasNext =false;
                                            }
                                        }
                                        sendAjax(nextMdpage,nextPage,hasNext,data);

                                    }else{
                                        dialogRef.getModalBody().append(`<p class="text-warning">${data.info}</p>`);
                                        dialogRef.enableButtons(true);
                                        dialogRef.setClosable(true);
                                        // setTimeout(function(){
                                        //     dialogRef.close();
                                        // }, 2000);
                                    }
                                },
                                error : function(data)
                                {
                                    dialogRef.getModalBody().append(`<p class="text-warning">${data.info}</p>`);
                                    dialogRef.enableButtons(true);
                                    dialogRef.setClosable(true);
                                    // setTimeout(function(){
                                    //     dialogRef.close();
                                    // }, 2000);
                                }
                            });
                    }
                }
            }, {
                label: '关闭',
                cssClass: 'btn-mini',
                action: function(dialogRef){
                    dialogRef.close();
                }
            }]
        });
    });


})