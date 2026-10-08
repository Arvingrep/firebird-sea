$(function(){
  var obj = $('.container');
  var is_removeEmpty = false;
  // 显示隐藏零数据
  obj.delegate('.removeEmpty', 'click', function(){
    var t = $(this), item = t.closest('.item'), index = t.siblings('.changeType.active').index();
    var showCon = item.find('.statistics-table');
    var showCon_height = showCon.attr('data-height');
    if(showCon_height == undefined){
      showCon_height = showCon.outerHeight();
      showCon.css({'height':showCon_height});
    }
    if(t.hasClass('ishide')){
      t.removeClass('ishide').text(langData['siteConfig'][32][67]);  //隐藏零数据
      showCon.find('.empty').show();
    }else{
      t.addClass('ishide').text(langData['siteConfig'][32][74]);//显示零数据
      showCon.find('.empty').hide();
    }
    if(index > -1){
      is_removeEmpty = true;
      t.siblings('.changeType.active').click();
    }
  })

  // 切换统计图
  obj.delegate('.changeType', 'click', function(){
    var t = $(this), item = t.closest('.item'), gindex = item.index(), index = t.index();
    var showCon = item.find('.statistics_chart');
    showCon.html('');
    if(!is_removeEmpty && t.hasClass('active')){
      t.removeClass('active');
      return;
    }
    is_removeEmpty = false;
    t.addClass('active').siblings().removeClass('active');
    var boxId = 'statistics_chart_'+gindex;

    // 获取数据
    var title = '';
    var data = statisticsData[gindex],
        xuan = data.xuan,
        chardata = [],
        xuanList = [],
        xuanVote = [],
        xuanMax  = 0;
    var removeEmpty = t.siblings('.removeEmpty').hasClass('ishide') ? true :false;
    for(var i = 0; i < xuan.length; i++){
      var d = xuan[i], c = d.count;
      if(!removeEmpty || (removeEmpty && c)){
        xuanList.push(d.txt);
        xuanVote.push(d.count);
        xuanMax = c > xuanMax ? c : xuanMax;
        chardata.push([d.txt, parseInt(d.ratio.replace('%',''))]);
      }
    }
    xuanMax = xuanMax ? xuanMax : 10;
    // xuanMax *= 10;

    if(index == 0){
      var chart = Highcharts.chart(boxId, {
            title: {
                text: title
            },
            credits: {
                enabled: false
            },
            tooltip: {
                headerFormat: '',
                pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,  // 可以被选择
                    cursor: 'pointer',       // 鼠标样式
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: [{
                type: 'pie',
                name: '',
                data: chardata
            }]
          });

    }else if(index == 1){
      var chart = Highcharts.chart(boxId, {
            chart: {
                spacing : [40, 0 , 40, 0]
            },
            credits: {
                enabled: false
            },
            title: {
                floating:true,
                text: title
            },
            tooltip: {
                pointFormat: '<b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    },
                    point: {
                        events: {
                            mouseOver: function(e) {  // 鼠标滑过时动态更新标题
                                // 标题更新函数，API 地址：https://api.hcharts.cn/highcharts#Chart.setTitle
                                chart.setTitle({
                                    text: e.target.name+ '\t'+ e.target.y + ' %'
                                });
                            }
                            //,
                            // click: function(e) { // 同样的可以在点击事件里处理
                            //     chart.setTitle({
                            //         text: e.point.name+ '\t'+ e.point.y + ' %'
                            //     });
                            // }
                        }
                    },
                }
            },
            series: [{
                type: 'pie',
                innerSize: '80%',
                name: '',
                data: chardata
            }]
        }, function(c) { // 图表初始化完毕后的回调函数
            // 环形图圆心
            // var centerY = c.series[0].center[1],
            //     titleHeight = parseInt(c.title.styles.fontSize);
            // // 动态设置标题位置
            // c.setTitle({
            //     y:centerY + titleHeight/2
            // });
        });

    }else if(index == 2){
      var chart = Highcharts.chart(boxId,{
            chart: {
                type: 'column'
            },
            credits: {
                enabled: false
            },
            title: {
                text: ''
            },
            subtitle: {
            },
            xAxis: {
                categories: xuanList
            },
            yAxis: {
                min: 0,
                max: xuanMax,
                minPadding: 10,
                allowDecimals: false,
                title: {
                    text: langData['siteConfig'][30][89]    //投票数 (票)
                },
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            tooltip: {
               valueSuffix: langData['siteConfig'][30][90]  //票
            },
            series: [{
                name: langData['siteConfig'][30][91],//票数
                data: xuanVote
            }]
          });

    }else if(index == 3){
      var chart = Highcharts.chart(boxId, {
            chart: {
                type: 'bar'
            },
            credits: {
                enabled: false
            },
            title: {
                text: ''
            },
            subtitle: {
            },
            xAxis: {
                categories: xuanList
            },
            yAxis: {
                min: 0,
                max: xuanMax,
                allowDecimals: false,
                title: {
                    text: langData['siteConfig'][30][89]    //投票数 (票)
                },
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y:.1f} '+langData['siteConfig'][30][90]+' </b></td></tr>',  //票
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            tooltip: {
               valueSuffix: langData['siteConfig'][30][90]  //票
            },
            series: [{
                name: langData['siteConfig'][30][91],//票数
                data: xuanVote
            }]
        });
    }

  })

})
