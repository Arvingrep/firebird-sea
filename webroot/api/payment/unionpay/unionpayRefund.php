<?php
/**
 * 微信扫码支付主文件
 *
 * @version        $Id: wxpay.php $v1.0 2015-12-10 下午23:35:11 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

  return;

}


/**
 * 重要：联调测试时请仔细阅读注释！
 *
 * 产品：跳转网关支付产品<br>
 * 交易：消费撤销类交易：后台消费撤销交易，有同步应答和后台通知应答<br>
 * 日期： 2015-09<br>
 * 版权： 中国银联<br>
 * 说明：以下代码只是为了方便商户测试而提供的样例代码，商户可以根据自己需要，按照技术文档编写。该代码仅供参考，不提供编码性能规范性等方面的保障<br>
 * 该接口参考文档位置：open.unionpay.com帮助中心 下载  产品接口规范  《网关支付产品接口规范》<br>
 *              《平台接入接口规范-第5部分-附录》（内包含应答码接口规范，全渠道平台银行名称-简码对照表）<br>
 * 测试过程中的如果遇到疑问或问题您可以：1）优先在open平台中查找答案：
 *                                  调试过程中的问题或其他问题请在 https://open.unionpay.com/ajweb/help/faq/list 帮助中心 FAQ 搜索解决方案
 *                             测试过程中产生的7位应答码问题疑问请在https://open.unionpay.com/ajweb/help/respCode/respCodeList 输入应答码搜索解决方案
 *                          2） 咨询在线人工支持： open.unionpay.com注册一个用户并登陆在右上角点击“在线客服”，咨询人工QQ测试支持。
 * 交易说明:1）以后台通知或交易状态查询交易确定交易成功
 *       2）消费撤销仅能对当清算日的消费做，必须为全额，一般当日或第二日到账。
 */

// 加载支付方式操作函数
loadPlug("payment");

include_once(dirname(__FILE__)."/acp_service.php");
define('SDK_SIGN_CERT_PATH', HUONIAOROOT.'/api/payment/unionpay/shiyao.pfx');
define('SDK_VERIFY_CERT_DIR', HUONIAOROOT.'/api/payment/unionpay/');
define('SDK_FRONT_TRANS_URL', 'https://gateway.95516.com/gateway/api/frontTransReq.do');
define('SDK_BACK_TRANS_URL', 'https://gateway.95516.com/gateway/api/backTransReq.do');
define('SDK_LOG_LEVEL', PhpLog::OFF);

$payment = get_payment("unionpay");
define('UNIONPAY_ACCOUNT', $payment['account']);
define('SDK_SIGN_CERT_PWD', $payment['certpwd']);

/**
 * 类
 */
class unionpayRefund {

