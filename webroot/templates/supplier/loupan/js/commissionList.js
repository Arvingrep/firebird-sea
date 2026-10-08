

  var payInfo = {
      "ids": "1",
      "total": 1,
      "amount": 0,
      "companyName": "苏州龙源房产开发公司",
      "cardNumber": "569873657521",
      "openingBank": "中国银行苏州分行",
      "openingName": "张凯",
      "cname": "李阳",
      "house": "8栋501",
      "gname": "营销总监",
      "aname": "杨侦"
  }
var pageVue = new Vue({
    el: '#page',
    data: {
        showPop:false,
        navList:navList,
        currid:currid,
        hoverid:'',


        tabOn:0,
        tabList:[
            { id:1, name:'佣金明细',page:1,totalCount:0,isload:false,pageSize:10,list:[],form:{} },
            { id:2, name:'提现处理',page:1,totalCount:0,isload:false,pageSize:10,list:[],form:{} },
        ],
        statusList:[ { id:-1, name:'全部' }, { id:1, name:'待提现' }, { id:2, name:'申请中' }, { id:3, name:'已到账' }, ],
        fxList:[],
        filterForm:{
            status:'',
            dcoid:!isNaN(dcoid) && (dcoid || dcoid === 0) ? Number(dcoid) : '', // 分销公司id
            startTime:'',
            endTime:'',
            keyword:'',
        },

        dateRange:'',
        pickerOptions: {
            shortcuts: [{
                text: '最近一周',
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                    picker.$emit('pick', [start, end]);
                }
            }, {
                text: '最近一个月',
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                    picker.$emit('pick', [start, end]);
                }
            }, {
                text: '最近三个月',
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                    picker.$emit('pick', [start, end]);
                }
            }]
        },

        choseList:[], //选中的数据

        // 弹窗相关
        certificateType:'verifyVisit', //操作类型
        reportPopShow:false, // 报备详情显示
        reportDetail:{}, // 报备详情
        loadDetail:false,
        qrShow:false, //是否显示二维码
        filterInfo:true, //是否过滤无效信息

        confirmPopShow:false, // 确认弹窗显示
        payInfo:payInfo, //打款信息
        note:''

    },
    mounted(){
        const that = this;
        that.getFxList()
        that.getCommissionList()


    },
    methods:{
         // 显示切换账户
        show_change: function () {
            $(".change_account").show()
        },

        // 隐藏切换账户
        hide_change: function () {
            $(".change_account").hide()
        },

        // 验证是否隐藏
        checkShow(list){
          const that = this;
          let show = false;
          for(let i = 0; i < list.length; i++){
            if(!list[i].hide){
              show = true;
              break;
            }
          }
          return show;
        },

        // 获取分销公司列表
        getFxList(){
            const that = this;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/distributorCompanyList&lpid=${loupanid}&page=1&pageSize=999999`
            $.ajax({
                url: url,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                       that.fxList = data.info.list
                       that.fxList.unshift({
                        id:-1,
                        dcoid:0,
                        name:'全民分销',
                       })
                    }
                },
                error: function (xhr, status, error) {
                }
            })
        },


        getCommissionList(){
            const that = this;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/commissionList&lpid=${loupanid}&page=${that.tabList[that.tabOn].page}&pageSize=${that.tabList[that.tabOn].pageSize}`
            if(that.tabList[that.tabOn].isload) return false; //表示正在加载中
            that.tabList[that.tabOn].isload = true;
            let formData = JSON.parse(JSON.stringify(that.filterForm));
            if(formData.dcoid == -1){
                formData.dcoid = 0
            }
            if(that.dateRange && that.dateRange.length){
                formData['startTime'] = that.dateRange[0]
                formData['endTime'] = that.dateRange[0]
            }else{
                formData['startTime'] = '';
                formData['endTime'] = '';
            }
            that.tabList[that.tabOn].form = formData
            if(that.tabOn){
                formData.status = 2;
            }
            $.ajax({
                url: url,
                type: "POST",
                data: formData,
                dataType: "json",
                success: function (data) {
                    that.tabList[that.tabOn].isload = false
                    if(data.state == 100){
                        that.tabList[that.tabOn].list = data.info.list
                    }
                },
                error: function (xhr, status, error) {
                    that.tabList[that.tabOn].isload = false
                }
            })
        },

        // 重新加载
        reloadList(){
            const that = this;
            that.tabList[that.tabOn].page = 1
            that.tabList[that.tabOn].isload = false;
            that.tabList[that.tabOn].totalCount = 0;
            that.tabList[that.tabOn].list = [];
            that.getCommissionList()
        },


        // tab切换
        changeTab(ind){
            const that = this;
            that.$refs[`table${that.tabOn + 1}`].clearSelection()
            that.choseList = []
            that.tabOn = ind;
        },

        // 显示报备详情
        showReportDetail(id){
            const that = this;
            that.reportPopShow = true;
            that.getReportDetail(id)
        },

        getReportDetail(id){
            const that = this;
            that.loadDetail = true;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/reportDetail&id=${id}`
            $.ajax({
                type: "POST",
                url: url,
                dataType: "json",
                success: function(data) {
                    that.loadDetail = false;
                    if(data.state == 100){
                        that.reportDetail = data.info;
                    }else{
                        showErrAlert(data.info);
                        that.reportPopShow = false;
                    }
                },
                error: function(xhr, status, error) {
                    that.reportPopShow = false;
                    that.loadDetail = false;
                }
            });
        },

        
        // 全选
        selectAll(val){
            const  that = this;
            if(val){
                // 全选
                that.$refs[`table${that.tabOn + 1}`].toggleAllSelection()
            }else{
                // 取消全选
                that.$refs[`table${that.tabOn + 1}`].clearSelection()
            }
        },

        selectAllRow(e){
            const  that = this;
            that.choseList = e
        },

        // 单行选中
        selectRow(e){
            const  that = this;
            that.choseList = e
        },

        /**
         * 处理手机号显示 三位以间隔
         * @param phone 处理的数字
         * @param encry 是否加密
         * */ 
        phoneFormat: function(phone,encry) {
            const that = this;
            let phoneStr = '';
            if(encry  && phone.length == 11){
                phoneStr =  phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
            }else{
                phoneStr =  phone;
            }
            // 判断输入框中的内容是否需要添加空格
            let phone_arr = phoneStr
            if (phone_arr.length > 3 && phone_arr.length < 8) {
                phoneStr = phone_arr.slice(0, 3) + ' ' + phone_arr.slice(3);
            } else if (phone_arr.length >= 8) {
                phoneStr = phone_arr.slice(0, 3) + ' ' + phone_arr.slice(3, 7) + ' ' + phone_arr.slice(7, 11);
            } else {
                phoneStr = phone_arr;
            }
            return phoneStr;
        },

        // 银行卡号格式化
        numFormat(cardnum) { 
            if(!cardnum) return ''
            let cardnum_arr = cardnum.toString().split('');
            let cardnumStr = '';
            for(let i = 0; i < cardnum_arr.length; i=i+4){
                cardnumStr += cardnum_arr.slice(i, i+4).join('') + ' ';
            }
            return cardnumStr;
        },

        // 获取打款明细
        getPaymentInfo(id){
            const that = this;
            if(!id){
                let idArr = that.choseList.map(item => {
                    return item.id;
                })
                id = idArr.join(',');
            }
            let url = `/include/ajax.php?service=house&action=route&route=marketing/getPaymentInfo&id=${id}`;
            $.ajax({
                type: "POST",
                url: url,
                dataType: "json",
                success: function(data) {
                    if(data.state == 100){
                        that.payInfo = data.info.list;
                    }else{
                        showErrAlert(data.info);
                    }
                },
                error: function() {
                    
                }
            });
        },

        showConfirmPop(id){
            const that = this;
            that.confirmPopShow = true;
            if(id){
                that.getPaymentInfo(id)
            }else{
                that.getPaymentInfo()
            }
        },

        // 确认打款
        confirmPayment(id){
            const  that = this;
            if(!id){
                let idArr = that.choseList.map(item => {
                    return item.id;
                })
                id = idArr.join(',');
            }
            let note = that.note
            if(!note){
                showErrAlert('请输入打款说明');
                return false;
            }
            let url = `/include/ajax.php?service=house&action=route&route=marketing/confirmPayment&id=${id}`;
            $.ajax({
                type: "POST",
                url: url,
                data: {note:note},
                dataType: "json",
                success: function(data) {
                    if(data.state == 100){
                        showErrAlert(data.info,'success')
                    }else{
                        showErrAlert(data.info)
                    }
                },
                error: function() {
                    showErrAlert('网络错误，请稍后再试')
                }
            });
        },
        // 导出列表
        exportCustomer(){
             let url = `/include/ajax.php?service=house&action=route&route=marketing/commissionList&lpid=${loupanid}&page=${that.tabList[that.tabOn].page}&pageSize=${that.tabList[that.tabOn].pageSize}&export=1`
             window.open(url)

        }
    },
})