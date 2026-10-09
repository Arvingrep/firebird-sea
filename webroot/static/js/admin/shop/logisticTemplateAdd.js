// $(function(){
//
// 	$("input[name=bearFreight]").bind("click", function(){
// 		var val = $(this).val();
// 		if(val == 1){
// 			$(".freight").hide();
// 		}else{
// 			$(".freight").show();
// 		}
// 	});
//
// 	$("input[name=valuation]").bind("click", function(){
// 		var val = $(this).val(), i = $(".freight i");
// 		if(val == 0){
// 			i.html("件");
// 		}else if(val == 1){
// 			i.html("kg");
// 		}else if(val == 2){
// 			i.html("m³");
// 		}
// 	});
//
//
// 	//保存
// 	$("#btnSubmit").bind("click", function(event){
// 		event.preventDefault();
// 		var t = $(this);
//
// 		t.attr("disabled", true);
// 		huoniao.operaJson("logisticTemplate.php?dopost=add", $("#editform").serialize() + "&submit=" + encodeURI("提交"), function(data){
// 			if(data.state == 100){
// 				if($("#dopost").val() == "add"){
// 					$.dialog({
// 						fixed: true,
// 						title: "添加成功",
// 						icon: 'success.png',
// 						content: "添加成功！",
// 						ok: function(){
// 							window.location.reload();
// 						},
// 						cancel: false
// 					});
//
// 				}else{
// 					$.dialog({
// 						fixed: true,
// 						title: "修改成功",
// 						icon: 'success.png',
// 						content: "修改成功！",
// 						ok: function(){
// 							try{
// 								var hz = "php";
// 								if(sid){
// 									hz = sid;
// 								}
// 								$("body",parent.document).find("#nav-logisticTemplate"+hz).click();
// 								parent.reloadPage($("body",parent.document).find("#body-logisticTemplate"+hz));
// 								$("body",parent.document).find("#nav-logisticTemplateEdit"+$("#id").val()+" s").click();
// 							}catch(e){
// 								location.href = thisPath + "logisticTemplate.php?sid="+sid;
// 							}
// 						},
// 						cancel: false
// 					});
// 				}
// 			}else{
// 				$.dialog.alert(data.info);
// 				t.attr("disabled", false);
// 			};
// 		}, function(){
// 			$.dialog.alert("网络错误，请刷新页面重试！");
// 			t.attr("disabled", false);
// 		});
// 	});
//
// });
var editform = new Vue({
  el:"#editform",
  data:{
    valuation:valuation*1, //计费方式
    logisticArea_arr:logisticArr,
    // 以下变量均为区域选择相关
    // areaArr:[], //区域数组
    // areaType:0, //当前点击选中区域的一级id
    // areaEdit:0, //是否显示区域显示
    // chosedAreaArr:[], //当前编辑的区域所选的
    // editInd:'', //当前编辑的index
    // value:[], //暂时的变量
    freeArea:freeArea*1,
    freeArr:freeArea_arr,//指定包邮
    noFreeArea:opennospecify*1,
    noFreeAreaArr:noFreeaArr,  //指定区域不包邮
    options:[],

    logistype:logistype, //配送类型
    feemodeval:Number(delivery_fee_mode),
    rangedelivery_arr:range_delivery_fee_valuearr?JSON.parse(range_delivery_fee_valuearr):[[0,0,0,0]]
  },

  created(){
    var tt = this;
    tt.getArea();
    tt.props = {
      multiple: true,
      value:'id',
      label:'typename',
      children:'lower',

    }
  },
  mounted(){

    var tt = this;
    // 编辑还是新建

    if(tt.logisticArea_arr.length == 0){
      tt.logisticArea_arr.push({
        area:'默认全国',
        express_start:1,
        express_postage:0,
        express_plus:1,
        express_postageplus:0,
      });
    }
    if(tt.freeArr.length == 1){
      tt.freeArr.push({
        area:[],
        min_num:1,
        min_amount:0.01,
      })
    }

    $(".w-form").delegate(".deleterangedeliveryfee", "click", function(){
        $(this).closest(".rangedeliveryfeeblock").remove();
    });

  },
  watch:{
    areaEdit:function(){
      var tt = this;
      if(!tt.areaEdit){
        tt.editInd = '';
      }
    },

  },
  methods:{
   getArea(){
     var url = "/include/ajax.php?service=siteConfig&action=area&son=once";
     var tt =this;
     axios({
     	method: 'post',
     	url: url,
     })
     .then((response)=>{
       var data = response.data;
       var array = data.info.map(function(item){
          if(item.lower != ''){
            var lower = item.lower.map(function(l){
               return {
                 id: l.id,
                 typename: l.typename,
               }
            })
            return {
                  id: item.id,
                  typename: item.typename,
                  lower: lower,
            }
          }else{
            return {
                  id: item.id,
                  typename: item.typename,
                  lower: [],
            }
          }
       })
       tt.options = array;
     });

   },
    // 新增
    addAreaLogi(arr){
      var tt = this;
      if(arr == 2){
        tt.logisticArea_arr.push({
          area:[],
          express_start:1,
          express_postage:0,
          express_plus:1,
          express_postageplus:0,
        })
      }else if(arr == 1){
        tt.freeArr.push({
          area:[],
          preferentialStandard:1,
          preferentialMoney:0.01,
        })
      }
    },

    // 删除
    del_tb(arr,i){
      var tt = this;
      arr.splice(i,1);
    },
    submit(){
      var tt = this;
      var title = $("#title").val();
      var content = $('#content').val();
      var goto = false;
      if(title == '') {
        $.dialog.alert('请输入名称');
        goto = true;
      }
      if(content == '') {
        $.dialog.alert('请输入运费说明');
        goto = true;
      }
      var dataArr = $("#editform").serialize();
      // console.log(dataArr);
      // console.log(tt.logisticArea_arr)
      // console.log(tt.noFreeAreaArr)
      // console.log(tt.freeArr)
      var dataStr  = dataArr+'&submit=提交';
      if(tt.logistype != 1){
        dataStr = dataArr+'&logisticArea='+JSON.stringify(tt.logisticArea_arr)+'&noFreeAreaArr='+JSON.stringify(tt.noFreeAreaArr)+'&freeArr='+JSON.stringify(tt.freeArr)+'&submit=提交'
      }else if(tt.feemodeval){
        dataStr = dataArr + '&range_delivery_fee_value='+JSON.stringify(tt.rangedelivery_arr)+'&submit=提交'
      }
      if(goto) return false;
      axios({
      	method: 'post',
      	url: $("#editform").attr("action"),
        data:dataStr
      })
      .then((response)=>{
        var data = response.data;
        if(data.state == 100){

            if($("#dopost").val() == "add"){
				$.dialog({
					fixed: true,
					title: "添加成功",
					icon: 'success.png',
					content: "添加成功！",
					ok: function(){
                        try{
							var hz = "php";
							if(sid){
								hz = sid;
							}
							$("body",parent.document).find("#nav-logisticTemplate"+hz).click();
							parent.reloadPage($("body",parent.document).find("#body-logisticTemplate"+hz));
							$("body",parent.document).find("#nav-logisticTemplateEdit"+$("#id").val()+" s").click();
						}catch(e){
							location.href = thisPath + "logisticTemplate.php?sid="+sid;
						}
					},
					cancel: false
				});

			}else{
				$.dialog({
					fixed: true,
					title: "修改成功",
					icon: 'success.png',
					content: "修改成功！",
					ok: function(){
						try{
							var hz = "php";
							if(sid){
								hz = sid;
							}
							$("body",parent.document).find("#nav-logisticTemplate"+hz).click();
							parent.reloadPage($("body",parent.document).find("#body-logisticTemplate"+hz));
							$("body",parent.document).find("#nav-logisticTemplateEdit"+$("#id").val()+" s").click();
						}catch(e){
							location.href = thisPath + "logisticTemplate.php?sid="+sid;
						}
					},
					cancel: false
				});
			}

        }else{
          alert(data.info)
        }
        goto = false;
      })




      return false;
    },

    checkInp(arr,ind,name,type){
      var el = event.currentTarget;
      var val = $(el).val();
      if(type == 'int'){
        arr[ind][name] = arr[ind][name].replace(/\D+/g,'')
      }else{
        arr[ind][name] = arr[ind][name].replace(/[^\d{1,}\.\d{1,}|\d{1,}]/g,'')
      }
    },


    addRange(){
      var tt = this;
      if(tt.rangedelivery_arr){

        tt.rangedelivery_arr.push([0,0,0,0])
      }else{
        tt.rangedelivery_arr = [[0,0,0,0]]
      }
    }


  }
})
