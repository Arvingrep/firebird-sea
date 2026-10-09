$(function(){
    //活动 时间
    var now = new Date();
    //增加天数
    function DateAdd(number, dated) {
      var datedTime = dated.getTime();
      var addMs = number*86400*1000;
      var affTime = datedTime+addMs;
      return affTime;
    }
    function DateDiff(startTime, endTime, type) {
      if(endTime > startTime){
        var timeDiff = endTime - startTime;
      }else{
        var timeDiff = startTime - endTime;
      }
        
        switch (type) {
            case "year":
                return Math.floor(timeDiff / 86400 / 365);
                break;
            case "month":
                return Math.floor(timeDiff / 86400 / 30);
                break;
            case "day":
                return (timeDiff / 86400).toFixed(1);
                break;
            case "hour":
                return Math.floor(timeDiff / 3600);
                break;
            case "minute":
                return Math.floor(timeDiff / 60);
                break;
            case "second":
                return timeDiff % 60;
                break;
        }
    }


    
    var addDate = DateAdd(beforeDays,now);
    mobiscroll.settings = {
        theme: 'ios',
        themeVariant: 'light',
        height:40
    };

    var now2 = new Date();
    var jiange = 15;//间隔时间
    var fen = now.getMinutes();
    var sfen = (fen%jiange) == 0 ?fen:(Math.floor(fen/jiange)+1)*jiange;
    var minDate = now2.setMinutes(sfen);
    var hourSelect,seFlag = false;
    var hourArr = [];
    //选择开始活动时间
    var startChose,endChose;
    var addDate2 = DateAdd(60,now);
    startChose = mobiscroll.datetime('#startdate', {
        controls: ['datetime'],
        display: 'bottom',
        min: new Date(minDate),
        max: new Date(addDate),
        headerText:'请选择开始时间',
        lang:'zh',
        dateFormat: 'yy-mm-dd',
        stepMinute: jiange,
        timeFormat:'HH:ii',
        daySuffix:'日',
        yearSuffix:'年',
        minuteText:'分',
        hourText:'时',
        disabledTime:true,

        onSet: function (event, inst) {
            var stxt = event.valueText.replace(/-/g,'.'); 
            //if($('#enddate').val() == ''){
                
            // }else{
            //     var etDate = $('#enddate').val();
            //     var stxt2 = etDate.replace(/-/g,'.'); 
            //     if(new Date(etDate) > new Date(event.valueText)){
            //         $('#usedate').val(stxt+' 至 '+stxt2);
            //     }else{//开始时间大于结束时间
            //         $('#usedate').val(stxt2+' 至 '+stxt);
            //         $('#startdate').val(etDate);
            //         $('#enddate').val(event.valueText);
            //     }
                
            // }
           
            var addDate1 =  event.valueText.replace(/-/g,'/')
            addDate2 = DateAdd(60,new Date(event.valueText.replace(/-/g,'/')));
            endChose.option({
              min:new Date(addDate1),
              max:new Date(addDate2),
            })


            $('#enddate').val('');
            $('#usedate').val(stxt+' 至 ')
            $('#enddate').click();
        }
    });
   
    //选择结束时间
    endChose = mobiscroll.datetime('#enddate', {
        controls: ['datetime'],
        display: 'bottom',
        min: new Date(minDate),
        max: new Date(addDate2),
        headerText:'请选择结束时间',
        lang:'zh',
        dateFormat: 'yy-mm-dd',
        stepMinute: jiange,
        timeFormat:'HH:ii',
        daySuffix:'日',
        yearSuffix:'年',
        minuteText:'分',
        hourText:'时',
        disabledTime:true,
        onSet: function (event, inst) {
           var stDate = $('#startdate').val();
           var stxt1 = event.valueText.replace(/-/g,'.');
           var stxt2 = stDate.replace(/-/g,'.');
           if(new Date(stDate) > new Date(event.valueText)){//开始时间大于结束时间
                $('#usedate').val(stxt1+' 至 '+stxt2);
                $('#startdate').val(event.valueText);
                $('#enddate').val(stDate);
           }else{
                $('#usedate').val(stxt2+' 至 '+stxt1);
           }
        }
    });

    $('.hdTime .timeWrap').click(function(){
      if($('#startdate').val() !='' && $('#enddate').val() ==''){
        $('#enddate').click();
      }else{
        $('#startdate').click();
      }
    })

    //满减优惠 折扣优惠
    $('.yhtype .radio span').click(function(e){
        $(this).addClass('curr').siblings('span').removeClass('curr');
        var inpval = $(this).attr('data-id');
        if(inpval == 0){//满减优惠
            $('.yhmoney').removeClass('fn-hide');
            $('.yhzhe').addClass('fn-hide');
        }else{//折扣优惠
            $('.yhzhe').removeClass('fn-hide');
            $('.yhmoney').addClass('fn-hide');
        }
        $('#promotiotype').val(inpval);
    })

    //全店通用 指定商品
    $('.shiyong .radio span').click(function(e){
        $(this).addClass('curr').siblings('span').removeClass('curr');
        var inpval = $(this).attr('data-id');
        if(inpval == 0){//全店通用
            $('.choseGoodW').addClass('fn-hide');
        }else{//指定商品
            $('.choseGoodW').removeClass('fn-hide');
        }
        $('#shoptype').val(inpval);
    })

    var pl_alax ;
    var lpage = 0,  ltotalPage = 0, ltotalCount = 0, lload = false ,shopLr = [],selectArr = [];

    $('.chooseSp').click(function() {

        $('.pro_mask').show();
        $('.pro_box').addClass('proshow');
        if($('.pro_box').find('.pro_li').size()==0){
          lpage = 1
          get_prolist()
        }

        $('html').addClass('noscroll');
    });
  // 隐藏
  $('.pro_mask,.pro_box .pro_cancel').click(function() {
    $('.pro_mask').hide();
    $('.pro_box').removeClass('proshow');
    $('html').removeClass('noscroll');
  });

  // 选择关联商品
  var allSelect = [];
  $('.pro_box').delegate('.pro_li', 'click', function() {
    var t = $(this),tstate = t.attr('data-hdstate'),tid = t.attr('data-id');
    t.toggleClass('chosed');
    if($('#search_pro').val() != '' && !t.hasClass('chosed')){//搜索了商品的 然后取消勾选
      if(allSelect.indexOf(tid) > -1){//之前有勾选 现在要剔除掉
        allSelect.splice(allSelect.indexOf(tid),1); 
      }
    }
  });

  $('.pro_box .pro_sure').click(function() {
    $('.goodlist li.goodLi').remove();
    if($('#search_pro').val() == ''){//未搜索
      var selectArr = [];
      allSelect=[];
      $('.proScrollBox li.chosed').each(function(){
        var  t = $(this),proid = t.attr('data-id');
        selectArr.push(proid);
        allSelect.push(proid);
        
      })
    }else{//已搜索
      var selectArr = allSelect;
      $('.proScrollBox li.chosed').each(function(){
          var  t = $(this),proid = t.attr('data-id');
          if(selectArr.indexOf(proid) <= -1){
              selectArr.push(proid);
          }
      })
    }
    console.log(selectArr)

    if(selectArr.length > 0){
      var sid = selectArr[0];
      createGoods(sid,selectArr);
    }
  
    
    $("#goodsId").val(selectArr.join(','))
    $('.pro_mask').hide();
    $('.pro_box').removeClass('proshow');
    $('html').removeClass('noscroll');

  })
  //编辑状态 --已选商品
  if(goodidVal){
    $('.loadIcon').show();
    lpage = 1
    get_prolist();
  }

  function createGoods(chid,myarr){
    var newAr = shopLr.filter(function (value, index, array) {
        return value.id == chid;
    });
    var html = [];
    html.push('<li data-id="'+newAr[0].id+'" class="goodLi">');
        html.push('<div class="goodImg"><img src="'+newAr[0].litpic+'" alt=""></div>');
        html.push('<p>'+newAr[0].title+'</p>');
    html.push('</li>');
    $('.goodWrap .goodlist').html(html.join(""));

    if(myarr.length > 0){
        $('.choseGoodW').addClass('hasC');
        $('.chooseSp a').html('已选'+myarr.length+'件商品，继续选择'); 
    }else{
        $('.choseGoodW').removeClass('hasC');
        $('.chooseSp a').html('选择可用商品'); 
    }
  }
  //搜索商品
  $('.search_box').click(function(){
    $(this).addClass('seshow');
    $('#search_pro').focus();
  })
  //
  $('#searchForm').submit(function(){
    lpage = 1 ;
    get_prolist();
    return false;
  })

  // 到底加载
  $('.proScrollBox').scroll(function(){
    var allh = $('.proScrollBox>ul').height();
    var w = $('.proScrollBox').height();
    var s_scroll = allh - 80 - w;
    if ($(this).scrollTop() >= s_scroll && !lload && lpage < ltotalPage)
    {
      lpage++;
      get_prolist();
    }
  });
  var ttflag = false;
    function get_prolist(){
        if(pl_alax){
          pl_alax.abort();
        }

        lload = true;
        var idArr = $("#goodsId").val().split(',')
        var data = [];
        data.push('u=1');
        data.push('page='+lpage);
        data.push('title='+$('#search_pro').val());

        url = '/include/ajax.php?service=shop&action=slist&moduletype=4&pageSize=20&'+data.join('&');
        $('.pro_box ul .loading').remove();
        $('.pro_box ul').append('<div class="loading"><span>加载中~</span></div>');
        pl_alax = $.ajax({
          url: url,
          type: "GET",
          dataType: "json", //指定服务器返回的数据类型
          crossDomain: true,
          success: function(data) {
            lload = false;
            $('.pro_box ul .loading').remove();
            if (data.state == 100) {
              var list = [],item = data.info.list;
              ltotalPage = data.info.pageInfo.totalPage;
              ltotalCount = data.info.pageInfo.totalCount;
              var label = $('.pro_box ul').attr('data-name');
              if(item.length>0){
                //$('.link_pro').removeClass('noDatapro');
                //$('.search_box').show();
                for(var i = 0; i<item.length; i++){
                  shopLr.push(item[i]);
                  var chosed = '';
                  $('.pro_show li').each(function(){
                    var t = $(this);
                    if(t.attr('data-link') == type && t.attr('data-id') == item[i].id){
                      chosed = "chosed";
                    }
                  });
                  chosed = idArr.indexOf(item[i].id) > -1?'chosed': '';
                  list.push('<li class="pro_li '+chosed+'" data-id="'+item[i].id+'" data-hdstate="'+item[i].huodongstate+'">');
                  list.push('<a href="javascript:;">');
                  list.push('<s class="hasChoseIcon"></s>')
                  list.push('<div class="left_proimg">');
                  list.push('<img data-url="'+item[i].litpic+'" src="'+item[i].litpic+'" />');
                  list.push('</div>');
                  list.push('<div class="right_info">');
                  list.push('<h2>'+item[i].title+'</h2>');
                  list.push('<p class="price"><em>'+echoCurrency('symbol')+'</em><strong>'+item[i].price+'</strong></p>');
              
                  list.push('</div>');
                  list.push('</a>');
                  list.push('</li>');

                }
                if(lpage==1){
                  $('.pro_box ul').html(list.join(''));
                }else{
                  $('.pro_box ul').append(list.join(''));
                }

                //编辑状态
                if(!ttflag){
                  ttflag = true;
                  if(goodidVal){
                    $('.loadIcon').hide();
                    var sid = idArr[0];
                    createGoods(sid,idArr);
                  }
                  console.log(333)
                }
                

                // $('.pro_box ul img').scrollLoading(); //懒加载
              }else{
                if(ltotalPage < lpage && lpage > 0){

                  $('.pro_box ul').append('<div class="noData loading"><p>已经到底啦！</p></div>')
                }else{
                  //$('.link_pro').addClass('noDatapro');
                  //$('.search_box').hide();
                  $('.pro_box ul').html('<div class="loading"><div class="emptyImg"></div><h2>暂无合适的商品</h2></div>')   /* 暂无符合条件的商品哦~*/
                }
              }

            } else {
              //$('.link_pro').addClass('noDatapro');
              //$('.search_box').hide();
              $('.pro_box ul').html('<div class="loading"><div class="emptyImg"></div><h2>暂无合适的商品</h2></div>')  /* 暂无符合条件的商品哦~*/
            }
          },
          error: function(err) {
            console.log('fail');
            $('.pro_box ul').html('<div class="loading">网络错误，加载失败</div>');

          }
        });

    }
    $('#quanlimitname').click(function(){
      if($('#number').val() == '' || $('#number').val() == 0){
        showErrAlert('请输入发放量');
        return false;
      }
      
    })
    //限领张数
    $('#number').blur(function(){
      var tval = $(this).val();
      if(tval >0){
        if(oldNumber && tval<oldNumber*1){//修改的发放量
          showErrAlert('不得低于修改前的发放量');
          $(this).focus();
        }else{
          if($('#peisList').size() > 0){
            $('#peisList').remove();
          }
          getTypeList();
        }
        
      }else{
        showErrAlert('至少发放一张');
        $(this).focus();
      }
    })

    var defaultValue = [1]
    //编辑时
    if(oldNumber){
      getTypeList();
    }
    function getTypeList(){
        var plist = $('#number').val()*1;
        var typeList = [],html = [];
        html.push('<ul id="peisList" data-type="treeList" style="display: none;">')       
        for(var i = 1; i <= plist; i++){
            html.push('<li data-val="'+i+'"><span>'+i+'张</span>');
            html.push('</li>');           
        }       
        html.push('</ul>');
        $(".xianling #quanlimit").after(html.join(''));
        
        if(limitNum){
          defaultValue = [limitNum]
        }
        var treelist = $('#peisList').mobiscroll().treelist({
            theme: 'ios',
            themeVariant: 'light',
            height:40,
            lang:'zh',
            headerText:'选择限领张数',
            display: 'bottom',
            circular:false,
            defaultValue:defaultValue,
            onInit:function(){
                $("#quanlimitname").val($("#peisList li[data-val="+defaultValue[0]+"]").text())
                $("#quanlimit").val(defaultValue[0]);
            },
            onSet:function(valueText, inst){
                var typename = $("#peisList li[data-val="+inst._wheelArray[0]+"]").text()
                var typeid = inst._wheelArray[0];
                $("#quanlimitname").val(typename);
                $("#quanlimit").val(typeid);
            },
            onShow:function(){
                 toggleDragRefresh('off');
            },
            onHide:function(){
                 toggleDragRefresh('on');
            }

        })
    }
  //立即添加
  $('.fabu_btn .btn').click(function(){
    var btn = $(this),btntxt = btn.text();
    if(btn.hasClass("disabled")) return;
    var quanname = $('#quanname').val(),//名称
        startdate = $('#startdate').val(),
        enddate = $('#enddate').val(),
        shoptype = $('#shoptype').val(),//全店/商品
        goodsId  = $('#goodsId').val(),//商品id
        promotiotype  = $('#promotiotype').val(),//满减/折扣
        promotio  = $('#promotio').val(),//满减--优惠金额
        promotio1  = $('#promotio1').val(),//折扣--优惠金额
        basicprice  = $('#basic_price').val(),//使用门槛
        number  = $('#number').val(),//发放量
        quanlimit  = $('#quanlimit').val();//限领

    if(!quanname){
      showErrAlert('请输入优惠券名称');
      return false;
    }  
    if(!startdate){
      showErrAlert('请选择开始时间');
      return false;
    }  
    if(!enddate){
      showErrAlert('请选择结束时间');
      return false;
    }  
    //验证是否超过60天
    if(startdate && enddate){
      var sdate = parseInt(((new Date(startdate)).getTime())/1000);
      var edate = parseInt(((new Date(enddate)).getTime())/1000);
      var dayDiff = DateDiff(sdate,edate,'day');
      if(dayDiff > 60){
        showErrAlert('有效期不能超过60天');
        return false;
      }
    }
    //指定商品
    if(shoptype == '1' && !goodsId){
      showErrAlert('请选择可用商品');
      return false;
    }    
    //满减优惠 
    if(promotiotype == '0' && !promotio){
      showErrAlert('请输入优惠金额');
      return false;
    } 
        //折扣--优惠金额
    if(promotiotype == '1' ){
      if(!promotio1){
        showErrAlert('请输入优惠折扣');
        return false;
      }else if(promotio1>9.99){
        showErrAlert('最高9.99');
        return false;
      }else if(promotio1<0.01){
        showErrAlert('最低0.01');
        return false;
      }
      
    } 

    if(!basicprice){
      showErrAlert('请输入使用门槛金额');
      return false;
    } 
    if(promotiotype == '0'){
      if(basicprice > 0 && basicprice*1 < promotio*1){
        showErrAlert('门槛需高于优惠金额');
        return false;
      }
    }
    if(!number){
      showErrAlert('请输入发放量');
      return false;
    } 
    if(!quanlimit){
      showErrAlert('请选择限领张数');
      return false;
    } 
    if(promotiotype == 1){
        $("#promotio").val(promotio1);
    }
    btn.addClass("disabled").html(langData['siteConfig'][6][35]+"...");
    var form = $('#fabuForm'),action = form.attr('action'),url = form.attr('data-url');
    var data = form.serialize();
    console.log(data)
    $.ajax({
        url: action,
        type: "POST",
        data:data,
        dataType: "json",
        success: function (data) {
            if(data.state == 100){
              showErrAlert(data.info);
              setTimeout(function(){
                location.href =  url
              },500)
              
            }else{
              showErrAlert(data.info);
            }
            btn.removeClass("disabled").html(btntxt);
        },
        error:function () {
          showErrAlert(langData['siteConfig'][20][183]);
          btn.removeClass("disabled").html(btntxt);
        }
    });
  })




})
