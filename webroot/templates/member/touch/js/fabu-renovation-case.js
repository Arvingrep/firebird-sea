
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
			console.log(percentage)
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

    //房屋类型
    getHuxing()
    function getHuxing(){
        $.ajax({
          type: "POST",
          url: "/include/ajax.php?service=renovation&action=type&type=8",
          dataType: "json",
          success: function(res){
                if(res.state==100 && res.info){
                    var list = res.info;                   
                    var huxinSelect = new MobileSelect({
                          trigger: '.room_type',
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
                            $('#room_type').val(data[0].typename);
                            $('.room_type .choose span').hide();
                            $('#units').val(data[0].id);
                            
                          }
                          ,triggerDisplayData:false,
                    });
                }
          }
      });
    }
    

    //类别
    var cateSelect = new MobileSelect({
        trigger: '.category ',
        title: '',
        wheels: [
            {data: [
                    {id:'0',value:langData['renovation'][3][38]},//家装
                    {id:'1',value:langData['renovation'][3][39]}//公装
                ]
              }            
        ],
        position:[0, 0],
        callback:function(indexArr, data){
            $('#category').val(data[0].value);
            $('#typeId').val(data[0].id);
            $('.category .choose span').hide();
            if(data[0].id == 0){//家装
              $('.roomType_li').show();
              $('.comstyle_li').hide();
            }else{//公装
              $('.roomType_li').hide();
              $('.comstyle_li').show();
            }
        }
        ,triggerDisplayData:false,
    });

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

                            $('#btypeName').val(data[0].typename);
                            $('.btype .choose span').hide();
                            $('#btype').val(data[0].id)
                          }
                          ,triggerDisplayData:false,
                    });
                }
          }
      });
  }

  //公装类型
    getComstyle()
    function getComstyle(){
        $.ajax({
          type: "POST",
          url: "/include/ajax.php?service=renovation&action=type&type=3",
          dataType: "json",
          success: function(res){
                if(res.state==100 && res.info){
                    var list = res.info;                   
                    var typeSelect = new MobileSelect({
                          trigger: '.comstyle',
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

                            $('#comstyleName').val(data[0].typename);
                            $('.comstyle .choose span').hide();
                            $('#comstyle').val(data[0].id)
                          }
                          ,triggerDisplayData:false,
                    });
                }
          }
      });
  }
//单位
  $('#area').blur(function(){

      if($(this).val().length > 0 ){       
         $(this).siblings('label').css("color","#45464f");
      }
    });
  $('#price').blur(function(){

      if($(this).val().length > 0 ){       
         $(this).siblings('label').css("color","#45464f");
      }
    });

 // 选择日期
    $('#choosedate').mdater({
        maxDate: new Date(),
    });

    
    $('#choosedate').on('input propertychange', function(){

        var date = $('#choosedate').val();
        $('#start_time').val(date);
        $('.choosedate .choose span').hide();

    })
    //结束日期
  $('#choosedate2').mdater({
        minDate: new Date(),
    });
    
    
    $('#choosedate2').on('input propertychange', function(){

        var date = $('#choosedate2').val();
        $('#end_time').val(date);
        $('.choosedate2 .choose span').hide();

    })



    //擅长风格
    $('.art_ul').delegate('li', 'click', function () {
      $(this).toggleClass('active').siblings().removeClass('active')
    })


  
    // 信息提示框
    // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }

    //表单验证
    $('#btn-keep').click(function () {
      var f=$(this),txt = f.text();
       var anli_title = $('#anli_title');//标题
       var category = $('#category').val();//类别
       var btype = $('#btype').val();//方式
       var area = $('#area');//面积
       var price = $('#price');//造价
       var room_type = $('#room_type').val();//户型
       var start_time = $('#start_time').val();//开工日期
       var end_time = $('#end_time').val();//竣工日期
       var art_style=$('.art_ul li');
       var typeId = $('#typeId').val();
       var comstyle = $('#comstyle').val();//公装类型

        if(!anli_title.val()){
            anli_title.focus()
             showMsg(langData['renovation'][7][7]);  //请输入标题
            
        }else if(!category){
             showMsg(langData['renovation'][9][27]);  //请选择类别
            
        }else if(!btype){
             showMsg(langData['renovation'][15][38]);  //请选择装修方式
            
        }else if(!area.val()){
            area.focus()
             showMsg(langData['renovation'][9][28]);  //请输入面积
            
        }else if(!price.val()){
            price.focus()
             showMsg(langData['renovation'][9][29]);  //请输入造价
            
        }else if(!room_type && typeId == 0){//家装时
             showMsg(langData['renovation'][4][33]);  //请选择户型
            
        }else if(!comstyle && typeId == 1){//公装时
             showMsg(langData['renovation'][15][37]);  //请选择公装类型
            
        }else if(!start_time){
             showMsg(langData['renovation'][9][30]);  //请选择开工日期

        }else if(!end_time){
             showMsg(langData['renovation'][9][31]);  //请选择竣工日期
             
        }else if(!(art_style.hasClass('active'))){
             showMsg(langData['renovation'][9][32]);  //请选择您的擅长风格    

        }else if($('.store-imgs .imgshow_box').length == 0){
             showMsg(langData['renovation'][9][33]);  //请上传平面户型图
            
        }else if($('.store-imgs2 .imgshow_box').length == 0){
             showMsg(langData['renovation'][9][34]);  //请上传效果图
            
        }else{
          
            //户型图
            var pics1 = [];
            $("#fileList2").find('.thumbnail').each(function(){
                var src = $(this).find('img').attr('data-val');
                pics1.push(src);
            });
            console.log(pics1)
            $("#layout_pics").val(pics1.join(','));

            //效果图
            var pics2 = [];
            $("#fileList").find('.thumbnail').each(function(){
                var src = $(this).find('img').attr('data-val');
                pics2.push(src);
            });
            $("#albums_pics").val(pics2.join(','));
            
            var styleId = $('.art_ul li.active').attr('data-id')
            $('#style').val(styleId)
            f.addClass("disabled").text(langData['renovation'][14][58]);//保存中...
            var form = $("#fabuForm"), action = form.attr("action"),data = form.serialize(), url = form.attr('data-url');
          
            data += "&began="+$('#start_time').val();//开工日期
            data += "&end="+$('#end_time').val();//竣工日期
            //data += "&fid="+fid;
            //data += "&ftype="+ftype;
            $.ajax({
                url: action,
                data: data,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);
                    if(data && data.state == 100){
                        
                        if((data.info != undefined && data.info != "" && data.info != 0) || data.info =='修改成功'){
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