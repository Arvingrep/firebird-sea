
$(function () {

  //方式
    getType()
    function getType(){
        $.ajax({
          type: "POST",
          url: "/include/ajax.php?service=renovation&action=type&type=7",
          dataType: "json",
          success: function(res){
                if(res.state==100 && res.info){
                    var list = res.info;                   
                    var typeSelect = new MobileSelect({
                          trigger: '.btype',
                          title: '',
                          wheels: [
                              {data:list}
                          ],
                          keyMap: {
                            id: 'id',
                            value: 'typename'
                          },
                          position:[0, 0],
                          callback:function(indexArr, data){

                            $('#btype').val(data[0].typename);
                            $('.btype .choose span').hide();
                            $('#typeId').val(data[0].id)
                          }
                          ,triggerDisplayData:false,
                    });
                }
          }
      });
    }

    //价格
    getPrice()
    function getPrice(){
        $.ajax({
          type: "POST",
          url: "/include/ajax.php?service=renovation&action=type&type=6",
          dataType: "json",
          success: function(res){
                if(res.state==100 && res.info){
                    var list = res.info;                   
                    var priceSelect = new MobileSelect({
                          trigger: '.price',
                          title: '',
                          wheels: [
                              {data:list}
                          ],
                          keyMap: {
                            id: 'id',
                            value: 'typename'
                          },
                          position:[0, 0],
                          callback:function(indexArr, data){

                            $('#priceName').val(data[0].typename);
                            $('.price .choose span').hide();
                            $('#price').val(data[0].id)
                          }
                          ,triggerDisplayData:false,
                    });
                }
          }
      });
    }



      //选择阶段 
      var stageSelect = new MobileSelect({
          trigger: '.stage',
          title: '',
          wheels: [
              {data: [
                    {id:'0',value:langData['renovation'][2][7]},//开工
                    {id:'1',value:langData['renovation'][3][15]},//水电
                    {id:'2',value:langData['renovation'][3][16]},//泥木
                    {id:'3',value:langData['renovation'][3][17]},//油漆
                    {id:'4',value:langData['renovation'][2][8]}//竣工
                ]
              }                       
          ],
          position:[0, 0],
          callback:function(indexArr, data){
              $('#stageName').val(data[0].value);
              $('.stage .choose span').hide();
              $('#stageId').val(data[0].id)
          }
          ,triggerDisplayData:false,
      });
    
    


//单位
  $('#area').blur(function(){

      if($(this).val().length > 0 ){       
         $(this).siblings('label').css("color","#45464f");
      }
    });



    //擅长风格
    $('.art_ul').delegate('li', 'click', function () {
      $(this).toggleClass('active').siblings().removeClass('active');

    })

    $('.more_add .go_add').click(function () {
      $('.order_mask2,.order_container2').show();
      $('#stageName').val('');
      $('#stageId').val('');
      $('.stage .choose span').show();
      $('#com_profile').val('');
      $('#fileList').find('.thumbnail').remove();
    })

    $('.order_mask2').click(function () {
      $('.order_mask2,.order_container2').hide()
    })

  //所在小区选择触发
  $('.posi_house').bind('click',function(){
    $(this).addClass('hasClick');
    $('.page-wrap').animate({'right':'0'},200);
    setTimeout(function(){
      comSearch()
    },300)

  });
  

 
  function comSearch(){
    var CommunityObj = $('.intell_data');  //地址列表
    //小区模糊搜索
    var title = $.trim($('#house_name').val());
    var addr = $('.position_box .gz-addr-seladdr').attr('data-id');
    CommunityObj.html('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
    $.ajax({
          url: '/include/ajax.php?service=house&action=communityList&addrid='+addr,
          data: "keywords="+title,
          dataType: "jsonp",
          success: function (data) {
             
              var list = data.info.list, addrList = [];
              if(data && data.state == 100){
                if(list.length > 0){
                  for (var i = 0, addr, contact; i < list.length; i++) {
                      addr = list[i];
                      addrList.push('<li class="intell_data_li" data-id="'+list[i].id+'" data-cityid="'+list[i].cityid+'"><p><span>'+list[i].title+'</span></p></li>');//附近
                  }
                  
                  CommunityObj.html(addrList.join(""));
                  $('#build_name').addClass('canChose');
                }else{
                  $('#build_name').removeClass('canChose');
                  CommunityObj.html('<div class="loading">'+langData['renovation'][15][28]+'</div>');//该区域没有相关小区，请重新选择！
                }
              }else{
                $('#build_name').removeClass('canChose');
                CommunityObj.html('<div class="loading">'+langData['renovation'][15][28]+'</div>');//该区域没有相关小区，请重新选择！
              }                         
          },
          error: function(){
            $('#build_name').removeClass('canChose');
            CommunityObj.html('<div class="loading">'+langData['siteConfig'][20][227]+'</div>');//网络错误，加载失败！
          }
      });
  }
  $('#house_name').bind("input", function(){
    comSearch();
  })
  
  //点击模糊匹配的信息时
  $('.intell_data').delegate('.intell_data_li', 'click', function(){
    var t = $(this), val = t.find('span').text(), id = t.attr('data-id'), cityid = t.attr('data-cityid');
    $('.community .choose span').hide();
    $('#build_name').attr('data-cityid', cityid);
    $('#build_name').val(val);
    $('.page-wrap').animate({'right':'-100%'},200);
  
  });
  
  //选择地址的返回按钮
  $('.page-wrap .go_back').click(function(){
    $('.page-wrap').animate({'right':'-100%'},200);
    if(!$('#build_name').hasClass('canChose')){
      $('.community .choose span').show();
      $('#build_name').attr('data-cityid', '');
      $('#build_name').val('');
    }
  });

   $(".search_btn").bind("click", function(){
    var communityTitle = $.trim($('#house_name').val());
    if(communityTitle != ''){
      comSearch();
    }
  });
  
    
    var sid = 0;
    $('.order_container2 .sure').click(function(){
      var tj = true;
      var tid = $(this).attr('data-id');
      var stage = $('#stageName').val();
      var stageId = $('#stageId').val();
      var com_profile = $('#com_profile').val();//阶段描述
      var imglen=$('#fileList .thumbnail').length;
      console.log(imglen)
        if(!stage){
             showMsg(langData['renovation'][14][63]);  //请选择阶段
             tj = false;
        }else if(!com_profile){
            showMsg(langData['renovation'][14][64]);  //请输入阶段描述
            tj = false;
        }else if(imglen == 0){
            showMsg(langData['renovation'][14][66]);  //请上传图片
            tj = false;
        }else{
          $('.section').each(function(){
            var stId = $(this).find('.titile').attr('data-id');
            if(stId == stageId){
              showMsg(langData['renovation'][15][17]);  //该阶段已存在
              tj = false;
            }
          })


        }
        if(!tj) return;


        sid++;
        var list = [],imgVal=[];
        var mList = $('#fileList .thumbnail')
        for(var m=0; m<mList.length;m++){
          var src = mList.eq(m).find('img').attr('src');
          var imgU = mList.eq(m).find('img').attr('data-url');
          var sim = mList.eq(m).find('img').attr('data-val');
          
           list.push('<li><img src="'+src+'" alt="" data-val="'+sim+'" data-url="'+imgU+'"></li>') ;
           imgVal.push(sim);

        }
        console.log(sim,imgU)
        //判断是否已添加过 若无对应id则添加 若有 则编辑
        if(tid > 0){//编辑
          var edPar = $('.section[data-id="'+tid+'"]');
          edPar.find('.titile').text(stage);           
          edPar.find('.titile').attr('data-id',stageId);
          edPar.find('.note').text(com_profile);
          edPar.find('ul').html(list.join(''));
          tid = 0;

        }else{
          $('#more_add').prepend('<section class="section" data-id="'+sid+'"><h3 class="titile" data-id="'+stageId+'">'+stage+'</h3><figure><p class="note">'+com_profile+'</p><ul data-img="'+imgVal.join('||')+'">'+list.join('')+'</ul></figure><div class="o fn-clear"><a href="javascript:;" class="edit">'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a></div></section>');//编辑 -- 删除
        }

        

        $('.order_mask2,.order_container2').hide();

        //删除
        $('.o').delegate(".del", "click", function(){
            var that=$(this);
            if($('.section').length == 1){
                showMsg(langData['renovation'][14][65]); //至少保存一个阶段
                return false;
            }else{
                $('.alert_tip2').show();                  
                //one()绑定click事件
                $(".yuyue_yes").one("click",(function(){
              
                  $('.alert_tip2').hide();
                    that.parents('.section').remove()
                  }));
                }
                
            })

            $('.alert_content2').delegate(".yuyue_no", "click", function(){
                $('.alert_tip2').hide();
        })
        //编辑
        $('.o').delegate(".edit", "click", function(){           
          $('.order_mask2,.order_container2').show();
          var par = $(this).closest('.section'),
              tit = par.find('.titile').text(),
              titId = par.find('.titile').attr('data-id'),
              note = par.find('.note').text(),
              parId = par.attr('data-id');//编辑元素的id
          $('.order_container2 .sure').attr('data-id',parId)
          var imgS = par.find('img');
          var imglist = [];
          for(var i=0; i<imgS.length;i++){
            var imgSrc = imgS.eq(i).attr('src');
            var imgUrl = imgS.eq(i).attr('data-url');
            var simVal = imgS.eq(i).attr('data-val');
            imglist.push('<li id="WU_FILE_'+i+'" class="thumbnail imgshow_box">') ;
            imglist.push('<img src="'+imgSrc+'" alt="" data-val="'+simVal+'" data-url>');
            imglist.push('<i class="del_btn">+</i>');
            imglist.push('</li>');

          }
          $('#fileList').find('.thumbnail').remove();
          $('#uploadbtn').before(imglist.join(''));
          $('#com_profile').val(note);
          $('#stageName').val(tit);
          $('#stageId').val(titId);
        })

          
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
       var f = $(this),txt = f.text();
       var build_title = $('#build_title');//标题
       var addrid = $('#addrid');//选择所在地
       var build_addr = $('#build_addr');//详细地址
       var build_name = $('#build_name');//小区
       var price = $('#price');//预算
       var area = $('#area');//面积
       var room_type = $('#btype');//方式
       var art_style=$('.art_ul li');//风格
       var builName = build_name.val()
       $('#style').val($('.art_ul li.active').attr('data-id'));
        if(!build_title.val()){

            build_title.focus()
             showMsg(langData['renovation'][7][7]);  //请输入标题
            
        }else if(!addrid.val()){
            showMsg(langData['renovation'][1][46]);  //请选择所在地
            
        }else if(!build_addr.val()){
             build_addr.focus()
             showMsg(langData['renovation'][1][42]);  //请输入详细地址
        //没有点击选择小区 或者 存在小区但未选择     
        }else if(!builName){
             showMsg(langData['renovation'][15][29]);  //请选择小区
            
        }else if(!price.val()){
             showMsg(langData['renovation'][1][43]);  //请选择装修预算
            
        }else if(!area.val()){
            area.focus();
             showMsg(langData['renovation'][9][28]);  //请输入面积
            
        }else if(!room_type.val()){
             showMsg(langData['renovation'][14][62]);  //请选择方式
            
        }else if(!(art_style.hasClass('active'))){
             showMsg(langData['renovation'][9][37]);  //请选择风格    

        }else if($('.section').length == 0){
             showMsg(langData['renovation'][14][63]);  //请至少添加一个阶段
            
        }else{
          //获取房间信息列表
          var stagelist = [],stage_len = $('.more_add .section').length;
          if(stage_len!=0){
            $('.more_add').find('.section').each(function(){
              var d = $(this), stage_name = d.find('.titile').text(),
              stage_id = d.find('.titile').attr('data-id'),
              note = d.find('.note').text(),
              imgL = d.find('ul').attr('data-img');
              stagelist.push({
                "stageName":stage_name,
                "stage":stage_id,
                "description":note,
                "imgList":imgL                
              })
            });
          }
          f.addClass("disabled").text(langData['renovation'][14][58]);//保存中...
          var form = $("#fabuForm"), action = form.attr("action"),data = form.serialize(), url = form.attr('data-url');
          data += "&stagelist=" + JSON.stringify(stagelist)
          $.ajax({
                url: action,
                data: data,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);
                    if(data && data.state == 100){
                        
                        if(id != undefined && id != "" && id != 0){
                          $('.order_mask').show();
                          setTimeout(function(){
                            location.href = url;
                          },1000)

                        }

                        
                    }else{
                        alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['renovation'][15][16]);//保存失败，请重试！
                    f.removeClass("disabled").text(txt);//
                }
            });
        }

    });
    // 立即预约关闭
     $('.order_mask .t3').click(function(){
        $('.order_mask').hide();
   
     })

});