$(function(){
  //开始时间
  		$(".form_datetime .add-aft").datetimepicker({
  			format: 'yyyy-mm-dd hh:ii:ss',
  			autoclose: true,
  			language: 'ch',
  			todayBtn: true,
  			minuteStep: 15,
  			startDate:new Date(),
  			linkField: "startdate",
  		});
      $(".form_datetime input").datetimepicker({
  			format: 'yyyy-mm-dd hh:ii:ss',
  			autoclose: true,
  			language: 'ch',
  			todayBtn: true,
  			minuteStep: 15,
  			startDate:new Date(),
  			linkField: "startdate",
  		});
      console.log($('#number').val())
      if($('#number').val()){
          var quannum = $('#number').val();
          var html = [];
          html.push('<option value="0">请选择</option>');
          var limitGet = litmit?litmit:1;
          for(var i = limitGet; i <= quannum; i++){
              var select = '';
              if(limit ==i){
                  select = 'selected';
              }
              html.push('<option value="'+i+'" '+select+'>'+i+'</option>');
          }
          $("#quanlimit").html(html.join(''))
      }

      $("#number").change(function(event) {
        /* Act on the event */
        var quannum = $(this).val();
        var html = [];
        html.push('<option value="0">请选择</option>');
        var limitGet = litmit?litmit:1;
        for(var i = limitGet; i <= quannum; i++){
            var select = '';
            if(limit ==i){
                select = 'selected';
            }
          html.push('<option value="'+i+'" '+select+'>'+i+'</option>');
        }
        $("#quanlimit").html(html.join(''))
      });


      $("#submit").click(function(){
        var starttime = $("#startdate").val();  //截止时间
        var yhmoney = $("#yhmoney").val();   //优惠金额
        var manjian = $("#manjian").val();   //满减
        var quannum = $("#quannum").val();   //发放数
        var quanlimit = $("#quanlimit").val();   //限领数
        var shopid = $("#shopid").val();   //指定店铺id
        if(starttime == ''){
          alert('请选择截止时间');
          return false;
        }
        if(yhmoney == ''){
          alert('请输入优惠金额');
          return false;
        }
        if(manjian == ''){
          alert('请输入使用门槛');
          return false;
        }
        if(quannum == ''){
          alert('请输入发放数量');
          return false;
        }
        if(quanlimit == ''){
          alert('请选择限领数量');
          return false;
        }
        if(shopid == ''){
          alert('请选择店铺');
          return false;
        }

        var form = $("#shop-form");
        console.log(form.serializeArray())

          $.ajax({
              url: '',
              type: "POST",
              data: form.serializeArray(),
              dataType: "json",
              success: function (data) {
                  if(data.state==100){
                      alert(data.info);
                      location.href = 'waimaiQuan.php';
                  }else{
                      alert(data.info);
                      windows.reload();
                  }
              },
              error:function () {

              }
          });
        return false;

      })
})
