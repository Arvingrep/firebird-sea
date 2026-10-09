var page = new Vue({
  el:"#page",
  data:{
    navList:navList,  //左侧导航
    currid:currid, //左侧导航当前高亮
    hoverid:'',
    loading:false, //加载中
    gwinfo:gwinfo !='' ? JSON.parse(gwinfo)[0]:[],
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
    submit:function(){
      var tt = this;
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
      let phoneRule = /^[1][3-9]\d{9}$|^([6|9])\d{7}$|^[0][9]\d{8}$|^[6]([8|6])\d{5}$/; //验证国内手机号
      let areaCode=$('#areaCode').val(); //区号
      let phoneNumber=$('#phoneNumber').val();
      if(areaCode=='86'&&!phoneRule.test(phoneNumber)){ //国内
        alert('请输入正确的手机号！')
        return false;
      }
      if(stop) return false;
      var url = '/include/ajax.php?service=house&action=loupanGuwenAdd&dopost=edit&loupanid='+loupanid+'&aid='+aid;
      if(!aid){
            url = '/include/ajax.php?service=house&action=loupanGuwenAdd&dopost=add&loupanid='+loupanid;
      }
      axios({
        method: 'post',
        url: url,
        data:form.serialize(),
      })
          .then((response)=>{
            tt.loading = false;
            var data = response.data;
            tt.loading = false;
            if(data.state == 100){
              alert(data.info);
                window.location.href = masterDomain+'/supplier/loupan/adviser.html';
            }else{
              alert(data.info);
            }
          });

      console.log(form.serializeArray())

    },
  }
})
