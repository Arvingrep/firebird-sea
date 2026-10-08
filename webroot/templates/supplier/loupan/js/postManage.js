

var pageVue = new Vue({
	el:'#page',
    data:{
        navList:navList,
        currid:currid,
        hoverid:'',



        // 当前页面特有
        postList:[
            
        ], //职务列表
    
        qxList:[{
            id:1,
            name:'客户管理'
        },{
            id:2,
            name:'打印到访单'
        }],
        fxqxList:[{
            id:1,
            name:'报备审核'
        },{
            id:2,
            name:'带看审核'
        },{
            id:3,
            name:'更新成交信息'
        },{
            id:4,
            name:'成交审核'
        },{
            id:5,
            name:'提现审核'
        }],

        formData:{},
        isChange:false, //是否正在修改权限
        edit_ind:'',
        is_edit:false, //是否正在修改名称
    },
    mounted(){
        this.getPostList()
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


        // 获取职务列表
        getPostList(){
            const that = this;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/groupList&lpid=${loupanid}`
            $.ajax({
                url:url,
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        let list = res.info.list
                        if(list.length > 0){
                            that.postList = list
                        }
                    }
                }
            })
        },

        // 新增职务
        addPost(){
            const that = this;
            that.is_edit = true;
            that.edit_ind = that.postList.length;
            that.postList.push({
                id:'',
                name:'',
                permission:'',
                mpermission:'',
            })

        
        },

        // 更新职务名称  包含添加和修改
        updatePost(id){
            const that = this;
            let formData = that.postList[that.edit_ind]
            that.is_edit = false
            let url = `/include/ajax.php?service=house&action=route&route=marketing/${id ? 'updateGroupName' : 'addGroup'}&lpid=${loupanid}&${id ? '' : 'g'}name=${formData.name}`;
            $.ajax({
                url:url,
                data:{
                    id:[formData.id],
                },
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        that.$message({
                            message: res.info,
                            type: 'success'
                        });
                        that.getPostList();
                    }else{
                        that.$message({
                            message: res.info,
                            type: 'error'
                        });
                    }
                }
            })
        },

        /**
         * 权限修改
         * @param {boolean} checked 是选中还是取消
         * @param {number} id 权限id
         * @param {string} param 权限名称
         * @param {number} ind 编辑的职务下标 
         * */ 
        changeVal(checked,id,param,ind){
            const that = this;
            id = id.toString();
            that.isChange = true;
            that.edit_ind = ind;
            let permission = that.postList[ind][param]
            let permissionArr = permission.split(',');
            if(checked){
                if(permissionArr.indexOf(id) == -1){
                    permissionArr.push(id)
                }
            }else{
                if(permissionArr.indexOf(id) != -1){
                    permissionArr.splice(permissionArr.indexOf(id),1)
                }
            }
            permissionArr = permissionArr.filter(item => !!item)
            let permission_new = permissionArr.join(',')
            that.$set(that.postList[ind],param,permission_new)
        },

        // 确认修改权限
        changePerssion(){
            const that = this;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/updatePermission&lpid=${loupanid}`;

            $.ajax({
                url:url,
                data:{
                    id:[that.postList[that.edit_ind].id],
                    permission:that.postList[that.edit_ind].permission,
                    mpermission:that.postList[that.edit_ind].mpermission,
                },
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        // that.getPostList();
                        that.$message({
                            message: res.info,
                            type: 'success'
                        });
                    }else{
                        that.$message({
                            message: res.info,
                            type: 'warning'
                        });
                    }
                }
            })
        },

        // 删除确认
        confirmDel(ind){
            const that = this
            let url = `/include/ajax.php?service=house&action=route&route=marketing/delGroup&lpid=${loupanid}&id=${that.postList[ind].id}`;
            $.ajax({
                url:url,
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        that.postList.splice(ind,1)
                    }else{
                        that.$message({
                            message: res.info,
                            type: 'warning'
                        });
                    }
                }
            })
        },

    }
})