
$(function () {
  // input 键盘焦点问题修复

    window.addEventListener('resize', () => {
        const activeElement = document.activeElement
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
            setTimeout(() => {
              activeElement.scrollIntoView()
            }, 100)
          }
    })

    //年
    $('#works').blur(function(){
        if($(this).val().length > 0 ){       
           $(this).siblings('label').css("color","#45464f");
        }
      });

    // 点击上传照片(一张)
    var upqjShow = new Upload({
      btn: '#up_qj',
      title: 'Images',
      mod: 'renovation',
      params: 'type=atlas',
      atlasMax: 1,
      deltype: 'delAtlas',
      replace: false,
      fileQueued: function(file, activeBtn){
        var btn = activeBtn ? activeBtn : $("#up_qj");
        var p = btn.parent(), index = p.index();
        $("#qjshow_box li").each(function(i){
          if(i >= index){
            var li = $(this), t = li.children('.img_show'), img = li.children('.img');
            if(img.length == 0){
              t.after('<div class="img" id="'+file.id+'"></div><i class="del_btn">+</i>');
              return false;
            }

          }
        })
      },
      uploadSuccess: function(file, response, btn){
        if(response.state == "SUCCESS"){
          $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'"  data-val="'+response.url+'"/>');

        }
      },
      uploadProgress:function(file,percentage){
        var $li = $('#'+file.id),
			$percent = $li.find('.progress span');
			// 避免重复创建
			if (!$percent.length) {
				
				$percent = $('<p class="progress"><span></span></p>')
					.appendTo($li)
					.find('span');
					
			}
			$percent.css('width', percentage * 100 + '%');
      },
      uploadFinished: function(){
        if(this.sucCount == this.totalCount){
          // showMsg('所有图片上传成功');
        }else{
          showMsg((this.totalCount - this.sucCount) + '张图片上传失败');
        }
        
        updateQj();
      },
      uploadError: function(){

      },
      showErr: function(info){
        showMsg(info);
      }
    });
    $('#qjshow_box').delegate('.del_btn', 'click', function(){
      var t = $(this),li = t.closest('li');
      	upqjShow.del(li.find(".img img").attr("data-val"));
        t.remove();
      	li.find(".img").remove(); 
    })
    function updateQj(){
      var qj_file = [];     
      $("#qjshow_box li").each(function(i){
        var img = $(this).find('img');
        if(img.length){
          var src = img.attr('data-url');
          qj_file.push(src);
        }
      })
      $('#photo').val(qj_file.join(','));
      
    }

    //独立设计师
    $('.alone').click(function(){
      $('.com_choose').hide();
       $('.info li.comp_cho').addClass('active')
    })

    //所属公司
     $('.com_have').click(function(){
      $('.com_choose').show();
      $('.info li.comp_cho').removeClass('active')
    })



    var thisInputId;
    //打开选择公司页面
    $(".container").delegate(".teacher", "click", function () {
        thisInputId = $(this).find('input').attr('id');
        $('.te_choose').animate({ 'right': '0' }, 300);
        $('body').css('overflow', 'hidden')
        getList();

    });
    //申请加入
    $(".reno_company").delegate(".apply", "click", function () {    
        var par  =$(this).closest('.com_li')   
        var com_type=par.find('.com_type').text();
        var storeId=par.attr('data-id');
        //输出被选中的公司名
        $('#tec_num').val(com_type);
        $('#store').val(storeId);
        $('.teacher .choose .text').hide();
        $('.te_choose').animate({ 'right': '-100%' }, 150);
        $('body').css('overflow', 'auto');

    });
    
    //关闭申请加入页面
    $('.top_return a').click(function(){
      $('.te_choose').animate({'right':'-100%'},150);
      $('body').css('overflow','auto')
    });

    //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').closest('li').hide();
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.layer_list ul').append(phoneList.join(''));
                }else{
                   $('.layer_list ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.layer_list ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer_code').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        $(".areacode_span label").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    //搜索商家
    $('.renoform_go').click(function(){
      getList(1);
      return false;
    })
    

    var page = 1;
    var isload = false;
    //公司列表
    function getList(tr) {
      if(tr){
          isload = false;
          page=1;
          $('.com_ul').html('')
      }
      if(isload) return false;
      isload = true;
      var keywords = $('#keywords').val();
      $(".loading").remove();
      $('.com_ul').append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
      var url ="/include/ajax.php?service=renovation&action=store&page="+page+"&title="+keywords+"&pageSize=10";
      $.ajax({
          url: url,
          type: "GET",
          dataType: "json",
          success: function (data) {  
            isload = false;           
            if(data && data.state == 100){
              var list = data.info.list;
              var totalpage = data.info.pageInfo.totalPage;
              var html=[];
              if(list.length > 0){
                $(".com_ul .loading").remove();
                for(var i=0;i<list.length;i++){
                  html.push('<li class="com_li" data-id="'+list[i].id+'">');
                  var pic = list[i].logo != "" && list[i].logo != undefined ? list[i].logo : "/static/images/404.jpg";
                  html.push('<div class="com_bottom">');                                               
                  html.push('<div class="left_b">');                        
                  html.push('<img src="'+pic+'" alt="">');
                  html.push('</div>');
                  html.push('<div class="right_b">');
                  html.push('<div class="com1">');
                  html.push('<h4 class="com_type">'+list[i].company+'</h4>');
                  if(list[i].safeguard > 0){
                       html.push('<span class="defend"></span>'); 
                  }
                  if (list[i].certi == 1) {
                      html.push('<span class="certify"></span>'); 
                  }                
                  html.push('</div>'); 
                  html.push('<ul class="right_ul">');                 
                  html.push('<li>'+langData['renovation'][0][24]+'：<span>'+list[i].diaryCount+'</span></li>'); //  案例              
                  html.push('<li>'+langData['renovation'][0][25]+'：<span>321</span></li>'); //   工地             
                  html.push('<li>'+langData['renovation'][0][4]+'：<span>'+list[i].teamCount+'</span></li>');   //     设计师         
                  html.push('</ul>');                                     
                  html.push('</div>');                                                     
                  html.push('<p class="apply">'+langData['renovation'][7][27]+'</p>');                 
                  html.push('</div> ');                 
                  html.push('</li>');
                 
                }
                $(".reno_company .com_ul").append(html.join(""));  
                isload = false;
                if(page >= totalpage){
                  isload = true;                            
                  $(".reno_company .com_ul").append('<div class="loading">'+langData['renovation'][2][25]+'</div>');//已显示全部
                  
                }

              }else{
                $(".com_ul .loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
              }
            }else {
              $(".reno_company .com_ul .loading").html(data.info);
            }
          },
          error: function(){
            isload = false;
            $(".reno_company .com_ul .loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
          }
      })
    }

    //选择教师页面滚动加载
    $('.te_choose').scroll(function() {
        
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w;
        if ($(window).scrollTop() >= scroll&& !isload) {
          page++;
          getList()
            
        };

    });

    

    // 信息提示框
    // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }

    //表单验证
    $('#btn-keep').click(function () {
      var r = true,f=$(this),txt=$(this).text();
      if(f.hasClass('disabled')) return false;
      var type = document.getElementsByName('type');//公司属性
       var art_name = $('#art_name');//姓名
       var phone = $('#phone');//联系方式
       var works = $('#works');//工作经验

       var tec_num=$('#tec_num').val();//选择所属公司

        if($('.qjimg_box .img').length == 0){
             showMsg(langData['renovation'][7][15]);  //请上传照片
             r= false;
            
        }else if(!art_name.val()){
             showMsg(langData['renovation'][8][3]);  //请输入姓名
             r= false;
            
        }else if(!phone.val()){
            phone.focus()
             showMsg(langData['renovation'][1][29]);  //请输入联系方式
             r= false;
            
        }else if(!works.val()){
            works.focus()
             showMsg(langData['renovation'][7][29]);  //请输入工作年数
             r= false;
            
        }else if(type[0].checked && !tec_num){          
          showMsg(langData['renovation'][8][10]);  //请选择所属公司 
          r= false; 
                             
        }

        if(!r) return;
        var photo = $('.qjimg_box #WU_FILE_0').find('img').attr('data-url');
        $('#photo').val(photo)
        f.addClass("disabled").text(langData['renovation'][15][24]);//提交中...
        var data,form = $("#fabuForm"), action = form.attr("action");
        data = form.serialize();
        // console.log(data);
        // return false;
        $.ajax({
            url: action,
            data: data,
            type: "POST",
            dataType: "json",
            success: function (data) {
                f.removeClass("disabled").text(txt);
                if(data && data.state == 100){
                    $('.order_mask').show();
                    
                }else{
                    alert(data.info);
                }
            },
            error: function(){
                alert(langData['renovation'][15][25]);//提交失败，请重试！
                f.removeClass("disabled").text(txt);//
            }
        });

    });
    // 立即预约关闭
     $('.order_mask .work_close').click(function(){
        $('.order_mask').hide();
   
     })

});