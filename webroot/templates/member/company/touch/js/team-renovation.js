$(function () {

    //导航内容切换
    $('.order_header li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.wrap .order_content').eq(i).addClass('order_show').siblings().removeClass('order_show');
        if($(this).hasClass('apply')){
            $('.art_btn').hide();
        }else{
            $('.art_btn').show();
            var url = $(this).attr('data-url');
            $('.art_add a').attr('href',url);
        }
        getList();
    });

    //工长类型
    
  	getgztype()
    function getgztype(){
        $.ajax({
          type: "POST",
          url: "/include/ajax.php?service=renovation&action=type&type=591",
          dataType: "json",
          success: function(res){
                if(res.state==100 && res.info){
                    var list = res.info;                   
                    var huxinSelect = new MobileSelect({
                          trigger: '.forman_type',
                          title: '',
                          wheels: [
                              {data:list}
                          ],
                          keyMap: {
                            id: 'id',
                            value: 'typename'
                          },
                          position:[0, 0],
                          callback:function(indexArr, data){
                            $('#forman_type').val(data[0].typename);
                            $('.forman_type .choose span').hide();
                            $('#typeId').val(data[0].id)
                          }
                          ,triggerDisplayData:false,
                    });
                }
          }
      });
    }

    // 点击上传照片(一张)
    var upqjShow = new Upload({
      btn: '#up_qj',
      title: 'Images',
      mod: 'renovation',
      params: 'type=atlas',
      atlasMax: 1,
      deltype: 'delAtlas',
      replace: false,
      fileQueued: function(file, activeBtn){
        var btn = activeBtn ? activeBtn : $("#up_qj");
        var p = btn.parent(), index = p.index();
        $("#qjshow_box li").each(function(i){
          if(i >= index){
            var li = $(this), t = li.children('.img_show'), img = li.children('.img');
            if(img.length == 0){
              t.after('<div class="img" id="'+file.id+'"></div><i class="del_btn">+</i>');
              return false;
            }

          }
        })
      },
      uploadSuccess: function(file, response, btn){
        if(response.state == "SUCCESS"){
          $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'" data-val="'+response.url+'" />');

        }
      },
      uploadProgress:function(file,percentage){
        var $li = $('#'+file.id),
            $percent = $li.find('.progress span');
            // 避免重复创建
            if (!$percent.length) {
                
                $percent = $('<p class="progress"><span></span></p>')
                    .appendTo($li)
                    .find('span');
                    
            }
            $percent.css('width', percentage * 100 + '%');
      },
      uploadFinished: function(){
        if(this.sucCount == this.totalCount){
          // showMsg('所有图片上传成功');
        }else{
          showMsg((this.totalCount - this.sucCount) + '张图片上传失败');
        }
        
        updateQj();
      },
      uploadError: function(){

      },
      showErr: function(info){
        showMsg(info);
      }
    });
    $('#qjshow_box').delegate('.del_btn', 'click', function(){
      var t = $(this),li = t.closest('li');
        upqjShow.del(li.find(".img img").attr("data-val"));
        t.remove();
        li.find(".img").remove(); 
    })
    function updateQj(){

      var qj_file = [];      
      $("#qjshow_box li").each(function(i){
        var img = $(this).find('img');
        if(img.length){
          var src = img.attr('data-url');
          qj_file.push(src);
        }
      })
      $('#photo').val(qj_file.join(','));
      
    }

    //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;



                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').closest('li').hide();
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.layer_list ul').append(phoneList.join(''));
                }else{
                   $('.layer_list ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.layer_list ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer_code').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        $(".areacode_span label").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })



    var imgUrl,art_name;
    //打开选择管理
    $(".order_content").delegate(".manage", "click", function () {       
        $('.te_choose').animate({ 'right': '0' }, 300);
        $('body').css('position', 'fixed');
        var par = $(this).closest('.com_li'),
            id = par.attr('data-id'),
            name = par.attr('data-name'),
            works = par.attr('data-works'),
            otherli = par.find('.right_ul').html(),
            photo = par.attr('data-photo'),
            photos = par.attr('data-photos'),
            foreAge = par.attr('data-age'),
            areacode = par.attr('data-code'),
            style = par.attr('data-style'),
            stylename = par.attr('data-stylename'),
            phone = par.attr('data-tel');
  

        $('#qjshow_box .img').remove();
        if(photo && photos){
            $('#qjshow_box li').append('<div class="img" id="WU_FILE_has_0"><img src="'+photo+'" data-url="'+photos+'"><i class="del_btn">+</i></div>');
          	$('#photo').val(photos);
        }
     	 $('#tjname').val(name);
         $('#age').val(foreAge);//工长年龄
        $('.te_choose').attr('data-index',id);
        var gurl;
        if($(this).hasClass('foreman_manage')){           
            $('.foreType,.foreAge').show();//工长类型 
            $('.top_return h2').html(langData['renovation'][10][8]);//工长管理
            $('.workTime .name').find('label').text(langData['renovation'][8][21]);//工龄
            gurl = "/include/ajax.php?service=renovation&action=editForeman&id="+id; 
        }else{
            $('.foreType,.foreAge').hide();
            $('.top_return h2').html(langData['renovation'][10][7]);//设计师管理
            $('.workTime .name').find('label').text(langData['renovation'][7][22]);//工作经验
            gurl = "/include/ajax.php?service=renovation&action=editTeam&id="+id;
        }
        $('.te_choose .right_ul').html(otherli);
        if(phone){
           $('.art_info2 #phone').val(phone); 
        }
        if(areacode !='0'){
           $('#areaCode').val(areacode);
            $('.areacode_span label').text('+'+areacode); 
        }
        if(style){//工长类型
            $('.forman_type .choose span').hide();
          $('#forman_type').val(stylename);  
          $('#typeId').val(style);  
        }        
        
        $('.art_info2 .works').val(works);
        $('#btn-keep').attr('data-id',id);
        $('#btn-keep').attr('data-action',gurl);
    });

    //删除设计师
    $(".art_info1").delegate(".del", "click", function () {   
        var indexId = $('.te_choose').attr('data-index');
        $.ajax({
          url: "/include/ajax.php?service=renovation&action=delTeam&id="+indexId,
          type: "GET",
          dataType: "json",
          success: function (data) {
            if(data && data.state == 100){
                $('.te_choose').animate({ 'right': '-100%' }, 150);
                $('body').css('position', 'relative')
                setTimeout(function(){getList(1);}, 1000);
            }else{
              alert(data.info);
            }
          },
          error: function(){
            alert(langData['siteConfig'][6][203]);//网络错误，请重试！
          }
        });   
    });
    
    //关闭页面
    $('.top_return a').click(function(){
      $('.te_choose').animate({'right':'-100%'},150);
      $('body').css('position','relative')
    });
    //表单验证
    $('#btn-keep').click(function () {
        var f=$(this),txt = f.text();
        var tid = f.attr('data-id');
        f.addClass("disabled").text(langData['siteConfig'][7][9]+'...');//保存中...
            var form = $("#fabuForm"), action = f.attr("data-action"),data = form.serialize();                    
            $.ajax({
                url: action,
                data: data,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);
                    
                    if(data && data.state == 100){   
                                  
                        $('.te_choose').animate({ 'right': '-100%' }, 150);
                        $('body').css('position', 'relative')
                        setTimeout(function(){getList(1);}, 500);
                        

                        
                    }else{
                        alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['renovation'][15][16]);//保存失败，请重试！
                    f.removeClass("disabled").text(txt);//
                }
            });
        

    });


    var page = 1;
    var loadMoreLock = false;
    var objId = $('.art_manage .com_ul');
    var objId2 = $('.forman .com_ul');
    var objId3 = $('.apply_manage .com_ul');

      //加载
    $(window).scroll(function() {       
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w;
        if ($(window).scrollTop() >= scroll && !loadMoreLock) {
            var page = parseInt($('.order_header .active').attr('data-page')),
                totalPage = parseInt($('.order_header .active').attr('data-totalPage'));
            if (page < totalPage) {
                ++page;
                loadMoreLock = true;
                $('.order_header .active').attr('data-page', page);
                getList();
            }
        };
    });

    getList();
    function getList() {
        var active = $('.order_header .active'), action = active.attr('data-id'), url;
        var page = active.attr('data-page');
      $('.loading').remove();
        if (action == 1) {
            
            objId.append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...           
            url =  "/include/ajax.php?service=renovation&u=1&company="+Identity.store.id+"&action=team&page="+page+"&pageSize=8";
          
        }else if(action == 2){
            
            objId2.append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
            url = "/include/ajax.php?service=renovation&u=1&action=foreman&company="+Identity.store.id+"&page="+page+"&pageSize=8";
        }else if(action == 3){
            
            objId3.append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
            url = "/include/ajax.php?service=renovation&u=1&action=Application&company="+Identity.store.id+"&page="+page+"&pageSize=8";
        }
        loadMoreLock = true;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                var list = data.info.list;
                if(data && data.state == 100){
                    var html = [];
                    var pageinfo = data.info.pageInfo,totalpage = pageinfo.totalPage;
                    active.attr('data-totalPage', totalpage);
                    if(list.length >0){

                        for(var i=0;i<list.length;i++){
                            var id      = list[i].id,
                                name    = list[i].name,
                                works   = list[i].works,
                                age     = list[i].age,
                                areaCode     = list[i].areaCode,
                                caseCount = list[i].caseCount,
                                tel = list[i].tel,
                                style = list[i].style,//工长类型
                                stylename = list[i].stylename,
                                photos = list[i].photos,
                                photo = list[i].photo;
                        html.push('<li class="com_li" data-id="'+id+'" data-name="'+name+'" data-photo="'+photo+'" data-photos="'+photos+'" data-works="'+works+'" data-age="'+age+'" data-code="'+areaCode+'"  data-tel="'+tel+'" data-style="'+style+'" data-stylename="'+stylename+'">');
                        html.push('    <div class="com_bottom">');                     
                        html.push('        <div class="left_b">');
                        html.push('          <img src="'+photo+'" alt="">');
                        html.push('        </div>');
                        html.push('        <div class="right_b">');                         
                        html.push('          <h4 class="com_type">'+name+'</h4>');
                        html.push('         <ul class="right_ul">');
                        if(action == 1){//设计师管理
                            //工作经验1年 -- 暂无工作经验
                            var works='',caseNum='';
                            works = list[i].works>0?langData['renovation'][15][19].replace('1',list[i].works):langData['renovation'][14][72];
                            //作品1套 --暂无作品 
                            caseNum = list[i].case>0?langData['renovation'][15][18].replace('1',list[i].age):langData['renovation'][14][76];

                            html.push('         <li>'+works+'</li>');
                            html.push('         <li>'+caseNum+'</li>');
                            html.push('     </ul>');
                            html.push('        <p class="phone">'+list[i].tel+'</p>');
                            html.push('        <p class="manage">'+langData['renovation'][10][9]+'</p>');//管理
                        }else if(action == 2){
                            //工龄1年 -- 暂无工作经验
                            var works='';
                            works = list[i].works>0?langData['renovation'][15][20].replace('1',list[i].works):langData['renovation'][14][72];
                            html.push('       <li>'+works+'</li>');
                            //年龄1岁
                            html.push('       <li>'+langData['renovation'][15][21].replace('1',list[i].age)+'</li>');
                            html.push('     </ul>');
                            html.push('         <p class="phone">'+list[i].tel+'</p>');
                            html.push('         <p class="manage foreman_manage">'+langData['renovation'][10][9]+'</p>'); // 管理
                        }else{
                            //工龄1年 -- 暂无工作经验
                            var works='';
                            works = list[i].works>0?langData['renovation'][15][20].replace('1',list[i].works):langData['renovation'][14][72];
                            html.push('       <li>'+works+'</li>');
                            if(list[i].moduletype =='designer'){
                                caseNum = list[i].case>0?langData['renovation'][15][18].replace('1',list[i].diary):langData['renovation'][14][76];
                                html.push('         <li>'+caseNum+'</li>');
                            }else{

                                //年龄1岁
                                html.push('       <li>'+langData['renovation'][15][21].replace('1',list[i].case)+'</li>');

                            }

                            html.push('     </ul>');
                            html.push('        <p class="phone">'+list[i].tel+'</p>');
                            html.push('    <div class="opinion">');
                            html.push('      <p class="agree" data-id= "'+list[i].id+'" data-type="'+list[i].moduletype+'">'+langData['renovation'][0][47]+'</p>');//同意
                            html.push('       <p class="refuse" data-id= "'+list[i].id+'" data-type="'+list[i].moduletype+'">'+langData['renovation'][0][48]+'</p>'); //   拒绝
                            html.push('    </div>');
                        }                                             
                        html.push('        </div>');                                                 
                        html.push('    </div>');        
                        html.push('</li>');

                    }
                    if (action == 1) {
                            objId.find('.loading').remove();
                            if(page == 1){
                                objId.html(html.join(""));
                            }else{
                                objId.append(html.join(""));
                            }
                        }else if(action == 2){
                            objId2.find('.loading').remove();
                            if(page == 1){
                                objId2.html(html.join(""));
                            }else{
                                objId2.append(html.join(""));
                            }
                        }else if(action == 3){
                            objId3.find('.loading').remove();
                            if(page == 1){
                                objId3.html(html.join(""));
                            }else{
                                objId3.append(html.join(""));
                            }
                        }
                        loadMoreLock = false;
                        if(page >= pageinfo.totalPage){
                            loadMoreLock = true;
                            if (action == 1) {
                                objId.append('<div class="loading">'+langData['renovation'][15][1]+'</div>');//没有更多啦~
                            }else if(action == 2){
                                objId2.append('<div class="loading">'+langData['renovation'][15][1]+'</div>');//没有更多啦~
                            }else if(action == 3){
                                objId3.append('<div class="loading">'+langData['renovation'][15][1]+'</div>');//没有更多啦~
                            }
                        }
                    }else{
                        loadMoreLock = false;
                        if(action == 1) {
                            objId.find('.loading').html(langData['siteConfig'][20][126]);//暂无相关信息！
                        }else if(action == 2){
                            objId2.find('.loading').html(langData['siteConfig'][20][126]);//暂无相关信息！
                        }else if(action == 3){
                            objId3.find('.loading').html(langData['siteConfig'][20][126]);//暂无相关信息！
                        }
                    }
                }else {
                    loadMoreLock = false;
                    if(action == 1) {
                        objId.find('.loading').html(data.info);
                    }else if(action == 2){
                        objId2.find('.loading').html(data.info);
                    }else if(action == 3){
                        objId3.find('.loading').html(data.info);
                    }
                }
            },
            error: function(){
                loadMoreLock = false;
                if (action == 1) {
                    objId.find('.loading').html(langData['renovation'][2][29]);//网络错误，加载失败...
                }else if(action == 2){
                    objId2.find('.loading').html(langData['renovation'][2][29]);//网络错误，加载失败...
                }else if(action == 3){
                    objId3.find('.loading').html(langData['renovation'][2][29]);//网络错误，加载失败...
                }
            }
        })
    }

    $('.apply_manage').delegate('.agree','click',function () {
        var id      = $(this).attr("data-id");
        var type    = $(this).attr("data-type");
        var updatetype    = 1;
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=agreeApplication&id="+id+"&type="+type+"&updatetype="+updatetype,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    alert("更改成功");
                }else{
                    alert(data.info);
                }
            },
            error: function(){
                alert(langData['siteConfig'][6][203]);//网络错误，请重试！
            }
        });
    })

    $('.apply_manage').delegate('.refuse','click',function () {
        var id      = $(this).attr("data-id");
        var type    = $(this).attr("data-type");
        var updatetype    = 2;
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=agreeApplication&id="+id+"&type="+type+"&updatetype="+updatetype,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    alert("更改成功");
                }else{
                    alert(data.info);
                }
            },
            error: function(){
                alert(langData['siteConfig'][6][203]);//网络错误，请重试！
            }
        });
    })

});