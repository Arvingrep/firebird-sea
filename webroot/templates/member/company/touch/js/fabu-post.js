$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');
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
                        $('.areacode_span').closest('.ml4r').hide();
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
        $(".areacode_span em").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })
  var zhinengArr = [];
  function getTypeList(param, callback){
    $.ajax({
      url: masterDomain+"/include/ajax.php?" + param,
      type: "GET",
      dataType: "jsonp",
      success: function (data) {
        if(data.state == 100){
          callback(data.info);
        }
      },
      error: function(){
      }
    });
  }

  // 职位类别
  getTypeList('service=job&action=type&son=1', function(data){
    var typeSelect = new MobileSelect({
        trigger: '#choicetype',
        title: $('#choicetype').parent().siblings('dt').find('label').text(),
        wheels: [
          {data : data}
        ],
        keyMap: {
          id: 'id',
          value: 'typename',
          childs: 'lower'
        },
        transitionEnd:function(indexArr, data){
        },
        callback:function(indexArr, data){
          $("#type").val(data[data.length-1].id);
        }
      });
  });
  // 选择性别
  var sexSelect = new MobileSelect({
    trigger: '#choicesex',
    title: $('#choicesex').parent().siblings('dt').find('label').text(),
    wheels: [
      {data : sexList}
    ],
    transitionEnd:function(indexArr, data){
    },
    callback:function(indexArr, data){
      $("#sex").val(data[data.length-1].id);
    }
  });
  // 职位性质
  var natureSelect = new MobileSelect({
    trigger: '#choicenature',
    title: $('#choicenature').parent().siblings('dt').find('label').text(),
    wheels: [
      {data : natureList}
    ],
    transitionEnd:function(indexArr, data){
    },
    callback:function(indexArr, data){
      $("#nature").val(data[data.length-1].id);
    }
  });
  // 工作经验
  getTypeList('service=job&action=item&type=1', function(data){
    new MobileSelect({
        trigger: '#choiceexperience',
        title: $('#choiceexperience').parent().siblings('dt').find('label').text(),
        wheels: [
          {data : data}
        ],
        keyMap: {
          id: 'id',
          value: 'typename',
          childs: 'lower'
        },
        transitionEnd:function(indexArr, data){
        },
        callback:function(indexArr, data){
          $("#experience").val(data[data.length-1].id);
        }
      });
  });
  // 学历要求
  getTypeList('service=job&action=item&type=2', function(data){
    new MobileSelect({
        trigger: '#choiceeducational',
        title: $('#choiceeducational').parent().siblings('dt').find('label').text(),
        wheels: [
          {data : data}
        ],
        keyMap: {
          id: 'id',
          value: 'typename',
          childs: 'lower'
        },
        transitionEnd:function(indexArr, data){
        },
        callback:function(indexArr, data){
          $("#educational").val(data[data.length-1].id);
        }
      });
  });
  // 薪资范围
  getTypeList('service=job&action=item&type=3', function(data){
    new MobileSelect({
        trigger: '#choicesalary',
        title: $('#choicesalary').parent().siblings('dt').find('label').text(),
        wheels: [
          {data : data}
        ],
        keyMap: {
          id: 'id',
          value: 'typename',
          childs: 'lower'
        },
        transitionEnd:function(indexArr, data){
        },
        callback:function(indexArr, data){
          $("#salary").val(data[data.length-1].id);
        }
      });
  });

  //年月日
  $('#valid').scroller(
    $.extend({preset: 'date', dateFormat: 'yy-mm-dd'})
  );


  //提交发布
  $("#submit").bind("click", function(event){

    event.preventDefault();

    var addrids = $('.gz-addr-seladdr').attr('data-ids').split(' ');
    $('#addrid').val($('.gz-addr-seladdr').attr('data-id'));
    $('#cityid').val(addrids[0]);

    var t           = $(this),
        title       = $("#title"),
        type        = $("#type"),
        valid       = $("#valid"),
        number      = $("#number"),
        addrid      = $("#addrid"),
        experience  = $("#experience"),
        educational = $("#educational"),
        salary      = $("#salary"),
        tel         = $("#tel"),
        email       = $("#email");

    if(t.hasClass("disabled")) return;

    //职位名称
    if($.trim(title.val()) == "" || title.val() == 0){
      alert(langData['siteConfig'][27][61]);
      $(window).scrollTop(title.offset().top);
      return;
    }

    //职位类别
    if($.trim(type.val()) == "" || type.val() == 0){
      alert(langData['siteConfig'][26][173]);
      $(window).scrollTop(type.parent().offset().top);
      return;
    }

    //有效期
    if($.trim(valid.val()) == "" || valid.val() == 0){
      alert(langData['siteConfig'][20][22]);
      $(window).scrollTop(valid.parent().offset().top);
      return;
    }

    //招聘人数
    if($.trim(number.val()) == ""){
      alert(langData['siteConfig'][27][120]);
      $(window).scrollTop(number.offset().top);
      return;
    }

    //工作地点
    if($.trim(addrid.val()) == "" || addrid.val() == 0){
      alert(langData['siteConfig'][27][63]);
      $(window).scrollTop(addrid.parent().offset().top);
      return;
    }

    //工作经验
    if($.trim(experience.val()) == "" || experience.val() == 0){
      alert(langData['siteConfig'][27][64]);
      $(window).scrollTop(experience.parent().offset().top);
      return;
    }

    //学历要求
    if($.trim(educational.val()) == "" || educational.val() == 0){
      alert(langData['siteConfig'][27][65]);
      $(window).scrollTop(educational.parent().offset().top);
      return;
    }

    //薪资范围
    if($.trim(salary.val()) == "" || salary.val() == 0){
      alert(langData['siteConfig'][27][66]);
      $(window).scrollTop(salary.parent().offset().top);
      return;
    }

    //联系方式
    if($.trim(tel.val()) == "" || tel.val() == 0){
      alert(langData['siteConfig'][20][433]);
      $(window).scrollTop(tel.offset().top);
      return;
    }

    //联系邮箱
    if($.trim(email.val()) == "" || email.val() == 0){
      alert(langData['siteConfig'][27][18]);
      $(window).scrollTop(email.offset().top);
      return;
    }

    // t.addClass('disabled');

    var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), data = form.serialize();

    $.ajax({
      url: action,
      data: data,
      type: "POST",
      dataType: "json",
      success: function (data) {
        if(data && data.state == 100){

          location.href = url;

        }else{
          alert(data.info);
          t.removeClass("disabled");
        }
      },
      error: function(){
        alert(langData['siteConfig'][20][183]);
        t.removeClass("disabled");
      }
    });



  });

  $("#fabuForm").submit(function(e){
    e.preventDefault();
    $("#submit").click();
  })


})
