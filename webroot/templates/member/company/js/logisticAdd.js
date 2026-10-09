$(function(){

  // $(".bearFreight span").bind("click", function(){
	// 	var val = $(this).data("id");
	// 	if(val == 1){
	// 		$("#freight").hide();
	// 	}else{
	// 		$("#freight").show();
	// 	}
	// });

	// $(".valuation span").bind("click", function(){
	// 	var val = $(this).data("id"), i = $("#freight i");
	// 	if(val == 0){
	// 		i.html("件");
	// 	}else if(val == 1){
	// 		i.html("kg");
	// 	}else if(val == 2){
	// 		i.html("m³");
	// 	}
	// });
  /**************2021-12-22 新增商家配送*****************/
  // 
  
 
  var lievf = '<div class="rangedeliveryfee rangedeliveryfeeblock ">配送距离<input type="text"style="width:80px;"class="juliSt" value="0">公里至<input type="text"style="width:80px;"class="juliEd" value="0">公里，外送费<input type="text"style="width:80px;"class="ranfee" value="0">元，起送价<input type="text"style="width:80px;"class="ranbasic"value="0">元<div class="deleterangedeliveryfee"title="删除自定义显示项">删除</div></div>';
    $(".w-form").delegate(".addrangedeliveryfee", "click", function(){

      var t = $(this).closest(".lievf");
      var date1 = new Date().getTime();
      var date2 = new Date().getTime() + 1;
      var html = lievf.replace("date11", date1).replace("date22", date2);
      var newexperience = $(html);
      newexperience.insertAfter(t);
      newexperience.slideDown(300);
    });
    $(".w-form").delegate(".deleterangedeliveryfee", "click", function(){
       $(this).closest(".rangedeliveryfeeblock").remove();
    });
    //免费开关
    $(".w-form").delegate(".ace", "click", function(){
      var t = $(this);

      var oldVal = $('#fixover').val()?$('#fixover').val():'';
      if(oldVal>0){
        t.attr('data-price',oldVal);
      }
      if(t.is(':checked')){        
        t.val('1');
        $('#fixover').val(t.attr('data-price')).removeAttr('readonly')       
      }else{
        t.val('0');
        $('#fixover').val('').attr('readonly','true')
        
      }

    });




});



