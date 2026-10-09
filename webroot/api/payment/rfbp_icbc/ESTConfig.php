<?php
class ESTConfig
{
    //统一下单
    const payCreateUrl = "/ecp/ecpserver/pay/api/pay/create";
    //支付查询
    const payQueryUrl = "/ecp/ecpserver/pay/api/pay/query";
    //统一退款
    const refundCreateUrl = "/ecp/ecpserver/pay/api/refund/create";
    //退款查询
    const refundQueryUrl = "/ecp/ecpserver/pay/api/refund/query";
    //分账-子订单查询
    const shareAllocationQuery = "/ecp/ecpserver/open/api/shareAllocation/query/v2";
    //分账-子订单录入
    const shareAllocationApply = "/ecp/ecpserver/open/api/shareAllocation/apply/v2";
}
