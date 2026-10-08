var isload = false;
$(function(){


  $('.nav-tabs li').click(function(){
    var t = $(this), index = t.index(), module = t.attr('data-module');
    t.addClass('active').siblings('li').removeClass('active');
    $('.tbody').eq(index).show().siblings().hide();
    atpage = 1;
    getList();
  })

  getList();


})

// 获取明细
function getList(type, idx){

  if(isload) return;

  var data = [];
  var active, index;
  if(idx){
    active = $(".stra_lead .swiper-slide").eq(idx);
    index = idx;
  }else{
    active = $(".nav-tabs .active");
    index = active.index();
  }

  var module = active.attr("data-module");

  var objContent = $(".container .tbody").eq(index);

  objContent.html('<div class="loading">'+langData['siteConfig'][20][409]+'</div>');
  var loading = objContent.find('.loading');

  if(loading.hasClass("end")) return;

  data.push('module='+module);
  data.push('page='+atpage);
  data.push('pageSize='+pageSize);

  isload = true;

  $.ajax({
    url: '/include/ajax.php?service=member&action=getOrderList',
    data: data.join('&'),
    type: 'post',
    dataType: 'json',
    success: function(res){

      if(res && res.state == 100){
        var list = res.info.list, len = list.length, pageInfo = res.info.pageInfo;
        totalCount = pageInfo.totalCount;

        if(len > 0){
          var html = [];
          for(var i = 0; i < len; i++){
            var obj = list[i],
                date = obj.date,
                paytype = obj.paytype,
                amount = obj.amount,
                ordernum = obj.ordernum,
                orderdate = obj.orderdate,
                user = obj.user,
                store = obj.store;

            var ptstr = [];
            var ptarr = paytype.split(",");
            for(var m = 0; m < ptarr.length; m++){
              for(n in paytypeArr){
                if(ptarr[m] == n){
                  ptstr.push(paytypeArr[n]);
                  break;
                }
              }
            }

            html.push('<div class="item">');
            html.push(' <p class="fn-clear item-tit"><span class="fn-left">'+ptstr.join(",")+'</span><span class="fn-right">+'+amount+'</span></p>');
            html.push(' <p>'+langData['siteConfig'][50][30]+'：'+store.title+'</p>');
            html.push(' <p>'+langData['siteConfig'][26][155]+'：'+user+'</p>');
            html.push(' <p>'+langData['siteConfig'][19][308]+'：'+ordernum+'</p>');
            html.push(' <p>'+langData['siteConfig'][19][51]+'：'+orderdate+'</p>');
            html.push('</div>');
          }

          loading.before(html.join("")).addClass("vh");
          loading.html('').addClass('end').removeClass('vh');
          showPageInfo();

        }else{
          loading.html('').addClass('end').removeClass('vh');
        }

      }else{
        loading.html(langData['siteConfig'][21][64]).addClass('end').removeClass('vh');
      }

      isload = false;
    },
    error: function(){
      alert(langData['siteConfig'][20][183]);
      isload = false;
    }
  })
 }


var paytypeArr = [];
paytypeArr['alipay'] = langData['siteConfig'][19][699];
paytypeArr['wxpay'] = langData['siteConfig'][19][700];
paytypeArr['money'] = langData['siteConfig'][19][328];
paytypeArr['point'] = langData['siteConfig'][19][701];
paytypeArr['unionpay'] = langData['siteConfig'][19][702];
paytypeArr['paypal'] = langData['siteConfig'][19][703];
paytypeArr['tenpay'] = langData['siteConfig'][19][704];
