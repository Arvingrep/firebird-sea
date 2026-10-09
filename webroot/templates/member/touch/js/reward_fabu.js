var page_reward = new Vue({
  el:'#rewardPage',
  data:{
    hb_balance: Number(hb_balance) > 0 ? Number(hb_balance) : '',  //红包余额
    hb_num:Number(hb_num) > 0 ? Number(hb_num) : '',  //红包剩余个数
    share_money:Number(share_money) > 0 ? Number(share_money) : '',  //分享金额
    share_num:Number(share_num) > 0 ? Number(share_num) : '',  //红包剩余个数
    hbfmode: '0',  //红包分配方式
    setType:Number(setType),
    add_share:'',   //新增分享金额
    add_hb_num:'',   //新增红包个数
    add_hb_money:'',  //新增红包金额
    recTip:[1000, 500, 200, 50, 20],
    showShareTip:false,  //分享提示
    successTip:false,  //设置成功
    checkShare:Number(checkShrare),
    checkRead:Number(checkRead),
    ds_inp:false,
    noDot :false,
    dsNum:'',
    ds_num_in:[],
    showCountTip:false,
    countAll:0,
  },
  mounted(){
    var tt = this;
    $('body').on('touchstart',function(){
      if(tt.showShareTip){
        tt.showShareTip = false;
      }
    });



    $("body").click(function(e) {
      if($(e.target).closest('.ds_keyboard').length < 1 && $(e.target).closest('.divInp').length <1){
        tt.ds_inp = false;
      }

      // if($(e.target).closest('.mainUl').length >=1){
      //   tt.dsNum = '';
      //   tt.ds_num_in = [];
      // }
    });

    $(".hbAmount").click(function(){
      tt.ds_inp = true;
      var propname = $(this).attr('data-name')
      tt.ds_num_in = tt[propname].toString().split('')
      if($(this).hasClass('onEdit')) return false;
      $(".hbAmount").removeClass('onEdit');
      $(this).addClass('onEdit');
      var onEditOff = $('.onEdit').offset().top + 2 * $('.onEdit').height();
      var keyboardOff = $('.ds_keyboard').offset().top - $(".ds_keyboard").height();

      if(onEditOff >= keyboardOff){
        $('#formBox').css({
          'padding-bottom':(onEditOff - keyboardOff)+'px',
        });

        setTimeout(function(){
          $(window).scrollTop($(document).height())

        },300)
      }else{
        $('#formBox').css({
          'padding-bottom':'0',
        })
      }
    })
  },
  watch:{
    
    ds_num_in(val){
      var tt = this;
      var currEdit = $('.onEdit');
      var propname = currEdit.attr('data-name')
      tt[propname] = val.join('');
      tt.dsNum = val.join('');
    },
    ds_inp(val){
      var tt = this;
      if(!val){
        $(".hbAmount").removeClass('onEdit');
        $('#formBox').css({
          'padding-bottom':'0',
        })

      }

    },
    add_hb_money(val){
      var tt = this;
      // var share_money = tt.share_money;
      var share_num = tt.setType == 1 ? tt.add_share : tt.share_num;
      share_num = share_num ? share_num : 0;
      var share_money = share_money ? share_money : tt.share_money;
      if((val * 1 +  share_money * share_num)>0){
        tt.showCountTip = true
        tt.countAll = (val * 1 +  share_money * share_num) * (1 + jili_bili)
        tt.countAll = parseFloat(tt.countAll.toFixed(2))
      }else{
        tt.showCountTip = false;
      }
    },
    hb_balance(val){
      var tt = this;
      var share_money = share_money ? share_money : tt.share_money;
      var share_num = tt.setType == 1 ? tt.add_share : tt.share_num;
     
      if((val * 1 +  share_money * share_num)> 0){
        tt.showCountTip = true
        tt.countAll = (val * 1 +  share_money * share_num) * (1 + jili_bili)
        tt.countAll = parseFloat(tt.countAll.toFixed(2))
      }else{
        tt.showCountTip = false;
      }
    },
    share_money:function(val){
      var tt = this;
      var add_hb_money = tt.setType == 1 ? tt.add_hb_money : tt.hb_balance;
      if(add_hb_money * 1 +  val * tt.share_num){
        tt.showCountTip = true;
        tt.countAll = (add_hb_money * 1 +  val * tt.share_num) * (1 + jili_bili)
        tt.countAll = parseFloat(tt.countAll.toFixed(2))
      }else{
        tt.showCountTip = false;
      }
    },
    share_num:function(val){
      var tt = this;
      var add_hb_money = tt.setType == 1 ? tt.add_hb_money : tt.hb_balance;
      if((add_hb_money * 1 +  val * tt.share_money) > 0){
        tt.showCountTip = true;
        tt.countAll = (add_hb_money * 1 +  tt.share_money * val) * (1 + jili_bili)
        tt.countAll = parseFloat(tt.countAll.toFixed(2))
      }else{
        tt.showCountTip = false;
      }
    },

    add_share:function(val){
      var tt =this;
      var add_hb_money = tt.setType == 1 ? tt.add_hb_money : tt.hb_balance;
      var share_money = share_money ? share_money : tt.share_money;
      share_money = share_money ? share_money : 0


      console.log(add_hb_money,val,share_money)
      if((add_hb_money * 1 +  val * share_money) > 0){
        tt.showCountTip = true;
        tt.countAll = (add_hb_money * 1 +  share_money * val) * (1 + jili_bili)
        tt.countAll = parseFloat(tt.countAll.toFixed(2))
      }else{
        tt.showCountTip = false;
      }
    },
  },
  methods:{
    // 数字键盘
    numIn(){
      var tt = this;
      var el = event.currentTarget;
      var num = $(el).attr('data-id');
      if(tt.ds_num_in.indexOf('.') <= -1 || num != '.'){
        tt.ds_num_in.push(num);
      }

    },
    ds_delNum(){
      var tt = this;
      tt.ds_num_in.pop();
    },
    nextStep(){ //下一步
      var tt = this;
      var enEidt = $('.hbAmount.onEdit').closest('.inpBox');
      var ddInp = enEidt.next('.inpBox');
      if(ddInp.find('input[type="text"]').length > 0){
        ddInp.find('input[type="text"]').focus();
      }
      tt.ds_inp = false;


    },

    checkPlaceHolder(){
      var tt = this;
      var el = event.currentTarget;
      var txt = $(el).text();
      txt = txt.replace(/[^\d^\.]+/g,'');
      $(el).text(txt);
      if(txt == ''){
        $(el).closest('.divInp').addClass('placeholderOn')
      }else{
        $(el).closest('.divInp').removeClass('placeholderOn')
      }
    },
    // 输入红包金额
    changeHbAmount(type){
      var tt = this;
      var el = event.currentTarget;
      var txt = $(el).text();
      txt = txt.replace(/[^\d^\.]+/g,'');
      txt = Number(txt);
      if(type == 1){
        tt.add_hb_money = txt;
        // tt.hb_balance = hb_balance * 1 + txt ;
        console.log(tt.add_hb_money)
      }else{
        tt.hb_balance = txt;
      }

    },
    // 输入分享金额
    changeShareAmount(){
      var tt = this;
      var el = event.currentTarget;
      var txt = $(el).text();
      txt = txt.replace(/[^\d^\.]+/g,'');
      tt.share_money = txt;
    },

    // 提示框显示
    showRecTip(){
      var el = event.currentTarget;
      $(el).siblings('.recTip').show();
    },

    // 隐藏提示框
    hideRecTip(){
      var el = event.currentTarget;
      setTimeout(function(){
        $(el).siblings('.recTip').hide();
      },300)
    },

    // 提交
    submit(){
      var tt = this;
      // console.log($("#formBox").serialize())
      var form = $("#formBox"), action = form.attr("action"), url = form.attr("data-url"), tj = true;

      event.preventDefault();
      var t           = $(this)
      var mydata = $("#formBox").serialize();
      var strType = tt.setType ? '&type=add':'';
      mydata = mydata+strType
      if(($('input[name="hbAmount"]').val()=='' || $('input[name="hbAmount"]').val()=='0' || $('input[name="hbNum"]').val()=='' || $('input[name="hbNum"]').val()=='0') && ($('input[name="share_money"]').val()=='' || $('input[name="share_money"]').val()=='0' || $('input[name="hbshareNum"]').val()=='' || $('input[name="hbshareNum"]').val()=='0')){
        showErrAlert('请输入激励的金额和人数');
        $(".payBeforeLoading").hide()
        return false;
      }
      if($('input[name="hbAmount"]').val() > 0 && !$('input[name="hbNum"]').val()){
        showErrAlert('请输入激励人数');
        $(".payBeforeLoading").hide()
        return false;
      }
      if($('input[name="hbNum"]').val() > 0 && !$('input[name="hbAmount"]').val()){
        showErrAlert('请输入激励金额');
        $(".payBeforeLoading").hide()
        return false;
      }

      var shareInfo = 0,readInfo = 0;
      if($('input[name="share_money"]').val() > 0 || tt.checkShare > 0){
        shareInfo = 1;
      }

      if($('input[name="hbNum"]').val() > 0|| tt.checkRead > 0){
        readInfo = 1;
      }

      $.ajax({
        url: action,
        data: mydata+'&readInfo='+readInfo+'&shareInfo='+shareInfo,
        type: "POST",
        dataType: "json",
        success: function (data) {
          if (data && data.state == 100) {
            if (typeof (data.info) == 'object') {
              sinfo = data.info;
              service = 'siteConfig';
              $('#ordernum').val(sinfo.ordernum);
              $('#action').val('pay');

              $('#pfinal').val('1');
              $("#amout").text(sinfo.order_amount);
              $("#amount").val(sinfo.order_amount);

              $('.payMask').show();
              $('.payPop').css('transform', 'translateY(0)');
              $("#pordertype").val('payEncourage');
              //
              // if (totalBalance * 1 < sinfo.order_amount * 1) {
              //
              //   $("#moneyinfo").text('余额不足，');
              //
              //   $('#balance').hide();
              // }
              if (totalBalance * 1 < sinfo.order_amount * 1) {

                $("#moneyinfo").text('余额不足，');
                $("#moneyinfo").closest('.check-item').addClass('disabled_pay')

                $('#balance').hide();
              }

              if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
                $("#bonusinfo").text('额度不足，');
                $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
              }else if( bonus * 1 < sinfo.order_amount * 1){
                $("#bonusinfo").text('余额不足，');
                $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
              }else{
                $("#bonusinfo").text('');
                $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
              }


              ordernum = sinfo.ordernum;
              order_amount = sinfo.order_amount;

              payCutDown('', sinfo.timeout, sinfo);
            } else {
              if (device.indexOf('huoniao_Android') > -1) {
                setupWebViewJavascriptBridge(function (bridge) {
                  bridge.callHandler('pageClose', {}, function (responseData) {
                  });
                });
                location.href = data.info;
              } else {
                location.href = data.info + (data.info.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
              }
            }
          } else {
            $(".payBeforeLoading").hide()
            alert(data.info);
          }
        },
        error: function(){
          alert(langData['siteConfig'][20][183]);
          t.removeClass("disabled").html(langData['shop'][1][8]);
        }

      });
    },
  }
})
