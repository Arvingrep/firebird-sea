$(function() {
    $('#chartscontainer').highcharts({
      title: {
        text: langData['waimai'][1][5],
        x: -20
      },
      xAxis: {
        categories: timeArr,
        labels: {
          step: 3,
        }
      },
      yAxis: {
        title: {
          text: langData['waimai'][6][169]
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      tooltip: {
        valueSuffix: echoCurrency('short')
      },
      series: [{
        name: langData['waimai'][1][12],
        data: priceArr
      }]
    });
});
