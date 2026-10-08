var atpage = 1, pageSize =10, totalCount = 0, container = $('.line-off-mem');

$(function(){
	// 判断浏览器是否是ie8
  	if($.browser.msie && parseInt($.browser.version) >= 8){
    	$('.line-off-mem .member-list:nth-child(5n)').css('margin-right','0');
    }

    //单选按钮组
    $(".w-form").delegate(".radio span", "click", function(){
        var t = $(this), dl = t.closest("dl"), id = t.attr("data-id"), hline = dl.find(".tip-inline");
        if(!t.hasClass("curr")){
            t.siblings("input[type=hidden]").val(id);
            hline.removeClass().addClass("tip-inline success").html("<s></s>");
            t.addClass("curr").siblings("span").removeClass("curr");
        }
    });
    // 添加新会员
    $('#add-maker').click(function(){
        $('.desk').show();
        $('.add-member-popup').show();
    })
    $('.add-member-popup .close').click(function(){
        $('.desk').hide();
        $('.add-member-popup').hide();
    })
    //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
                url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
                type: 'get',
                dataType: 'JSONP',
                success: function(data){
                    if(data && data.state == 100){
                       var phoneList = [], list = data.info;
                       var listLen = list.length;
                       var codeArea = list[0].code;
                       if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                            $('.areaCode').hide();
                            $('.w-form .inp#tel-number').css({'padding-left':'10px','width':'255px'});
                            return false;
                       }
                       for(var i=0; i<list.length; i++){
                            phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
                            
                       }
                       $('.areaCode_wrap ul').append(phoneList.join(''));
                    }else{
                       $('.areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
                    }
                },
                error: function(){
                    $('.areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
                }

            })
      }
      //显示区号
      $('.areaCode').bind('click', function(){
        var areaWrap =$(this).closest("dd").find('.areaCode_wrap');
        if(areaWrap.is(':visible')){
          areaWrap.fadeOut(300)
        }else{
          areaWrap.fadeIn(300);
          return false;
        }
      });

      //选择区号
      $('.areaCode_wrap').delegate('li', 'click', function(){
        var t = $(this), code = t.attr('data-code');
        var par = t.closest("dd");
        var areaIcode = par.find(".areaCode");
        areaIcode.find('i').html('+' + code);
        $("#areaCode").val(code);
      });

      $('body').bind('click', function(){
        $('.areaCode_wrap').fadeOut(300);
      });
    // 新会员提交
    var lgform = $('#add-member');
    var err = lgform.find('.error p');
    lgform.submit(function(e){
        e.preventDefault();
        err.text('').hide();
        var telnum = $('#tel-number'),
        tel = telnum.val(),
        nameinp = $('#name'),
        name = nameinp.val(),
        passinp = $('#password'),
        pass = passinp.val(),
        submit = $('#add'),
        r = true;

    if(name == ''){
        err.text(langData['siteConfig'][20][533]).show();    //请输入您的姓名
        nameinp.focus();
        return false;
    }

    if(r && tel == ''){
      err.text(langData['siteConfig'][29][150]).show();  //请输入您的电话号码
      telnum.focus();
      return false;
    }else {
      var reg ,h='';
      reg = !!tel.match(/^1[34578](\d){9}$/);
      if (!reg) {
        err.text(langData['siteConfig'][29][151]).show();  //您的电话号码输入错误
        telnum.focus();
        return false;
      }
    }
    if (r && r && pass == '') {
        err.text(langData['siteConfig'][29][152]).show();   //请输入您的密码
        passinp.focus();
        return false;
    }

    submit.attr('disabled', true);

    $.ajax({
        url: '/include/ajax.php?service=dating&action=addUser',
        type: 'post',
        data: lgform.serialize(),
        dataType: 'json',
        success: function(data){
            console.log(data)
            submit.attr('disabled', false);
            err.text(data.info).show();
            if(data && data.state == 100){
                nameinp.val('');
                telnum.val('');
                getList(1);
            }
        },
        error: function(){
            submit.attr('disabled', false);
            err.text(langData['siteConfig'][6][203]).show();  //网络错误，请重试
        }
    })
    
  })
    
    container.delegate('.delete-img', 'click', function(){
        var t = $(this), item = t.closest('.member-list');
    	$('.desk').show();
    	$('.hello-popup').show().data('item',item);
    })
    $('.hello-btn .sure').click(function(){
        var item = $('.hello-popup').data('item'), id = item.attr('data-id');
        item.remove();
        $('.desk').hide();
        $('.hello-popup').hide();
        $.post('/include/ajax.php?service=dating&action=delUser&id='+id);
    })
    $('#hello-popup-delete, .hello-btn .cancel').click(function(){
    	$('.desk').hide();
    	$('.hello-popup').hide();
    })

    $('.searchform').submit(function(e){
        e.preventDefault();
        getList(1);
    })

    if(add){
        $('#add-maker').click();
    }

    getList();
   
})

    function getList(tr){
        if(tr){
          atpage = 1;
        }
        keywords = $('.door-text').val();
        container.html('<div class="loading">'+langData['siteConfig'][20][409]+'...</div>');   //正在获取，请稍后
        totalCount = 0;
        showPageInfo();
        $.ajax({
          url: '/include/ajax.php?service=dating&action=memberList&company='+user.hnUid+'&page='+atpage+'&pageSize='+pageSize+'&nickname='+keywords,
          type: 'get',
          dataType: 'json',
          success: function(data){
            if(data && data.state == 100){
              var html = [];
              totalCount = data.info.pageInfo.totalCount;
              for(var i = 0; i < data.info.list.length; i++){
                var d = data.info.list[i];
                if(d.photo){
                    var photo = '<img src="'+d.photo+'" alt="">';
                }else{
                    var photo = '<img src="'+staticPath + 'images/default_user.jpg" class="noimg" alt="">';
                }
                html.push('<div class="member-list fn-clear" data-id="'+d.id+'">');
                html.push('   <a href="'+d.url+'" target="_blank">'+photo+'</a>');
                html.push('   <div class="personal-wrap">');
                html.push('       <a href="javascript:;"><p class="name fn-left">'+d.nickname+'</p><p class="sex fn-right">'+(d.sex == "1" ? langData['siteConfig'][13][4] : langData['siteConfig'][13][5])+'&nbsp;&nbsp;'+(d.age ? '<span>'+d.age+'</span>'+langData['siteConfig'][13][29]: '')+'</p></a>');
                //男-女-岁
                html.push('       <p class="tel">'+d.phone+'</p>');
                html.push('   </div>');
                html.push('   <a href="javascript:;"><img src="'+templets_skin+'images/delete-img.png" alt="" class="delete-img"></a>');
                html.push('</div>');
              }
              container.html(html.join(""));
              showPageInfo();
            }else{
              container.html('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');//暂无相关信息
            }
          },
          error: function(){
            container.html('<div class="loading">'+langData['siteConfig'][6][203]+'</div>');//网络错误，请重试
          }
        })
    }