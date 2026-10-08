

var page = new Vue({
	el:'#page',
    data:{
        showPop:false,
        navList:navList,
        currid:currid,
        hoverid:'',



        // 当前页面特有
        postList:[], //职务列表
        post_ind:0 , //当前页面的职务索引
        formData:{
            id:'', //id
            realName:'', //姓名
            phone:'', //手机号
            password:'', //密码
            avatar:'', //头像
            avatar_url:'', //头像
            wechat:'', //微信号
            qr:'', //二维码
            qr_url:'', //二维码
            sale:0, //是否置业顾问
            view:'', //带看次数
            deal:'',//成交次数
            gid:'', //添加/编辑成员的职务id
        },
        error_param:'',
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
        teamObj:{
            list:[],
            page:1,
            isload:false,
            loadEnd:false,
        },
        chosedPermission:[],
        isAjax:false, // 是否正在请求数据
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
                        that.postList = res.info.list.map(item => {
                            return {
                                ...item,
                                count:0,
                            }
                        })
                        if(that.postList.length){
                            that.getteamList()
                        }
                    }
                }
            })
        },

        reloadList(){
            const that = this;
            that.teamObj.list = []
            that.teamObj.page = 1;
            that.teamObj.isload = false;
            that.teamObj.loadEnd = false;
            that.getteamList()
        },
        // 获取成员列表
        getteamList(){
            const that = this;
            if(that.teamObj.isload) return false;
            that.teamObj.isload = true
            let url = `/include/ajax.php?service=house&action=route&route=marketing/userList&page=${that.teamObj.page}&pageSize=10&lpid=${loupanid}&gid=${that.postList[that.post_ind].id}`
            $.ajax({
                url:url,
                dataType:'json',
                success:(res)=>{
                    that.teamObj.isload = false
                    if(res.state == 100){
                        that.teamObj.list = that.teamObj.list.concat(res.info.list)
                        that.page++;
                        if(that.page > res.info.pageInfo.totalPage){
                            that.teamObj.loadEnd = true
                            that.teamObj.isload = true
                        }
                    }else{
                        that.teamObj.loadEnd = true
                        that.teamObj.isload = true
                    }
                }
            })
        },

        // 查看权限
        checkPermission(val){
            const that = this;  
            if(!val) return false;
            that.chosedPermission = []
            let obj = that.postList.find(item => {
                return Number(item.id) == Number(val)
            })
            if(obj.lock * 1){
                that.formData.sale = 1
            }else{
                that.formData.sale = 0
            }
            let permission = obj.permission.split(',') || []
            for(let i=0;i<permission.length;i++){
                let curP = Number(permission[i])
                let ind = that.qxList.findIndex(item => {
                    return item.id == curP
                })
                if(ind != -1){
                    that.chosedPermission.push(that.qxList[ind])
                }
            }
            let mpermission = obj.mpermission.split(',') || []
            for(let i=0;i<mpermission.length;i++){
                let curP = Number(mpermission[i])
                let ind = that.fxqxList.findIndex(item => {
                    return item.id == curP
                })
                if(ind != -1){
                    that.chosedPermission.push(that.fxqxList[ind])
                }
            }
        },

        // 获取权限名称
        checkPermissionName(obj){
            const that = this;
            let permissionArr = []
            let permission = obj.permission.split(',') || []
            for(let i=0;i<permission.length;i++){
                let curP = Number(permission[i])
                let ind = that.qxList.findIndex(item => {
                    return item.id == curP
                })
                if(ind != -1){
                    permissionArr.push(that.qxList[ind].name)
                }
            }
            let mpermission = obj.mpermission.split(',') || []
            for(let i=0;i<mpermission.length;i++){
                let curP = Number(mpermission[i])
                let ind = that.fxqxList.findIndex(item => {
                    return item.id == curP
                })
                if(ind != -1){
                    permissionArr.push(that.fxqxList[ind].name)
                }
            }

            return permissionArr.join('、')
        },

        // 上传图片
        uploadImg(e,param){
            const that = this
            let file = e.target.files[0]
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
                    $.ajax({
                        accepts:{},
                        url: '/include/upload.inc.php?mod=siteConfig&type=atlas&filetype=image',
                        data: formData,
                        type: "POST",
                        processData: false, // 使数据不做处理
                        contentType: false,
                        dataType: "json",
                        success: function (data) {
                            if(data.state == 'SUCCESS'){
                                that.$set(that.formData,param,data.url)
                                that.$set(that.formData,`${param}_url`,data.turl)
                            }
                        }
                    })
                }
            } 
        },

        // 添加/编辑成员  打开弹窗
        addNewMember(item = ''){
            const that = this;
            item['gid'] = Number(item['gid'])
            for(let key in that.formData){
                let name = key == 'realName' ? 'realname' : key;
                if(key == 'avatar'){
                    name = 'photo'
                }else if(key == 'avatar_url'){
                    name = 'avatar'
                }else if(key  == 'qr_url'){
                    name = 'qrUrl'
                }
                if(item && item.hasOwnProperty(name)){
                    that.$set(that.formData,key,item[name]);
                }else{
                    that.$set(that.formData,key,'')
                }
            }
            if(!item || !item.gid){
                that.formData.gid = that.postList[that.post_ind].id;
            }
            that.checkPermission(that.formData.gid)    
            that.showPop = true;
        },

        isPhoneNo(){
            const that = this;
            return (/(^1[3|4|5|6|7|8|9][0-9]{9}$)/.test($.trim(that.formData.phone)))
        },

        
        // 添加/编辑成员  打开弹窗
        submitData(){
            const that = this;
            let bool = false;
            let tip = ''
            for(let key in that.formData){
                if(that.formData[key] == '' && ['realName','phone'].includes(key)){
                    that.$message({
                        message: key == 'realName' ? '请填写姓名' : '请填写手机号',
                        type: 'warning'
                    });
                    that.error_param = key;
                    bool = true;
                    return false;
                }
                if(key =='phone'){
                    if(!that.isPhoneNo($.trim(that.formData[key]))){
                        that.$message({
                            message: '请输入正确的手机号',
                            type: 'warning'
                        });
                        that.error_param = key;
                        bool = true;
                        return false;
                    }
                }
                if(key == 'gid' && that.formData[key] == ''){
                    that.$message({
                        message: '请选择职务',
                        type: 'warning'
                    });
                    that.error_param = key;
                    bool = true;
                    return false;
                }

            }
            let formData = that.formData
            
            if(bool) return false;
            $.ajax({
                url:`/include/ajax.php?service=house&action=route&route=marketing/${that.formData.id ? 'editUser' : 'addUser'}&lpid=${loupanid}`,
                type:'post',
                data:formData,
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        that.$message({
                            message: res.info,
                            type: 'success'
                        });
                        that.showPop = false;
                        // that.reloadList()
                        location.reload()
                    }else{
                        that.$message({
                            message: res.info,
                            type: 'warning'
                        });
                    }
                }
            })
            
        },

        // 更改成员
        updateUserStatus(obj){
            const that = this;
            if(that.isAjax) return false;
            that.isAjax = true;
            $.ajax({
                accepts:{},
                url: `/include/ajax.php?service=house&action=route&route=marketing/updateUserStatus&id=${obj.id}&status=${obj.status == 2 ? 1 : 2}&lpid=${loupanid}`,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    that.isAjax = false;
                    if(data.state == 100){
                        that.$message({
                            message: data.info,
                            type: 'success'
                        });
                        that.$set(obj,'status',obj.status == 2 ? 1 : 2)
                    }
                }
            })
        },

        // 删除成员
        deleteUser(obj){
            const that = this;
            if(that.isAjax) return false;
            that.isAjax = true;
            $.ajax({
                accepts:{},
                url: `/include/ajax.php?service=house&action=route&route=marketing/delUser&id=${obj.id}&lpid=${loupanid}`,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    that.isAjax = false;
                    if(data.state == 100){
                        that.$message({
                            message: data.info,
                            type: 'success'
                        });
                        that.reloadList()
                    }
                }
            })
        },

        // 分页
		showPageInfo:function(currid){
			var tt = this;
			var info = $(".pagination");
			var nowPageNum = atpage;
			var allPageNum = Math.ceil(totalCount/pageSize);
			var pageArr = [];
			info.html("").hide();
			var pages = document.createElement("div");
			pages.className = "pagination-pages";
			info.append(pages);
			//拼接所有分页
			if (allPageNum > 1) {

				//上一页
				if (nowPageNum > 1) {
					var prev = document.createElement("a");
					prev.className = "prev";
					prev.innerHTML = langData['siteConfig'][6][33];//上一页
					prev.onclick = function () {
						atpage = nowPageNum - 1;
						tt.getList(currid);
					}
					info.find(".pagination-pages").append(prev);
				}

				//分页列表
				if (allPageNum - 2 < 1) {
					for (var i = 1; i <= allPageNum; i++) {
						if (nowPageNum == i) {
							var page = document.createElement("span");
							page.className = "curr";
							page.innerHTML = i;
						} else {
							var page = document.createElement("a");
							page.innerHTML = i;
							page.onclick = function () {
								atpage = Number($(this).text());
								tt.getList(currid);
							}
						}
						info.find(".pagination-pages").append(page);
					}
				} else {
					for (var i = 1; i <= 2; i++) {
						if (nowPageNum == i) {
							var page = document.createElement("span");
							page.className = "curr";
							page.innerHTML = i;
						}
						else {
							var page = document.createElement("a");
							page.innerHTML = i;
							page.onclick = function () {
								atpage = Number($(this).text());
								tt.getList(currid);
							}
						}
						info.find(".pagination-pages").append(page);
					}
					var addNum = nowPageNum - 4;
					if (addNum > 0) {
						var em = document.createElement("span");
						em.className = "interim";
						em.innerHTML = "...";
						info.find(".pagination-pages").append(em);
					}
					for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
						if (i > allPageNum) {
							break;
						}
						else {
							if (i <= 2) {
								continue;
							}
							else {
								if (nowPageNum == i) {
									var page = document.createElement("span");
									page.className = "curr";
									page.innerHTML = i;
								}
								else {
									var page = document.createElement("a");
									page.innerHTML = i;
									page.onclick = function () {
										atpage = Number($(this).text());
										tt.getList(currid);
									}
								}
								info.find(".pagination-pages").append(page);
							}
						}
					}
					var addNum = nowPageNum + 2;
					if (addNum < allPageNum - 1) {
						var em = document.createElement("span");
						em.className = "interim";
						em.innerHTML = "...";
						info.find(".pagination-pages").append(em);
					}
					for (var i = allPageNum - 1; i <= allPageNum; i++) {
						if (i <= nowPageNum + 1) {
							continue;
						}
						else {
							var page = document.createElement("a");
							page.innerHTML = i;
							page.onclick = function () {
								atpage = Number($(this).text());
								tt.getList(currid);
							}
							info.find(".pagination-pages").append(page);
						}
					}
				}

				//下一页
				if (nowPageNum < allPageNum) {
					var next = document.createElement("a");
					next.className = "next";
					next.innerHTML = langData['siteConfig'][6][34];//下一页
					next.onclick = function () {
						atpage = nowPageNum + 1;
						tt.getList(currid);
					}
					info.find(".pagination-pages").append(next);
				}

				info.show();

			}else{
				info.hide();
			}
		},
    }
})