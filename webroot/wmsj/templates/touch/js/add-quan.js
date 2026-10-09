new Vue({
	el:'#page',
	data:{
    LOADING:false,
  },
  mounted(){
    mobiscroll.settings = {
       theme: 'ios',
       themeVariant: 'light',
       height:40,
       headText:true,
   };

   mobiscroll.datetime('#endtime', {
       controls: ['datetime'],
       display: 'bottom',
       min: new Date(),
       headerText:'请选择开始时间',
       lang:'zh',
       dateFormat: 'yy-mm-dd',
       // stepMinute: jiange,
       timeFormat:'HH:ii',
       minuteText:'分',
       hourText:'时',
       disabledTime:true,
   });


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
  },

  methods:{
    submit(){
      var el = event.currentTarget;
      if($(el).hasClass('disabled')) return false;
      $(el).addClass('disabled')
      var endTime = $("#endtime").val();
      var yhmoney = $("#yhmoney").val();
      var manjian = $("#manjian").val();
      var number = $("#number").val();
      if(!endTime){
        showErrAlert('请选择截止时间');
        return false;
      }
      if(!yhmoney){
        showErrAlert('请输入优惠金额');
        return false;
      }
      if(!number){
        showErrAlert('请输入发放数目');
        return false;
      }

      var form = $("#formBox");
      $.ajax({
          url: '',
          type: "POST",
          data: form.serializeArray(),
          dataType: "json",
          success: function (data) {
            $(el).removeClass('disabled')
              if(data.state==100){
                  showErrAlert(data.info);
                  location.href = 'manage-quan.php?sid='+sid;
              }else{
                  showErrAlert(data.info);
                  window.reload();
              }
          },
          error:function () {

          }
      });
    }
  }
})
