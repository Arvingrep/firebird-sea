var pageVue = new Vue({
	el:'#page',
    data:{
        showPop:false,
        navList:navList,
        currid:currid,
        hoverid:'',

        pageSize:10,
        chosedArr:[], //选中的
        crmSource_ind:active||0,
        crmSource_type_ind:0,
        crmSource:[
            {
                id:1,
                name:'线上客源',
                lower:[
                    {
                        id:'',
                        name:'全部',
                        count:0
                    },
                    {
                        id:2,
                        name:'信息订阅',
                        count:0
                    },
                    {
                        id:3,
                        name:'活动报名',
                        count:0
                    },
                    {
                        id:1,
                        name:'浏览房源',
                        count:0
                    },
                ],
                list:[],
                isload:false,
                loadEnd:false,
                page:1,
            },
            {
                id:2,
                name:'新房分销',
                list:[],
                count:0,
                isload:false,
                loadEnd:false,
                page:1,
            },
            {
                id:3,
                name:'名单导入',
                list:[],
                count:0,
                isload:false,
                loadEnd:false,
                page:1,
            },
        ],
        filterData:{
            type:'',
            source:'',
            status:'',
            keyword:'',
        },
        // 备注
        isMarking:false,
        mark_ind:0,
        remark:'', //备注
        // 来源
        sourceList:[ { id:-1, name:'全部' }, { id:1, name:'PC网页' }, { id:2, name:'H5 ' }, { id:3, name:'微信小程序' }, { id:4, name:'APP ' }, { id:5, name:'后台导入' }, ],
        // 跟进状态
        statusList:[ { id:-1, name:'全部' }, { id:1, name:'跟进中' }, { id:2, name:'未跟进' }, ],
        statusList1:[ { id:-1, name:'全部' }, { id:1, name:'带看过' }, { id:2, name:'未带看' }, ],
    },
    mounted(){
        const that = this;
        that.reloadList()
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

        reloadList(){
            const that = this;
            that.chosedArr = []
            let currLoad = that.crmSource[that.crmSource_ind];
            currLoad['page'] = 1;
            currLoad['isload'] = false;
            currLoad['loadEnd'] = false;
            currLoad['list'] = [];
            that.getCustomerList();
        },
        // 获取客户列表
        getCustomerList(e){
            const that = this;
            console.log(that.crmSource[that.crmSource_ind].page)
            let currLoad = JSON.parse(JSON.stringify(that.crmSource[that.crmSource_ind]));
            if(currLoad.isload) return false;
            currLoad.isload = true;
            // if(currLoad.list && currLoad.list.length>0){
            //     // 已经加载过
            //     return false;
            // }
            let url = `/include/ajax.php?service=house&action=route&route=marketing/customerList&pageSize=${that.pageSize}&page=${currLoad.page}&lpid=${loupanid}`
            $.ajax({
                data:{
                    class:currLoad.id,
                    type:currLoad.lower && currLoad.lower.length && currLoad.lower[that.crmSource_type_ind].id,
                    ...that.filterData,
                },
                url:url,
                dataType:'json',
                success:(res)=>{
                    currLoad.isload = false;
                    if(res.state == 100){
                        let list = res.info.list
                        if(list.length > 0){
                            currLoad.list = list
                        }
                        currLoad.count = res.info.pageInfo.totalCount
                        that.$set(that.crmSource,that.crmSource_ind,JSON.parse(JSON.stringify(currLoad)))
                    }
                }
            })
        },

        // 删除客户
        delCustomer(item){
            const that = this;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/delCustomer&lpid=${loupanid}&ids=${item.id}`
            $.ajax({
                url:url,
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        that.$message({
                            message: res.info,
                            type: 'success'
                        });
                        that.reloadList();
                    }else{
                        that.$message({
                            message: res.info,
                            type: 'error'
                        });
                    }
                }
            })
        },

        // 客户备注
        markCustomer(item){
            const  that = this;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/saveCustomerMark&lpid=${loupanid}&id=${item.id}`
            $.ajax({
                url:url,
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        that.$message({
                            message: data.info,
                            type: 'success'
                        });
                        that.getCustomerList();
                    }else{
                        that.$message({
                            message: data.info,
                            type: 'error'
                        });
                    }
                }
            })
        },

        // 导入客户 有2个步骤 上传文件  导入文件

        // step1 上传文件
        uploadFile(){
            const that = this;
            let file = event.target['files'][0]            
            if (window.FileReader) {
                var reader = new FileReader();
                reader.readAsDataURL(file); 
                reader.onload = function(e) {
                    var formData = new FormData();
                    // let tempPath = this.result;
                    formData.append("Filedata", file);
                    formData.append("name", file.name);
                    formData.append("lastModifiedDate", file.lastModifiedDate);
                    formData.append("size", file.size);
                    // that.uploadImg(formData,paramStr)

                    $.ajax({
                        accepts:{},
                        url: '/include/upload.inc.php?mod=siteConfig&filetype=file',
                        data: formData,
                        type: "POST",
                        processData: false, // 使数据不做处理
                        contentType: false,
                        dataType: "json",
                        success: function (data) {
                            if(data.state == 'SUCCESS'){
                                that.importCustomer(data.url);
                                that.$message({
                                    message: res.info,
                                    type: success
                                });
                            }else{
                                alert('文件上传失败，请稍后重试');
                               
                            }
                        },
                        error: function () { }
                    });


                    // if(data.state == 'SUCCESS'){
                        
                    // }
                    
                }
            } 
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

        // 导出客户
        exportCustomer(){
            const that = this;
            let currLoad = that.crmSource[that.crmSource_ind];
            if(currLoad.isload) return false;
            currLoad.isload = true;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/exportCustomer&lpid=${loupanid}&class=${currLoad.id}&type=${currLoad.lower && currLoad.lower.length && currLoad.lower[that.crmSource_type_ind].id}`
            let filterStrArr = [];
            for(let i in that.filterData){
                if(that.filterData[i]){
                    filterStrArr.push(i + '=' + that.filterData[i])
                }
            }
            url += '&' + filterStrArr.join('&')
            window.open(url)
        },

        // 备注客户
        saveCustomerMark(note,id){
            const that = this;
            
            let url = `/include/ajax.php?service=house&action=route&route=marketing/saveCustomerMark&lpid=${loupanid}`
            $.ajax({
                data:{
                    id:id,
                    mark:note
                },
                url:url,
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        that.$message({
                            message: '备注成功',
                            type: 'success'
                        });
                        that.isMarking = false;
                        that.$set(that.crmSource[that.crmSource_ind].list[that.mark_ind],'mark',note)
                    }
                }
            })
        },

        // 选择
        choseItem(obj,val,isAll = ''){
            const that = this;
            if(val){
                if(obj && isAll != 'all'){
                    that.chosedArr.push(obj.id)
                }else{
                    that.chosedArr = that.crmSource[that.crmSource_ind].list.map(item => {
                        return item.id
                    })
                }
            }else{
                if(obj && isAll != 'all'){
                    that.chosedArr.splice(that.chosedArr.indexOf(obj.id),1)
                }else{
                    that.chosedArr = []
                }
            }
        },


        

    }
})