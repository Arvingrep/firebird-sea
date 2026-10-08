var ue;
var pageVue = new Vue({
  el: "#page",
  data: {
    loading: false,
    navList: navList,  //左侧导航
    currid: currid, //左侧导航当前高亮
    hoverid: '',
    loading: false,
    article_id: id,
    type: [
      {
        id: 1,
        title: '施工进度'
      },
      {
        id: 2,
        title: '销售信息'
      },
      {
        id: 4,
        title: '交房'
      },
      {
        id: 3,
        title: '加推'
      }
    ],
    typeActive: 0, //时刻类型
    imgSrc: '',
    showImg: '',
    buildListData: buildList || [], //楼栋列表
    buildShow: false, //显示楼栋选择
    houseShow: false, //显示户型
    formInfo: '', //详情描述
    deliveryTime: '', //交房时间
  },
  mounted() {
    let tt = this;
    $("#hdStart").datetimepicker({ format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch' }).on('change', function (e) {
      tt.deliveryTime = $(this).val(); //更新vue数据
    });
    if (this.article_id) this.getDetail();
    backsuccessFn = res => {
      this.$nextTick(() => {
        this.imgSrc = res.url;
      });
    }
  },
  methods: {
    // 显示切换账户
    show_change: function () {
      $(".change_account").show();
    },

    // 隐藏切换账户
    hide_change: function () {
      $(".change_account").hide();
    },

    // 提交
    submit: function () {
      var tt = this;
      var form = $("#form");
      if (tt.loading) return false;
      tt.loading = true;
      let nowDate = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
      axios({
        method: 'post',
        url: `/include/ajax.php?service=house&action=route&route=property/${this.article_id ? 'editLoupanMoment' : 'addLoupanMoment'}&lpid=${loupanid}&eventTime=${nowDate}&id=${this.article_id || ''}`,
        data: form.serialize(),
      })
        .then((response) => {
          var data = response.data;
          tt.loading = false;
          if (data.state == 100) {
            alert(data.info);
            location.reload();
          } else {
            alert(data.info)
          }
        });
    },
    async getDetail() {
      let result = await axios({
        method: 'post',
        url: `/include/ajax.php?service=house&action=route&route=property/loupanMomentData&id=${this.article_id}`,
      });
      if (result.data.state == 100) {
        let detail = result.data.info.data;
        this.typeActive = this.type.findIndex((item) => item.id == detail.type); //时刻类型
        this.imgSrc = detail.images[0]; //图片
        this.showImg = detail.images_url[0];
        this.formInfo = detail.info; //描述
        if (detail.buildings) { //楼栋
          this.buildListData.forEach(item => {
            let buildArr = detail.buildings.split(',').filter(res => res);
            if (buildArr.includes(item.name)) {
              item.active = true;
            }
          });
        }
        if (detail.housetype) { //户型
          this.houseListData.forEach(item => {
            let houseArr = detail.housetype.split(',').filter(res => res);
            if (houseArr.includes(item.id)) {
              item.active = true;
            }
          })
        }
        //交房时间
        let dtime = new Date(detail.delivery_time * 1000);
        this.deliveryTime = `${dtime.getFullYear()}-${dtime.getMonth() + 1}-${dtime.getDate()}`;
      }
    }
  },
  computed: {
    buildItem() {
      return this.buildListData.filter(res => res.active);
    },
    buildId() {
      let id = this.buildItem.map(res => res.name).join(',');
      return id;
    },
    houseListData() { //户型列表
      let arr = this.buildItem.map(res => res.houseType).flat(1);
      return [...new Map(arr.map(item => [item.id, item])).values()];
    },
    houseItem() {
      return this.houseListData.filter(res => res.active);
    },
    houseId() {
      let id = this.houseItem.map(res => res.id).join(',');
      return id;
    },
  }
})
