var ue = UE.getEditor('body');
new Vue({
    el:'#page',
    data:{
        tabsList:[],
        currObj:{},
        formData:{}, //要提交的数据
        levelList:[],
        huodongopen:[],
        huodongygtime:huodongygtime,
    },
    mounted(){
        const that = this;
        that.dataSolve()
    },
    methods:{

        // 数据处理
        dataSolve(){
            const that = this;
            if(huodongopt){
                huodongopt = JSON.parse(huodongopt)
            }
            if(huodongnames){
                huodongnames = JSON.parse(huodongnames)
            }
            if(huodongopen){
                huodongopen = JSON.parse(huodongopen);
                that.huodongopen = huodongopen
            }
            if(levelList){
                that.levelList = JSON.parse(levelList);
                for(let i = 0; i < that.levelList.length; i++){
                    that.$set(that.levelList[i],'name',that.levelList[i].title)
                }

            }
            let hdArr = []
            for(let i = 0; i < huodongnames.length; i++){
                hdArr.push({
                    id:huodongopt[i],
                    name:huodongnames[i],
                    open:huodongopen.indexOf(huodongopt[i]) > -1 ? 1 : 0,
                    saveOpen:huodongopen.indexOf(huodongopt[i]) > -1 ? 1 : 0,
                    shortName:huodongopt[i] == 1 ? '准点抢' : huodongnames[i].substr(0,2)
                })
            }
            
            that.tabsList = hdArr;
            that.currObj = hdArr[0]


        },

        // 开关转换
        changeSwicth(id,val){
            const that = this;
            val = (val == 2 ? 0 : 1);
            if(val){
                that.huodongopen.push(id)
            }else{
                that.huodongopen.splice(that.huodongopen.indexOf(id),1)
            }
            
            let ind = that.tabsList.findIndex(item => {
                return item.id == id;
            })
            that.$nextTick(() => {
                that.$set(that.tabsList[ind],'open',val)
            })
        },

        switchClick(){
            const el = event.currentTarget;
            let input = $(el).find('input[type="radio"]');
            input.click()
        },

        //跳转页面
        addPage(){
            const that = this;
            let el = event.currentTarget;
            let id = $(el).attr('data-id');
            let url = $(el).attr('href');
            let title = $(el).attr('data-title');
            parent.addPage(id, "shop", title, url);
        },

        // 新增限购场次
        addLevelList(){
            const that = this;
            that.levelList.push({
                id:0,
                etime:'',
                ktime:'',
                number:'',
                title:'',
                name:'',
            })
        },

        saveLevelList(){
            const that = this;
            if(that.levelList.length == 0) return false;
            huoniao.operaJson("shopSessions.php?dopost=update", "data="+ JSON.stringify(that.levelList) +"&token="+$("#token").val(), function(data){
                if(data.state == 100){
                    // that.$message({
                    //     message: data.info,
                    //     type: 'success'
                    // });
                }else{
                     that.$message({
                        message: data.info,
                        type: 'error'
                    });
                }
            })
        },

        delLevelList(id,ind){
            const that = this;
            $.dialog.confirm("确认要删除吗？此操作不可恢复，请谨慎操作！！！", function(){
				huoniao.operaJson("shopSessions.php?dopost=del", "id="+id+"&token="+$("#token").val(), function(data){
					if(data.state == 100){
						that.$message({
                            message: data.info,
                            type: 'success'
                        });
						setTimeout(function() {
							that.levelList.splice(ind,1)
						}, 800);
					}else{
						that.$message({
                            message: data.info,
                            type: 'erroe'
                        });
						return false;
					}
				});
			});
        },

        // 保存数据 config
        saveInfo(){
            const that = this;
            ue.sync();
			var body = "&KanjiaGuize="+encodeURIComponent(ue.getContent());
			
            let param = $('#editform').serialize();
            huoniao.operaJson("shopConfig.php?action=shop&type=huodong", param + body, function(data){
                if(data.state == 100){
                    for(let i = 0; i < that.tabsList.length; i++){
                        that.tabsList[i].saveOpen = that.tabsList[i].open
                    }
                    that.$message({
                        message: '修改成功！',
                        type: 'success'
                    });
                }

                
            })

            that.saveLevelList()
        },
    },
})