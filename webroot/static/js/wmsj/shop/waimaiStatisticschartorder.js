$(function() {
    $('#chartscontainer').highcharts({
      title: {
        text: langData['siteConfig'][16][40],
        x: -20 //center
      },
      xAxis: {
        categories: timeArr,
        labels: {
          step: 3,
        }
      },
      yAxis: {
        title: {
          text: langData['waimai'][6][168]
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      tooltip: {
        valueSuffix: langData['siteConfig'][13][36]
      },
      series: [{
        name: langData['siteConfig'][9][38],
        data: priceArr
      }]
    });
  });
