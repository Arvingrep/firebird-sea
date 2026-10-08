
$(function () {
  //单位
  $('#area').blur(function(){

      if($(this).val().length > 0 ){       
         $(this).siblings('label').css("color","#45464f");
      }
    });
    //房屋类型
    var hx =[];
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
                            $('#units').val(data[0].id)
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
              $('.roomType_li,.pubWrap,.area_li').show();
              $('.comstyle_li').hide();
            }else{//公装
              $('.roomType_li,.pubWrap,.area_li').hide();
              $('.comstyle_li').show();
            }
        }
        ,triggerDisplayData:false,
    });
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


//风格
    $('.style').off('click').delegate('li', 'click', function () {

        $(this).toggleClass('active').siblings().removeClass('active');
    })

    
    $('.space').off('click').delegate('li', 'click', function () {
      $(this).toggleClass('active')
    })
    $('.local').off('click').delegate('li', 'click', function () {
      $(this).toggleClass('active')
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
       var category = $('#category');//类别
       var price = $('#price');//造价
       var area = $('#area');//面积
       var room_type = $('#room_type');//户型
       var style=$('.style li');//风格
       var space=$('.space li');//空间
       var local=$('.local li');//局部
       var styleid = $('.style li.active').attr('data-id')
       $('#style').val(styleid);
       var typeId = $('#typeId').val();
       var comstyle = $('#comstyle').val();//公装类型
        //效果图
        var pics = [];
        $("#fileList").find('.thumbnail').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#imglist").val(pics.join(','));
        //空间
        var kongjian = [];
        $(".space").find('.active').each(function(){
            var kid = $(this).attr('data-id');
            kongjian.push(kid);
        });
        $("#kongjian").val(kongjian.join(','));
        //空间
        var jubu = [];
        $(".local").find('.active').each(function(){
            var kid = $(this).attr('data-id');
            jubu.push(kid);
        });
        $("#jubu").val(jubu.join(','));
        if(!anli_title.val()){
            anli_title.focus()
             showMsg(langData['renovation'][7][7]);  //请输入标题
            
        }else if(!category.val()){
             showMsg(langData['renovation'][9][27]);  //请选择类别
            
        }else if(!room_type.val() && typeId == 0){
             showMsg(langData['renovation'][4][33]);  //请选择户型
            
        }else if(!area.val() && typeId == 0){
          area.focus();
          showMsg(langData['renovation'][9][28]);  //请输入面积
            
        }else if(!comstyle && typeId == 1){//公装时
             showMsg(langData['renovation'][15][37]);  //请选择公装类型
            
        }else if(!price.val()){
             showMsg(langData['renovation'][15][39]);  //请选择造价
            
        }else if($('.store-imgs2 ').length == 0){
             showMsg(langData['renovation'][9][34]);  //请上传效果图
            
        }else if(!(style.hasClass('active'))){
             showMsg(langData['renovation'][9][37]);  //请选择风格    

        }else if(!(space.hasClass('active'))  && typeId == 0){
             showMsg(langData['renovation'][9][38]);  //请选择空间  

        }else if(!(local.hasClass('active'))  && typeId == 0){
             showMsg(langData['renovation'][9][39]);  //请选择局部    

        }else{
          f.addClass("disabled").text(langData['renovation'][14][58]);//保存中...
          var form = $("#fabuForm"), action = form.attr("action"),data = form.serialize(), url = form.attr('data-url');
          $.ajax({
                url: action,
                data: data,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);
                    if(data && data.state == 100){
                        
                        // if(id != undefined && id != "" && id != 0){
                          $('.order_mask').show();
                          setTimeout(function(){
                            location.href = url;
                          },1000)

                        // }

                        
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