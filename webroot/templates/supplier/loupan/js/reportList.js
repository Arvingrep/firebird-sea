


var pageVue = new Vue({
    el: '#page',
    data(){
        return{
            showPop:false,
            navList:navList,
            currid:currid,
            hoverid:'',

            mpermission:mpermission, //当前登录用户分销权限
            permission:permission, //当前登录用户分销权限
            // 不同状态 有更新权限的 显示待成交 其他不显示
            state_ind:0,
            stateList:[{id:10,name:'全部',count:0},{ id:11, name:'报备审核', count:0 ,checkRight:1},{ id:12, name:'待到访', count:0 ,checkRight:2},{ id:13, name:'到访核实', count:0,checkRight:2 },{ id:14, name:'待成交', count:0 ,checkRight:3},{ id:15, name:'成交核实', count:0,checkRight:4 },{ id:16, name:'已成交', count:0 ,checkRight:4},{ id:17, name:'已失效', count:0 ,checkRight:4}],
            listData:{
                page:1,
                list:[],
                total:0,
                pageSize:20,
                isload:false, //是否正在加载
                pageInfo:{}
            }, //数据列表
                
            fxList:[
            ], //分销活动筛选
            filterForm:{
                source:1, //来源
                dtype:dcoid ? 1 : '', //分销类型
                dcoid:dcoid ? Number(dcoid) : '', //分销公司id
                keyword:'', //搜索关键字
                pageType:10,
            },
            choseList:[], //选择的数据

            // 提交成交信息
            currChose:{}, //当前选择操作的数据
            dealPopShow:false, //成交信息弹窗
            formData:{
                source:1, //来源
                dcoid:'', //分销公司id
                id:'', //分销报备记录表id
                house:'', //房源信息
                ctype:1, //成交资料类型 1-认购协议书 2-购房合同
                purchase:'', //成交金额
                contract:'', //合同或者购房协议 值
                receipt:'', //收款票据
                dong:'',  //栋
                danyuan:'', //单元
                hao:'', //号
            },
            contract:[], //购房协议数组 ↑上面用的
            receipt:[],
            // 到访凭证弹窗
            certificateType:'verifyVisit', //凭证类型  默认核实到访
            certificatePopShow:false,
            currOn:0, //轮播图 当前显示的索引
            

            // 核实弹窗的
            verifyObj:{
                auditReport:['无效客户','无效电话','无购房意向'],
                verifyVisit:['缺少/无效视频','缺少/无效照片','缺少到访单'],
                verifyDeal:['缺少资料','无效资料','未成交']
            },
            isAjax:false, //是否正在请求中
            popperShow:false,
            verifyForm:{
                ind:0,
                mark:'',
                message:'',
            },

            reportPopShow:false, // 报备详情显示
            reportDetail:{}, // 报备详情
            qrShow:false, //是否显示二维码
            filterInfo:true, //是否过滤无效信息
        }

    },
    mounted(){
        const that = this;

        if(pageType){
            let objInd = that.stateList.findIndex(item => item.id == pageType);
            if(objInd > -1){
                that.state_ind = objInd;
                that.filterForm.pageType = Number(pageType);
            }
        }


        that.getStatistics(); //获取统计数据
        that.getFxList();//获取分销公司列表
        that.getList(); //获取列表数据


        $('body').delegate('.confirm_header.canClick span','click',function(){
            $(this).addClass('on_chose').siblings().removeClass('on_chose');
            that.verifyForm.ind = $(this).index()
            that.verifyForm.message = $(this).text()
        })
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

        // 获取分销公司列表
        getFxList(){
            const that = this;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/distributorCompanyList&lpid=${loupanid}&page=1&pageSize=999999`
            $.ajax({
                url: url,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    that.listData.isload = false;
                    if(data.state == 100){
                       that.fxList = data.info.list
                       that.fxList.unshift({
                        dcoid:-1,
                        name:'全民分销',
                        dtype:2,
                       })
                    }
                },
                error: function (xhr, status, error) {
                    that.listData.isload = false;
                }
            })
        },


        changeDcoid(id){
            const that = this;
            if(id == -1){
                // 全民分销
                // that.filterForm.dcoid = '';
                that.filterForm.dtype = 2;
            }else{
                that.filterForm.dcoid = id;
                that.filterForm.dtype = 1;
            }

            that.reloadList();
        },


        // 重新获取列表
        reloadList(){
            const that = this;
            that.listData.list = [];
            that.listData.pageInfo = {};
            that.listData.page = 1;
            that.listData.isload = false;

           
            that.getList(); 
        },

        getList(){
            const that = this;
            if(that.listData.isload) return false;
            that.listData.isload = true;
            let form = JSON.parse(JSON.stringify(that.filterForm))
            if(form.dcoid == -1){
              form.dcoid = 0
            }
            let url = `/include/ajax.php?service=house&action=route&route=marketing/reportList&lpid=${loupanid}&page=${that.listData.page}&pageSize=${that.listData.pageSize}`
            $.ajax({
                url: url,
                data:form,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    that.listData.isload = false;
                    if(data.state == 100){
                        that.listData.list = data.info.list;
                        that.listData.page = data.info.pageInfo.page;
                        that.listData.total = data.info.pageInfo.totalCount;
                        that.listData.pageInfo =  data.info.pageInfo
                    }
                },
                error: function (xhr, status, error) {
                    that.listData.isload = false;
                }
            })
        },

        // tab切换
        tabChange(key){
            const  that = this;
            that.state_ind = key;
            that.filterForm.pageType = that.stateList[key].id;
            that.reloadList()

        },


        // 全选
        selectAll(val){
            const  that = this;
            if(val){
                // 全选
                that.$refs.tableData.toggleAllSelection()
                that.choseList = JSON.parse(JSON.stringify(that.listData.list))
            }else{
                // 取消全选
                that.$refs.tableData.clearSelection()
                that.choseList = []
            }
        },

          // 导出客户
        exportCustomer(){
            const that = this;
            // let currLoad = that.crmSource[that.crmSource_ind];
            // if(currLoad.isload) return false;
            // currLoad.isload = true;
            // let url = `/include/ajax.php?service=house&action=route&route=marketing/exportCustomer&lpid=${loupanid}&class=${currLoad.id}&type=${currLoad.lower && currLoad.lower.length && currLoad.lower[that.crmSource_type_ind].id}`
            // let filterStrArr = [];
            // for(let i in that.filterData){
            //     if(that.filterData[i]){
            //         filterStrArr.push(i + '=' + that.filterData[i])
            //     }
            // }
            // url += '&' + filterStrArr.join('&')
            // window.open(url)

            let form = JSON.parse(JSON.stringify(that.filterForm))
            if(form.dcoid == -1){
              form.dcoid = ''
            }
            form['export'] = 1;
            let formArr = []
            for(let i in form){
                if(form[i]){
                    formArr.push(i + '=' + form[i])
                }

            }
            let url = `/include/ajax.php?service=house&action=route&route=marketing/reportList&lpid=${loupanid}&${formArr.join('&')}`
            window.open(url)
        },

         // 导入客户 有2个步骤 上传文件  导入文件

        // step1 上传文件
        uploadFile(event,key,type = 'file'){
            const that = this;
            let file = event.target['files'][0]            
            if (window.FileReader) {
                var reader = new FileReader();
                reader.readAsDataURL(file); 
                reader.onload = function(e) {
                    var formData = new FormData();
                    let tempPath = this.result;
                    formData.append("Filedata", file);
                    formData.append("name", file.name);
                    formData.append("lastModifiedDate", file.lastModifiedDate);
                    formData.append("size", file.size);
                    if(type != 'file'){
                        that.$set(that.formData,key + '_path',tempPath)
                    }
                    
                   
                    $.ajax({
                        accepts:{},
                        url: '/include/upload.inc.php?mod=house&type=atlas&filetype='+type,
                        data: formData,
                        type: "POST",
                        processData: false, // 使数据不做处理
                        contentType: false,
                        dataType: "json",
                        success: function (data) {
                            if(data.state == 'SUCCESS'){
                                if(type == 'file'){
                                    that.importCustomer(data.url)
                                }else{
                                    if(key  == 'contract' || key == 'receipt'){
                                        // 可以传多张
                                        that[key].push({
                                            url:data.url,
                                            path:data.turl
                                        })
                                    }else{
                                        that.$set(that.formData,key,data.url)
                                        that.$set(that.formData,key + '_path',data.turl)
                                    }
                                }
                            }else{
                                alert('文件上传失败，请稍后重试');
                               
                            }
                        },
                        error: function () { }
                    });
                    
                }
            } 
        },


        // 删除上传的图片
        delFile(ind,key){
            const that = this;
            that[key].splice(ind,1)
        },
        importCustomer(filePath){
            const that = this;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/importCustomer&lpid=${loupanid}`
            $.ajax({
                data:{
                   file:filePath
                },
                url:url,
                dataType:'json',
                success:(res)=>{
                    that.$message({
                        message: res.info,
                        type: res.state == 100 ? 'success' : 'error'
                    });

                    that.reloadList()
                }
            })
        },

        // 获取统计数据
        getStatistics(){ 
            const that = this;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/reportListStatus&lpid=${loupanid}&source=1&dcoid=${that.filterForm.dcoid}`
            $.ajax({
                url: url,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        let info = data.info;
                        for(let i = 0; i < that.stateList.length; i++){
                            that.stateList[i].count = info[`total${that.stateList[i].id}`]
                        }
                    }
                },
                error: function (xhr, status, error) {
                    
                }
            })
        },
        
        // 显示成交信息提交弹窗
        showDealPop(obj){
            const that = this;
            that.currChose = obj;
            that.dealPopShow = true;
            that.formData.dcoid = that.currChose.dcoid
            that.formData.id = that.currChose.id
        },


        // 提交数据 id => 提交不同类型数据
        /**
         * 14 =>  成交信息
         * */ 
        submitData(id){
            const that = this;
            let flag = that.checkForm(id)
            if(!flag) return false;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/submitDealInfo&lpid=${loupanid}`
            let formdata  = that.formData
            $.ajax({
                type: "POST",
                url: url,
                data: formdata,
                dataType: "json",
                success: function(data) {
                    if(data.state == 100){
                        showErrAlert(data.info,'success')
                    }else{
                        showErrAlert(data.info)
                    }
                }
            });
        },

        // 验证数据是否符合
        checkForm(id){
            const that = this;
            let flag = true;
            if(id == 14){ // 提交成交信息资料
                if(that.currChose.commissionType == 1 && !that.formData.purchase){
                    showErrAlert('请填写成交金额')
                    flag = false
                }else if(that.contract.length == 0){
                    showErrAlert('请上传认购证明')
                    flag = false
                }else if(that.receipt.length == 0){
                    showErrAlert('请上传收款收据')
                    flag = false
                }

                if(flag){
                    let contract = that.contract.map(item => {
                        return item.url
                    })
                    let receipt = that.contract.map(item => {
                        return item.url
                    })
                    that.formData.contract = contract.join(',')
                    that.formData.receipt = receipt.join(',')
                    that.formData.house = [that.formData.dong,that.formData.danyuan,that.formData.hao].join(',')
                }
            }


            return flag
        },


        /**
         * 确认弹窗
         * @param {string} type 确认弹窗类型
         * @param {object} obj 确认弹窗的操作对象
         * @param {boolean} isDetail 确认弹窗的操作对象是否为详情
         * */ 
        confirm_heshi(type = 'verifyVisit',obj = {},isDetail = 0){
            const that = this;
            that.currChose = obj.id && obj || that.currChose;
            let className = 'confirm-dialog confirm-sm-dialog';
            let html = '',tit = '',btn = '';
            if(that.currChose && that.currChose.id){

                html = `<span style='color:#3377FF;'>【${that.currChose.dcoid ? '渠道' : '全民'}分销】</span>${that.currChose.reportUser} ${that.currChose.visitTime.replace(/-/g,'.')}到访`;
                tit = `确认到访有效？`
                btn = `确认有效`
            }
            if(type == 'auditReport'){
                html = `<span style='color:#3377FF;'>【${that.currChose.dcoid ? '渠道' : '全民'}分销】</span>${that.currChose.reportUser} ${that.currChose.reportTime.replace(/-/g,'.')}报备`;
                tit = `确认报备有效？`
            }else if(type == 'verifyDeal'){
                html = `
                <span style='color:#3377FF;'>【报备人】</span>${that.currChose.reportUser} <span style='color:#3377FF;'>【客户】</span>${that.currChose.cname}
                <div class="inpDiv"><span><input name="dong" id="dong"/>栋</span><span><input name="danyuan" id="danyuan"/>单元</span><span><input name="hao" id="hao"/>号</span></div>
                <p class="tip">完善认购房源信息，没有的项可不填</p>
                `;
                tit = `确认认购成功`
                className = 'confirm-dialog confirm-deal-dialog '
                btn = tit
            }else if(type == 'invalidReport'){
                className = 'confirm-dialog '
                 html = `<span style='color:#919499;'>限制到访时间：</span>${that.reportDetail.customer.reportTime.replace(/-/g,'.')}- ${that.reportDetail.customer.expectVisitTime.replace(/-/g,'.')}<br/><b style="color:#FF3419; font-size:16px;">提前到访视作无效报备</b>`;
                tit = `确认报备无效？`
                btn = '确认报备无效'
            }
            that.$confirm(
               html,
               tit,
                {
                    customClass:className,
                    dangerouslyUseHTMLString: true,
                    confirmButtonText: btn,
                    cancelButtonText: "取消",
                    confirmButtonClass: (type == 'verifyDeal' || type == 'invalidReport' ? 'confirm_del_btn' : '')
                })
                .then(() => {
                    if(type == 'invalidReport'){
                        console.log('提前到访')
                        that.invalidReport(id,isDetail)
                    }else{
                        that.verifyState(type,1,'',isDetail)
                    }
                })
                .catch(() => {
                    console.log("取消了");
                });
        },

        // 核实不通过
        cancel_heshi(type = 'verifyVisit',isDetail){
            const  that = this;
            let options = [];
            if(['verifyVisit', 'verifyDeal','auditReport'].includes(type)){
                for(let i = 0; i < that.verifyObj[type].length; i++){
                    options.push('<span class="'+(i == 0 ? "on_chose" : '') +'">'+that.verifyObj[type][i]+'</span>')
                }
            }
            that.verifyForm.ind = 0
            let html = `<div class="confirm_header canClick disflex a-c j-b">
                        <div class="confirm_header_title"></div>
                        <div class="disflex a-c ">
                            ${options.join('')}
                        </div> 
                    </div>
                    <div class='confirm_content'>
                        <textarea placeholder="(选填)补充说明" id="markInp"></textarea>
                    </div>`;
            let tit = `到访无效`
            let btn = `确定无效`
            if(type == 'verifyDeal'){
                tit = `成交结果驳回`
                btn = `确定驳回`
            }else if(type == 'invalidReport'){
                tit = `确认报备无效`
                btn = `确定无效`
            }
            this.$confirm(
                html,
                tit,
                {
                  customClass: "confirmVerify-dialog confirm-dialog",
                  dangerouslyUseHTMLString: true,
                  confirmButtonText: btn,
                  cancelButtonText: "取消",
                  confirmButtonClass:'confirm_del_btn'
                }
              )
                .then((status) => {
                    that.verifyState(type,2,'',isDetail)
                })
                .catch((status) => {
                  console.log(status);
                });
        },

        /**
         * 核实状态
         * @param type 不同类型
         * @param state 1 => 通过  2 => 不通过
         * @param obj 验证对象
         * */ 
        verifyState(type,state,obj,isDetail){
            const that = this;
            if(that.isAjax) return false;
            that.isAjax = true;
            that.currChose = obj || that.currChose;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/${type}&lpid=${loupanid}`
            let form = {
                state:state,
                id:that.currChose.id
            }
            if(state != 1){
                that.verifyForm.mark = $("#markInp").length && $("#markInp").val() || that.verifyForm.mark
                form.invalidType = that.verifyForm.ind + 1
                form.note = that.verifyForm.mark;
            }

            if(state == 1 && type == 'verifyDeal'){
                let house_arr = [$("#dong").val(),$("#danyuan").val(),$("#hao").val()];
                form.house = house_arr.join(',');
            }
            $.ajax({
                type: "POST",
                url: url,
                data: form,
                dataType: "json",
                success: function(data) {
                    that.isAjax = false;
                    if(data.state == 100){
                        showErrAlert(data.info,'success');
                        that.dealPopShow=false;
                        that.reportPopShow = false;
                        that.certificatePopShow =false;
                        if(isDetail){
                            that.getReportDetail(id)
                            that.reloadList()
                        }else{
                            that.reloadList()
                        }
                    }else{
                        showErrAlert(data.info)
                    }
                }
            });
        },


        /**
         * 打印到访单
         * @param id 分销列表id
         * @param print 是否有权限打印
         * @param isDetail 是否是详情页
         * */ 
        printVisit(id,print=0,isDetail=0){
            const that = this;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/confirmVisit&id=${id}&print=${print ?  1 : 0}`
            $.ajax({
                type: "POST",
                url: url,
                dataType: "json",
                success: function(data) {
                    if(data.state == 100){
                        if(!isDetail){
                            // location.reload();
                            that.reloadList();
                        }else{
                            that.getReportDetail(id)
                        }
                        that.printPage(id)
                    }else if(data.state == 201){
                        className = 'confirm-dialog '
                        html = `<span style='color:#919499;'>限制到访时间：</span>${data.startTime.replace(/-/g,'.')}- ${data.endTime.replace(/-/g,'.')}<br/><b style="color:#FF3419; font-size:16px;">提前到访视作无效报备</b>`;
                       btn = '确认报备无效'
                        that.$confirm(
                            html,
                            data.info,
                            {
                              customClass: "confirm-dialog",
                              dangerouslyUseHTMLString: true,
                              confirmButtonText: '确定无效',
                              cancelButtonText: "取消",
                              confirmButtonClass:'confirm_del_btn'
                            }
                          )
                            .then((status) => {
                                console.log('提前报备')
                                that.invalidReport(id,isDetail)
                            })
                            .catch((status) => {
                              
                            });
                    }else {
                        showErrAlert(data.info)
                    }
                }
            })
        },

        printPage(id){ 
            var hasPrint = false;
            const loading = this.$loading({
                lock: true,
                text: 'Loading',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
              });
            $('#printVisitConfirm').attr('src', memberDomain + '/house_loupan_printVisitConfirm.html?id=' + id);
            $('#printVisitConfirm').load(function(){
                setTimeout(function(){
                    if(!hasPrint){
                        document.getElementById('printVisitConfirm').contentWindow.printPage();
                        hasPrint = true;
                        loading.close()
                    }
                }, 1000);
            })
        },

        /**
         * 提前到访，报备无效
         * */ 
        invalidReport(id,isDetail=0){
            const that = this;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/invalidReport&id=${id}`
            $.ajax({
                type: "POST",
                url: url,
                dataType: "json",
                success: function(data) {
                    if(data.state == 100){
                        if(!isDetail){
                            location.reload();
                        }else{
                            that.getReportDetail(id)
                        }
                        
                    }
                }
            })
        },

        // 显示核实弹窗
        showCertificatePop(type,obj){
            const that = this;
            that.certificatePopShow = true; 
            that.certificateType = type; 
            that.currChose = obj
        },

        // 轮播图切换
        changeImg(ind){
            const that = this;
            that.currOn = ind;
            if(that.$refs.carousel){
                that.$refs.carousel.setActiveItem(ind)
            }
            
        },

        getReportDetail(id){
            const that = this;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/reportDetail&id=${id}`
            $.ajax({
                type: "POST",
                url: url,
                dataType: "json",
                success: function(data) {
                    if(data.state == 100){
                        that.reportDetail = data.info;
                    }else{
                        showErrAlert(data.info);
                    }
                }
            });
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


        // 点击表格 获取详情
        rowClick(e){
          const that = this;
          that.reportPopShow = true;
          that.currChose = e;
          that.getReportDetail(e.id)
        },

        /**
         * 处理手机号显示 三位以间隔
         * @param phone 处理的手机号
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
        }
    }
})