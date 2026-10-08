$(function(){

	var AreaSelectBox = $('.ui-country'),
			TelSelectBox = $('.ui-select');

	$('body').click(function(){
		AreaSelectBox.hide();
		TelSelectBox.hide();
	})

	$('#country-1').click(function(){
		if (AreaSelectBox.css("display")=='none') {
			AreaSelect();
			return false;
		}else{
			AreaSelectBox.hide();
		};
	})
	$('#J-countryMobileCode').click(function(){
		if (TelSelectBox.css("display")=='none') {
			TelSelect();
			return false;
		}else{
			TelSelectBox.hide();
		};
	})
	$('.ui-country-tops li').click(function(){
		var u = $(this),
			country = u.text();
			uval = u.attr("data-value");
		$('#country-1 label').text(country);
		$('.ui-select-content li').each(function(){
			x = $(this), xval = x.attr("data-value"),num = x.find('span').text();
			if (xval == uval) {
				$('#J-countryMobileCode label').text(num);
				AreaSelectBox.hide();
			};
		})
		AreaSelectBox.hide();
	})
	$('.ui-country-group li').click(function(){
		var  u = $(this), uval = u.attr("data-value");
		$('.ui-country-content li').hide();
		$('.ui-country-content li').each(function(){
			x = $(this), xval = x.attr("data-group");
			if (xval == uval) {
				x.show();
			};
		})
		u.addClass('tab-active');
		u.siblings('li').removeClass('tab-active');
		return false;
	})
	$('.ui-country-item').click(function(){
		var  u = $(this), uval = u.attr("data-value"),
			country = u.text();
		$('#country-1 label').text(country);
		$('.ui-select-content li').each(function(){
			x = $(this), xval = x.attr("data-value"),num = x.find('span').text();
			if (xval == uval) {
				$('#J-countryMobileCode label').text(num);
				AreaSelectBox.hide();
			};
		})
	})
	$('.ui-select-content').delegate('li','click',function(){
		var u = $(this),
			country = u.find('span').text();
			uval = u.attr("data-value");
		$('.ui-country li').each(function(){
			x = $(this), xval = x.attr("data-value"),num = x.text();
			if (xval == uval) {
				$('#country-1 label').text(num);
				AreaSelectBox.hide();
			};
		})
		$('#J-countryMobileCode label').text(country);
		TelSelectBox.hide();
	})


	// 选择国际/地区
	function AreaSelect() {
		var country = $('#country-1'), countryLeft = country.offset().left,
				countryTop  = country.offset().top + country.outerHeight() - 1;
		AreaSelectBox.css({'top':countryTop+'px','left':countryLeft+'px'}).show();
	}

	// 选择手机号
	function TelSelect() {
		var tel = $('#J-countryMobileCode'), telLeft = tel.offset().left,
				telTop  = tel.offset().top + tel.outerHeight() - 1;
		TelSelectBox.css({'top':telTop+'px','left':telLeft+'px'}).show();
	}

})