console.log(noFreeaArr)
var fabuForm = new Vue({
  el:"#fabuForm",
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
    active:active?Number(active):0,
    feemodeval:feemodeval,
  },
  created(){
    var tt = this;
    tt.getArea();
    tt.props = {
      multiple: true,
      lazy: false,
      value:'id',
      label:'typename',
      children:'lower',
    }

  },
  mounted(){

    var tt = this;
    console.log(tt.noFreeAreaArr)
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
      if(tt.freeArr.length == 0){
          tt.freeArr.push({
              area:[],
              min_num:1,
              min_amount:0.01,
          })
      }
    //配送方式切换
    $('.confirmTab li').click(function(){
      var t = $(this);
      if(!t.hasClass('active')){
        t.addClass('active').siblings('li').removeClass('active');
        var tindex = t.index(),tid = t.attr('data-id');
        $('.w-form .comCon').eq(tindex).addClass('comShow').siblings('.comCon').removeClass('comShow');
        $('#logistype').val(tid);
        tt.active = tindex;
      }
    })

    //起送价、配送模式 切换
    $(".w-form").delegate("#delivery_fee_mode", "change", function(){
      var t = $(this), val = t.val();
      tt.feemodeval = val;
    })

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
      var goto = false;
      var dataArr = $("#fabuForm").serialize();
      console.log(dataArr);
      console.log($("#fabuForm").serializeArray())
      console.log(tt.logisticArea_arr)
      console.log(tt.noFreeAreaArr)
      console.log(tt.freeArr)

    var logistype = $('#logistype').val(),//快递--商家
        cityid = $('#cityid').val(),
        title = $('.comCon.comShow .title').val(),
        note      = $('.comCon.comShow .content').val();//运费说明
    //商家配送相关值    
    var valuation  = $('#delivery_fee_mode').val(),//固定--按距离
        fixbasic  = $('#fixbasic').val(),//固定起送价
        fixfee    = $('#fixfee').val(),//固定配送费
        openFree  = $('.ace').val(),//免配送费
        fixover   = $('#fixover').val();//满减金额
    //快递邮寄相关值    
    var calcType  = $('#valuation').val(),//按件数/重量/体积
        freeArea  = $('#freeArea').val(),//指定包邮-- 开关    
        noFreeArea  = $('#noFreeArea').val();//指定区域不配送 开关    
    if(!title){
      $('.comCon.comShow .title').siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>请输入模板名称");
      goto = true;
    }else{
      $('.comCon.comShow .title').siblings(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
    }
    // if(!note){
    //   $('.comCon.comShow .content').siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>请输入运费说明");
    //   goto = true;
    // }else{
    //   $('.comCon.comShow .content').siblings(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
    // }
    //商家配送

    if(logistype == 1){      
      //固定配送
      if(valuation == 0){
        if(!fixbasic){
          $('#fixbasic').siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>请输入固定起送价");
          goto = true;
        }else{

          $('#fixbasic').siblings(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
        }
        if(!fixfee){
          $('#fixfee').siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>请输入固定配送费");
          goto = true;

        }else{

          $('#fixfee').siblings(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
        }
        if(openFree == 1){
          console.log(fixover)
          if(!fixover){
            $('#fixover').closest('.form-group').find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>请输入免配送费的金额");
            goto = true;
          }else{
            $('#fixover').closest('.form-group').find(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
          }
        }
      }else{//按距离
        var feeJuli = [];
        $('#delivery_fee_mode1 .rangedeliveryfeeblock').each(function(){
          var t = $(this);
          var juliSt = t.find('.juliSt').val(),
              juliEd = t.find('.juliEd').val(),
              ranfee = t.find('.ranfee').val(),
              ranbasic = t.find('.ranbasic').val();
          if(juliSt > juliEd){
            juliSt = t.find('.juliEd').val(); 
            juliEd = t.find('.juliSt').val(); 
          }
          var ranArr = [];
          if(juliSt)
          ranArr.push(juliSt)
          if(juliEd)
          ranArr.push(juliEd)
          if(ranfee)
          ranArr.push(ranfee)
          if(ranbasic)
          ranArr.push(ranbasic)
          if(ranArr.length == 4)
          feeJuli.push(ranArr);
        })
        if(feeJuli.length == 0){
          $.dialog.alert('请配置不同距离外送费');
          goto = true;
        }

      }
    }else{
      //配送运费及区域
      
      if(freeArea == 1){//开启指定包邮

        if(tt.freeArr.length ==0){
          $.dialog.alert('请至少配置一个包邮地区');
          goto = true;
        }else{
          
          var snum = 0;
          for(var k = 0;k<tt.freeArr.length;k++){
            var sarea = tt.freeArr[k].area;
            if(sarea.length >0){
              snum++;
            }
            
          }
          //有条数 但没有选择地区
          if(snum == 0){
            $.dialog.alert('请至少配置一个包邮地区');
            goto = true;
          }

        }
        
        
      }
      if(noFreeArea == 1){//开启指定区域不配送
        if(tt.noFreeAreaArr.length ==0){
          $.dialog.alert('请选择不配送地区');
          goto = true;
        }
      }
    }

    if(goto) return false;
    //商家配送
    if(logistype == 1){  
      dataArr = dataArr+'&range_delivery_fee_value='+JSON.stringify(feeJuli);
    }else{//快递
      dataArr = dataArr+'&logisticArea='+JSON.stringify(tt.logisticArea_arr)+'&noFreeAreaArr='+JSON.stringify(tt.noFreeAreaArr)+'&freeArr='+JSON.stringify(tt.freeArr);
    }

      axios({
      	method: 'post',
      	url: $("#fabuForm").attr("action"),
        data:dataArr,
      })
      .then((response)=>{
        var data = response.data;
        if(data.state == 100){
			$.dialog({
  			  title: langData['siteConfig'][19][287],
  			  icon: 'success.png',
  			  content: data.info,
  			  ok: function(){
  				  location.href = manageUrl;
  			  }
  		    });
        }else{
          $.dialog.alert(data.info)
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


  }
})
