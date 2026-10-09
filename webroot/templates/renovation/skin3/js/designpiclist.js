$(function(){

	$('#container').waterfall({
		itemCls: 'item',
		prefix: 'container',
		colWidth: 280,
		gutterWidth: 15,
		gutterHeight: 15,
		minCol: 3,
		maxCol: 3,
		loadingMsg: ''
	});
	$('#container2').waterfall({
		itemCls: 'item',
		prefix: 'container',
		colWidth: 286,
		gutterWidth: 20,
		gutterHeight: 20,
		minCol: 4,
		maxCol: 4,
		loadingMsg: ''
	});

})