  /**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    public $appId;

    public $rsaPrivateKey;

    public $wxpayrsaPublicKey;

    function __construct(){
        $this->unionpayRefund();
    }

    function unionpayRefund(){

    }

    function refund($order){

        global $cfg_secureAccess;
        global $cfg_basehost;

        $date = GetMkTime(time());

        $orderId = 'T'.$order["ordernum"];

        loadPlug("payment");
        $payment = get_payment("unionpay");

        $params = array(

            //以下信息非特殊情况不需要改动
            'version' => '5.0.0',             //版本号
            'encoding' => 'utf-8',            //编码方式
            'signMethod' => '01',           //签名方法
            'txnType' => '31',                //交易类型
            'txnSubType' => '00',             //交易子类
            'bizType' => '000201',            //业务类型
            'accessType' => '0',              //接入类型
            'channelType' => '07',            //渠道类型
            'backUrl' => $cfg_secureAccess.$cfg_basehost.'/api/payment/unionpay/unionpayRefundBack.php', //后台通知地址

            //TODO 以下信息需要填写
            'orderId' => $orderId,     //商户订单号，8-32位数字字母，不能含“-”或“_”，可以自行定制规则，重新产生，不同于原消费，此处默认取demo演示页面传递的参数
            'merId' => $payment['account'],         //商户代码，请改成自己的测试商户号，此处默认取demo演示页面传递的参数
            'origQryId' => $order['transaction_id'], //原消费的queryId，可以从查询接口或者通知接口中获取，此处默认取demo演示页面传递的参数
            'txnTime' => date('YmdHis', $date),     //订单发送时间，格式为YYYYMMDDhhmmss，重新产生，不同于原消费，此处默认取demo演示页面传递的参数
            'txnAmt' => $order["amount"] * 100,       //交易金额，消费撤销时需和原消费一致，此处默认取demo演示页面传递的参数

            // 请求方保留域，
            // 透传字段，查询、通知、对账文件中均会原样出现，如有需要请启用并修改自己希望透传的数据。
            // 出现部分特殊字符时可能影响解析，请按下面建议的方式填写：
            // 1. 如果能确定内容不会出现&={}[]"'等符号时，可以直接填写数据，建议的方法如下。
            //    'reqReserved' =>'透传信息1|透传信息2|透传信息3',
            // 2. 内容可能出现&={}[]"'符号时：
            // 1) 如果需要对账文件里能显示，可将字符替换成全角＆＝｛｝【】“‘字符（自己写代码，此处不演示）；
            // 2) 如果对账文件没有显示要求，可做一下base64（如下）。
            //    注意控制数据长度，实际传输的数据长度不能超过1024位。
            //    查询、通知等接口解析时使用base64_decode解base64后再对数据做后续解析。
            //    'reqReserved' => base64_encode('任意格式的信息都可以'),
        );

        AcpService::sign ( $params ); // 签名
        $url = "https://gateway.95516.com/gateway/api/backTransReq.do";

        $result_arr = AcpService::post ( $params, $url);
        if(count($result_arr)<=0) { //没收到200应答的情况
            return array("state" => 200, "code" => "POST请求失败");

            // printResult ( $url, $params, "" );
            // echo "POST请求失败：" . $errMsg;
            // return;
        }

        // printResult ($url, $params, $result_arr ); //页面打印请求应答数据

        if (!AcpService::validate ($result_arr) ){
            return array("state" => 200, "code" => "应答报文验签失败");

            // echo "应答报文验签失败<br>\n";
            // return;
        }

        if ($result_arr["respCode"] == "00"){
            return array("state" => 100, "date" => $date, "trade_no" => $orderId);

            // return array("state" => 100, "info" => "受理成功");

            //交易已受理，等待接收后台通知更新订单状态，如果通知长时间未收到也可发起交易状态查询
            //TODO
            echo "受理成功。<br>\n";
        } else if ($result_arr["respCode"] == "03"
                || $result_arr["respCode"] == "04"
                || $result_arr["respCode"] == "05" ){
            //后续需发起交易状态查询交易确定交易状态
            //TODO
            return array("state" => 200, "code" => "处理超时，请稍后查询。");

             // echo "处理超时，请稍微查询。<br>\n";
        } else {
            //其他应答码做以失败处理
             //TODO
            return array("state" => 200, "code" => "失败：" . $result_arr["respMsg"]);

             // echo "失败：" . $result_arr["respMsg"] . "。<br>\n";
        }

    }

}

/**
 * 打印请求应答
 *
 * @param
 *          $url
 * @param
 *          $req
 * @param
 *          $resp
 */
function printResult($url, $req, $resp) {
    echo "=============<br>\n";
    echo "地址：" . $url . "<br>\n";
    echo "请求：" . str_replace ( "\n", "\n<br>", htmlentities ( createLinkString ( $req, false, true ) ) ) . "<br>\n";
    echo "应答：" . str_replace ( "\n", "\n<br>", htmlentities ( createLinkString ( $resp , false, false )) ) . "<br>\n";
    echo "=============<br>\n";
}
