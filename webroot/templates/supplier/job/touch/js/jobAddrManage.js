var pageVue = new Vue({
    el:'#page',
    data:{
        jobAddrList:[], //地址列表
        delArr:[], //要删除的地址
        onManage:false,
    },
    mounted:function(){
        const that = this;
        that.getAddrList('all')
    },
    methods:{
        getAddrList(type,id,ind){
            const that = this;
            let paramStr = ''
            if(type == 'all'){
                paramStr = '&method=all&company_addr=1'
            }else if(type == 'del'){
                paramStr='&method=del&id=' +  id
            }
            $.ajax({
				url: '/include/ajax.php?service=job&action=op_address' + paramStr ,
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data.state == 100){
						if(type == 'all'){
							that.jobAddrList = data.info;
						}else if(type == 'del'){
                            that.jobAddrList.splice(ind,1)
                        }

					}else{
                        showErrAlert(data.info)
					}
				},
				error: function () { 

				}
			});
        },

        delAddr(item,ind){
            const that = this;

            let options = {
                title: '确认删除该地址?',    // 提示标题
                isShow:true,
                btnSure: '删除',
                btnCancel:item.count_use ? '好的' : '取消',
                btnCancelColor:item.count_use ? '#3381FF' : '#000',
                btnColor:'#F21818',
                noSure:item.count_use ? true : false,
                popClass:'myConfirmPop'
            }

            if(item.count_use > 0){
                options['title'] = '该地址不可删除';
                options['confirmTip'] = '该地址有'+item.count_use+'条职位信息正在使用，不可删除'
            }
            confirmPop(options,function(){
                that.getAddrList('del',item.id,ind)
            })
        }

    }
})