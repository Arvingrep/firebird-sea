var page = new Vue({
  el:"#page",
  data:{
    navList:navList,  //左侧导航
    currid:currid, //左侧导航当前高亮
    hoverid:'',
    loading:false, //加载中
  },
  mounted(){
    $("#hdStart, #hdEnd").datetimepicker({CustomFormat: 'yyyy-mm-dd hh:mm', DateFormat:'Custom', autoclose: true, minView: 0, language: 'ch'});
  },
  methods:{
    // 显示切换账户
    show_change:function(){
      $(".change_account").show()
    },

    // 隐藏切换账户
    hide_change:function(){
      $(".change_account").hide()
    },

    // 提交数据
    submit:function(dotype){
      var tt = this;
      if(tt.loading) return false;
      tt.loading = true;
      var stop = false, form = $("#form");
      $('.required').each(function(){
          var t = $(this);
          if(t.find('input').length==1 &&t.find('input').val()=='' ){
            alert(t.find('input').attr('placeholder'))
            stop = true;
            return false;
          }else if(t.find('input').length>1 &&t.find('input.imglist-hidden').val()==''){
            alert(t.find('input.imglist-hidden').attr('placeholder'))
            stop = true;
            return false;
          }
      })

      var start = $("#hdStart").val();
      var end = $("#hdEnd").val();
      if((new Date(start)).valueOf() > (new Date(end)).valueOf()){
        alert('活动结束时间选择有误，请重新选择')
        stop = false;
        return false;
      }

      if(stop) return false;
      axios({
        method: 'post',
        url: '/include/ajax.php?service=house&action=loupanHuodongEdit',
        data: form.serialize(),
      })
          .then((response) => {
            tt.loading = false;
            var data = response.data;
            tt.loading = false;
            if (data.state == 100) {
              window.location.href = masterDomain+'/supplier/loupan/huodong.html';
              alert(data.info);
            } else {
              alert(data.info);
            }
          });

    },
  }
})
