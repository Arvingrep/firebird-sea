$(function(){

  //运费列表
  if($('.logList').size() > 0){
    var atpage = 1,isload = false;
    // $(window).scroll(function() {
    //   var allh = $('body').height();
    //   var w = $(window).height();
    //   var scroll = allh - w;
    //   if ($(window).scrollTop() + 50 > scroll && !isload) {
    //     atpage++;
    //     getList();
    //   };
    // });
    getList();
    function getList(tr){
      if(isload) return false;
      isload = true;
      if(tr){
        atpage = 1;
        $(".logList").html("");
      }
      $(".logList .loading").remove();

      $.ajax({
          url: "/include/ajax.php?service=shop&action=logistic&b=1",
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
            if(data && data.state == 100 && data.info.length > 0){
              var list = data.info,html = [];
              if(list.length > 0){
                for(var i = 0; i < list.length; i++){
                  var logEditUrl2 = logEditUrl.replace('%id%',list[i].id);
                  html.push('<div class="logItem" data-id="'+list[i].id+'" data-type="'+list[i].logistype+'">');
                  if (list[i].logistype == 1){
                    html.push('  <div class="logTop"><strong>'+list[i].title+'</strong><span>商家配送</span></div>');
                  }else{
                    html.push('  <div class="logTop"><strong>'+list[i].title+'</strong><span>快递邮寄</span></div>');
                  }

                  var noteTxt = '',cla = '';
                  if(list[i].note){
                    noteTxt='<div>'+list[i].note+'</div>';
                    cla = 'hasT'
                  }
                  html.push('  <div class="logNote '+cla+'">'+noteTxt+'</div>');
                  html.push('  <div class="logOpr">');
                  html.push('    <a href="'+logEditUrl2+'" class="logEdit"><i></i>编辑</a><a href="javascript:;" class="logDel"><i></i>删除</a>');
                  html.push('  </div>');
                  html.push('</div>');

                  html.push('</li>');
                  

                }
                $(".logList").append(html.join(""));
                $('.logList .logItem').each(function(){
                  var h1 = $(this).find('.logNote').height();
                  var h2 = $(this).find('.logNote div').height();
                  if(h2>h1){
                    $(this).find('.logNote').addClass('over');
                  }
                })

                isload = false;
                //最后一页
                // if(atpage >= data.info.pageInfo.totalPage){
                //     isload = true;
                //     $(".logList").append('<div class="loading">'+langData['siteConfig'][18][7]+'</div>');
                // }
              }else{
                isload = true;

                $(".logList").append('<div class="loading">暂无相关信息</div>');
              }
            }else{
                isload = true;
                $(".logList").append('<div class="loading">暂无相关信息</div>');
            }
          },
          error: function(){
            isload = false;
            $('.logList').html('<div class="loading">'+langData['siteConfig'][20][227]+'</div>');
          }
      });
    }

    //删除
    $(".logList").delegate(".logDel", "click", function(){
      var t = $(this), par = t.closest(".logItem"), id = par.data("id");
      var type = par.attr('data-type')
      var popOptions = {
          title:'确定删除？',
          btnColor:'#3377FF',
          isShow:true
      }
      confirmPop(popOptions,function(){
        $.ajax({
            url: "/include/ajax.php?service=shop&action=delLogistic&logistype="+type+"&id="+id,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
              if(data && data.state == 100){
                location.reload();
              }else{
                showErrAlert('此模板有商品正在使用，不可删除');
                $(".pubdelAlert .cancelDel").click();
              }
            },
            error: function(){
              showErrAlert(langData['siteConfig'][20][183]);
              $(".pubdelAlert .cancelDel").click();
            }
          });
      });

    });

  }

  var psArea_arr = ['默认全国'];//存放配送运费的区域集合
  var baoyArea_arr = [];//存放包邮区域集合
  var nopsArea_arr = [];//存放不配送区域集合

  //配送方式切换
  var tabFlag = false;
  $('.confirmTab li').click(function(){
    var t = $(this);
    if(!t.hasClass('active')){
      var tindex = t.index();
      var inpval = t.find('a').attr('data-id');
      var nowCon = $('.comCon.comShow');

      if(tindex == 0){//快递邮寄
        if(nowCon.find('.title').val()!='' || nowCon.find('.knowCont').html()!='' || psArea_arr.length > 1 || (baoyArea_arr.length > 0 && $('#freeArea').val() == 1) || (nopsArea_arr.length > 0  && $('#noFreeArea').val() == 1)){
          tabFlag = true;
        }
      }else{
        if(nowCon.find('.title').val()!='' || nowCon.find('.knowCont').html()!='' || $('#fixbasic').val()!='' || $('#fixfee').val()!='' || $('#fixover').val()!=''){
          tabFlag = true;
        }
      }
      console.log(tabFlag)
      if(tabFlag){//已经有填写的内容
        var popOptions = {
          btnCancel:'继续填写',
          btnSure:'确定',
          title:'确定换为商家配送吗',
          confirmTip:'切换后当前已填写信息将会清空哦',
          btnColor:'#000',
          btnCancelColor:'#3578FF',
          isShow:true
        }
        if(tindex == 0){
          popOptions.title = '确定更换为快递邮寄吗';
        }
        confirmPop(popOptions,function(){
          suretab(t,tindex,inpval,'1')
        });

      }else{
        suretab(t,tindex,inpval)
      }
      
      
      
    }
  })
  function suretab(tdom,tx,tv,kong){
    tabFlag = false;
    tdom.addClass('active').siblings('li').removeClass('active');
    $('.container .comCon').eq(tx).addClass('comShow').siblings('.comCon').removeClass('comShow');
    $('#logistype').val(tv);

    if(kong == '1'){//确认则清空
      if(tx == 1){//商家配送--则清空快递邮寄
        var nowCon = $('.container .comCon').eq(0);
        nowCon.find('.title').val('');
        nowCon.find('.knowCont').html('');
        psArea_arr = ['默认全国'];
        baoyArea_arr = [];
        nopsArea_arr = [];
        $('#freeArea').val('0');
        $('#noFreeArea').val('0');
        $('.delivery_area .switch,.delivery_area').removeClass('active');
        $('#calcPr').val('0');
        $('.radiobox.calcPr .radio span').removeClass('curr');
        $('.radiobox.calcPr .radio span:first-child').addClass('curr');
        $('.comtxt1').html('首件(件)');
        $('.comtxt2').html('续件(件)');
        $('.shouNum').val('0');
        $('.shoufee').val('0');
        $('.xuNum').val('1');
        $('.xufee').val('0');
        $('.delivery_area.peisong .feeBox').each(function(){
            if($(this).index() > 0){
                $(this).remove();
            }
        })
        $('.delivery_area.baoyou .feeBox').remove();
        $('.delivery_area.baoyou dd').addClass('fn-hide');
        $('.delivery_area.nopeis dd').addClass('fn-hide');
        $('.delivery_area.nopeis .areaSt').val('')
      }else{
        var nowCon = $('.container .comCon').eq(1);
        nowCon.find('.title').val('');
        nowCon.find('.knowCont').html('');
        $('#fixbasic').val('');
        $('#fixfee').val('');
        $('#fixover').val('');
        $('#openFree').val('1');
        $('.delivery_fix .switch').addClass('active');
        $('#valuation').val('0');
        $('.radiobox.valuation .radio span').removeClass('curr');
        $('.radiobox.valuation .radio span:first-child').addClass('curr');
      }

    }
  }
  /***************快递邮寄*****************************/
  //计价方式
  $('.calcPr .radio span').click(function(e){
    var inpval = $(this).attr('data-id');
    $(this).addClass('curr').siblings('span').removeClass('curr');
    if(inpval == 0){//按件数
      $('.comtxt1').html('首件(件)');
      $('.comtxt2').html('续件(件)');
    }else if(inpval == 1){//按重量
      $('.comtxt1').html('首件重量(kg)');
      $('.comtxt2').html('续件重量(kg)');
    }else{//按体积
      $('.comtxt1').html('首件体积(m³)');
      $('.comtxt2').html('续件体积(m³)');
    }
    $('#calcPr').val(inpval)
  })
  //指定包邮--开关
  $('.delivery_area.baoyou .switch').click(function(){
    var par =$(this).closest('.delivery_area');
    par.toggleClass('active');
    if($(this).hasClass('active')){
      $(this).removeClass('active');
      $('#freeArea').val('0');
      par.find('dd').addClass('fn-hide');
    }else{
      $(this).addClass('active');
      $('#freeArea').val('1');
      par.find('dd').removeClass('fn-hide');

    }
  })
  //指定区域不配送--开关
  $('.delivery_area.nopeis .switch').click(function(){
    var par =$(this).closest('.delivery_area');
    par.toggleClass('active');
    if($(this).hasClass('active')){
      $(this).removeClass('active');
      $('#noFreeArea').val('0');
      par.find('dd').addClass('fn-hide');
    }else{
      $(this).addClass('active');
      $('#noFreeArea').val('1');
      par.find('dd').removeClass('fn-hide');

    }
  })
  
  // 选择地区数据
  //编辑状态
  if(logisticArr.length > 1 || freeArea_arr.length > 0 || noFreeaArr.length > 0){
    $('.loadIcon').show();
  }
  getArea()
  function getArea(){
    $.ajax({
      url: "/include/ajax.php?service=siteConfig&action=area&son=once",
      type: "GET",
      dataType: "jsonp",
      success: function (data) {
        if(data && data.state == 100){
          var list = data.info,html=[];
          for(var i = 0; i < list.length; i++){
            html.push('<div class="areaItem">');
            html.push('  <div class="areaTop comItem" data-id="'+list[i].id+'"><div  class="areaCh"><label></label><span>'+list[i].typename+'</span></div><s class="arr"></s></div>');
            var lower = list[i].lower;
            if(lower.length > 0){
              html.push('  <div class="areaBot" data-len="'+lower.length+'">');
              for(var j = 0; j < lower.length; j++){
                html.push('    <div class="comItem" data-id="'+lower[j].id+'"><label></label><span>'+lower[j].typename+'</span></div>');
                
              }
              html.push('  </div>');
            }
            html.push('</div>');                
          }
          $(".areaAlert .areaWrap").html(html.join(""));
          $('.loadIcon').hide();
          if(logisticArr.length > 0){
            var myedHtml = createAreafee(logisticArr.length,'1');
            $('.delivery_area.peisong .feeWrap').html(myedHtml.join(''));          
          }
          if(freeArea_arr.length > 0){
            var myedHtml2 = createBaoyfee(freeArea_arr.length,'1');
            $('.delivery_area.baoyou .feeWrap').html(myedHtml2.join(''));
          }

          if(noFreeaArr.length > 0){
            var data_areaname2 = '',chosename2 = '';
            nopsArea_arr.push(noFreeaArr);
            var choseAid = noFreeaArr[0][1];
            var choseAon = $('.areaWrap .areaBot .comItem[data-id="'+choseAid+'"]');
            var allPar = choseAon.closest('.areaItem');
            chosename2 += allPar.find('.areaTop span').text();
            chosename2 += '/'+choseAon.find('span').text();
            data_areaname2 = chosename2+'等'+noFreeaArr.length+'个地区';
            $('.delivery_area.nopeis .feeWrap .areaSt').val(data_areaname2)
            $('.delivery_area.nopeis .feeWrap .choseArea').attr('data-isclick','1')
          }

        }else{
          showErrAlert(langData['siteConfig'][27][77]);
        }
      },
      error: function(){
        showErrAlert(langData['siteConfig'][20][183]);
      }
    });
  }
  
  
  

  //配送运费及区域 -- 增加配送区域
  $('.areafeeAdd').click(function(){
    var sbm = $(this).siblings('.feeWrap');
    //之前的元素未点击过选择区域
    if(sbm.find('.choseArea').size() > 0){
      sbm.find('.choseArea').each(function(ind){
        var bt = $(this);
        if(bt.attr('data-isclick') == '0'){
          psArea_arr[ind] = [];
        }
      })
    }
    var myHtml = createAreafee('1','');
    sbm.append(myHtml.join(''));
  })
  function createAreafee(num,parmarr){
    var txt1 = txt2 = '';
    var inpval = $('.calcPr .radio span.curr').attr('data-id');
    if(inpval == 0){//按件数
      txt1 = '首件(件)';
      txt2 = '续件(件)';
    }else if(inpval == 1){//按重量
      txt1 = '首件重量(kg)';
      txt2 = '续件重量(kg)';
    }else{//按体积
      txt1 = '首件体积(m³)';
      txt2 = '续件体积(m³)';
    }
    var feeHtml = [];
    for(var m = 0;m<num;m++){
      var data_areaname = '',chosename = '';
      var data_isClick = '0';
      var data_shoufee = data_xufee = 0;
      var data_shounum = data_xunum = 1;
      var deltxt = '<div class="feeDel"></div>';
      var arrtxt = '<i class="arr"></i>';
      var discla = '';
      if(parmarr == '1'){//编辑状态
        data_isClick = '1';
        data_shounum = logisticArr[m].express_start;
        data_shoufee = logisticArr[m].express_postage;
        data_xunum = logisticArr[m].express_plus;
        data_xufee = logisticArr[m].express_postageplus;
        if(m==0){
          data_areaname = '默认全国';
          deltxt = arrtxt ='';
          discla = 'disabled';
        }else{
          psArea_arr.push(logisticArr[m].area);
          var choseAid = logisticArr[m].area[0][1];
          var choseAon = $('.areaWrap .areaBot .comItem[data-id="'+choseAid+'"]');
          var allPar = choseAon.closest('.areaItem');
          chosename += allPar.find('.areaTop span').text();
          chosename += '/'+choseAon.find('span').text();
          data_areaname = chosename+'等'+logisticArr[m].area.length+'个地区';
        }
      }

      feeHtml.push('<div class="feeBox">');
      feeHtml.push(deltxt);
      feeHtml.push('  <div class="psArea">');
      feeHtml.push('    <span>可配送区域</span>');
      feeHtml.push('    <div class="choseArea '+discla+'" data-isclick="'+data_isClick+'">');
      feeHtml.push('      <input type="text" placeholder="请选择" class="areaSt" readonly value="'+data_areaname+'">');
      feeHtml.push(arrtxt);
      feeHtml.push('    </div>');
          
      feeHtml.push('  </div>');
      feeHtml.push('  <div class="comdl">');
      feeHtml.push('    <span class="comtxt1">'+txt1+'</span>');
      feeHtml.push('    <div class="areaNum">');
      feeHtml.push('      <em class="rec disabled"></em>');
      feeHtml.push('      <div><input type="text" class="shouNum" onkeyup="zhengshu(this)" name="express_start" value="'+data_shounum+'"></div>');
      feeHtml.push('      <em class="plus"></em>');
      feeHtml.push('    </div>');
      feeHtml.push('  </div>');
      feeHtml.push('  <div class="comdl">');
      feeHtml.push('    <span>运费('+echoCurrency('short')+')</span>');
      feeHtml.push('    <div class="areaNum">');
      feeHtml.push('      <em class="rec disabled"></em>');
      feeHtml.push('      <div><input type="text" class="shoufee"  onkeyup="xiaoshu(this)" name="express_postage" value="'+data_shoufee+'"></div>');
      feeHtml.push('      <em class="plus"></em>');
      feeHtml.push('    </div>');
      feeHtml.push('  </div>');
      feeHtml.push('  <div class="comdl">');
      feeHtml.push('    <span class="comtxt2">'+txt2+'</span>');
      feeHtml.push('    <div class="areaNum">');
      feeHtml.push('      <em class="rec disabled"></em>');
      feeHtml.push('      <div><input type="text" class="xuNum" onkeyup="zhengshu(this)" name="xj" value="'+data_xunum+'"></div>');
      feeHtml.push('      <em class="plus"></em>');
      feeHtml.push('    </div>');
      feeHtml.push('  </div>');
      feeHtml.push('  <div class="comdl">');
      feeHtml.push('    <span>续费('+echoCurrency('short')+')</span>');
      feeHtml.push('    <div class="areaNum">');
      feeHtml.push('      <em class="rec disabled"></em>');
      feeHtml.push('      <div><input type="text" class="xufee"  onkeyup="xiaoshu(this)" name="express_postageplus" value="'+data_xufee+'"></div>');
      feeHtml.push('      <em class="plus"></em>');
      feeHtml.push('    </div>');
      feeHtml.push('  </div>');      
      feeHtml.push('</div>');
    }
    return feeHtml;

  }

  //指定包邮 -- 增加配送区域
  $('.baoyoufeeAdd').click(function(){
    var sbm = $(this).siblings('.feeWrap');
    //之前的元素未点击过选择区域
    if(sbm.find('.choseArea').size() > 0){
      sbm.find('.choseArea').each(function(ind){
        var bt = $(this);
        if(bt.attr('data-isclick') == '0'){
          baoyArea_arr[ind] = [];
        }
      })
    }
    var myHtml = createBaoyfee('1','');
    sbm.append(myHtml.join(''));
  })
  function createBaoyfee(num,parmarr){
    var feeHtml = [];
    for(var m = 0;m<num;m++){
      var data_areaname = '',chosename = '';
      var data_isClick = '0';
      var data_minprice = 0.01;
      var data_minum = 1;
      if(parmarr == '1'){//编辑状态
        data_isClick = '1';
        data_minum = freeArea_arr[m].preferentialStandard;
        data_minprice = freeArea_arr[m].preferentialMoney;
        baoyArea_arr.push(freeArea_arr[m].area);
        var choseAid = freeArea_arr[m].area[0][1];
        var choseAon = $('.areaWrap .areaBot .comItem[data-id="'+choseAid+'"]');
        var allPar = choseAon.closest('.areaItem');
        chosename += allPar.find('.areaTop span').text();
        chosename += '/'+choseAon.find('span').text();
        data_areaname = chosename+'等'+freeArea_arr[m].area.length+'个地区';
      }

      feeHtml.push('<div class="feeBox">');
      feeHtml.push('  <div class="feeDel"></div>');
      feeHtml.push('  <div class="psArea">');
      feeHtml.push('    <span>选择包邮地区</span>');
      feeHtml.push('    <div class="choseArea" data-isclick="'+data_isClick+'">');
      feeHtml.push('      <input type="text" placeholder="请选择" class="areaSt" readonly value="'+data_areaname+'">');
      feeHtml.push('      <i class="arr"></i>');
      feeHtml.push('    </div>');
          
      feeHtml.push('  </div>');
      feeHtml.push('  <div class="comdl">');
      feeHtml.push('    <span>最低购买件数</span>');
      feeHtml.push('    <div class="areaNum">');
      feeHtml.push('      <em class="rec disabled"></em>');
      feeHtml.push('      <div><input type="text" class="minbuyNum" onkeyup="zhengshu(this)" name="preferentialStandard" value="'+data_minum+'"></div>');
      feeHtml.push('      <em class="plus"></em>');
      feeHtml.push('    </div>');
      feeHtml.push('  </div>');
      feeHtml.push('  <div class="comdl">');
      feeHtml.push('    <span>最低购买金额（'+echoCurrency('short')+'）</span>');
      feeHtml.push('<div class="areaNum dip">');
      feeHtml.push('  <div><input type="text" class="minbuyPrice" onkeyup="xiaoshu(this)" name="preferentialMoney" value="'+data_minprice+'" placeholder="请输入"></div>');
      feeHtml.push('</div>');

      feeHtml.push('  </div>');     
      feeHtml.push('</div>');
    }
    return feeHtml;
  }

  //点击一级城市
  $('.areaWrap').delegate('.areaTop','click',function(e){
    e.preventDefault();
    var t = $(this);
    var allPar = t.closest('.areaItem');
    var both = allPar.find('.areaTop').height() + allPar.find('.areaBot').height();
    //点到选中城市
    if(e.target == t.find('label')[0] || e.target == t.find('span')[0]){
      if(t.hasClass('noall')){//二级没有全选
        t.removeClass('noall');
        t.addClass('curr');
        allPar.find('.areaBot .comItem').addClass('curr');
      }else if(t.hasClass('curr')){
        t.removeClass('curr');
        allPar.find('.areaBot .comItem').removeClass('curr');
      }else{
        t.addClass('curr');
        allPar.find('.areaBot .comItem').addClass('curr');
      }
      if(!allPar.hasClass('hasClick')){
        //展开
        allPar.addClass('hasClick');
        allPar.find('.arr').addClass('curr');
        allPar.css('height',both+'px');
      }
    }
    //下拉收起
    else{
      if(!allPar.hasClass('hasClick')){
        allPar.addClass('hasClick');
        allPar.find('.arr').addClass('curr');
        allPar.css('height',both+'px');
      }else{
        allPar.removeClass('hasClick');
        allPar.find('.arr').removeClass('curr');
        allPar.css('height','.88rem');
      }
    }

  })
  //二级城市
  $('.areaWrap').delegate('.areaBot .comItem','click',function(e){
    e.preventDefault();
    var t = $(this);
    var allPar = t.closest('.areaItem');
    t.toggleClass('curr');
    if(!t.hasClass('curr')){//二级取消选择
      allPar.find('.areaTop').removeClass('curr').addClass('noall');
    }else{
      //统计选择个数 --是否全选
      var allLen = allPar.find('.areaBot').attr('data-len');
      var choseLen = allPar.find('.areaBot .curr').length;
      if(choseLen == allLen){
        allPar.find('.areaTop').addClass('curr');
      }
    }
  })
  var hasChoseArr = [];
  
  //选择地区--弹出
  $('.feeWrap').delegate('.choseArea','click',function(){
    if($(this).hasClass('disabled')) return false;
    $(this).attr('data-isclick','1');
    $('.choseArea').removeClass('choseShow');
    $(this).addClass('choseShow');
    //先清空所有选中的样式
    $('.areaWrap .areaItem').removeClass('hasClick canClick');
    $('.areaWrap .areaItem').css('height','.88rem');
    $('.areaWrap .areaItem .arr').removeClass('curr');
    $('.areaWrap .areaItem .comItem').removeClass('noall curr');
    //如果是编辑的 给已选的加上样式
    var index = $(this).closest('.feeBox').index();   
    var oldPar = $(this).closest('.delivery_area');
    if(oldPar.hasClass('baoyou')){
      hasChoseArr = baoyArea_arr[index];
    }else if(oldPar.hasClass('nopeis')){
      hasChoseArr = nopsArea_arr[index];
    }else{
      hasChoseArr = psArea_arr[index];
    }
    
    if(hasChoseArr&&hasChoseArr.length > 0){
      var choseNum = 1;
      for(var k = 0;k<hasChoseArr.length;k++){
        var choseid = hasChoseArr[k][1];//已选的二级城市
        var choseCon = $('.areaWrap .areaBot .comItem[data-id="'+choseid+'"]');
        choseCon.addClass('curr');
        choseCon.closest('.areaBot').attr('data-num',choseNum++);
        var allPar = choseCon.closest('.areaItem');
        var allLen = choseCon.closest('.areaBot').attr('data-len');
        var allNum = choseCon.closest('.areaBot').attr('data-num');
        if(allNum>1){
          if(allLen == allNum){//全选了
            choseCon.closest('.areaBot').siblings('.areaTop').addClass('curr');
          }else{//只选择了部分
            choseCon.closest('.areaBot').siblings('.areaTop').addClass('noall');
          }
          //用于下拉展开
          allPar.addClass('canClick');
          if(k == hasChoseArr.length -1){//循环结束
            $('.areaWrap .areaItem.canClick').each(function(){
              $(this).find('.arr').click();
            })

          }
          
        }
      }

    }

    $(".areaMask").show();
    $(".areaAlert").addClass('alertshow');
  })

  //选择地区--确认  
  $('.areaAlert .sure_btn').click(function(){
    var dom = $('.choseArea.choseShow');
    var index = dom.closest('.feeBox').index();
    var allAreaArr = [],chosename = '';
    $('.areaWrap .areaBot .comItem.curr').each(function(ind){
      var areaArr = [];
      var tid = $(this).attr('data-id');
      var allPar = $(this).closest('.areaItem');
      var parid = allPar.find('.areaTop').attr('data-id');
      areaArr.push(parid);
      areaArr.push(tid);
      allAreaArr.push(areaArr);
      if(ind == 0){  
        chosename += allPar.find('.areaTop span').text();
        chosename += '/'+$(this).find('span').text();
      }
      
    })
    var allLen = allAreaArr.length;
    var oldPar = dom.closest('.delivery_area');
    
    if(allLen>0){
      dom.find('.areaSt').val(chosename+'等'+allLen+'个地区');

      if(oldPar.hasClass('baoyou')){//包邮区域

        if(baoyArea_arr && baoyArea_arr[index]){//有位置则替换
          baoyArea_arr[index] = allAreaArr
        }else{
          baoyArea_arr.push(allAreaArr);
        }

      }else if(oldPar.hasClass('nopeis')){//不配送区域
        if(nopsArea_arr && nopsArea_arr[index]){//有位置则替换
          nopsArea_arr[index] = allAreaArr
        }else{
          nopsArea_arr.push(allAreaArr);
        }
      }else{//配送区域
        if(psArea_arr && psArea_arr[index]){//有位置则替换
          psArea_arr[index] = allAreaArr
        }else{
          psArea_arr.push(allAreaArr);
        }
      }
      
      
    }else{//一个都没选

      dom.find('.areaSt').val('');
      //之前有选中 则要替换为空
      if(hasChoseArr&&hasChoseArr.length > 0){
        if(oldPar.hasClass('baoyou')){//包邮区域
          baoyArea_arr[index] = [];
        }else if(oldPar.hasClass('nopeis')){//不配送区域
          nopsArea_arr[index] = [];
        }else{//配送区域
          psArea_arr[index] = [];
        }
      }
    }

    $(".areaMask").hide();
    $(".areaAlert").removeClass('alertshow');

  })

  //选择地区--取消
  $('.areaMask,.areaAlert .cancel_btn').click(function(){
    $(".areaMask").hide();
    $(".areaAlert").removeClass('alertshow');
  })
  //删除区域
  $('.feeWrap').delegate('.feeDel','click',function(){
    var t = $(this);
    var oldPar = t.closest('.delivery_area'); 
    var par = t.closest('.feeBox'); 
    var tinx = par.index();
    //已选区域要删除
    if(oldPar.hasClass('baoyou')){

      if(baoyArea_arr && baoyArea_arr[tinx]){
        baoyArea_arr.splice(tinx,1)
      }
    }else if(oldPar.hasClass('nopeis')){
      if(nopsArea_arr && nopsArea_arr[tinx]){
        nopsArea_arr.splice(tinx,1)
      }
    }else{
      if(psArea_arr && psArea_arr[tinx]){
        psArea_arr.splice(tinx,1)
      }
    }
    par.remove();

  })

  //数量+
  $('.feeWrap').delegate('.plus','click',function(){
    var par = $(this).closest('.areaNum')
    var inp = par.find('input');
    var oldNum = inp.val()*1?inp.val()*1:0;
    if(inp.hasClass('xuNum')){//续件/最低购买件数 1件起
      oldNum>0?oldNum:1;
    }
    var count = oldNum+1;
    inp.val(count);
    if(inp.hasClass('xuNum')){
      if(count >1){
        par.find('.rec').removeClass('disabled');
      }
    }else{
      par.find('.rec').removeClass('disabled');
    }
    
  })
  //数量减
  $('.feeWrap').delegate('.rec','click',function(){
    if($(this).hasClass("disabled")) return;
    var par = $(this).closest('.areaNum')
    var inp = par.find('input');
    var oldNum = inp.val()*1?inp.val()*1:1;
    if(inp.hasClass('xuNum')){//续件 1件起
      oldNum>1?oldNum:2;
    }
    var count = parseFloat((oldNum-1).toFixed(2));
    console.log(count)
    if(inp.hasClass('xuNum')){//续件 1件起
      if(count == 1)
      $(this).addClass('disabled');
    }else{
      
      if(count <= 1){
        console.log(555)
        count = 1;
        $(this).addClass('disabled');
      }
      
    }
    inp.val(count);

  })
  /***************商家配送*****************************/
  //
  //起送价/配送模式
  $('.valuation .radio span').click(function(e){
    var inpval = $(this).attr('data-id');
    $(this).addClass('curr').siblings('span').removeClass('curr');
    if(inpval == 0){//固定配送费
      $('.delivery_fix').removeClass('fn-hide');
      $('.delivery_random').addClass('fn-hide');
    }else{//按距离
      $('.delivery_fix').addClass('fn-hide');
      $('.delivery_random').removeClass('fn-hide');
    }
    $('#valuation').val(inpval)
  })
  //免配送费开关
  $('.delivery_fix .switch').click(function(){
    var t = $(this);
    var oldVal = $('#fixover').val()?$('#fixover').val():'';
    if(oldVal>0){
      t.attr('data-price',oldVal);
    }
    if($(this).hasClass('active')){
      
      $(this).removeClass('active');
      $('#openFree').val('0');
      $('#fixover').val('').attr('readonly','true')
    }else{
      $(this).addClass('active');
      $('#openFree').val('1');
      $('#fixover').val(t.attr('data-price')).removeAttr('readonly')
    }
  })

  //增加不同距离外送费
  $('.ranfeeAdd').click(function(){
    var sbm = $(this).siblings('.feeWrap');
    var feeHtml = [];
    feeHtml.push('<div class="mealform">');
    feeHtml.push('<div class="feeBox">');
    feeHtml.push('  <div class="feeDel"></div>');
    feeHtml.push('  <div class="psjuli">');
    feeHtml.push('    <span>配送距离</span>');
    feeHtml.push('    <input type="text" placeholder="请输入距离" class="juliSt" onkeyup="xiaoshu(this)">');
    feeHtml.push('    <em class="sunit">公里</em>');
    feeHtml.push('    <i class="zhi"></i>');
    feeHtml.push('    <input type="text" placeholder="请输入距离" class="juliEd" onkeyup="xiaoshu(this)">');
    feeHtml.push('    <em class="sunit">公里</em>');

    feeHtml.push('  </div>');
    feeHtml.push('  <div class="comdl">');
    feeHtml.push('    <span>外送费</span><input type="text" placeholder="请输入价格" class="ranfee" onkeyup="xiaoshu(this)"><em class="unit">'+echoCurrency('short')+'</em>');
    feeHtml.push('  </div>');
    feeHtml.push('  <div class="comdl">');
    feeHtml.push('    <span>起送价</span><input type="text" placeholder="请输入价格" class ="ranbasic" onkeyup="xiaoshu(this)"><em class="unit">'+echoCurrency('short')+'</em>');
    feeHtml.push('  </div>');     
    feeHtml.push('</div>');

    sbm.append(feeHtml.join(''));
  })
  //删除距离外送费
  $('.feeWrap').delegate('.feeDel','click',function(){
    var par = $(this).closest('.feeBox');
    par.remove();
  })

  //立即添加
  $('.addBtn').click(function(){
    var btn = $(this),btntxt = btn.find('a').text();
    if(btn.hasClass("disabled")) return;
    var logistype = $('#logistype').val(),//快递--商家
        cityid = $('#cityid').val(),
        title = $('.comCon.comShow .title').val(),
        note      = $('.comCon.comShow .knowCont').html();//运费说明
    //商家配送相关值    
    var valuation  = $('#valuation').val(),//固定--按距离
        fixbasic  = $('#fixbasic').val(),//固定起送价
        fixjuli  = $('#fixjuli').val(),//最大距离
        fixfee    = $('#fixfee').val(),//固定配送费
        openFree  = $('#openFree').val(),//免配送费
        fixover   = $('#fixover').val();//满减金额
    //快递邮寄相关值    
    var calcType  = $('#calcPr').val(),//按件数/重量/体积
        freeArea  = $('#freeArea').val(),//指定包邮-- 开关    
        noFreeArea  = $('#noFreeArea').val();//指定区域不配送 开关    

    if(!title){
      showErrAlert('请输入模板名称');
      return false;
    }   
    //商家配送
    if(logistype == 1){      
      //固定配送
      if(valuation == 0){
        if(!fixbasic){
          showErrAlert('请输入固定起送价');
          return false;
        }
        if(!fixfee){
          showErrAlert('请输入固定配送费');
          return false;
        }
        if(openFree == 1){
          if(!fixover){
            showErrAlert('请输入免配送费的金额');
            return false;
          }
        }
      }else{//按距离
        var feeJuli = [];
        $('.feeWrap .feeBox').each(function(){
          var t = $(this);
          var juliSt = t.find('.juliSt').val(),
              juliEd = t.find('.juliEd').val(),
              ranfee = t.find('.ranfee').val(),
              ranbasic = t.find('.ranbasic').val();
          if(juliSt > juliEd){
            juliSt = t.find('.juliEd').val(); 
            juliEd = t.find('.juliSt').val(); 
          }
          var ranArr = [];
          if(juliSt)
          ranArr.push(juliSt)
          if(juliEd)
          ranArr.push(juliEd)
          if(ranfee)
          ranArr.push(ranfee)
          if(ranbasic)
          ranArr.push(ranbasic)
          if(ranArr.length == 4)
          feeJuli.push(ranArr);
        })
        if(feeJuli.length == 0){
          showErrAlert('请配置不同距离外送费');
          return false;
        }
        console.log(JSON.stringify(feeJuli))

      }
    }else{
      //配送运费及区域
      var logisticArea_arr =[];
      var expar = $('.delivery_area.peisong').find('.feeBox:first-child');
      var shouNum = expar.find('.shouNum').val()?expar.find('.shouNum').val():'0';
      var shoufee = expar.find('.shoufee').val()?expar.find('.shoufee').val():'0';
      var xuNum = expar.find('.xuNum').val()?expar.find('.xuNum').val():'1';
      var xufee = expar.find('.xufee').val()?expar.find('.xufee').val():'0';
      logisticArea_arr.push({
        area:'默认全国',
        express_start:shouNum,
        express_postage:shoufee,
        express_plus:xuNum,
        express_postageplus:xufee,
      });
      if(psArea_arr.length >1){//有新增
          $('.peisong .feeBox').each(function(tindx){
            if(tindx > 0){ 
              var areaVal = $(this).find('.areaSt').val();
              var shouNum2 = $(this).find('.shouNum').val()?$(this).find('.shouNum').val():'0';
              var shoufee2 = $(this).find('.shoufee').val()?$(this).find('.shoufee').val():'0';
              var xuNum2 = $(this).find('.xuNum').val()?$(this).find('.xuNum').val():'1';
              var xufee2 = $(this).find('.xufee').val()?$(this).find('.xufee').val():'0';
              if(areaVal){
                logisticArea_arr.push({
                  area:psArea_arr[tindx],
                  express_start:shouNum2,
                  express_postage:shoufee2,
                  express_plus:xuNum2,
                  express_postageplus:xufee2,
                });
              }
            }
          })
      }
      if(freeArea == 1){//开启指定包邮
        var freeArr = [];
        if(baoyArea_arr.length ==0){
          showErrAlert('请至少配置一个包邮地区');
          return false;
        }else{
          $('.baoyou .feeBox').each(function(tindx){
            var areaVal = $(this).find('.areaSt').val();
            var minum = $(this).find('.minbuyNum').val()?$(this).find('.minbuyNum').val():'1';
            var minamount = $(this).find('.minbuyPrice').val()?$(this).find('.minbuyPrice').val():'0.01';
            if(areaVal){
              freeArr.push({
                area:baoyArea_arr[tindx],
                preferentialStandard:minum,
                preferentialMoney:minamount,
              })
            }

          })
          if(freeArr.length == 0){
            showErrAlert('请至少配置一个包邮地区');
            return false;
          }
        }
        
        
      }
      if(noFreeArea == 1){//开启指定区域不配送
        var noFreeAreaArr = [];
        if(nopsArea_arr.length ==0){
          showErrAlert('请选择不配送地区');
          return false;
        }else{
          $('.nopeis .feeBox').each(function(tindx){
            var areaVal = $(this).find('.areaSt').val();
            if(areaVal){
              noFreeAreaArr = nopsArea_arr[tindx];
            }

          })
          if(noFreeAreaArr.length == 0){
            showErrAlert('请选择不配送地区');
            return false;
          }
        }
      }
    }

    // if(!note){
    //   showErrAlert('请输入运费说明');
    //   return false;
    // }
    var data = [];
    data.push('title='+title);
    data.push('content='+note);
    data.push('cityid='+cityid);
    //商家配送
    if(logistype == 1){
      data.push('delivery_fee_mode='+valuation);
      if(valuation == 0){
        data.push('basicprice='+fixbasic);
        data.push('express_postage='+fixfee);
        data.push('express_juli='+fixjuli);
        data.push('preferentialMoney='+fixover);
        data.push('openFree='+openFree);
      }else{
        data.push('range_delivery_fee_value='+JSON.stringify(feeJuli));
      }
    }else{//快递邮寄
      data.push('valuation='+calcType);
      data.push('freeArea='+freeArea);
      data.push('noFreeArea='+noFreeArea);

      data.push('logisticArea='+JSON.stringify(logisticArea_arr));
      if(freeArea == 1){//开启指定包邮
        data.push('freeArr='+JSON.stringify(freeArr));
      }
      if(noFreeArea == 1){//开启指定区域不配送
        data.push('noFreeAreaArr='+JSON.stringify(noFreeAreaArr));
      }

    }
    data.push('logistype='+logistype);
    btn.addClass("disabled").find('a').html(langData['siteConfig'][6][35]+"...");
    var action = $('#fabuForm').attr('action'),url = $('#fabuForm').attr('data-url');
    $.ajax({
      url: action,
      data: data.join('&'),
      type: "POST",
      dataType: "json",
      success: function (data) {
        if(data && data.state == 100){
          var tip = langData['siteConfig'][20][341];  //发布成功
          if(editId !=0){
            tip = data.info;
          }
          showErrAlert(tip);
          setTimeout(function(){
            location.href = url;
          }, 1000)
        }else{
          showErrAlert(data.info);         
          btn.removeClass("disabled").find('a').html(btntxt);

          
        }
      },
      error: function(){
        showErrAlert(langData['siteConfig'][20][183]);
        btn.removeClass("disabled").find('a').html(btntxt);
      }
    });
  })

})
function xiaoshu(obj){
    obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3'); //只能输入两个小数
}
function zhengshu(obj){
    obj.value = obj.value.replace(/[^0-9]/g,''); //只能整数
}