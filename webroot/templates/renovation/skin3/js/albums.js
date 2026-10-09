$(function() {
  $('#container').waterfall({
    itemCls: 'item',
    prefix: 'container',
    colWidth: 280,
    gutterWidth: 15,
    gutterHeight: 20,
    minCol: 3,
    maxCol: 3,
    loadingMsg: ''
  });
})