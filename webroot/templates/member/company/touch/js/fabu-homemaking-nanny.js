//服务范围 点击叉号 关闭标签
function close_li(thisli){
    $(thisli).parent().remove();
    var range_num=$('.service-box .service li').length;
    $('.service-box .ser_range .num1').text(range_num);
}
var bodyheight = $(window).height();
//民族弹窗显示
function showNav() {
    $('body').css({
        overflow: 'hidden',
        height: bodyheight
    })
    $('.nav-container').addClass('active');
    $('.nav-mask').addClass('active');
}
//民族弹窗关闭
function closeNav() {
    $('.nav-container').removeClass('active');
    $('.nav-mask').removeClass('active');
    $('.nav-second li').removeClass('active');
    $('body').css({
        overflow: 'auto',
        height: 'auto'
    });
}

$(function () {

    toggleDragRefresh('off');  //取消下拉刷新
    
    //服务选择
     $('.service-box .ser_range .range_sure').click(function () {
        var range_value=$('.service_input').val();
       if(range_value.length>0){
            $('.service-box .service').append("<li><span>"+ range_value +"</span><img src='"+templatePath+"images/house_service/close_icon1.png' alt='' class='close_img' onclick='close_li(this)'></li>");
            var range_value=$('.service_input').val('');
            var range_num=$('.service-box .service li').length;
            $('.service-box .ser_range .num1').text(range_num);
       }

        if(range_num==10){
            $('.service-box .ser_range .range_sure button').attr({"disabled":"disabled"});
            var range_value=$('.service_input').val(langData['siteConfig'][45][100]);//最多只能添加10个
        }


    });

    function getChildType(){
      //学历
      $.ajax({
          type: "POST",
          url: masterDomain + "/include/ajax.php?service=homemaking&action=homemakingitemList&type=1&pageSize=99999",
          dataType: "jsonp",
          success: function(res){
              if(res.state==100 && res.info.list){
                  var educationSelect = new MobileSelect({
                      trigger: '.edu',
                      title: '',
                      wheels: [
                          {data:res.info.list}
                      ],
                      position:[0],
                      callback:function(indexArr, data){
                          $('#educationname').val(data[0]['value']);
                          $('#education').val(data[0]['id']);
                          $('.edu .choose span').hide();
                      }
                      ,triggerDisplayData:false,
                  });
              }
          }
      });
      //民族
      $.ajax({
        type: "POST",
        url: masterDomain + "/include/ajax.php?service=homemaking&action=homemakingitemList&type=2&pageSize=99999",
        dataType: "jsonp",
        success: function(res){
            if(res.state==100 && res.info.list){
              var html = [], list = res.info.list;
              for (var i = 0; i < list.length; i++) {
                html.push('<li data-id="'+list[i].id+'">'+list[i].typename+'</li>');
              }
              $(".national").html(html.join(' '));
            }
        }
      });
      //从业经验
      $.ajax({
        type: "POST",
        url: masterDomain + "/include/ajax.php?service=homemaking&action=homemakingitemList&type=3&pageSize=99999",
        dataType: "jsonp",
        success: function(res){
            if(res.state==100 && res.info.list){
                var educationSelect = new MobileSelect({
                    trigger: '.working',
                    title: '',
                    wheels: [
                        {data:res.info.list}
                    ],
                    position:[0],
                    callback:function(indexArr, data){
                        $('#work_year').val(data[0]['value']);
                        $('#experience').val(data[0]['id']);
                        $('.working .choose span').hide();
                    }
                    ,triggerDisplayData:false,
                });
            }
        }
      });


  }
 getChildType();

    //服务户数
    var numArr =[
      {id:'0',value:'0户'},
      {id:'1',value:'1户'},
      {id:'2',value:'2户'},
      {id:'3',value:'3户'},
      {id:'4',value:'4户'},
      {id:'5',value:'5户'},
      {id:'6',value:'6户'},
      {id:'7',value:'7户'},
      {id:'8',value:'8户'},
      {id:'9',value:'9户'},
      {id:'10',value:'10户'},
      {id:'11',value:'10户以上'},
    ];
    var huxinSelect = new MobileSelect({
        trigger: '.fuwu_num ',
        title: '',
        wheels: [
            {data: numArr}

        ],
        position:[0, 0],
        callback:function(indexArr, data){
            $('#service_num').val(data[0]['value']);
            $('#servicenums').val(data[0]['id']);
            $('.fuwu_num .choose span').hide();
        }
        ,triggerDisplayData:false,
    });

    $('.nav-mask').click(function () {
      closeNav()
    })

    $(".nav-second").delegate("li","click",function(){
      var nowtext = $(this).text(), id = $(this).attr('data-id');
      closeNav();
      $('.nation #nation_choose').val(nowtext);
      $('.nation #nation').val(id);
      $('.nation .text').text('');
    })

    //工作类型和内容
    $('.work_content li').click(function () {
        $('.work_mask').show();
    })
    $('.work_close').click(function () {
        $('.work_mask').hide();

    })

    $('.save').click(function () {
      var work_txt = '';
      var ids = '';
      $('.work_type1 li').each(function () {
        if($(this).hasClass("active") ){
          work_txt += $(this).html() + ' ';
          ids += $(this).attr('data-id') + ',';
        }
      });
      ids = ids.substr(0, ids.length - 1);

      if(ids!=''){
        $('#work_lei').val(work_txt);
        $('#nature').val(ids);
        $('.work_ty1').text('');
      }else{
        $('#nature').val('');
        $('#work_lei').val('');
        $('.work_ty1').text(langData['homemaking'][2][28]);
      }

      var work_txt1 = '';
      var ids1 = '';
      $('.work_type2 li').each(function () {
        if($(this).hasClass("active") ){
          work_txt1 += $(this).html() + ' ';
          ids1 += $(this).attr('data-id') + ',';
        }
      });
      ids1 = ids1.substr(0, ids1.length - 1);

      if(ids1!=''){
        $('#work_nei').val(work_txt1);
        $('#naturedesc').val(ids1);
        $('.work_ty2').text('');
      }else{
        $('#naturedesc').val('');
        $('#work_nei').val('');
        $('.work_ty2').text(langData['homemaking'][2][28]);
      }
      $('.work_mask').hide();
    })
     //类型

    $('.work_type1 li').click(function () {
        $(this).toggleClass('active');
    })
    //内容
    $('.work_type2 li').click(function () {
        $(this).toggleClass('active');
    })

// 上传身份证
  var upqjShowS = new Upload({
    btn: '#up_qj',
    bindBtn: '#qjshow_box .addbtn_more',
    title: 'Images',
    mod: modelType,
    params: 'type=atlas',
    atlasMax: 2,
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
        $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'" />');
      }
    },
    uploadFinished: function(){
      if(this.sucCount == this.totalCount){

      }else{
        showMsg(langData['siteConfig'][44][19].replace('1',(this.totalCount - this.sucCount)));//1张图片上传失败
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
    var t = $(this), val = t.siblings('img').attr('data-url');console.log(val);
    upqjShowS.del(val);
    t.siblings('.img').remove();
    t.remove();
    updateQj('del');
  })
  function updateQj(){
    var qj_type = $('#qj_type').val();
    var qj_file = [];
    if(qj_type == 0){
      $("#qjshow_box li").each(function(i){
        var img = $(this).find('img');
        if(img.length){
          var src = img.attr('data-url');
          qj_file.push(src);
        }
      })
      $('#qj_pics').val(qj_file.join(','));
      $('#qj_url').val('');
    }else{
      $('#qj_pics').val('');
    }
  }

  // 上传健康证
  var upqjShow = new Upload({
    btn: '#up_other',
    bindBtn: '#other_box .addbtn_more',
    title: 'Images',
    mod: modelType,
    params: 'type=atlas',
    atlasMax: 2,
    deltype: 'delAtlas',
    replace: false,
    fileQueued: function(file, activeBtn){
      var btn = activeBtn ? activeBtn : $("#up_qj");
      var p = btn.parent(), index = p.index();
      $("#other_box li").each(function(i){
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
        $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'" />');

      }
    },
    uploadFinished: function(){
      if(this.sucCount == this.totalCount){
        // showErr('所有图片上传成功');
      }else{
        showMsg(langData['siteConfig'][44][19].replace('1',(this.totalCount - this.sucCount)));//1张图片上传失败
      }

      updateQj();
    },
    uploadError: function(){

    },
    showErr: function(info){
      showMsg(info);
    }
  });
  $('#other_box').delegate('.del_btn', 'click', function(){
    var t = $(this), val = t.siblings('img').attr('data-url');console.log(val);
    upqjShow.del(val);
    t.siblings('.img').remove();
    t.remove();
    updateQj('del');
  })
  function updateQj(){
    var qj_type = $('#qj_type').val();
    var qj_file = [];
    if(qj_type == 0){
      $("#other_box li").each(function(i){
        var img = $(this).find('img');
        if(img.length){
          var src = img.attr('data-url');
          qj_file.push(src);
        }
      })
      $('#qj_pics').val(qj_file.join(','));
      $('#qj_url').val('');
    }else{
      $('#qj_pics').val('');
    }
  }
//补充更多信息
    $('.more_btn').bind('click',function(){
        $('.more_info').show();
    });
    // 信息提示框
    // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }

    //表单验证
    function isPhoneNo(p) {
        var areaCode = parseInt($("#areaCode").val());
        if(areaCode == 86){
            var pattern = /^1[23456789]\d{9}$/;
            return pattern.test(p);
        }
        return true;
    }
    $('#btn-keep').click(function () {
        $('#addrid').val($('.gz-addr-seladdr').attr('data-id'));
        var addrids = $('.gz-addr-seladdr').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);
        $('#place').val(addrids[0]);
        event.preventDefault();

        var t = $(this);

        var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;

        var comname = $('#comname').val();//姓名
        var phone = $('#phone').val();//手机
        var age = $('#age').val();//年龄
        var addrid = $('#addrid').val();//籍贯
        var education = $('#education').val();//学历
        var work_year = $('#experience').val();//从业经验
        var work_ty1=$("#nature").val();//工作类型
        var work_ty2=$("#naturedesc").val();//工作内容

        if(t.hasClass("disabled")) return;

        if(!comname){
            showMsg(langData['homemaking'][5][5]); //请输入姓名
            tj = false;
        }else if(!phone){
            showMsg(langData['homemaking'][5][6]);  //请输入联系方式
            tj = false;
        }else if (isPhoneNo($.trim($('#phone').val())) == false) {
            showMsg(langData['homemaking'][5][7]);  //手机号码不正确
            tj = false;
        }else if($('.store-imgs .imgshow_box').length == 0){
            showMsg(langData['homemaking'][5][8]);  //请上传人员照片
            tj = false;
        }else if(age==''){
            showMsg(langData['homemaking'][5][9]);  //请输入年龄
            tj = false;
        }else if(addrid==''){
            showMsg(langData['homemaking'][5][10]);  //请选择籍贯
            tj = false;
        }else if(education==''){
            showMsg(langData['homemaking'][5][11]);  //请选择学历
            tj = false;
        }else if(work_year==''){
            showMsg(langData['homemaking'][5][12]);  //请选择从业经验
            tj = false;
        }else if(work_ty1==''){
            showMsg(langData['homemaking'][5][13]);  //请选择服务范围
            tj = false;
        }else if(work_ty2==''){
            showMsg(langData['homemaking'][5][13]);  //请选择服务范围
            tj = false;
        }

        //获取图片的
		    var pics = [];
        $("#fileList").find('.thumbnail').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#photo").val(pics.join(','));

        $("#qjshow_box li").each(function(i){
          var img = $(this).find('img');
          if(img.length){
            var src = img.attr('data-url');
          }
          src = src == undefined ? '' : src;
          if(i==0){
            $("#idcardFront").val(src);
          }else if(i==1){
            $("#idcardBack").val(src);
          }
        });

        $("#other_box li").each(function(i){
          var img = $(this).find('img');
          if(img.length){
            var src = img.attr('data-url');
          }
          src = src == undefined ? '' : src;
          if(i==0){
            $("#healthchart").val(src);
          }else if(i==1){
            $("#cookingchart").val(src);
          }
        });

        if(!tj) return;

        $('#btn-keep').addClass("disabled").html(langData['siteConfig'][6][35]+"...");	//提交中

	      $.ajax({
	        url: action,
	        data: form.serialize(),
	        type: "POST",
	        dataType: "json",
	        success: function (data) {
	            if(data && data.state == 100){
	            	var tip = langData['siteConfig'][20][341];
                if(id != undefined && id != "" && id != 0){
                  tip = langData['siteConfig'][20][229];
                }
                location.href = url;
	            }else{
					      showMsg(data.info);
	            	t.removeClass("disabled").html(langData['siteConfig'][11][19]);		//立即发布
	            }
	        },
	        error: function(){
				      showMsg(langData['siteConfig'][20][183]);
	            t.removeClass("disabled").html(langData['siteConfig'][11][19]);		//立即发布
	        }
      });



    });


});
