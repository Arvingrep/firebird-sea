var showAlertErrTimer ;
$(function(){
  var localUrl = window.location.href;
  var location = localUrl.replace(masterDomain+'/','');
  var homeUrl = masterDomain+'/'+location.split('/')[0];
  $(".backHome").attr('href',homeUrl);
  var oldHtml = $(".truePage").html();
  var newHtml = $(".truePage").html();
  if($('.customBox .modbox[data-type="hideMod"] dd').length == 0){
    $('.customBox .modbox[data-type="hideMod"]').addClass('fn-hide')
  }
  // 色彩选择
  let pickr = Pickr.create({
      el: '#colorPicker',
      showAlways: true,
      default: '#0D6287',
      comparison: false,
      components: {
          hue: true,
          // opacity:true,
          interaction: {
              // hex: true,
              input: true,
              // RGBa:true,
          }
      },
      onChange(hsva) {
        optAction = true;
        const hex = hsva.toHEX();
        const rgb = hsva.toRGBA();
        const color = '#' + hex[0] + hex[1] + hex[2];
        const y = 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2]
        //
        // console.log(color)
        $('.fbItem.chosed').attr('data-newColor',color)
          $('.fbItem.chosed dt').css({
            'background':color,
          })
      },


  });

  // 隐藏/显示辅助线
  $('.hidebtn').click(function(){
    var t = $(this);
    $(".pageDec").toggleClass('hide');
  })
  var qrUrl = memberDomain+'/fabuJoin_touch_popup_3.4.html?preview=1&appIndex=1'
  $(".previewBox").find('.qrBox img').attr('src',masterDomain+'/include/qrcode.php?data='+ encodeURIComponent(qrUrl))

  // 左侧鼠标上移
  $('.modbox dd').hover(function(){
    var dd = $(this), mod = dd.closest('.modbox');
    var type = mod.attr('data-type');
    if(type != 'bjtype'){
      var code = dd.attr('data-code');
      $(".fastFb li[data-code='"+code+"'],.fbList .fbItem[data-code='"+code+"']").addClass('hover');
    }
  },function(){
    var dd = $(this), mod = dd.closest('.modbox');
    var type = mod.attr('data-type');
    if(type != 'bjtype'){
      var code = dd.attr('data-code');
      $(".fastFb li[data-code='"+code+"'],.fbList .fbItem[data-code='"+code+"']").removeClass('hover');
    }
  })




  // 鼠标点击
  // $('.customBox .modbox dd').click(function(){
  $('.customBox .modbox').delegate('dd','click',function(){
    optAction = true;
    var dd = $(this), mod = dd.closest('.modbox');
    dd.addClass('on_chose').siblings('dd').removeClass('on_chose');
    var type = mod.attr('data-type');
    $('.midContainer').addClass('transLeft');
    $(".rightCon").addClass('show').removeClass('noChange');

    if(type == 'showMod'){
      $(".tip_sure .switch").addClass('open');
      $(".tip_sure span").text('开启')
      $('.tip_sure p').addClass('fn-hide');
      var code = dd.attr('data-code');
      $(".customCon .fastFb li[data-code='"+code+"'],.customCon .fbList .fbItem[data-code='"+code+"']").click();
      $('.bujutype dd').eq(1).addClass('on_chose').siblings('dd').removeClass('on_chose');
      $('.rightCon.show .title a.reset_btn').removeClass('fn-hide').siblings('a').addClass('fn-hide')
    }
  });





  // 点击画板
  $(".customCon").delegate('.fastFb li', 'click', function(){
    optAction = true;
    var t = $(this);
    if(t.hasClass('add_btn')) return false;
    var code = t.attr('data-code');
    var icon = t.attr('data-icon'),
        icon_new = t.attr('data-newIcon'),
        name = t.attr('data-name'),
        name_new = t.attr('data-newName'),
        url_new = t.attr('data-newUrl'),
        url = t.attr('data-url');
    $('.midContainer').addClass('transLeft')
    if(t.hasClass('selfAdd') || !code){
      $(".reset_btn").addClass('fn-hide').siblings('.delbtn').removeClass('fn-hide');
      $('.tip_sure').hide()
    } else{
      $(".reset_btn").removeClass('fn-hide').siblings('.delbtn').addClass('fn-hide');
      $('.tip_sure').show()
    }
    $('.modBox.config .tip_sure .switch').addClass('open')
    $('.modBox.config .tip_sure dd span').text('开启')
    t.addClass('chosed').siblings().removeClass('chosed')
    $(".customCon .fbList .fbItem").removeClass('chosed')
    $(".customBox .modbox dd").removeClass('on_chose')
    $(".customBox .modbox dd[data-code='"+code+"']").addClass('on_chose').siblings('dd').removeClass('on_chose');
    $(".rightCon").addClass('show').removeClass('noChange');
    $(".rightCon").find('.modBox').addClass('fn-hide')
    $(".rightCon").find('.modBox.config').removeClass('fn-hide');

    // 赋值
    $(".rightCon .modBox.config .upbtn img").remove()
    if(icon || icon_new){
      var img = icon_new ? icon_new : icon;
      $(".rightCon .modBox.config").find('.upbtn').addClass('hasup').append('<img src="'+img+'">');
    }else{
      $(".rightCon .modBox.config").find('.upbtn').removeClass('hasup');
    }
    if(name || name_new){
      var text = (name_new||name_new== '') ? name_new : name;
      $(".rightCon .modBox.config").find('.iconName').val(text);
      $(".rightCon .modBox.config").find('.count span').text(text.length);
    }else{
      $(".rightCon .modBox.config").find('.iconName').val('');
      $(".rightCon .modBox.config").find('.count span').text(0);
    }
    if(url || url_new){
      $(".rightCon .modBox.config").find('.iconLink').val(url_new ? url_new : url);
    }else{
      $(".rightCon .modBox.config").find('.iconLink').val('');
    }
  });

  // 自定义初始化
  if($(".bujutype .on_chose").attr('data-val') == 2){
    $('.customCon .fastFb li').eq(0).click()
  }

  // 平台默认相互切换
  $(".modbox[data-type='bjtype'] dd").click(function(){
    var dd = $(this), mod = dd.closest('.modbox');
    dd.addClass('on_chose').siblings('dd').removeClass('on_chose');

      var val = dd.attr('data-val');
      $(".modbox dd").removeClass('on_hover')
      $(".rightCon .chose_tip").removeClass('red')
      $('.tip_sure .tip').addClass('fn-hide')
      if(val == 2){

        $('.midContainer').removeClass('linehide');
        $('.tip_sure').removeClass('fn-hide')
        $('.midContainer').addClass('transLeft');
        $(".rightCon").addClass('show')
        $(".rightCon").removeClass('chose_show');
        $(".rightCon.chose_show .chose_tip").removeClass('red')
        $(".customCon .fastFb li").eq(0).click();
         $(".pageCon.customCon").removeClass('fn-hide').siblings('.pageCon').addClass('fn-hide');
         $(".changeLayout").removeClass('fadeIn')
         $(".changeLayout[data-val='2']").addClass('fadeIn')
         setTimeout(function(){
           $(".changeLayout[data-val='2']").removeClass('fadeIn');
         },3000)
         $('.customBox').removeClass('fn-hide').siblings('.originBox').addClass('fn-hide')
      }else{
        $('.midContainer').addClass('linehide');
        $('.tip_sure').addClass('fn-hide')
        $(".pageCon:not(.customCon)").removeClass('fn-hide').siblings('.pageCon').addClass('fn-hide');
        $('.originBox').removeClass('fn-hide').siblings('.customBox').addClass('fn-hide');
        // $(".changeLayout p").html('已切换至默认布局，如需设置生效请及时保存');
        $(".changeLayout").removeClass('fadeIn')
        $(".changeLayout[data-val='1']").addClass('fadeIn')
        setTimeout(function(){
          $(".changeLayout[data-val='1']").removeClass('fadeIn')
        },3000)

          $('.rightCon').removeClass('show')
          $(".rightCon .chose_tip").removeClass('red')
          $('.midContainer').removeClass('transLeft')



      }




  })

  // 平台默认点击左侧
  $('.originBox .modbox dd').click(function(){
    var t = $(this),code = t.attr('data-code'),name = t.attr('data-name');
    var mode = t.closest('.modbox').attr('data-type')
    $('.midContainer').addClass('transLeft');
    $(".rightCon").addClass('chose_show');
    if(mode == 'showMod'){
      $(".tip_sure").addClass('fn-hide')
      $('.switch').addClass('open')
      $('.tip_sure span').text('开启');
      // $('.tip_sure p.tip').removeClass('fn-hide');
    }else{
      $(".tip_sure").addClass('fn-hide')
      $('.switch').addClass('open')
      $('.tip_sure span').text('已关闭');
      $('.tip_sure p.tip').addClass('fn-hide');
    }
    $(".originBox dd").removeClass('on_chose')
    t.addClass('on_chose');
    $(".originCon .fbItem,.originCon .fastFb li").removeClass('chosed');

    if(t.hasClass('child')){
      var color = t.attr('data-color');
      var col = t.attr('data-column')
      $(".modBox.children").removeClass('fn-hide').siblings('.modBox').addClass('fn-hide')
      $('.originCon .fbItem[data-code="'+code+'"]').addClass('chosed');
      $(".children .modName").val(name)
      $(".pcr-button").css(
        {
          background:(color?color:'#316BFF')
        }
      )
      if(col == 4){
        $(".column_chose").addClass('colOther')
      }else{
        $(".column_chose").removeClass('colOther')
      }
      var con = $(this).attr('data-content');
      if(con){
        renderHtml(JSON.parse(con))
      }
    }else{
      $(".modBox.config").removeClass('fn-hide').siblings('.modBox').addClass('fn-hide')
      $('.originCon .fastFb li[data-code="'+code+'"]').addClass('chosed').siblings('li').removeClass('chosed');
      var url = t.attr('data-url');
      var icon = t.attr('data-icon')
      var name = t.attr('data-name');
      // 赋值
      $(".rightCon .modBox.config .upbtn img").remove()
      if(icon){
        $(".rightCon .modBox.config").find('.upbtn').addClass('hasup').append('<img src="'+icon+'">');
      }else{
        $(".rightCon .modBox.config").find('.upbtn').removeClass('hasup');
      }
      if(name){
        $(".rightCon .modBox.config").find('.iconName').val(name);
        $(".rightCon .modBox.config").find('.count span').text(name.length);
      }else{
        $(".rightCon .modBox.config").find('.iconName').val('');
        $(".rightCon .modBox.config").find('.count span').text(0);
      }
      if(url){
        $(".rightCon .modBox.config").find('.iconLink').val(url);
      }else{
        $(".rightCon .modBox.config").find('.iconLink').val('');
      }
    }
  })

  // 平台默认点击滑板
  $(".originCon .fastFb li, .originCon .fbList .fbItem").click(function(){
    var code = $(this).attr('data-code');
    $('.originBox .modbox dd[data-code="'+code+'"]').click()
  })

  // 鼠标经过画板  上半部分
  // $(".fastFb li,.fbList .fbItem").hover(function(){
  //   var code = $(this).attr('data-code');
  //   $(".modbox dd[data-code='"+code+"']").addClass('on_hover');
  // },function(){
  //   var code = $(this).attr('data-code');
  //   $(".modbox dd[data-code='"+code+"']").removeClass('on_hover');
  // })
  var typeIn = false;
  $("body").on("compositionstart","input.iconName",function(){
    typeIn = true;
  })
  $("body").on("compositionend","input.iconName",function(){
    var t = $(this);
    var len = t.val().length;
    if(len <= 5){
      // 不需要考虑
      t.siblings('.count').find('span').text(t.val().length)
    }else{
      t.val(t.val().substring(0,5))
      t.siblings('.count').find('span').text(5)
    }

    var modtype = t.closest('.modBox');
    if(modtype.hasClass('config')){
      $(".customCon .fastFb .chosed").find('p').text(t.val()?t.val():'分类名称')
      $(".customCon .fastFb .chosed").attr('data-newName',t.val())
      if(t.val()){
        $(".customCon .fastFb .chosed").find('p').removeClass('noInp')
      }else{
        $(".customCon .fastFb .chosed").find('p').addClass('noInp')
      }
    }else{
      t.closest('.item').addClass('changed')
      var ind = t.closest('.item').index();
      $('.customCon .fbItem.chosed li').eq(ind).attr('data-newName',t.val())
      $('.customCon .fbItem.chosed li').eq(ind).find('p').text(t.val()?t.val():'分类名称')
      if(t.val()){
        t.closest('.item.selfD').addClass('changed')
        $('.customCon .fbItem.chosed li').eq(ind).find('p').removeClass('noInp')
      }else{
        t.closest('.item.selfD').removeClass('changed')
        $('.customCon .fbItem.chosed li').eq(ind).find('p').addClass('noInp')
      }
    }

    changeCon('name',ind,t.val())
    typeIn = false;
  })
  $("body").on("input  propertychange","input.iconName",function(){
    optAction = true;
		var t = $(this);
    var len = t.val().length;
    t.siblings('.count').find('span').text(t.val().length > 5 ? 5 : t.val().length)
    if(!typeIn){
      if(len <= 5){
        // 不需要考虑
        t.siblings('.count').find('span').text(t.val().length)
      }else{
        t.val(t.val().substring(0,5))
        t.siblings('.count').find('span').text(5)
      }
    }

    var modtype = t.closest('.modBox');
    if(modtype.hasClass('config')){
      $(".customCon .fastFb .chosed").find('p').text(t.val()?t.val():'分类名称')
      $(".customCon .fastFb .chosed").attr('data-newName',t.val())
      if(t.val()){
        $(".customCon .fastFb .chosed").find('p').removeClass('noInp')
      }else{
        $(".customCon .fastFb .chosed").find('p').addClass('noInp')
      }
    }else{
      t.closest('.item').addClass('changed')
      var ind = t.closest('.item').index();
      $('.customCon .fbItem.chosed li').eq(ind).attr('data-newName',t.val())
      $('.customCon .fbItem.chosed li').eq(ind).find('p').text(t.val()?t.val():'分类名称')
      if(t.val()){
        t.closest('.item.selfD').addClass('changed')
        $('.customCon .fbItem.chosed li').eq(ind).find('p').removeClass('noInp')
      }else{
        t.closest('.item.selfD').removeClass('changed')
        $('.customCon .fbItem.chosed li').eq(ind).find('p').addClass('noInp')
      }
    }

    changeCon('name',ind,t.val())
	});

  $("body").on("input  propertychange","input.iconLink",function(){
    optAction = true;
		var t = $(this);
    var modtype = t.closest('.modBox');
    if(modtype.hasClass('config')){
      // $(".fastFb .chosed").find('p').text(t.val())
      $(".customCon .fastFb .chosed").attr('data-newUrl',t.val())
    }else{
      t.closest('.item').addClass('changed')
      var ind = t.closest('.item').index();
      $('.customCon .fbItem.chosed li').eq(ind).attr('data-newUrl',t.val());
      if(t.val()){
        t.closest('.item.selfD').addClass('changed')
      }else{
        t.closest('.item.selfD').removeClass('changed')
      }
    }
    changeCon('url',ind,t.val())
	});



  // 上传图片
  $("#Filedata").change(function(event) {
    optAction = true;
    var t = $(this),upbtn = t.closest('.upbtn')
    if(t.val()){
      var data = [];
      data['mod'] = 'siteConfig';
      data['type'] = 'atlas';
      data['filetype'] = 'image';
      var btn = t.closest('.upbtn');
      btn.addClass('loading')
      $.ajaxFileUpload({
        url: '/include/upload.inc.php',
        fileElementId: "Filedata",
        dataType: "json",
        data: data,
        success: function(m, l) {
          btn.removeClass('loading')
          if (m.state == "SUCCESS") {
            upbtn.addClass('hasup')
            upbtn.find('img').remove();
            upbtn.append('<img src="'+m.turl+'" />');
            $(".customCon .fastFb li.chosed").attr('data-newIcon',m.turl);
            $(".customCon .fastFb li.chosed .icon img").attr('src',m.turl)

          }
        },
        error: function() {
          btn.removeClass('loading')
          // uploadError(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
        }
      });
      $("#Filedata").val('')
    }
  });

  $('.rightCon.show .reset_btn').hover(function(){
    var item = $('.customCon .chosed');
    var oItem =  $('.customBox .on_chose');
    var t = $(this);
    if(oItem.hasClass('config')){
      var oname = oItem.attr('data-name');
      var ourl = oItem.attr('data-url')
      var oicon = oItem.attr('data-icon');
      oicon = oicon.split('?')[0]
      var nameChange = item.attr('data-newName') || item.attr('data-newName') =='' || item.attr('data-name') != oname
      var urlChange = item.attr('data-newUrl') || item.attr('data-newUrl')=='' || item.attr('data-url') != ourl
      var iconChange = item.attr('data-newIcon') || item.attr('data-newIcon')=='' ||item.attr('data-icon').split('?')[0] != oicon;
      if(!nameChange && !urlChange && !iconChange){
        t.addClass('noChose')
      }
    }else if(oItem.hasClass('child')){
      var oname = oItem.attr('data-name');
      var ocolor = oItem.attr('data-color')
      var ocolumn = oItem.attr('data-column')
      var ocontent = oItem.attr('data-content')
      var nameChange = item.attr('data-newName') || item.attr('data-newName')=='' || item.attr('data-name') != oname
      var colorChange = item.attr('data-newColor') || item.attr('data-color') != ocolor
      var columnChange = item.attr('data-newcolumn') || item.attr('data-column') != ocolumn
      var contentChange = item.attr('data-newCon') || item.attr('data-content') != ocontent
      if(!nameChange && !contentChange && !colorChange && !columnChange){
        t.addClass('noChose')
      }
    }
  },function(){
    $(this).removeClass('noChose');
  })
  // 重置
  var reset_sure = false;
  $('.reset_btn').click(function(e){
    if($(this).hasClass('noChose')) return false;
    optAction = true;
    var t = $(this);
    var x = event.screenX,y = event.screenY;
    if(!reset_sure){
       $('.alertBox').addClass('show');
       $('.alertPop h4').html('确认重置该发布项？')
       $(".alertBtn a.sure").text('重置')
       $(".alertPop").css({
         right:10,
         left:'auto',
         top:116
       });
       $(".alertBtn a").off('click').click(function(){
         var a = $(this);
         if(a.hasClass('sure')){
           reset_sure = true;
           t.click();
         }else{
           reset_sure = false;
         }
         $('.alertBox').removeClass('show');
       })
    }else{
      reset_sure = false;
      var mod = t.closest('.modBox')
      // 点击确认
      if(mod.hasClass('config')){
        var curr = $(".fastFb li.chosed");
        var code = curr.attr('data-code');
        var arr = infoArr.config;
        for(var i=0; i<arr.length; i++){
          if(arr[i].code == code){
            curr.find('.icon img').attr('src',arr[i].icon);
            curr.attr('data-name',arr[i].name);
            curr.attr('data-url',arr[i].url)
            curr.attr('data-icon',arr[i].icon)
            curr.find('p').text(arr[i].name)
            curr.find('p').removeClass('noInp');
            curr.removeAttr('data-newName')
            curr.removeAttr('data-newIcon')
            curr.removeAttr('data-newUrl')
            $(".modBox.config").find('.upbtn img').attr('src',arr[i].icon)
            $(".modBox.config").find('.iconName').val(arr[i].name)
            $(".modBox.config").find('.iconLink').val(arr[i].url)
            break;
          }
        }
      }else{
        var code =$(".customBox .modbox .on_chose").attr('data-code');
        var item ;
        for(var i = 0; i <infoArr.children.length; i++){
          if(infoArr.children[i].code == code){
            item = infoArr.children[i];
            break;
          }
        }
        var content = item.content
        var col = item.column;
        var name = item.name;
        var color = item.color;
        $(".customBox .modbox .on_chose").attr('data-content',JSON.stringify(content));
        $(".customBox .modbox .on_chose").attr('data-column',col);
        $(".customBox .modbox .on_chose").attr('data-name',name);
        $(".customBox .modbox .on_chose").attr('data-color',color);
        var html = [];
        var par = $(".customBox .modbox .on_chose").closest('.modbox');

        if(par.attr('data-type') == 'hideMod'){
          $(".customBox .modbox .on_chose").click()
        }else{
          $('.fbItem.chosed').remove()
          for(var i = 0; i<content.length; i++){
            var cItem = content[i];
            if(cItem.state == 1){
              html.push('<li style="width:'+(100/col)+'%" data-url="'+cItem.icon+'" data-icon="'+cItem.icon+'" data-name="'+cItem.name+'"><div class="icon"><img src="'+cItem.icon+'" alt=""></div><p>'+cItem.name+'</p></li>')
            }
          }
          var colCls = col == 4?'marRight':''
          var $item = '<div class="fbItem chosed '+colCls+'" data-code="'+code+'" data-color="'+color+'" data-column="'+col+'" data-name="'+name+'" data-content='+JSON.stringify(content)+'><dl><dt style="background:'+color+';"><s></s><span>'+(name?name:"分组名称")+'</span></dt> <dd> <ul>'+html.join('')+'</ul></dd></dl><div class="line"></div> <a href="javascript:;" class="del_btn"><s></s>删除</a></div>'
          $('.customCon .fbList .add_btn').before($item);
          renderHtml(content)

        }
      }
    }
  })
  $('.alertBox').click(function(e){
    if(e.target == $('.alertBox')[0]){
      // $(".alertBox .alertPop").addClass('focus');
      // setTimeout(function(){
      //   $(".alertBox .alertPop").removeClass('focus');
      // },800)
      $('.alertBtn .cancel').click()
    }
  })

  // 新增
  $('.customCon .fastFb ').delegate('.add_btn','click',function(){
    optAction = true;
    var t = $(this);
    var add = true;

    for(var i = 0; i < $('.customCon .fastFb li.hasShow').length; i++){
      var li = $('.customCon .fastFb li').eq(i);
      var oUrl = li.attr('data-url'),
         oName = li.attr('data-name'),
         oIcon = li.attr('data-icon');
     var nUrl = li.attr('data-newUrl'),
         nName = li.attr('data-newName'),
         nIcon = li.attr('data-newIcon');
     var url = nUrl ? nUrl : oUrl, name = nName ? nName : oName, icon = nIcon ? nIcon : oIcon;
     // if(!url && !name && !icon){
     //   add = false;
     //   li.addClass('focusIn');
     //   setTimeout(function(){
     //     li.removeClass('focusIn');
     //   },500)
     //   break;
     // }
    }

    if(!add) return false;
    $('.customCon .fastFb li').removeClass('chosed')
    var item = '<li class="hasShow selfAdd chosed"><div class="icon"><img src="/static/images/admin/img_place.png" alt=""></div><p class="noInp">分类名称</p><s class="line"></s> <a href="javascript:;" class="del_btn"><s></s>删除</a> </li>'
    t.before(item)
    $('.hasShow.selfAdd.chosed').click()
  });

  // 删除
  var sure_delfb = false;
  $(".customCon").delegate(' .fastFb .del_btn', 'click', function(e) {
    optAction = true;
    var t = $(this);
    t.addClass('onShow');
    var li = t.closest('.hasShow');
    var icon = li.attr('data-newIcon')?li.attr('data-newIcon'):li.attr('data-icon');
    var name = li.attr('data-newName')?li.attr('data-newName'):li.attr('data-name');
    var url = li.attr('data-newUrl')?li.attr('data-newUrl'):li.attr('data-url');


    if(!sure_delfb && (icon || name || url)){
      if($(".midContainer").hasClass('transLeft')){
        li.click();
      }
      var x = t.offset().left, y = t.offset().top;
      $('.alertBox').addClass('show smallShow');
      $('.alertPop h4').html('确认删除该发布项？')
      $(".alertBtn a.sure").text('删除')
      $(".alertPop").css({
        left:x-140,
        top:y+28
      });
      $(".alertBtn a").off('click').click(function(){
        var a = $(this);
        t.removeClass('onShow');
        if(a.hasClass('sure')){
          sure_delfb = true;
          t.click()
        }else{
          sure_delfb = false;
        }
        $('.alertBox').removeClass('show smallShow');
      })
    }else{
      // if(li.hasClass('chosed')){
        // $('.rightCon').removeClass('show')
        // $(".midContainer").removeClass('transLeft')
      // }
      sure_delfb = false;
      li.remove();
      if(!li.hasClass('selfAdd')){
        var code = li.attr('data-code')
        if(code){
          icon = $(".customBox dd.on_chose").attr('data-icon');
          name = $(".customBox dd.on_chose").attr('data-name');
          url = $(".customBox dd.on_chose").attr('data-url');
        }
        $(".customBox .modbox[data-type='hideMod']").append('<dd class="config" data-code="'+code+'" data-icon="'+icon+'" data-url="'+url+'" data-name="'+name+'">'+name+'</dd>').removeClass('fn-hide');
        $(".customBox .modbox[data-type='showMod'] dd[data-code='"+code+"']").remove()
      }

      if(li.next('.hasShow').length){
        li.next('.hasShow').click()
      }else{
        $(".pageCon.customCon .fastFb li").eq(0).click()
      }

    }

    e.stopPropagation(); //阻止冒泡
  });

  // 添加快捷发布
  $(".customBox .modbox[data-type='hideMod']").delegate('dd','click',function(){
    optAction = true;
    var t = $(this);
    $(".tip_sure").show()
    $('.rightCon.show .title a').addClass('fn-hide')
    $('.rightCon.show').addClass('noChange')
    $(".customCon .fbItem,.customCon .fastFb li").removeClass('chosed')
    $('.rightCon.show .closetip').removeClass('fn-hide').siblings('p').addClass('fn-hide')
    if(t.hasClass('config')){

      var code = t.attr('data-code');
      var name = t.attr('data-name'),nname = t.attr('data-newName');
       var url = t.attr('data-url'),nurl = t.attr('data-newUrl');
       var icon = t.attr('data-icon'),nicon = t.attr('data-newIcon');
      $('.customBox .modbox dd').removeClass('on_chose')
      t.addClass('on_chose');
      if($('.customCon .fastFb li[data-code="'+code+'"]').length){
         $('.customCon .fastFb li[data-code="'+code+'"]').click()
      }else{
        $('.modBox.config').removeClass('fn-hide');
        $('.modBox.config .tip_sure .switch').removeClass('open');
        $('.modBox.config .tip_sure span').text('已关闭');
        $('.modBox.config .tip_sure p.tip').addClass('fn-hide');

        $(".rightCon .modBox.config .upbtn img").remove()
       if(icon || nicon){

         $(".rightCon .modBox.config").find('.upbtn').addClass('hasup').append('<img src="'+(nicon?nicon:icon)+'">');
       }else{
         $(".rightCon .modBox.config").find('.upbtn').removeClass('hasup');
       }
       if(name|| nname){

         $(".rightCon .modBox.config").find('.iconName').val(nname?nname:name);
         $(".rightCon .modBox.config").find('.count span').text((nname?nname:name).length);
       }else{
         $(".rightCon .modBox.config").find('.iconName').val('');
         $(".rightCon .modBox.config").find('.count span').text(0);
       }
       if(url || nurl){
         $(".rightCon .modBox.config").find('.iconLink').val(nurl?nurl:url);
       }else{
         $(".rightCon .modBox.config").find('.iconLink').val('');
       }
      }
      $(".rightCon").find('.modBox').addClass('fn-hide')
      $(".rightCon").find('.modBox.config').removeClass('fn-hide');
    }else{
      $('.modBox.config .tip_sure .switch').removeClass('open');
      var name = t.attr('data-name'),nname = t.attr('data-newName');
      var code = t.attr('data-code');
      var column = t.attr('data-column'),ncolumn = t.attr('data-newColumn');
      var color = t.attr('data-color'),ncolor = t.attr('data-newColor');
      var content = t.attr('data-content'),ncontent = t.attr('data-newCon');
      $(".rightCon").find('.modBox.children .modName').val(nname?nname:name)

      var col = ncolumn ? ncolumn : column;
      if(col == 4){
        $(".column_chose").addClass('colOther')
      }else{
        $(".column_chose").removeClass('colOther')
      }
      if(code){
        $(".customBox .modbox dd").removeClass('on_chose')
        $(".customBox .modbox dd[data-code='"+code+"']").addClass('on_chose');
      }

    $(".rightCon").addClass('show');
    $(".rightCon").find('.modBox').addClass('fn-hide')
    $(".rightCon").find('.modBox.children').removeClass('fn-hide');
    $('.modBox.children .tip_sure .switch').removeClass('open');
    $('.modBox.children .tip_sure span').text('已关闭');
    $('.modBox.children .tip_sure p.tip').addClass('fn-hide');
    if(content || ncontent){
      var con = ncontent ? ncontent : content;
      con = JSON.parse(con);
      renderHtml(con)
    }else{
      renderHtml()
    }
    var color = ncolor ? ncolor : color;
    $('.pcr-button').css({
      background:(color?color:'#316BFF')
    })
    }

  })


  // 组件选中
  $('.customCon').delegate(' .fbList .fbItem','click',function(){
    optAction = true;
    var t = $(this);
    var code = t.attr('data-code');
    var name = t.attr('data-name')
    var name_new = t.attr('data-newName');
    var ntxt = (name_new || name_new=='')  ? name_new : name;
    $('.midContainer').addClass('transLeft');
    $(".rightCon").addClass('show').removeClass('noChange')
    $('.optBox').scrollTop(0)
    $(".rightCon").find('.modBox.children .modName').val(ntxt)
    if(t.hasClass('selfAdd') || !code){
      $(".reset_btn").addClass('fn-hide').siblings('.delbtn').removeClass('fn-hide');
      $('.tip_sure').hide()
    } else{
      $(".reset_btn").removeClass('fn-hide').siblings('.delbtn').addClass('fn-hide');
      $('.tip_sure').show()
    }
    var column = t.attr('data-column');
    var column_new = t.attr('data-newColumn');
    var col = column_new ? column_new:column; //排列方式
    if(col == 4){
      $(".column_chose").addClass('colOther')
    }else{
      $(".column_chose").removeClass('colOther')
    }
    $(".customCon .fastFb li").removeClass('chosed')
    t.addClass('chosed').siblings('').removeClass('chosed');
    if(code){
      $(".customBox .modbox dd").removeClass('on_chose')
      $(".customBox .modbox dd[data-code='"+code+"']").addClass('on_chose');
    }
    var content = t.attr('data-content');
    var con_new = t.attr('data-newCon');  //新增
    $(".rightCon").addClass('show');
    $(".rightCon").find('.modBox').addClass('fn-hide')
    $(".rightCon").find('.modBox.children').removeClass('fn-hide');
    var con = con_new ? con_new : content;
    if(con){
      con = JSON.parse(con);
      renderHtml(con)
    }else{

      renderHtml()
    }
    var color = t.attr('data-color')
    var color_new = t.attr('data-newColor')
    var color_ = color_new ? color_new:color;
    $('.pcr-button').css({
      background:(color_?color_:'#316BFF')
    })


  });


  // 右侧页面渲染
  function renderHtml(list){
    // console.log(list)
    var html = [],html2 = [];
    if(list && list.length){
      for(var i = 0; i < list.length; i++){
        if(list[i].state == 1){
          var cls = list[i].icon && list[i].icon!='' ?'hasup' : ''
          var selfD = list[i].selfDefine && list[i].selfDefine==1?'selfD':''
          html.push('<li data-code="'+(list[i].code?list[i].code:"")+'" class="item '+selfD+'" data-idx="'+i+'">');
          html.push('<span class="del_item"></span><s class="left_icon"><img src="/static/images/admin/order_icon.png" alt=""></s>');
          html.push('<div class="item_con">');
          html.push('<div class="img_up fn-clear">');
          html.push('<div class="upbtn '+cls+'">');
          html.push('<input type="file" name="Filedata" id="Filedata_'+i+'" accept="png,jpg,jpeg" class="fileUp">');
          if(cls!=''){
            html.push('<img src="'+list[i].icon+'" alt="">');
          }
          html.push('<span>更换图片</span></div>');
          html.push('<div class="imgText">');
          html.push('<h4>分类图标</h4>');
          html.push('<p>建议图标尺寸100*100px</p> </div> </div>');
          html.push('<div class="inpbox">');
          html.push('<input type="text" placeholder="请输入分类名称" value="'+list[i].name+'" class="iconName">');
          html.push('<div class="count"><span>'+list[i].name.length+'</span>/5</div></div>');
          html.push('<div class="inpbox linkbox">');
          html.push('<s><img src="/static/images/admin/link.png" alt=""></s>');
          html.push('<input type="text" placeholder="请输入链接" value="'+list[i].url+'" class="iconLink">');
          html.push('</div> </div> </li>');
        }else{  //未添加

          // if(!list[i].selfDefine){
          //   var oldCon = $(".customBox dd.on_chose").attr('data-content');
          //   if(oldCon){
          //     oldCon = JSON.parse(oldCon);
          //     oldCon.forEach(function(val){
          //       if(val.name == list[i].name || val.url == list[i].url || val.icon == list[i].icon){
          //         html2.push('<li data-icon="'+val.icon+'" data-name="'+val.name+'" data-url="'+val.url+'"><div class="icon"><img src="'+val.icon+'"></div> <p>'+val.name+'</p> </li>')
          //       }
          //     })
          //   }
          //
          // }
          //

          if(list[i].code && !list[i].state){
            var oldCon
            if($(".customBox").hasClass('fn-hide')){
              oldCon = $(".originBox  dd.on_chose").attr('data-content');
            }else{
              oldCon = $(".customBox dd.on_chose").attr('data-content');
            }
              oldCon = JSON.parse(oldCon);
              oldCon.forEach(function(val){
                if(list[i].code == val.code){
                  html2.push('<li data-code="'+val.code+'" data-icon="'+val.icon+'" data-name="'+val.name+'" data-url="'+val.url+'"><div class="icon"><img src="'+val.icon+'"></div> <p>'+val.name+'</p> </li>')
                }
              })
          }
        }
      }
    }
    // else{
      // html.push('<li class="item"><span class="del_item"></span><s class="left_icon"><img src="/static/images/admin/order_icon.png" alt=""></s> <div class="item_con"> <div class="img_up fn-clear"> <div class="upbtn"> <input type="file" name="Filedata" id="Filedata_0" accept="png,jpg,jpeg" class="fileUp"><span>更换图片</span> </div> <div class="imgText"> <h4>分类图标</h4> <p>建议图标尺寸100*100px</p> </div> </div> <div class="inpbox"> <input type="text" placeholder="请输入分类名称" class="iconName"> <div class="count"><span>0</span>/5</div> </div> <div class="inpbox linkbox"> <s><img src="/static/images/admin/link.png" alt=""></s> <input type="text" placeholder="请输入分类链接" class="iconLink"> </div> </div> </li>')
    // }
    $('.modBox.children .list').html(html.join(''));
    if(html2.length > 0){
      $('.modBox.children .other_item ul').html(html2.join(''))
      $('.modBox.children .other_item').removeClass('fn-hide')
    }else{
      $('.modBox.children .other_item').addClass('fn-hide')
    }
  }

  // 排列方式
  $(".column_chose span").click(function(){
    optAction = true;
    var t = $(this);
    var col = t.attr('data-col');
    if(col == 4){
      $('.column_chose').addClass('colOther')
    }else{
      $('.column_chose').removeClass('colOther')
    }
    $(".customCon .fbList .fbItem.chosed").attr('data-newColumn',col)
    $(".customCon .fbList .fbItem.chosed li").css({
      'width': (100/col)+'%'
    })
  })

  $('body').delegate('.pcr-button','click',function(e){
    var color = '#fff'
    if($('.fbItem.chosed').length > 0){
      var item_color1 = $('.fbItem.chosed').attr('data-color')
      var item_color2 = $('.fbItem.chosed').attr('data-newColor');
      color = item_color2?item_color2:item_color1
    }else{
      color = $(".customBox dd.on_chose").attr('data-color');
    }
    $('.pcr-result').val(color?color:'#316BFF')
    $(".pcr-app.visible").addClass('show');
    pickr.setColor(color?color:'#316BFF');
    pickr.show()
  })
  $(document).on('click',function(el){
    if($(el.target).closest('.pickr').length == 0){

      $(".pcr-app.visible").removeClass('show');
    }
    if($(el.target).closest('.previewBox').length == 0 && $(el.target).closest('.preview').length == 0){
      $('.previewBox').removeClass('show');
    }
    if($('.showTip').length && el.target != $(".preview")[0] && el.target != $(".save")[0]){
      $(".fastFb li,.fbListbox .fbItem").removeClass('showTip')
    }
  });



  // 关闭快捷
  $('.optBox .switch').click(function(){
    optAction = true;
    var t = $(this);
    mod = t.closest('.modBox');
    if(t.hasClass('open')){
      t.removeClass('open');
      var tip_sure = t.closest('.tip_sure');
      tip_sure.find('span').text('已关闭')
      // tip_sure.find('p.tip').addClass('fn-hide').siblings('p.closetip').removeClass('fn-hide');
      $(".rightCon.show .title a").addClass('fn-hide');
      $(".rightCon.show").addClass('noChange')
      $(".rightCon.show .tip_sure p.closetip").removeClass('fn-hide').siblings('p').addClass('fn-hide')
      if(mod.hasClass('config')){
        var nurl = $('.fastFb .chosed').attr('data-newUrl');
        var nname = $('.fastFb .chosed').attr('data-newName');
        var nicon = $('.fastFb .chosed').attr('data-newIcon');
        var url = $('.fastFb .chosed').attr('data-url');
        var name = $('.fastFb .chosed').attr('data-name');
        var icon = $('.fastFb .chosed').attr('data-icon');
        $(".customBox .on_chose").attr('data-newName',(nname?nname:name))
        $(".customBox .on_chose").attr('data-newIcon',nicon?nicon:icon)
        $(".customBox .on_chose").attr('data-newUrl',nurl?nurl:url)

        $('.fastFb .chosed').remove();
      }else{

        var ncon = $('.fbList .chosed').attr('data-newCon');
        var nname = $('.fbList .chosed').attr('data-newName');
        var ncolor = $('.fbList .chosed').attr('data-newColor');
        var ncolumn = $('.fbList .chosed').attr('data-newColumn');
        var con = $('.fbList .chosed').attr('data-content');
        var name = $('.fbList .chosed').attr('data-name');
        var color = $('.fbList .chosed').attr('data-color');
        var column = $('.fbList .chosed').attr('data-column');
        $(".customBox .on_chose").attr('data-newName',nname?nname:name)
        $(".customBox .on_chose").attr('data-newCon',ncon?ncon:con)
        $(".customBox .on_chose").attr('data-newColor',ncolor?ncolor:color)
        $(".customBox .on_chose").attr('data-newColumn',ncolumn?ncolumn:column)
        $('.fbList .chosed').remove();

      }
      $('.modbox[data-type="hideMod"]').append($(".customBox .on_chose"))
      $(".customBox .modbox[data-type='hideMod']").removeClass('fn-hide')
    }else{
      $(".rightCon.show .tip_sure p").addClass('fn-hide');
      $(".rightCon.show").removeClass('noChange')
      t.closest(".tip_sure").addClass('hoverOn');
      t.addClass('open');
      var tip_sure = t.closest('.tip_sure');
      tip_sure.find('span').text('开启')
      tip_sure.find('p.tip').removeClass('fn-hide')
      $(".rightCon.show .title a.reset_btn").removeClass('fn-hide').siblings('a').addClass('fn-hide')
      var curr = $(".customBox dd.on_chose");
      if(curr.hasClass('config')){
        var url = curr.attr('data-url'),nurl = curr.attr('data-newUrl'),
        code = curr.attr('data-code'),
        icon = curr.attr('data-icon'),nicon = curr.attr('data-newIcon'),
        name = curr.attr('data-name'),nname = curr.attr('data-newName');
        url = nurl?nurl:url;
        icon = nicon?nicon:icon;
        name = nname?nname:name;
        $('.customCon .fastFb li').removeClass('chosed')
        $('.customCon .fastFb .add_btn').before('<li data-code="'+code+'" data-name="'+name+'" data-icon="'+icon+'" data-url="'+url+'" class="hasShow chosed"> <div class="icon"><img src="'+icon+'" alt=""></div> <p>'+name+'</p> <s class="line"></s> <a href="javascript:;" class="del_btn"><s></s>删除</a> </li>');
        $(".customBox .modbox[data-type='showMod']").append(curr)
      }else{
        var content = curr.attr('data-content'),con = curr.attr('data-newCon');
        var color = curr.attr('data-color'),ncolor = curr.attr('data-newColor');
        var col = curr.attr('data-column'),ncol = curr.attr('data-newColumn');
        var name = curr.attr('data-name'),nname = curr.attr('data-newName');
        var code = curr.attr('data-code');
        content = con ? con : content;
        color = ncolor ? ncolor : color;
        col = ncol ? ncol : col;
        name = nname ? nname : name;
        if(content){
          content = JSON.parse(content);
          var html = [];
          for(var i = 0; i<content.length; i++){
            var cItem = content[i];
            if(cItem.state == 1){
              html.push('<li style="width:'+(100/col)+'%" data-url="'+cItem.icon+'" data-icon="'+cItem.icon+'" data-name="'+cItem.name+'"><div class="icon"><img src="'+(cItem.icon?cItem.icon:"/static/images/admin/img_place1.png")+'" alt=""></div><p class="'+(cItem.name?"":"noInp")+'">'+(cItem.name?cItem.name:"分类名称")+'</p></li>')
            }
          }
          var colCls = col == 4?'marRight':''
          var $item = '<div class="fbItem chosed '+colCls+'" data-code="'+code+'" data-color="'+color+'" data-newcolumn="'+col+'" data-name="'+name+'" data-content='+JSON.stringify(content)+'><dl><dt style="background:'+color+';"><s></s><span>'+(name?name:"分组名称")+'</span></dt> <dd> <ul>'+html.join('')+'</ul></dd></dl><div class="line"></div> <a href="javascript:;" class="del_btn"><s></s>删除</a></div>'
          $('.customCon .fbList .add_btn').before($item);
          $('.customCon .fbItem.chosed').click()
          $(".customBox .modbox[data-type='showMod']").append(curr)
        }
      }
      if($(".customBox .modbox[data-type='hideMod'] dd").length == 0){
        $(".customBox .modbox[data-type='hideMod']").addClass('fn-hide')
      }
    }
  })







  $("body").on("input  propertychange","input.modName",function(){
    optAction = true;
    $('.fbItem.chosed dt span').text($(this).val()?$(this).val():'分组名称')
    $('.fbItem.chosed').attr('data-newName',$(this).val())
  });


  // 监听上传文件
  $('body').on('change','.upbtn input[type="file"]',function(){
    optAction = true;
    var t = $(this),upbtn = t.closest('.upbtn');
    var id = t.attr('id');
    var ind = t.closest('.item').index()
    var data = [];
    data['mod'] = 'siteConfig';
    data['type'] = 'atlas';
    data['filetype'] = 'image';
    var btn = t.closest('.upbtn');
    btn.addClass('loading')
    $.ajaxFileUpload({
			url: '/include/upload.inc.php',
			fileElementId: id,
      secureuri:true,
			dataType: "json",
			data: data,
			success: function(m, l) {
        btn.removeClass('loading')
				if (m.state == "SUCCESS") {
          upbtn.addClass('hasup')
          upbtn.find('img').remove();
          upbtn.append('<img src="'+m.turl+'" />');
          $('.customCon .fbItem.chosed li').eq(ind).attr('data-newIcon',m.turl)
          $('.customCon .fbItem.chosed li').eq(ind).find('img').attr('src',m.turl)
          btn.closest('.item').addClass('changed');
          changeCon('icon',ind,m.turl)
				}
			},
			error: function() {
        btn.removeClass('loading')
        console.log('网络错误')
			}
		});
  })


  // $('.midContainer').click(function(e){
  //   if($(e.target).closest('.truePage').size() == 0){
  //     $('.rightCon').removeClass('show')
  //     // $('.midContainer').removeClass('transLeft')
  //   }
  // });

  // 新增组件
  $(".fbList ").delegate('.add_btn','click',function(e){
    optAction = true;
    var t = $(this);
    var add = true;


    for(var i = 0; i < $(".customCon .fbList .fbItem").length; i++){
      var item = $(".customCon .fbList .fbItem").eq(i);
      var name = item.attr('data-newName')? item.attr('data-newName') : item.attr('data-name');
      for(var m = 0; m < item.find('li').length; m++){
        var li = item.find('li').eq(m);
        var li_name = li.attr('data-newName')? li.attr('data-newName') : li.attr('data-name');
        var li_icon = li.attr('data-newIcon')? li.attr('data-newIcon') : li.attr('data-icon');
        var li_url = li.attr('data-newUrl')? li.attr('data-newUrl') : li.attr('data-url');
        if(li_name && li_icon && li_url){

        }else{
          item.addClass('focusIn');
          setTimeout(function(){
            item.removeClass('focusIn');
          },500)
          add = false;
          item.addClass('showTip');
          item.attr('data-tip','请至少完善一个分类')
          break;
        }

        // if(!li_name && !li_icon && !li_url){
        //   item.addClass('focusIn');
        //   setTimeout(function(){
        //     item.removeClass('focusIn');
        //   },500)
        //   add = false;
        //   break;
        // }
      }

    }
    setTimeout(function(){
      $(".customCon .fbList .fbItem").removeClass('focusIn')
    },500)
    if(add){
      t.before('<div class="fbItem chosed selfAdd" data-newColumn="5"><dl><dt><s></s><span>分组名称</span></dt> <dd > <ul></ul></dd></dl><div class="line"></div> <a href="javascript:;" class="del_btn"><s></s>删除</a></div>');
      $('.selfAdd.chosed').click();
      setTimeout(function(){
        $(".modBox.children .add_more").click()
      },300)
    }else{
      // alert('请完善按钮信息')

      e.stopPropagation(); //阻止冒泡
    }

    // <li style="width:20%" class="curr"><div class="icon"><img src="/static/images/admin/img_place1.png" alt=""></div><p>分类名称</p></li>
  });


  // 新增按钮
  $('.btngroup .add_more').click(function(){
    optAction = true;
    var t = $(this);
    var go = false;
    $('.children .fbBox .list .item').each(function(){
      var li = $(this);
      var icon = li.find('img').length ? li.find('img').attr('src') : '';
      var name = li.find('.iconName').val();
      var url = li.find('.iconLink').val();

      // if(icon=='' || name == '' || url == ''){
      //   alert('请完善按钮信息');
      //   go = true;
      //   return false;
      // }
    })
    if(go) return false;
    var len = $('.children .fbBox .list .item').length;

    var col = $('.column_chose').hasClass('colOther')? 4 : 5;
    if($(".fbItem.chosed").length > 0){
      $('.fbItem.chosed ul').append('<li class="selfAdd" style="width:'+(100/col)+'%"><div class="icon"><img src="/static/images/admin/img_place1.png" alt=""></div><p class="noInp">分类名称</p></li>')
      var content = $('.customCon .fbItem.chosed').attr('data-content');
      var new_con = $('.customCon .fbItem.chosed').attr('data-newCon');
      var newCon = new_con ? new_con : content;
      if(newCon){
        newCon = JSON.parse(newCon)
        newCon.push({
          name:'',
          icon:'',
          url:'',
          state:1,
          selfDefine:1,
        });
        var arr1 = []; arr2=[]
        newCon.forEach((item, i) => {
          if(item.state == 1){
            arr1.push(item)
          }else{
            arr2.push(item)
          }
        });
        newCon = arr1.concat(arr2)
        $('.customCon .fbItem.chosed').attr('data-newCon',JSON.stringify(newCon))
      }else{
        newCon = [];
        newCon.push({
          name:'',
          icon:'',
          url:'',
          state:1,
          selfDefine:1,
        });
        $('.customCon .fbItem.chosed').attr('data-newCon',JSON.stringify(newCon))
      }
      renderHtml(newCon)
    }else{
      var content = $('.customBox .modbox .on_chose').attr('data-content');
      var new_con = $('.customBox .modbox .on_chose').attr('data-newCon');
      var newCon = new_con ? new_con : content;
      if(newCon){
        newCon = JSON.parse(newCon)
        newCon.push({
          name:'',
          icon:'',
          url:'',
          state:1,
          selfDefine:1,
        });
        var arr1 = []; arr2=[]
        newCon.forEach((item, i) => {
          if(item.state == 1){
            arr1.push(item)
          }else{
            arr2.push(item)
          }
        });
        newCon = arr1.concat(arr2)
        $('.customBox .modbox .on_chose').attr('data-newCon',JSON.stringify(newCon))
      }else{
        newCon = [];
        newCon.push({
          name:'',
          icon:'',
          url:'',
          state:1,
          selfDefine:1,
        });
        $('.customBox .modbox .on_chose').attr('data-newCon',JSON.stringify(newCon))
      }
      renderHtml(newCon)
    }


  });


  // 删除
  var sure_delItem = false;
  $('.fbBox').delegate('.del_item','click',function(){
    optAction = true;
    var t = $(this),item = t.closest('.item'),ind = item.index();
    t.addClass('onShow');
    var parbox = t.closest('.list')
    if(!item.hasClass('changed') && !item.hasClass('selfD')){
      sure_delItem = true;
    }
    if(item.hasClass('selfD')){
      if(item.find('.iconName').val() =='' && item.find('.iconLink').val() =='' && item.find('.upbtn img').length == 0){
        sure_delItem = true;
      }
    }
    if(!sure_delItem){
      var x = event.screenX,y = event.screenY;
       $('.alertBox').addClass('show');
       $('.alertPop h4').html('确认删除该发布项？')
       $(".alertBtn a.sure").text('删除')
       $(".alertPop").css({
         right:10,
         left:'auto',
         top:y-50
       });
       $(".alertBtn a").off('click').click(function(){
         var a = $(this);
         t.removeClass('onShow');
         if(a.hasClass('sure')){
           sure_delItem = true;
           t.click();
         }else{
           sure_delItem = false;
         }
         $('.alertBox').removeClass('show');
       })
    }else{
      sure_delItem = false;
      item.remove();
      var code = item.attr('data-code');
      if($('.customCon .fbItem.chosed').length){
        var curr = $('.customCon .fbItem.chosed li').eq(ind);
        if(!curr.hasClass('selfAdd')){
          var oUrl = curr.attr('data-url'),
          oName = curr.attr('data-name'),
          oIcon = curr.attr('data-icon');
          var nUrl = curr.attr('data-newUrl'),
          nName = curr.attr('data-newName'),
          nIcon = curr.attr('data-newIcon');
          var url = nUrl ? nUrl : oUrl, name = nName ? nName : oName, icon = nIcon ? nIcon : oIcon;
          curr.remove()
          var content = $('.customCon .fbItem.chosed').attr('data-content');
          var new_con = $('.customCon .fbItem.chosed').attr('data-newCon');
          var newCon = new_con ? new_con : content;

          if(newCon){
            var arrShow = [],arrHide = [];
            newCon = JSON.parse(newCon);
            for(var i = 0; i < newCon.length; i++){
              if(newCon[i].state == 0){
                arrHide.push(newCon[i])
              }else{
                arrShow.push(newCon[i])
              }
            }
            newCon = arrShow.concat(arrHide);
            newCon[ind]['state'] = 0;
            renderHtml(newCon)
            $('.customCon .fbItem.chosed').attr('data-newCon',JSON.stringify(newCon))
          }
        }else{
          var content = $('.customCon .fbItem.chosed').attr('data-content');
          var new_con = $('.customCon .fbItem.chosed').attr('data-newCon');
          var newCon = new_con ? new_con : content;
          if(newCon){
            newCon = JSON.parse(newCon)
            newCon.splice(ind,1)
            $('.customCon .fbItem.chosed').attr('data-newCon',JSON.stringify(newCon))
          }
          curr.remove();
        }

      }
      // else{
      //   var content = $('.customBox dd.on_chose').attr('data-content');
      //   var new_con = $('.customCon dd.on_chose').attr('data-newCon');
      //   var newCon = new_con ? new_con : content;
      //   var arr1 =
      //   if(newCon){
      //     newCon = JSON.parse(newCon);
      //     if(code){
      //       for(var i = 0; i < newCon.length; i++){
      //         if(code == newCon[i].code){
      //           newCon[i].state = 0;
      //         }
      //       }
      //     }
      //   }
      // }

      if(parbox.find('.item').length == 0){
        $('.btngroup .add_more').click()
      }
    }
  });


  // 新增 已有的
  $(".children  .other_item").delegate('li', 'click', function(event) {
    optAction = true;
    var t = $(this);
    var oUrl = t.attr('data-url'),
        oName = t.attr('data-name'),
        code = t.attr('data-code'),
        oIcon = t.attr('data-icon');
        var col = $('.column_chose').hasClass('colOther')? 4 : 5;
        var $li = '<li style="width:'+(100/col)+'%"  data-url="'+oUrl+'" data-name="'+oName+'" data-icon="'+oIcon+'"><div class="icon"><img src="'+oIcon+'" alt=""></div><p>'+oName+'</p></li>'
        $('.fbItem.chosed ul').append($li);
        var content = $('.customCon .fbItem.chosed').attr('data-content');
        var new_con = $('.customCon .fbItem.chosed').attr('data-newCon');
        var newCon = new_con ? new_con : content;
        var oldCon = $(".customBox dd.on_chose").attr('data-content');
        var currAddArr; //增加的数据
        if(oldCon){
          oldCon = JSON.parse(oldCon);
          for(var i = 0; i < oldCon.length; i++){
            if(oldCon[i].code == code){
              currAddArr = oldCon[i];
              break;
            }
          }
        }
        if(newCon){
          newCon = JSON.parse(newCon);
          if(newCon.length > 0){
            var arr1 = [],arr2 = []
            for(var i = 0; i < newCon.length; i++){
              if(newCon[i].code == currAddArr.code){
                newCon[i] = currAddArr;
                newCon[i].state = 1;
              }
              if(newCon[i].state == 1){
                arr1.push(newCon[i])
              }else{
                arr2.push(newCon[i])
              }

            }
            newCon = arr1.concat(arr2)
          }
          $('.customCon .fbItem.chosed').attr('data-newCon',JSON.stringify(newCon));
          renderHtml(newCon)
        }
  });


  // 删除此选项
  var sure_del = false;
  $('.modBox.children .title .delbtn').click(function(event){
    optAction = true;
    var x = event.pageX + 50,y = event.pageY + 10;
    var item = $('.customCon .fbItem.chosed');
    var toDel = false
    for(var i = 0; i < item.find('li').length; i++){
      var li = item.find('li').eq(i)
      if(li.attr('data-name') || li.attr('data-newName') || li.attr('data-newIcon') || li.attr('data-icon') || li.attr('data-url') || li.attr('data-newUrl')){
        toDel = true;
        break;
      }
    }

    if(!sure_del && item.length != 0 && toDel){
      $('.alertBox').addClass('show');
      $('.alertPop h4').html('确认删除该发布项？');
      $(".alertBtn a.sure").text('删除')
      $(".alertPop").css({
        left:x-240,
        top:y
      });
      $(".alertBtn a").off('click').click(function(){
        var a = $(this);
        if(a.hasClass('sure')){
          sure_del = true;
          $(".customCon .fbItem.chosed .del_btn").click();
        }else{
          sure_del = false;
        }
        $('.alertBox').removeClass('show');
      })
    }else{
      $(".customCon .fbItem.chosed .del_btn").click();

    }

  });

  // 删除自定义快捷

  $('.modBox.config .title .delbtn').click(function(event){
    var x = event.pageX + 50,y = event.pageY + 10;
    // x = x > ($(window).width()-240) ? ($(window).width()-240) : x
    var item = $(".customCon .chosed")
    var oUrl = item.attr('data-url'),
         oName = item.attr('data-name'),
         oIcon = item.attr('data-icon');
     var nUrl = item.attr('data-newUrl'),
         nName = item.attr('data-newName'),
         nIcon = item.attr('data-newIcon');
     var url = nUrl ? nUrl : oUrl, name = nName ? nName : oName, icon = nIcon ? nIcon : oIcon;
    if(!sure_delfb && (url || name || icon)){
      $('.alertBox').addClass('show');
      $('.alertPop h4').html('确认删除该发布项？')
      $(".alertBtn a.sure").text('删除')
      $(".alertPop").css({
        left:x-240,
        top:y
      });
      $(".alertBtn a").off('click').click(function(){
        var a = $(this);
        if(a.hasClass('sure')){
          sure_delfb = true;
          $(".customCon .hasShow.chosed .del_btn").click();
        }else{
          sure_delfb = false;
        }
        $('.alertBox').removeClass('show');
      })
    }else{
      $(".customCon .hasShow.chosed .del_btn").click();
    }
  })

  // 排序
  $('.customCon .fastFb ul').sortable({
		    items: 'li:not(.add_btn)',
		    placeholder: 'placeholder',
        tolerance:'pointer',
        containment:$(".fastFb ul"),
		    opacity: .9,
		    revert: 0,
        cursor:'move',
        start:function(event,ui){
          $('.fbListbox').addClass('noHover');
          if($('.customCon .fastFb li.hasShow').length % 4 == 0){
            $('.customCon .fastFb li.add_btn').addClass('bottom_add')
          }else{
            $('.customCon .fastFb li.add_btn').removeClass('bottom_add').addClass('right_add')
          }
          // ui.item.click();
          ui.item.addClass('chosed').siblings('li').removeClass('chosed');
          $('.customCon .fastFb ul .chosed').click()
        },
        stop:function(){
          $('.fbListbox').removeClass('noHover')
          $('.customCon .fastFb li.add_btn').removeClass('bottom_add').removeClass('right_add')
        },
		    update:function(){
          optAction = true;
		    }
		});

  $('.customCon .fbList').sortable({
	    items: '.fbItem',
      containment:$('.customCon .fbList'),
	    placeholder: 'placeholder',
      tolerance:'pointer',
	    axis: 'y',
	    opacity: .9,
	    revert: 0,
      cursor:'move',
      start:function(event,ui){
        $('.fastFb').addClass('noHover');
        ui.item.click()
      },
      stop:function(){
        $('.fastFb').removeClass('noHover')
      },
	    update:function(i){
        optAction = true;
	        // menuSort();
	    }
	});

  // 右侧分栏排序
  $('.modBox.children .fbBox ul').sortable({
	    items: '.item',
	    placeholder: 'placeholder',
	    // handle:'.left_icon',
      // orientation: 'vertical',
      containment:'.modBox.children .fbBox',
      tolerance:'pointer',
	    axis: 'y',
	    opacity: .9,
	    revert: 0,
      cursor:'move',
      start:function(event,ui){
        ui.item.find('.del_item').addClass('fn-hide')

      },
      stop:function(event,ui){
        ui.item.find('.del_item').removeClass('fn-hide')
      },
	    update:function(e,ui){
        optAction = true;
        checkIndex()
	    }
	});

  // 调整顺序
  function checkIndex(){
    var newCon = [];
    var oldCon = '';
    $('.customCon .fbItem.chosed ul').html('');
    oldCon = $('.customCon .fbItem.chosed').attr('data-content');
    if(oldCon){
      oldCon = JSON.parse(oldCon);
    }
    $('.modBox.children .fbBox .list').find('.item').each(function(){
      var t = $(this);
      var idx = t.attr('data-idx');
      var ind = t.index();
      var selfD = t.hasClass('selfD');
      var url = t.find('.iconLink').val(),
          name = t.find('.iconName').val(),
          icon = t.find('.hasup img').attr('src')?t.find('.hasup img').attr('src'):'';
      var code = t.attr('data-code');
        newCon.push({
          url:url,
          name:name,
          code:code?code:'',
          icon:icon?icon:'',
          state:1,
          selfDefine:selfD?1:0,
        });
      var col = $(".modBox.children .column_chose").hasClass('colOther')?4:5

      if(selfD){

        $('.customCon .fbItem.chosed ul').append('<li style="width:'+(100/col)+'%;" data-newName="'+name+'" data-newIcon="'+icon+'" data-url="'+url+'"> <div class="icon"><img src="'+(icon?icon:"/static/images/admin/img_place1.png")+'" alt=""></div> <p class="'+(name?'':"noInp")+'">'+(name?name:"分类名称")+'</p> </li>');
      }else{
        if(code){
          var currArr = '';
          for(var i = 0; i<oldCon.length; i++){
            if(oldCon[i] && oldCon[i].code == code){
              currArr = oldCon[i];
            }
          }

          $('.customCon .fbItem.chosed ul').append('<li style="width:'+(100/col)+'%;" data-url="'+currArr.url+'" data-icon="'+(currArr.icon?currArr.icon:"")+'" data-name="'+currArr.name+'" data-newName="'+(name?name:'')+'" data-newIcon="'+(icon?icon:'')+'" data-url="'+(url?url:"")+'"> <div class="icon"><img src="'+(icon?icon:"/static/images/admin/img_place1.png")+'" alt=""></div> <p class="'+(name?'':"noInp")+'">'+(name?name:"分类名称")+'</p> </li>');
        }
      }
    })

    $('.modBox.children .other_item').find('li').each(function(){
      var t = $(this);
      var url = t.attr('data-url'),
          name = t.attr('data-name'),
          icon = t.attr('data-icon');
          newCon.push({
            code:t.attr('data-code'),
            url:url,
            name:name,
            icon:icon?icon:'',
            state:0,
          });
    });
    $('.customCon .fbItem.chosed').attr('data-newCon',JSON.stringify(newCon));
  }

  // 改变
  function changeCon(param,ind,newVal){
    optAction = true;
    var content = $('.customCon .fbItem.chosed').attr('data-content');
    var new_con = $('.customCon .fbItem.chosed').attr('data-newCon');
    var newCon = new_con ? new_con : content;
    if(newCon){
      var arrShow = [],arrHide = [];
      newCon = JSON.parse(newCon);
      for(var i = 0; i < newCon.length; i++){
        if(newCon[i].state == 0){
          arrHide.push(newCon[i])
        }else{
          arrShow.push(newCon[i])
        }
      }
      newCon = arrShow.concat(arrHide);
      newCon[ind][param] = newVal;
    }

    $('.customCon .fbItem.chosed').attr('data-newCon',JSON.stringify(newCon));

  }

  // 删除组件

  $(".customCon").delegate('.fbList .del_btn', 'click', function(event) {
    optAction = true;
    var t = $(this);
    t.addClass('onShow');
    var item = t.closest('.fbItem');
    var x = t.offset().left,y =t.offset().top;
    x = x > ($(window).width()-240) ? ($(window).width()-240) : x
    // if(item.find('li').length == 0)
    var toDel = false;
    for(var i = 0; i < item.find('li').length; i++){
      var li = item.find('li').eq(i)
      if(li.attr('data-name') || li.attr('data-newName') || li.attr('data-newIcon') || li.attr('data-icon') || li.attr('data-url') || li.attr('data-newUrl')){
        toDel = true;
      }
    }
    if(!sure_del && item.find('li').length != 0 && toDel){
      if($(".midContainer").hasClass('transLeft')){
        item.click();
      }
      $('.alertBox').addClass('show smallShow');
      $('.alertPop h4').html('确认删除该发布项？')
      $(".alertBtn a.sure").text('删除')
      $(".alertPop").css({
        left:x-176,
        top:y+28
      });
      $(".alertBtn a").off('click').click(function(){
        var a = $(this);
        t.removeClass('onShow');
        if(a.hasClass('sure')){
          sure_del = true;
          t.click()
        }else{
          sure_del = false;
        }
        $('.alertBox').removeClass('show smallShow');
      })
    }else{
      sure_del = false;

      var code = item.attr('data-code');
      if(!item.hasClass('selfAdd') || code){
        var dd = $(".customBox .modbox dd[data-code='"+code+"']")
        dd.removeClass('on_chose')
        $(".customBox .modbox[data-type='hideMod']").removeClass('fn-hide').append(dd)
      }
      item.remove();
      if(li.next('.fbItem') && li.next('.fbItem').length){
        li.next('.fbItem').off('click').click()
      }else{
        $(".pageCon.customCon .fbItem").eq(0).off('click').click()
      }
      // $(".rightCon").removeClass('show');
      // $(".midContainer").removeClass('transLeft')
    }


    event.stopPropagation();  //阻止冒泡
  });


  // 点击中间空白区域
  $('.midContainer').click(function(e){
    if(e.target == $('.midContainer')[0] ){
      clickArr()
    }
  });
  $('.pageCon').click(function(e){

    if(e.target == $('.pageCon:not(.fn-hide)')[0] ){
      clickArr()
    }
  });

  function clickArr(){
    if($(".bujutype .on_chose").attr('data-val') == 1){
      $(".rightCon").removeClass('chose_show').removeClass('show');
      $(".rightCon .chose_tip").removeClass('red')
      $(".midContainer").removeClass('transLeft')
      $('.originBox dd').removeClass('on_chose')
      $(".fastFb li,.fbListbox .fbItem").removeClass('chosed')
    }else{
      $(".rightCon").removeClass('show');
      $(".midContainer").removeClass('transLeft')
      // $(".modBox").eq(0).removeClass('fn-hide').siblings('.modBox').addClass('fn-hide')
      $(".customBox dd").removeClass('on_chose');
      $(".customCon .fbList .fbItem,.customCon .fastFb li").removeClass('chosed')
    }
  }

  // 重置
  var sure = false;
  $('.initBtn').click(function(e){
    optAction = true;
    var x = e.screenX,y = e.screenY;
    x = x > 1140 ? 1140 : x
    var t = $(this);
    // if(!sure){
    //   $('.alertBox').addClass('show bigShow');
    //   $('.alertPop h4').html('确认重置发布页所有设置？')
    //   $(".alertBtn a.sure").text('重置')
    //   $(".alertPop").css({
    //     right:6,
    //     left:'auto',
    //     top:116
    //   });
    //   $(".alertBtn a").off('click').click(function(){
    //     var a = $(this);
    //     if(a.hasClass('sure')){
    //       sure = true;
    //       t.click()
    //     }else{
    //       sure = false;
    //     }
    //     $('.alertBox').removeClass('show bigShow');
    //   })
    // }else{
    //   console.log('已确认')
    //   sure = false;
    //   $(".pageCon.customCon").html($(".pageCon:not(.customCon)").html())
    //   $(".customBox ").html($(".originBox").html())
    //   $(".headTitle").val('');
    //   $(".fastFb>h2").text('快捷发布');
    //   $('.titleShow').val(1)
    //   $(".switchbox .btn").addClass('open')
    // }
    $('.popMask,.popbox').addClass('show');
    $(".popbox .cancel,.popbox .close_pop").click(function(){
      $('.popMask,.popbox').removeClass('show');
    })
    $(".popbox .sure").click(function(){
      $('.popMask,.popbox').removeClass('show');
      $(".pageCon.customCon .fastFb ul").html($(".pageCon:not(.customCon) .fastFb ul").html())
      $(".pageCon.customCon .fbList").html($(".pageCon:not(.customCon) .fbList").html())
      $(".fastFb .page_title h2").text('快捷发布');
      $(".headTitle").val('快捷发布');
      $('.titleShow').val(1);
      $(".switchbox .btn").addClass('open');

      $(".customBox .modbox[data-type='showMod']").html($(".originBox .modbox[data-type='showMod']").html())
      $(".customBox .modbox[data-type='hideMod']").html($(".originBox .modbox[data-type='hideMod']").html());
      if($(".originBox .modbox[data-type='hideMod'] dd").length == 0){
        $(".customBox .modbox[data-type='hideMod']").addClass('fn-hide')
      }else{
        $(".customBox .modbox[data-type='hideMod']").removeClass('fn-hide')
      }
    })
  });


  // 保存
  $(".save,.preview").off('click').click(function(e){
    var t = $(this);
    var str = t.hasClass('preview')?'&type=1':''
    if(t.hasClass('disabled')) return false;
    t.addClass('disabled')
    if(str != ''){
      $(".previewBox").addClass('show');
      $(".previewBox p").addClass('blue').html('<s></s>同步中');
      setTimeout(function(){
        $(".previewBox p").removeClass('blue').html('已同步至最新');
      },400)
    }
    var action = infoArr.customChildren == '' && infoArr.customConfig == '' ?'save':'edit';
    var noData = 'customChildren=""&customConfig=""';
    var currData = getData(str);
    if(!currData){
      t.removeClass('disabled');
      if(str == ''){
        setTimeout(function(){
          t.text('保存')
        },1000)
      }
      return false;
    }
    var data = $(".bujutype .on_chose").attr('data-val') == '2' ? currData.join('&'):noData;
    data = data.replace(/\+/g, "%2B");
    if($("#titleShow").val() == 1 && $('.headTitle').val() == ''){
      $('.fastFb .page_title').addClass('focusIn');
      t.removeClass('disabled');
      if(str == ''){
        t.text('保存')
      }
      $('.fastFb  .page_title').click()
      $(".initBox").addClass('focusIn');
      setTimeout(function(){
        $(".initBox").removeClass('focusIn');
      },500)
      setTimeout(function(){
        $('.fastFb .page_title').removeClass('focusIn')
      },500)
      return false;
    }
    var title = {
      state:$("#titleShow").val()?$("#titleShow").val():0,
      title:$('.headTitle').val()
    }

    if($(".bujutype .on_chose").attr('data-val') == '1'){
      title = {
        state:1,
        title:''
      }
    }
    if(str == ''){
      t.text('保存中...')
      $('.previewBox').removeClass('show');
    }
    $.ajax({
      url: 'siteFabuPages.php?dopost='+action+str,
      data: data+'&title='+JSON.stringify(title),
      type: "POST",
      dataType: "json",
      success: function (data) {
        if(data.state == 100){
          optAction = false;
          t.removeClass('disabled')
          if(str == ''){
            t.html('保存')
            $('.success_tip').addClass('show');
            setTimeout(function(){
              $('.success_tip').removeClass('show');
            },3000)
          }
        }
      },
      error: function(){}
    });
  });

  // 获取数据
  function getData(type){
    var customConfigArr = [],customChildrenArr = [];
    var goUp = true;
    var hasChosed = false;
    // 已添加的
    $(".pageCon:not(.fn-hide) .fastFb li:not(.add_btn)").each(function(){
      var t = $(this);
      var ourl = t.attr('data-url'),nurl = t.attr('data-newUrl'),
          oname = t.attr('data-name'),nname = t.attr('data-newName'),
          oicon = t.attr('data-icon'),nicon = t.attr('data-newIcon'),
          code = t.attr('data-code');
          var url = (nurl || nurl == '')?nurl:ourl;
          var name = (nname || nname == '')?nname:oname;
          var icon = (nicon || nicon == '')?nicon:oicon;
        if(url && name && icon ){
          customConfigArr.push({
            url:encodeURIComponent(nurl?nurl:ourl),
            name:encodeURIComponent(nname?nname:oname),
            code:code?code:'',
            icon:nicon?nicon:oicon,
            state:1,
          })
        }else if(!ourl && !nurl && !oname && !nname && !oicon && !nicon){
          t.addClass('focusIn');
          setTimeout(function(){
            t.removeClass('focusIn');
          },500)
        }else{

            t.addClass('focusIn');
            if(!hasChosed){
              t.attr('data-tip','请完善')
              t.click();
              t.addClass('showTip');
              hasChosed = true;
              if(type != ''){
                $(".previewBox").addClass('show');
              }
            }
            setTimeout(function(){
              t.removeClass('focusIn')
            },500)
          if(type == ''){
            $('.error_tip').addClass('show');
            setTimeout(function(){
              $('.error_tip').removeClass('show');
            },3000)
          }

          goUp = false;
        }
    });
    $(".pageCon:not(.fn-hide) .fbList .fbItem").each(function(ind){
      var t = $(this);
      var oname = t.attr('data-name'),nname = t.attr('data-newName'),
          ocolumn = t.attr('data-column'),ncolumn = t.attr('data-newColumn'),
          ocolor = t.attr('data-color'),ncolor = t.attr('data-newColor'),
          ocontent = t.attr('data-content'),ncontent = t.attr('data-newCon'),
          code = t.attr('data-code'),
          selfDefine = t.hasClass('selfAdd')?1:0;
          var con = ncontent?ncontent:ocontent

          if(con){
            var conArr = JSON.parse(con);
            var pushIn = false;
            var arrCon = []
            for(var i = 0; i<conArr.length; i++){
              var val = conArr[i];
              var item_name = val.name;
              var item_url = val.url;
              var item_icon = val.icon;
              conArr[i].name = encodeURIComponent(val.name)
              conArr[i].url = encodeURIComponent(val.url)
              if(item_name && item_url && item_icon){
                pushIn = true;
                arrCon.push(conArr[i])

              }else if(!item_name && !item_url && !item_icon){
                t.addClass('focusIn');
                setTimeout(function(){
                  t.removeClass('focusIn');
                },500)
              }else{

                  t.addClass('focusIn');

                  if(!hasChosed){
                    t.attr('data-tip','请补全未完善信息')
                    t.click();
                    t.addClass('showTip');
                    hasChosed = true;
                    if(type != ''){
                      $(".previewBox").addClass('show');
                    }
                  }
                  setTimeout(function(){
                    t.removeClass('focusIn')
                  },500)
                if(type == ''){
                  $('.error_tip').addClass('show');
                  setTimeout(function(){
                    $('.error_tip').removeClass('show');
                  },3000)
                }
                goUp = false;
                break;
              }
            }
            if(arrCon.length){
              customChildrenArr.push({
                name:encodeURIComponent(nname?nname:oname),
                code:code?code:'',
                column:ncolumn?ncolumn:ocolumn,
                color:ncolor?ncolor:ocolor,
                content:arrCon,
                selfDefine:selfDefine,
                state:1,
              })
            }

          }else{
            t.addClass('focusIn');
            setTimeout(function(){
              t.removeClass('focusIn')
            },500)
            if(type == ''){

              $('.error_tip').addClass('show');
              setTimeout(function(){
                $('.error_tip').removeClass('show');
              },3000)
            }
            goUp = false;
          }
    });
    if($('.showTip').length >= 1){
      $(".pageCon.customCon").scrollTop($('.showTip').offset().top)
    }
    // if(!goUp) return false;
    // $('.fbList .fbItem,.fastFb li').removeClass('focusIn')
    // 未添加的
    $('.customBox .modbox[data-type="hideMod"] dd').each(function(){
      var t = $(this);
      var code = t.attr('data-code');
      var name = t.attr('data-name');
      var url = t.attr('data-url');
      var icon = t.attr('data-icon');
      if(t.hasClass('config')){
        customConfigArr.push({
          url:encodeURIComponent(url),
          name:encodeURIComponent(name),
          code:code?code:'',
          icon:icon,
          state:0,
        })
      }else if(t.hasClass('child')){
        var name = t.attr('data-name');
        var code = t.attr('data-code');
        var column = t.attr('data-column');
        var color = t.attr('data-color');
        var content = t.attr('data-content');
        customChildrenArr.push({
          name:encodeURIComponent(name),
          code:code,
          column:column,
          color:color ? color : '#316BFF',
          content:JSON.parse(content),
          selfDefine:0,
          state:0,
        })
      }
    })


    var arr = [];

    arr.push('customChildren='+(customChildrenArr.length > 0 ?JSON.stringify(customChildrenArr):''));
    arr.push('customConfig='+(customConfigArr.length > 0 ?JSON.stringify(customConfigArr) : ''));

    if(!goUp && type=='') {
      arr = false
    };
    return arr;


  }

  // 自定义上移显示黑框提示
  $(".modBox .delbtn").hover(function(){
    var mod = $(this).closest('.modBox')
    if($('.customCon .chosed').hasClass('selfAdd')){
      var toDel = false
      var name = $('.customCon .chosed').attr('data-newName');
      var url = $('.customCon .chosed').attr('data-newUrl');
      var icon = $('.customCon .chosed').attr('data-newIcon');
      if(mod.hasClass('children')){
        var item = $('.customCon .fbItem.chosed');
        for(var i = 0; i < item.find('li').length; i++){
          var li = item.find('li').eq(i)
          if(li.attr('data-name') || li.attr('data-newName') || li.attr('data-newIcon') || li.attr('data-icon') || li.attr('data-url') || li.attr('data-newUrl')){
            toDel = true;
            break;
          }
        }
      }

      if(name || url || icon){
        toDel = true;
      }

      if(toDel){
        $(".modBox .delbtn .del_tip").stop().fadeIn()
      }
    }
  },function(){
    $(".modBox .delbtn .del_tip").stop().fadeOut()
  })

  $('.optBox .bg').click(function(){
    var rightCon = $(this).closest('.rightCon');
    if(rightCon.hasClass('chose_show')){
      $('.chose_tip').addClass('focusIn');
      setTimeout(function(){
        $('.chose_tip').removeClass('focusIn');
        $('.chose_tip').addClass('red');
      },550)
    }else if(rightCon.hasClass('noChange')){
      $('.tip_sure .errtip').addClass('focusIn').removeClass('fn-hide').siblings('p').addClass('fn-hide');
      setTimeout(function(){
        $('.chose_tip').removeClass('focusIn').addClass('red');
      },550)
    }
  })

  // 监听标题变化
  $("body").on("input  propertychange","input.headTitle",function(){
    var title = $(this).val();
    if(title){
      $(".fastFb .page_title h2").text(title)
    }else{
      $(".fastFb .page_title h2").text('输入标题')
    }
  });



  $('.switchbox .btn').click(function(){
    var t = $(this);
    t.toggleClass('open');
    $("#titleShow").val(t.hasClass('open')?1:0)
    if(t.hasClass('open')){
      $(".initBox .inpbox").show()
      $(".fastFb .page_title").removeClass('opacity')
      $('.switchbox span').text('有标题')
      if(!$(".headTitle").val()){
        $(".fastFb  .page_title h2").text('快捷发布');
        $(".headTitle").val('快捷发布')
      }


    }else{
      $('.switchbox span').text('无标题')
      $(".initBox .inpbox").hide()
      $(".fastFb .page_title").addClass('opacity')
    }

  })

  // 点击标题
  $('.customCon .fastFb .page_title').click(function(e){
    $('.rightCon').addClass('show');
    $('.rightCon .modBox').addClass('fn-hide');
    $('.rightCon .modBox').eq(0).removeClass('fn-hide');
    $(".midContainer").addClass('transLeft');
    $(".fastFb li,.fbList .fbItem").removeClass('chosed')
    $(this).addClass('chose_tit');
    if($(this).hasClass('opacity')){
      $('.switchbox .btn').click();
    }
    $('body').one('click',function(){
      $('.customCon .fastFb .page_title').removeClass('chose_tit');
    });

    $('.previewBox').removeClass('show')
    e.stopPropagation();
  });

  // 删除标题
  $('.customCon .fastFb .page_title .del_title').click(function(e){
    $('.switchbox .btn').click();
    $('.previewBox').removeClass('show')
    e.stopPropagation()
  })


  $('.tip_sure dd').hover(function(){
    var t = $(this);
    var par = t.closest('.tip_sure');
    if(!par.hasClass('hoverOn') && par.find('.open').length > 0){
      par.find('.tip').removeClass('fn-hide')
    }else{
      par.find('.tip').addClass('fn-hide')
    }

  },function(){
    var t = $(this);
    var par = t.closest('.tip_sure');
    par.find('.tip').addClass('fn-hide');
    par.removeClass('hoverOn');
  })


  function showErrAlert(data) {
    showAlertErrTimer && clearTimeout(showAlertErrTimer);
    $(".popErrAlert").remove();
    $("body").append('<div class="popErrAlert"><p>' + data + '</p></div>');

    $(".popErrAlert").css({
      "visibility": "visible"
    });
    showAlertErrTimer = setTimeout(function() {
      $(".popErrAlert").fadeOut(300, function() {
        $(this).remove();
      });
    }, 1500);
   }
})
