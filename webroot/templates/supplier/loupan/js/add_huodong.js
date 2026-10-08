var pageVue = new Vue({
  el:"#page",
  data:{
    article_id:id,
    navList:navList,  //左侧导航
    currid:currid, //左侧导航当前高亮
    hoverid:'',
    loading:false, //加载中
    type:[
      {
        id:1,
        title:'看房专车'
      },
      {
        id:2,
        title:'立减'
      },
      {
        id:4,
        title:'返现'
      },
      {
        id:3,
        title:'折扣'
      },
      {
        id:5,
        title:'其他'
      }
    ],
    typeId:1, //活动类型id
    title:'', //活动标题
    discount:'', //优惠值
    unit:1, //1:每套 2:每平米
    thumb:'', //活动封面
    showThumb:'', //活动封面展示
    startTime:'', //活动报名开始时间/优惠有效期开始时间
    endTime:'', //活动报名结束时间/优惠有效期结束时间
    deadline:'', //领取截止时间
    note:'', //活动说明
  },
  mounted(){
    let tt =this;
    $("#hdStart, #hdEnd,#deadline").datetimepicker({format: 'yyyy-mm-dd hh:mm', autoclose: true, minView: 0, language: 'ch'}).on('change',function(e){
      const id = $(this).attr('id');
      switch(id) {
        case 'hdStart':
          tt.startTime = $(this).val();
          break;
        case 'hdEnd':
          tt.endTime = $(this).val();
          break;
        case 'deadline':
          tt.deadline = $(this).val();
          break;
      }
    });
    if(this.article_id) this.getDetail();
    backsuccessFn = res => {
      this.$nextTick(() => {
        this.thumb = res.url;
      });
    }
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
    tabFn(id){
      let tt =this;
      this.typeId=id;
      this.$nextTick(res=>{
        $("#hdStart, #hdEnd,#deadline").datetimepicker({format: 'yyyy-mm-dd hh:mm', autoclose: true, minView: 0, language: 'ch'}).on('change',function(e){
          const id = $(this).attr('id');
          switch(id) {
            case 'hdStart':
              tt.startTime = $(this).val();
              break;
            case 'hdEnd':
              tt.endTime = $(this).val();
              break;
            case 'deadline':
              tt.deadline = $(this).val();
              break;
          }
        });
      })
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
            tt.loading = false;
            return false;
          }else if(t.find('input').length>1 &&t.find('input.imglist-hidden').val()==''){
            alert(t.find('input.imglist-hidden').attr('placeholder'))
            stop = true;
            tt.loading = false;
            return false;
          }
      })

      var start = $("#hdStart").val();
      var end = $("#hdEnd").val();
      if((new Date(start)).valueOf() > (new Date(end)).valueOf()){
        alert('活动结束时间选择有误，请重新选择')
        stop = false;
        tt.loading = false;
        return false;
      }

      if(stop) return false;
      axios({
        method: 'post',
        url: `/include/ajax.php?service=house&action=route&route=property/${this.article_id?'editLoupanActivity':'addLoupanActivity'}&lpid=${loupanid}&id=${this.article_id||''}`,
        data: form.serialize(),
      }).then((response) => {
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
    async getDetail() {
      let result = await axios({
        method: 'post',
        url: `/include/ajax.php?service=house&action=route&route=property/loupanActivityData&id=${this.article_id}`,
      });
      if (result.data.state == 100) {
        let detail = result.data.info.data;
        this.typeId = detail.type; //活动类型
        this.title = detail.title; //活动标题
        this.thumb = detail.litpic; //活动封面
        this.showThumb = detail.litpicUrl;
        if(detail.type == 2||detail.type == 3||detail.type == 4){ //优惠
          this.discount = detail.value; //优惠值
          this.unit = detail.unit; //1:每套 2:每平米
          let dtime = new Date(detail.deadline*1000);
          this.deadline = `${dtime.getFullYear()}-${dtime.getMonth()+1}-${dtime.getDate()} ${dtime.getHours()}:${dtime.getMinutes()}`; //领取截止时间
        }
        let stime = new Date(detail.ktime*1000);
        this.startTime = `${stime.getFullYear()}-${stime.getMonth()+1}-${stime.getDate()} ${stime.getHours()}:${stime.getMinutes()}`;
        let etime = new Date(detail.etime*1000);
        this.endTime = `${etime.getFullYear()}-${etime.getMonth()+1}-${etime.getDate()} ${etime.getHours()}:${etime.getMinutes()}`;
        this.note = detail.note;
      }
    }
  }
})
