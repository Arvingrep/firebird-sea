
/*
 Template Name: Stexo - Responsive Bootstrap 4 Admin Dashboard
 Author: Themesdesign
 Website: www.themesdesign.in
 File: Morris init js
 */

!function($) {
    "use strict";

    var MorrisCharts = function() {};
	var upIncome = function(data,type){
		$.ajax({
		    url: './member/commissionCount.php?dopost=getallmoney',
		    data: data,
		    type: "GET",
		    dataType: "json",
		    success: function (data) {
		        if(data.state == 100){
		           if(type===1){
					   console.log(1)
		        	   var $data  = [];
		        	   for(var d in data.info.coutinfo){
		        		   $data.push({
		        			   y:d,
		        			  a:data.info.coutinfo[d].czamount,
		        			  b:data.info.coutinfo[d].platform,
		        		   })
		        	   }
					   $('#morris-line-yj').html('')
		        	    MorrisCharts.prototype.createLineChart('morris-line-yj', $data, 'y', ['a', 'b'], ['佣金', '充值'], ['#30419b', '#02c58d']);
		           }else if(type===0){
					   console.log(2)
		        	   var $data2  = [];
		        	   for(var d in data.info.coutinfo){
		        	   	   $data2.push({
		        	   		   y:d,
		        	   		   b:data.info.coutinfo[d].expenditure,
		        	   	   })
		        	   }
					    $('#morris-line-zc').html('')
		        	   MorrisCharts.prototype.createLineChart('morris-line-zc', $data2, 'y', [ 'b'], [ '支出'], [ '#02c58d']);
		           }else{
					  $('#morris-line-yj').html('');
					  $('#morris-line-zc').html('');
		        	   var $data  = [];
		        	   for(var d in data.info.coutinfo){
						   console.log(data.info.coutinfo[d].czamount)
		        	   	   $data.push({
		        	   		   y:d,
		        	   		   a:data.info.coutinfo[d].czamount,
		        	   		   b:data.info.coutinfo[d].platform,
		        	   	   })
		        	   }
		        	   var $data2  = [];
		        	   for(var d in data.info.coutinfo){
		        	   	   $data2.push({
		        	   		   y:d,
		        	   		   b:data.info.coutinfo[d].expenditure,
		        	   	   })
		        	   }
		        	    MorrisCharts.prototype.createLineChart('morris-line-yj', $data, 'y', ['a', 'b'], ['佣金', '充值'], ['#30419b', '#02c58d']);
		        	   MorrisCharts.prototype.createLineChart('morris-line-zc', $data2, 'y', [ 'b'], [ '支出'], [ '#02c58d']);
		           }
				   $('.yj h3').html('<em>'+echoCurrency('symbol')+'</em>'+data.info.allplatform);
				   $('.cz h3').html('<em>'+echoCurrency('symbol')+'</em>'+data.info.allczamount)
				   $('.zc h3').html('<em>'+echoCurrency('symbol')+'</em>'+data.info.allzhichu)
		        }
		    }
		});
	};
    $('.time_chose span').click(function(){
		var t = $(this);
		var type = Number(t.parents('.time_chose').attr('data-type'));
		t.addClass('on_chose').siblings('span').removeClass('on_chose');
		if($(this).hasClass('month')){
			var now  = new Date();
			var lastMonth = new Date();
			var today = now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
			lastMonth.setMonth(lastMonth.getMonth()-1);
			var lm = lastMonth.getFullYear()+'-'+(lastMonth.getMonth()+1)+'-'+lastMonth.getDate();
			var data = {
				start:lm,
				end:today
			}
			upIncome(data,type)
		}else if($(this).hasClass('week')){
			upIncome('',type)
		}
		
		
	})
    //creates line chart
    MorrisCharts.prototype.createLineChart = function(element, data, xkey, ykeys, labels, lineColors) {
        Morris.Line({
          element: element,
          data: data,
          xkey: xkey,
          ykeys: ykeys,
          labels: labels,
          hideHover: 'auto',
          gridLineColor: '#eef0f2',
          resize: true, //defaulted to true
          lineColors: lineColors
        });
    },

    MorrisCharts.prototype.init = function() {
		var optionSet2 = {
		  " autoApply": true,
		    opens: 'left',
			  "linkedCalendars": false,
		 };
		
		$('#reportrange2').daterangepicker(optionSet2, function(start, end, label) {
				$('#reportrange2 span.time_in').html(start.format('YYYY-MM-DD') +' 至 '+end.format('YYYY-MM-DD'))
				console.log("New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')");
				$('#reportrange2').attr('data-start',start.format('YYYY-MM-DD'));
				$('#reportrange2').attr('data-end',end.format('YYYY-MM-DD'));
				var data = {
					start:start.format('YYYY-MM-DD'),
					end:end.format('YYYY-MM-DD')
				}
			upIncome(data,1)	
		});
		$('#reportrange1').daterangepicker( optionSet2,function(start, end, label) {
				$('#reportrange1 span.time_out').html(start.format('YYYY-MM-DD') +' 至 '+end.format('YYYY-MM-DD'))
				console.log("New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')");
				$('#reportrange1').attr('data-start',start.format('YYYY-MM-DD'));
				$('#reportrange1').attr('data-end',end.format('YYYY-MM-DD'));
				var data = {
						start:start.format('YYYY-MM-DD'),
						end:end.format('YYYY-MM-DD')
					}
				upIncome(data,0)	
		});
		
		upIncome();
        // create line chart
   //      var $data  = [
   //          { y: '2010', a: 75,  b: 65 },
   //          { y: '2011', a: 50,  b: 40 },
   //          { y: '2012', a: 75,  b: 65 },
   //          { y: '2013', a: 50,  b: 40 },
   //          { y: '2014', a: 75,  b: 65 },
   //          { y: '2015', a: 50, b: 40 },
			// { y: '2016', a: 51, b: 40 }
   //        ];
		 //  this.createLineChart('morris-line-yj', $data, 'y', ['a', 'b'], ['佣金', '充值'], ['#30419b', '#02c58d']);
		 //  var $data2  = [
		 //      { y: '2010',   b: 65 },
		 //      { y: '2011',   b: 40 },
		 //      { y: '2012',   b: 65 },
		 //      { y: '2013',   b: 40 },
		 //      { y: '2014',   b: 65 },
		 //      { y: '2015',  b: 40 }
		 //    ];
        
		 // this.createLineChart('morris-line-zc', $data2, 'y', [ 'b'], [ '支出'], [ '#02c58d']);
		 // console.log(this)
		 
    },
   
	//init
    $.MorrisCharts = new MorrisCharts, $.MorrisCharts.Constructor = MorrisCharts
}(window.jQuery),


//initializing 
function($) {
    "use strict";
    $.MorrisCharts.init();
}(window.jQuery);