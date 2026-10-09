$(function () {
    //app端取消下拉刷新
    toggleDragRefresh('off');
    var juFlag = 0;
    //input获得焦点时光标自动定位到文字后面
    $('input[type="text"]').click(function(){
        var tid = $(this).attr('id');
        if(tid && juFlag == 0){
            var sr=document.getElementById(tid);
            po_Last(sr)
        }               
    })
    $('input[type="text"]').blur(function(){
        juFlag = 0;
    })

    function po_Last(obj) {
        juFlag = 1;
        obj.focus();//解决ff不获取焦点无法定位问题
        if (window.getSelection) {//ie11 10 9 ff safari
            var max_Len=obj.value.length;//text字符数
            obj.setSelectionRange(max_Len, max_Len);
        }
        else if (document.selection) {//ie10 9 8 7 6 5
            var range = obj.createTextRange();//创建range
            range.collapse(false);//光标移至最后
            range.select();//避免产生空格
        }
    }
    //选择运营类别
    $('.category-list li').click(function () {
        $(this).toggleClass('active');
        var ids = [];
        $('.category-list li').each(function(){
            if($(this).hasClass('active')){
                ids.push($(this).data('id'));
            }
        })
        $('#categoryture').val(ids.join(","));
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
          $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'" data-val="'+response.url+'" />');

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
          // showErr('所有图片上传成功');
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
      $('#logo').val('');
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
      $('#logo').val(qj_file.join(','));
      
    }
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

    //查看示例
    $('.tipLi span').click(function(){
        $('.mask-case,.example').show();
    })

    $('.mask-case,.closeEx i').click(function(){
        $('.mask-case,.example').hide();
    })

    //表单验证
    function isPhoneNo(p) {
        var areaCode = parseInt($("#areaCode").val());
        if(areaCode == 86){
            var pattern = /^1[23456789]\d{9}$/;
            return pattern.test(p);
        }
        return true;
    }

    $('#btn-keep').click(function (e) {
        var categoryture = $('#categoryture').val();
        var type = $('#type_text').val();
        var comname = $('#comname').val();
        var addrid =$('#addrid').val();
        var address = $('#address').val();
        var phone = $('#phone').val();
        var note = $('#com_profile').html();

        e.preventDefault();
        var t = $("#fabuForm"), action = t.attr('data-action');
        t.attr('action', action);
        var addrid = 0, cityid = 0, r = true;

        if(!comname){
            r = false;
            showErr(langData['marry'][4][9]);//请输入公司名称！
            return;
        }else if(!address){
            r = false;
            showErr(langData['marry'][4][11]);//请填写详细地址！
            return;
        }else if(!phone){
            r = false;
            showErr(langData['marry'][4][12]);//请输入手机号！
            return;
        }else if(categoryture == ''){
            r = false;
            showErr(langData['marry'][4][4]); //请选择分类！
            return;
        }else if($('.qjimg_box .img').length == 0){
             r = false;
            showErr(langData['siteConfig'][21][129]);//请上传LOGO
            return;
            
        }else if($('.store-imgs .imgshow_box').length == 0){
            r = false;
            showErr(langData['marry'][8][15]);//请上传店铺环境！
            return;
        }else if(!note){
            r = false;
            showErr(langData['marry'][7][30]);//请输入店铺描述
            return;
        }
      
        //店铺所在地
        var ids = $('.gz-addr-seladdr').attr("data-ids");
        if(ids != undefined && ids != ''){
            addrid = $('.gz-addr-seladdr').attr("data-id");
            ids = ids.split(' ');
            cityid = ids[0];
        }else{
            r = false;
            showErr(langData['siteConfig'][28][63]);  //请选择所在地
            return;
        }
        $('#addrid').val(addrid);
        $('#cityid').val(cityid);

        //店铺环境
        var pics = [];
        $("#fileList").find('.thumbnail').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#pics").val(pics.join(','));

        //店铺视频
        var video = [];
        $("#fileList2").find('.thumbnail').each(function(){
            var src = $(this).find('video').attr('data-val');
            video.push(src);
        });
        $("#video").val(video.join(','));

        if(!r){
            return;
        }

        $.ajax({
			url: action,
			data: t.serialize()+'&note='+note,
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
                    showErr(data.info);
				}else{
                    showErr(data.info);
				}
			},
			error: function(){
                showErr(langData['siteConfig'][6][203]);
			}
		})

        
        
    });

    //错误提示
    var showErrTimer;
    function showErr(txt){
        showErrTimer && clearTimeout(showErrTimer);
        $(".popErr").remove();
        $("body").append('<div class="popErr"><p>'+txt+'</p></div>');
        $(".popErr p").css({"margin-left": -$(".popErr p").width()/2, "left": "50%"});
        $(".popErr").css({"visibility": "visible"});
        showErrTimer = setTimeout(function(){
            $(".popErr").fadeOut(300, function(){
                $(this).remove();
            });
        }, 1500);
    }




});