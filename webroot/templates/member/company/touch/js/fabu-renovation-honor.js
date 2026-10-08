$(function () {
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
          $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'" data-val="'+response.url+'"/>');

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
      $('#litpic').val('');
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
      $('#litpic').val(qj_file.join(','));
      
    }
    // 信息提示框
    // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }


    $('#btn-keep').click(function () {
        var f= $(this),txt=f.text();
        var article_tit = $('#article_tit');//标题
        if(!article_tit.val()){
              article_tit.focus()
             showMsg(langData['renovation'][7][13]);  //请输入标题
            
        }else if($('.qjimg_box .img').length == 0){
             showMsg(langData['renovation'][10][16]);  //请上传资质图片
            
        }else{
            f.addClass("disabled").text(langData['renovation'][14][58]);//保存中...
            //图集
            var pics1 = [];
            $("#qjshow_box ").find('.img').each(function(){
                var src = $(this).find('img').attr('data-val');
                pics1.push(src);
            });
            $("#litpic").val(pics1.join(','));
            
            var form = $("#fabuForm"),data = form.serialize(), action = form.attr('action'), url = form.attr('data-url');
            console.log(data);
            $.ajax({
                url: action,
                data: data,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);
                    if(data && data.state == 100){
                        
                          showMsg(langData['siteConfig'][6][39]);//保存成功
                          setTimeout(function(){
                            location.href = url;
                          },1000)


                        
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

});