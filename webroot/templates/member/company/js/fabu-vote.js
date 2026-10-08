$(function(){
  var obj = $("#groupList");

    //上传海报
    function mysub_(){
        $("#hbImg").attr('src', cfg_staticPath+'images/placeholder_img.png');
        $("#delHb").hide();
        $("#Filedata").prev("span").html(langData['siteConfig'][6][178]);//重新选择

        var data = [];
        data['mod'] = "vote";
        data['type'] = "atlas";
        data['filetype'] = "image";

        $.ajaxFileUpload({
            url: "/include/upload.inc.php",
            fileElementId: "Filedata",
            dataType: "json",
            data: data,
            success: function(m, l) {
                if (m.state == "SUCCESS") {
                    $("#hbImg").attr('src', m.turl);
                    $("#litpic").val(m.url);
                    $("#delHb").show();
                } else {
                    uploadError_();
                }
            },
            error: function() {
                uploadError_();
            }
        });

    }

    //上传失败、重新上传
    function uploadError_(){
        $("#hbImg").attr('src', cfg_staticPath+'images/placeholder_img.png');
        $("#Filedata").prev("span").html(langData['siteConfig'][31][69]);//添加海报
        $("#delHb").hide();
        $("#litpic").val("");
    }
    $("#Filedata").bind("change", function(){
        if ($(this).val() == '') return;
        mysub_();
    });
    $("#delHb").bind("click", function(){
        uploadError_();
    });

  // 新建问题
  $('.addNew').click(function(){
    var html = addCustomInput('question');
    var $html = $(html);
    obj.append($html);
    $html.find('.edit .title').focus();

    $html.find('.xuan_con').dragsort({
      dragSelector: "li",
      placeHolderTemplate: '<li class="holder"></li>',
      dragSelectorExclude: 'input, textarea, object, a, .pic, .img_big, a.icon',
      dragEnd: function(){
        checkXuan(this);
      }
    });
  })

  // 进入编辑状态
  obj.delegate(".g-btns .edit", "click", function(){
    var t = $(this), p = t.closest('.item');
    if(p.hasClass('editing')) return;
    p.addClass('editing').removeClass('normal');
  })
  // 退出编辑状态
  obj.delegate(".editComplete", "click", function(){
    var t = $(this), p = t.closest('.item');
    p.find('input.error').removeClass('error');

    var config = getQuestConfg(p, true);

    if(config){

      // 标题
      p.find('.result .tit').text(config.title);
      p.find('.result .type').text(config.q_type ? '['+langData['siteConfig'][31][75]+']' : '['+langData['siteConfig'][31][76]+']');

      // 选项
      var xuanHtml = [], len = config.xuan.length;
      var style = '';
      if(config.s_dire){
        style = ' style="float:left;width:'+(1/config.s_dire*100).toFixed(2)+'%;"';
      }
      var s_count = '';
      s_count += config.s_count ? langData['siteConfig'][43][13] : '';//0票
      s_count += config.s_ratio ? '(0%)' : '';

      xuanHtml.push('<div class="xuan_row fn-clear">');
      for(var i = 0; i < len; i++){
        var d = config.xuan[i];
        xuanHtml.push('<div class="xuan"'+style+'>');
        xuanHtml.push('  <div class="txt"><span class="count">'+s_count+'</span><label for=""><i class="icon icon_'+(config.q_type ? 'check' : 'radio')+'"></i>'+d.txt+'</label></div>');
        xuanHtml.push('  <div class="pic">');
        if(d.img){
          xuanHtml.push('    <img src="'+d.img+'" alt="">');
        }
        xuanHtml.push('  </div>');
        xuanHtml.push('</div>');

        if(config.s_dire && ((i+1) % config.s_dire == 0) ){
          xuanHtml.push('</div>');
          xuanHtml.push('<div class="xuan_row fn-clear">');
        }
      }
      xuanHtml.push('</div>');
      p.find('.body').html(xuanHtml.join(""));

      // 没有任何修改的情况下，body部分会有抖动？
      setTimeout(function(){
        p.removeClass('editing').addClass('normal');
      }, 200)
    }
  })

  // -------------------------------------------左侧菜单
  // 显示投票数、百分比
  obj.delegate(".show_count_number, .show_count_ratio", "click", function(){
    $(this).toggleClass('active');
  })
  // 排列方式，问题类型
  obj.delegate(".g-btns .more li", "click", function(){
    var t = $(this), id = t.attr('data-id'), txt = t.text();
    t.closest('.togg').attr('data-id', id).children('span').text(txt);
    t.parent().addClass('hide');
    setTimeout(function(){
      t.parent().removeClass('hide');
    },200)
  })

  // -------------------------------------------选项菜单
  // 上传选项图片
  obj.delegate(".upbtn", "click", function(){
    var t = $(this);
    if(t.hasClass('disabled')) return;
    t.siblings('.Filedata').click();
  })
  // 删除选项图片
  obj.delegate(".img_big .del", "click", function(){
    var t = $(this), p = t.closest('.pic');
    delAtlasPic(p.children('.pic_val').val());
    p.removeClass('has').children('.img').html('');
  })
  // 选项上移下移
  obj.delegate(".xuan_up, .xuan_down", "click", function(){
    var t = $(this), li = t.closest('li'), ul = li.parent();
    var d = li.clone();
    if(t.hasClass('xuan_up')){
      if(!li.prev().length) return;
      li.prev().before(d.clone());
    }else{
      if(!li.next().length) return;
      li.next().after(d.clone());
    }
    li.remove();
    checkXuan(ul);
  })
  // 新增选项
  obj.delegate(".xuan_add", "click", function(){
    var t = $(this), p = t.closest('li');
    var html = addCustomInput('xuan');
    var $item = $(html);
    p.after($item);
    $item.find('.xuan_txt').focus();

    checkXuan(p);
  })
  // 删除选项
  obj.delegate(".xuan_del", "click", function(){
    var t = $(this), li = t.closest('li'), ul = li.parent(), len = li.siblings().length;
    if(len <= 1){
      $.dialog.alert(langData['siteConfig'][31][99]);//至少保留两个选项
      return;
    }else{
      delPic(li);
      checkXuan(ul);
    }
  })

  // -------------------------------------------右侧菜单
  // 复制
  obj.delegate(".g-btns .copy", "click", function(){
    var t = $(this), p = t.closest('.item'), clone = p.clone(), time = new Date().getTime();
    clone.find('.Filedata').each(function(i){
      var t = $(this);
      t.attr('id', 'Filedata_clone_'+i+'_'+time);
    })
    p.after(clone);
    checkQuesNum();
  })
  // 上移下移
  obj.delegate(".g-btns .up, .g-btns .down, .g-btns .gotop, .g-btns .gobottom", "click", function(){
    var t = $(this), item = t.closest('.item');
    var d = item.clone();
    if(t.hasClass('up')){
      if(!item.prev().length) return;
      item.prev().before(d);
    }else if(t.hasClass('down')){
      if(!item.next().length) return;
      item.next().after(d);
    }else if(t.hasClass('gotop')){
      obj.prepend(d);
    }else if(t.hasClass('gobottom')){
      obj.append(d.clone());
    }
    d.find('.xuan_con').dragsort({
      dragSelector: "li",
      placeHolderTemplate: '<li class="holder"></li>',
      dragSelectorExclude: 'input, textarea, object, a, .pic, .img_big, a.icon',
      dragEnd: function(){
        checkXuan(this);
      }
    });
    item.remove();
    checkQuesNum();
  })
  // 删除
  obj.delegate(".g-btns .del", "click", function(){
    var item = $(this).closest('.item');
    delPic(item);
    checkQuesNum();
  })

  // 拖动
  $('.xuan_con').dragsort({
    dragSelector: "li",
    placeHolderTemplate: '<li class="holder"></li>',
    dragSelectorExclude: 'input, textarea, object, a, .pic, .img_big, a.icon',
    dragEnd: function(){
      checkXuan(this);
    }
  });

  // 提交
  $("#fabuForm").submit(function(e){
    e.preventDefault();
    var form = $(this),
        url = form.attr('action'),
        tourl = form.attr('data-url'),
        btn = form.find('.submit'),
        cityid = $("#cityid").val(),
        title = $.trim($('#title').val()),
        litpic = $.trim($('#litpic').val()),
        description = $.trim($('#description').val());

    form.find('input.error, select.error').removeClass('error');
    if(cityid == 0 || cityid == ''){
      $("#cityid").addClass('error');
      $('.main').animate({scrollTop:0 },200);
      return false;
    }

    if(title == ''){
      $.dialog.alert(langData['siteConfig'][20][26]);//请输入标题
      $('#title').addClass('error');
      $('.main').animate({scrollTop:0 },200);
      return false;
    }
      if(litpic == ''){
          $.dialog.alert(langData['siteConfig'][31][100]);//请上传投票海报
          $('html,body').animate({scrollTop:0 },200);
          return false;
      }
    if(description == ''){
      // $.dialog.alert('请填写文字说明');
      // $('html,body').animate({scrollTop:0 },200);
      // return false;
    }

    var item = obj.children(".item");
    if(!item.length){
      $.dialog.alert(langData['siteConfig'][31][101]);//您还没有创建任何问题
      return false;
    }
    var config = [], tj = true;
    item.each(function(){
      var cfg = getQuestConfg($(this));
      if(cfg){
        config.push(cfg);
      }else{
        tj = false;
        return false;
      }
    })
    if(tj){
      btn.attr('disabled', true);
      $.ajax({
        url: url,
        data: {id: id, title: title, litpic: litpic, description: description, cityid: cityid, config: config},
        type: 'post',
        dataType: 'json',
        success: function(data){
          if(data && data.state == 100){

            location.reload();

          }else{
            $.dialog.alert(data.info);
            btn.attr('disabled', false);
          }
        },
        error: function(){
          $.dialog.alert(langData['siteConfig'][6][203]);//网络错误，请重试！
          btn.attr('disabled', false);
        }
      })
    }
  })

  // 获取问题配置
  function getQuestConfg(item, turl){
    var tj = true;
    var config = {}, xuan = [];
    var tit               = item.find('.edit .title'),
        show_count_number = item.find('.show_count_number'),
        show_count_ratio  = item.find('.show_count_ratio'),
        g_type            = item.find('.g_type').attr('data-id'),
        direction         = item.find('.direction').attr('data-id'),
        xuanItem          = item.find('.xuan_con li');
    var title = $.trim(tit.val());
    if(!title){
      showError(tit, langData['siteConfig'][39][0]);//请填写标题
      return false;
    }
    // 选项
    xuanItem.each(function(){
      var t = $(this),
          title = t.find('.xuan_txt'),
          img = t.find('.pic_val').val() != '' ? ( turl ? t.find('.img_big img').attr('src') : t.find('.pic_val').val() ) : '';
      var val = $.trim(title.val());
      if(val == ''){
        showError(title, langData['siteConfig'][31][102]);//请填写选项
        tj = false;
        return false;
      }
      xuan.push({"txt":val, "img" : img});
    })

    if(!tj) return false;

    g_type    = g_type ? parseInt(g_type) : 0;
    direction = direction ? parseInt(direction) : 0;

    config = {
      title: title,
      xuan: xuan,
      s_count: show_count_number.hasClass('active') ? 1 : 0,
      s_ratio: show_count_ratio.hasClass('active') ? 1 : 0,
      s_dire: direction,
      q_type: g_type
    }

    return config;

  }

  // 选项上移下移按钮显示、隐藏
  function checkXuan(t){
    console.log('checkXuan')
    var t = t ? t.closest('.item') : t.children('.item');
    t.each(function(){
      var li = $(this).find('.xuan_con li'), len = li.length;
      li.each(function(i){
        if(i == 0){
          $(this).find(".xuan_up").hide();
          $(this).find(".xuan_down").show();
        }else if(i + 1 == len){
          $(this).find(".xuan_down").hide();
          $(this).find(".xuan_up").show();
        }else{
          $(this).find(".xuan_up, .xuan_down").show();
        }
      })
    })
  }

  // 编辑状态获取问题html或者选项html
  var addCustomInput = function(where){
    var html = [];

    var getbody = function(n){
      var time = new Date().getTime();
      var body = [];
      body.push('<li>');
      body.push('  <span class="tp"><i class="icon icon_move"></i></span>');
      body.push('  <div class="xuan_m fn-clear">');
      body.push('    <div class="xuan_inp">');
      body.push('      <input type="text" class="xuan_txt" placeholder="'+langData['siteConfig'][31][78]+'">');   //选项
      body.push('      <div class="pic">');
      body.push('         <div class="img"></div>');
      body.push('         <div class="upbtn"><i class="icon icon_pic"></i></div>');
      body.push('         <input type="file" name="Filedata" value="" class="fn-hide Filedata" id="Filedata_'+time+(n ? '_'+n : '')+'">');
      body.push('         <input type="hidden" name="pic" value="" class="fn-hide pic_val">');
      body.push('      </div>');
      body.push('    </div>');
      body.push('    <div class="xuan_btns">');
      body.push('      <a href="javascript:;" class="icon icon_del2 xuan_del" title="'+langData['siteConfig'][6][8]+'"></a>'); //删除
      body.push('      <a href="javascript:;" class="icon icon_up xuan_up" title="'+langData['siteConfig'][6][158]+'"'+(n == 1 ? ' style="display:none;"' : '')+'></a>'); //上移
      body.push('      <a href="javascript:;" class="icon icon_down xuan_down" title="'+langData['siteConfig'][6][159]+'"'+(n == 2 ? ' style="display:none;"' : '')+'></a>');//下移
      body.push('      <a href="javascript:;" class="icon icon_add xuan_add" title="'+langData['siteConfig'][6][31]+'"></a>');//新增
      body.push('    </div>');
      body.push('  </div>');
      body.push('</li>');
      return body.join("");
    }

    if(where == 'question'){
      var count = obj.children('.item').length+1;
      html.push('<div class="item horizontal editing">');
      html.push('  <div class="result">');
      html.push('    <div class="title"><span class="px">'+count+'</span>.<span class="tit"></span><span class="type">['+langData['siteConfig'][31][76]+']</span></div>');//单选题
      html.push('    <div class="body fn-clear"></div>');
      html.push('  </div>');
      html.push('  <div class="edit">');
      html.push('    <div class="title_con">');
      html.push('      <span class="tp">'+langData['siteConfig'][19][0]+'</span><input type="text" class="title" value="" placeholder="'+langData['siteConfig'][31][77]+'">');//标题---请输入题目内容
      html.push('    </div>');
      html.push('    <ul class="xuan_con">');
      html.push(      getbody(1));
      html.push(      getbody(2));
      html.push('    </ul>');
      html.push('    <a href="javascript:;" class="editComplete">'+langData['siteConfig'][31][79]+'</a>');  //完成编辑
      html.push('  </div>');
      html.push('  <div class="g-btns fn-clear">');
      html.push('    <div class="g-btns-left fn-hide">');
      html.push('      <a href="javascript:;" class="show_count_number"><i class="icon icon_check"></i>'+langData['siteConfig'][31][80]+'</a>');  //显示投票数
      html.push('      <a href="javascript:;" class="show_count_ratio"><i class="icon icon_check"></i>'+langData['siteConfig'][31][81]+'</a>');  //显示百分比
      html.push('      <a href="javascript:;" class="direction togg" data-id="0">');
      html.push('        <span>'+langData['siteConfig'][31][84]+'</span><i class="sj_up"></i><i class="sj_down"></i>');//纵向排列
      html.push('        <ul class="more">');
      html.push('          <li data-id="0">'+langData['siteConfig'][31][84]+'</li>');//纵向排列
      html.push('          <li data-id="2">'+langData['siteConfig'][31][85]+'</li>');//1行2列
      html.push('          <li data-id="3">'+(langData['siteConfig'][31][85]).replace('2','3')+'</li>');
      html.push('          <li data-id="4">'+(langData['siteConfig'][31][85]).replace('2','4')+'</li>');
      html.push('        </ul>');
      html.push('      </a>');
      html.push('      <a href="javascript:;" class="g_type togg" data-id="0">');
      html.push('        <span>单选题</span>');
      html.push('        <i class="sj_up"></i><i class="sj_down"></i>');
      html.push('        <ul class="more">');
      html.push('          <li data-id="0">'+langData['siteConfig'][31][76]+'</li>');  //单选题
      html.push('          <li data-id="1">'+langData['siteConfig'][31][75]+'</li>');  //多选题
      html.push('        </ul>');
      html.push('      </a>');
      html.push('    </div>');
      html.push('    <div class="g-btns-right">');
      html.push('      <a href="javascript:;" class="edit"><i class="icon icon_edit"></i>'+langData['siteConfig'][6][6]+'</a>');   //编辑
      html.push('      <a href="javascript:;" class="copy"><i class="icon icon_copy"></i>'+langData['siteConfig'][31][86]+'</a>');  //复制
      html.push('      <a href="javascript:;" class="down"><i class="icon icon_down2"></i>'+langData['siteConfig'][6][159]+'</a>');  //下移
      html.push('      <a href="javascript:;" class="up"><i class="icon icon_up2"></i>'+langData['siteConfig'][6][158]+'</a>');  //上移
      html.push('      <a href="javascript:;" class="gotop"><i class="icon icon_top"></i>'+langData['siteConfig'][31][87]+'</a>');  //最前
      html.push('      <a href="javascript:;" class="gobottom"><i class="icon icon_bottom"></i>'+langData['siteConfig'][31][88]+'</a>');  //最后
      html.push('      <a href="javascript:;" class="del"><i class="icon icon_del1"></i>'+langData['siteConfig'][6][8]+'</a>');  //删除
      html.push('    </div>');
      html.push('  </div>');
      html.push('</div>');
    }else{
      html.push(getbody());
    }

    return html.join("");
  }

  // 修改问题编号
  function checkQuesNum(){
    obj.children('.item').each(function(i){
      $(this).find('.px').text((i+1));
    })
  }

  //上传单张图片
  function mysub(id){
    var t = $("#"+id), con = t.siblings('.img'), pic_val = t.siblings(".pic_val"), uploadHolder = t.siblings('.upbtn');

    var data = [];
    data['mod'] = 'vote';
    data['filetype'] = 'image';
    data['type'] = 'atlas';

    $.ajaxFileUpload({
      url: "/include/upload.inc.php",
      fileElementId: id,
      dataType: "json",
      data: data,
      success: function(m, l) {
        if (m.state == "SUCCESS") {
          if(con.html() == ''){
            con.html('<img src="'+m.turl+'" alt="" class="img"><div class="img_big"><img src="'+m.turl+'" alt=""><a href="javascript:;" class="del"><i class="icon icon_del3"></i></a><em><s></s></em></div>');
            con.parent().addClass('has');
          }else{
            con.find('img').attr('src', m.turl);
            delAtlasPic(pic_val.val());
          }
          pic_val.val(m.url);

          uploadHolder.removeClass('disabled').parent().removeClass('uploading');

        } else {
          uploadError(m.state, id, uploadHolder);
        }
      },
      error: function() {
        uploadError(langData['siteConfig'][6][203], id, uploadHolder);//网络错误，请重试！
      }
    });

  }
  // 上传错误
  function uploadError(info, id, uploadHolder){
    $.dialog.alert(info);
    uploadHolder.removeClass('disabled').parent().removeClass('uploading');
  }
  //删除已上传图片
  var delAtlasPic = function(picpath){
    var g = {
      mod: "vote",
      type: "delAtlas",
      picpath: picpath,
      randoms: Math.random()
    };
    $.ajax({
      type: "POST",
      url: "/include/upload.inc.php",
      data: $.param(g)
    })
  };

  obj.delegate(".Filedata", "change", function(){
    var t = $(this);
    if (t.val() == '') return;
    t.siblings('.upbtn').addClass('disabled').parent('.pic').addClass('uploading');
    mysub(t.attr("id"));
  })

  // 错误提示
  function showError(t, info){
    t.addClass('error').focus();
  }

  // 删除图片
  function delPic(obj){
    obj.hide();
    obj.find('.pic_val').each(function(){
      var img = $(this).val();
      if(img != ''){
        delAtlasPic(img)
      }
    })
    obj.remove();
  }
})
