<?php
/**
 * 支付宝转账主文件
 *
 * @version        $Id: alipayTransfers.php $v1.0 2019-7-10 上午11:18:19 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');


/**
 * 类
 */
class alipayTransfers {

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

    public $alipayrsaPublicKey;

    function __construct(){
        $this->alipayTransfers();
    }

    /**
     * 初始化
    */
    function alipayTransfers(){

        // 加载支付方式操作函数
        loadPlug("payment");
        $payment = get_payment("alipay");

        $this->appId = $payment['appid'];
        $this->rsaPrivateKey = $payment['appPrivate'];
        $this->alipayrsaPublicKey = $payment['alipayPublic'];
        $this->pid = $payment['partner'];

    }

    /**
     * 申请电子回单
    */
    function applyIncubating($order){
        global $dsql;
        require_once ("aop/AopCertClient.php");
        require_once ("aop/request/AlipayDataBillEreceiptApplyRequest.php");

        $appId = $this->appId;
        $rsaPrivateKey = $this->rsaPrivateKey;

        //应用证书路径
        $appCertPath = dirname(__FILE__) . "/cert/appCertPublicKey.crt";

        //支付宝公钥证书路径
        $alipayCertPath = dirname(__FILE__) . "/cert/alipayCertPublicKey_RSA2.crt";

        $aop = new AopCertClient ();
        $aop->gatewayUrl = 'https://openapi.alipay.com/gateway.do';
        $aop->appId = $appId;
        $aop->rsaPrivateKey = $rsaPrivateKey;
        // $aop->alipayrsaPublicKey = $alipayrsaPublicKey;
        $aop->apiVersion = '1.0';
        $aop->signType = 'RSA2';
        $aop->postCharset='UTF-8';
        $aop->format='json';

        //调用getPublicKey从支付宝公钥证书中提取公钥
        $aop->alipayrsaPublicKey = $aop->getPublicKey($alipayCertPath);
        //是否校验自动下载的支付宝公钥证书，如果开启校验要保证支付宝根证书在有效期内
        $aop->isCheckAlipayPublicCert = true;
        //调用getCertSN获取证书序列号
        $aop->appCertSN = $aop->getCertSN($appCertPath);
        //调用getRootCertSN获取支付宝根证书序列号
        $aop->alipayRootCertSN = '687b59193f3f462dd5336e5abf83c5d8_02941eef3187dddf3d3b83462e1dfcf6';  //到2028年之前都不会变


        $request = new AlipayDataBillEreceiptApplyRequest ();
        $pid = $this->pid;
        $order_id = $order['order_id'];  //单据号
        $request->setBizContent("{" .
            "  \"type\":\"FUND_DETAIL\"," .
            "  \"key\":\"$order_id\"," .
            "  \"bill_user_id\":\"$pid\"" .
            "}");
        $result = $aop->execute ( $request);
        $responseNode = str_replace(".", "_", $request->getApiMethodName()) . "_response";
        $resultCode = $result->$responseNode->code;
        if(!empty($resultCode)&&$resultCode == 10000){
            $fid = $result->$responseNode->file_id;
            //记录fid【支付宝比较特殊，要先用fid，直接记录在receipt_ali_fid中】
            $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `receipting` = 1,`ordernum`='{$order['ordernum']}',`receipt_ali_fid`='$fid' WHERE `id` = {$order['id']}");
            $dsql->dsqlOper($sql, "update");
            return array("state"=>100,"info"=>"电子回单申请中，请等待...");
        } else {
            $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `receipting` = 2,`ordernum`='{$order['ordernum']}',`receipt_fail_reason`='电子回单申请失败' WHERE `id` = {$order['id']}");
            $dsql->dsqlOper($sql, "update");
            return array("state"=>200,"info"=>"电子回单申请失败");
        }
    }

    /**
     * 查询电子回单
    */
    function queryIncubating($order){
        global $dsql;
        require_once ("aop/AopCertClient.php");
        require_once ("aop/request/AlipayDataBillEreceiptQueryRequest.php");
        $appId = $this->appId;
        $rsaPrivateKey = $this->rsaPrivateKey;

        //应用证书路径
        $appCertPath = dirname(__FILE__) . "/cert/appCertPublicKey.crt";

        //支付宝公钥证书路径
        $alipayCertPath = dirname(__FILE__) . "/cert/alipayCertPublicKey_RSA2.crt";

        $aop = new AopCertClient ();
        $aop->gatewayUrl = 'https://openapi.alipay.com/gateway.do';
        $aop->appId = $appId;
        $aop->rsaPrivateKey = $rsaPrivateKey;
        // $aop->alipayrsaPublicKey = $alipayrsaPublicKey;
        $aop->apiVersion = '1.0';
        $aop->signType = 'RSA2';
        $aop->postCharset='UTF-8';
        $aop->format='json';

        //调用getPublicKey从支付宝公钥证书中提取公钥
        $aop->alipayrsaPublicKey = $aop->getPublicKey($alipayCertPath);
        //是否校验自动下载的支付宝公钥证书，如果开启校验要保证支付宝根证书在有效期内
        $aop->isCheckAlipayPublicCert = true;
        //调用getCertSN获取证书序列号
        $aop->appCertSN = $aop->getCertSN($appCertPath);
        //调用getRootCertSN获取支付宝根证书序列号
        $aop->alipayRootCertSN = '687b59193f3f462dd5336e5abf83c5d8_02941eef3187dddf3d3b83462e1dfcf6';  //到2028年之前都不会变

        $request = new AlipayDataBillEreceiptQueryRequest ();
        $fid = $order['fid'];
        $request->setBizContent("{" .
            "\"file_id\":\"$fid\"" .
            "  }");
        $result = $aop->execute ( $request);

        $responseNode = str_replace(".", "_", $request->getApiMethodName()) . "_response";
        $resultCode = $result->$responseNode->code;
        if(!empty($resultCode)&&$resultCode == 10000){
            $status = $result->$responseNode->status;
            //回单成功，下载并保存
            if($status=="SUCCESS"){
                global $cfg_uploadDir;
                $download_url = $result->$responseNode->download_url;
                //下载该文件到本地，并上传到远程服务器
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $download_url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
                $fileStr = curl_exec($ch);
                $fileDir = HUONIAOROOT.$cfg_uploadDir."/siteConfig/receipt/";
                if(!is_dir($fileDir)){
                    mkdir($fileDir,0777,true);
                }
                $file_name = $dsql->getOne($dsql::SetQuery("select `note` from `#@__member_withdraw` where `id`={$order['id']}"));
                $filePath = HUONIAOROOT.$cfg_uploadDir."/siteConfig/receipt/".$file_name.".pdf";
                $pngPath = HUONIAOROOT.$cfg_uploadDir."/siteConfig/receipt/".$file_name.".png";
                file_put_contents($filePath,$fileStr);
                //尝试把pdf转换为图片
                if(is_callable("exec")){
                    $cmd = "magick convert -density 200 -background white -alpha remove -quality 100 $filePath -append $pngPath";
                    exec($cmd);
                    if(file_exists($pngPath)){
                        unlinkFile($filePath); //删除pdf
                        $filePath = $pngPath;
                    }
                }
                //上传保存到远程服务器...
                global $cfg_ftpUrl;
                global $cfg_fileUrl;
                global $cfg_uploadDir;
                global $cfg_ftpType;
                global $cfg_ftpState;
                global $cfg_ftpDir;
                global $cfg_quality;
                global $cfg_softSize;
                global $cfg_softType;
                global $cfg_editorSize;
                global $cfg_editorType;
                global $cfg_videoSize;
                global $cfg_videoType;
                global $cfg_meditorPicWidth;
                global $cfg_ftpSSL;
                global $cfg_ftpPasv;
                global $cfg_ftpServer;
                global $cfg_ftpPort;
                global $cfg_ftpUser;
                global $cfg_ftpPwd;
                global $cfg_ftpTimeout;
                global $cfg_OSSUrl;
                global $cfg_OSSBucket;
                global $cfg_EndPoint;
                global $cfg_OSSKeyID;
                global $cfg_OSSKeySecret;
                global $cfg_QINIUAccessKey;
                global $cfg_QINIUSecretKey;
                global $cfg_QINIUbucket;
                global $cfg_QINIUdomain;
                global $cfg_OBSUrl;
                global $cfg_OBSBucket;
                global $cfg_OBSEndpoint;
                global $cfg_OBSKeyID;
                global $cfg_OBSKeySecret;
                global $cfg_COSUrl;
                global $cfg_COSBucket;
                global $cfg_COSRegion;
                global $cfg_COSSecretid;
                global $cfg_COSSecretkey;

                global $editorMarkState;
                global $editor_ftpType;
                global $editor_ftpState;
                global $customUpload;
                global $custom_uploadDir;
                global $customFtp;
                global $custom_ftpType;
                global $custom_ftpState;
                global $custom_ftpDir;
                global $custom_ftpServer;
                global $custom_ftpPort;
                global $custom_ftpUser;
                global $custom_ftpPwd;
                global $custom_ftpDir;
                global $custom_ftpUrl;
                global $custom_ftpTimeout;
                global $custom_ftpSSL;
                global $custom_ftpPasv;
                global $custom_OSSUrl;
                global $custom_OSSBucket;
                global $custom_EndPoint;
                global $custom_OSSKeyID;
                global $custom_OSSKeySecret;
                global $custom_QINIUAccessKey;
                global $custom_QINIUSecretKey;
                global $custom_QINIUbucket;
                global $custom_QINIUdomain;
                global $editor_ftpDir;
                global $custom_OBSUrl;
                global $custom_OBSBucket;
                global $custom_OBSEndpoint;
                global $custom_OBSKeyID;
                global $custom_OBSKeySecret;
                global $custom_COSUrl;
                global $custom_COSBucket;
                global $custom_COSRegion;
                global $custom_COSSecretid;
                global $custom_COSSecretkey;
                global $editor_uploadDir;

                $cfg_softType = $cfg_softType ? explode("|", $cfg_softType) : array();
                $cfg_editorType = $cfg_editorType ? explode("|", $cfg_editorType) : array();
                $cfg_videoType = $cfg_videoType ? explode("|", $cfg_videoType) : array();

                $editor_uploadDir = $cfg_uploadDir;
                // $cfg_uploadDir = "/" . $path . $cfg_uploadDir;
                $editor_ftpType = $cfg_ftpType;

                $custom_ftpState = $editor_ftpState = $cfg_ftpState;
                $custom_ftpType = $cfg_ftpType;
                $custom_ftpSSL = $cfg_ftpSSL;
                $custom_ftpPasv = $cfg_ftpPasv;
                $custom_ftpUrl = $cfg_ftpUrl;
                $custom_ftpServer = $cfg_ftpServer;
                $custom_ftpPort = $cfg_ftpPort;
                $custom_ftpDir = $editor_ftpDir = $cfg_ftpDir;
                $custom_ftpUser = $cfg_ftpUser;
                $custom_ftpPwd = $cfg_ftpPwd;
                $custom_ftpTimeout = $cfg_ftpTimeout;
                $custom_OSSUrl = $cfg_OSSUrl;
                $custom_OSSBucket = $cfg_OSSBucket;
                $custom_EndPoint = $cfg_EndPoint;
                $custom_OSSKeyID = $cfg_OSSKeyID;
                $custom_OSSKeySecret = $cfg_OSSKeySecret;
                $custom_QINIUAccessKey = $cfg_QINIUAccessKey;
                $custom_QINIUSecretKey = $cfg_QINIUSecretKey;
                $custom_QINIUbucket = $cfg_QINIUbucket;
                $custom_QINIUdomain = $cfg_QINIUdomain;
                $custom_OBSUrl = $cfg_OBSUrl;
                $custom_OBSBucket = $cfg_OBSBucket;
                $custom_OBSEndpoint = $cfg_OBSEndpoint;
                $custom_OBSKeyID = $cfg_OBSKeyID;
                $custom_OBSKeySecret = $cfg_OBSKeySecret;
                $custom_COSUrl = $cfg_COSUrl;
                $custom_COSBucket = $cfg_COSBucket;
                $custom_COSRegion = $cfg_COSRegion;
                $custom_COSSecretid = $cfg_COSSecretid;
                $custom_COSSecretkey = $cfg_COSSecretkey;

                $remotePath = "..".$editor_uploadDir."/siteConfig/receipt/";
                $res = getRemoteImage(array($filePath), array("savePath" => $remotePath), 'siteConfig', '..', false, 2);
                $fpath = "";
                if($res){
                    $res = json_decode($res,true);
                    if($res['state']=="SUCCESS"){
                        if($res['list'][0]['state']=="SUCCESS"){
                            $fpath = $res['list'][0]['fid'];
                        }
                    }
                }
                //记录回单地址到数据库中，并更新状态
                $oid = $order['id'];
                $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `receipt` = '$fpath',`receipting`=0 WHERE `id` = {$oid}");
                $dsql->dsqlOper($sql, "update");
            }
            //生成中，记录到状态，并定时调用
            elseif($status=="PROCESS"){
                $oid = $order['id'];
                $sql = $dsql::SetQuery("update `#@__member_withdraw` set `receipting`=1 where `id`=$oid");
                $dsql->update($sql);
            }
            //回单失败了
            else{
                $error_message = $result->$responseNode->error_message;
                $oid = $order['id'];
                $sql = $dsql::SetQuery("update `#@__member_withdraw` set `receipting`=2,`receipt_fail_reason`='".addslashes($error_message)."' where `id`=$oid");
                $dsql->update($sql);
            }
        } else {
            //请求失败了
            $msg = $result->$responseNode->code;
            return array("state"=>200,"info"=>$msg);
        }
    }

    /**
     * 支付
    */
    function transfers($order){
        require_once ("aop/AopCertClient.php");
        require_once ("aop/request/AlipayFundTransUniTransferRequest.php");

        $appId = $this->appId;
        $rsaPrivateKey = $this->rsaPrivateKey;
        $alipayrsaPublicKey = $this->alipayrsaPublicKey;

        // ----------订单信息
        // 商户订单号
        $out_trade_no = $order['ordernum'];
        // 账户
        $account = $order['account'];
        // 姓名
        $name = $order['name'];
        // 提现金额
        $amount = $order['amount'];
        // 备注
        global $cfg_shortname;
        $desc = $cfg_shortname . "余额提现";
        // 用户ID
        $userid = $order['userid'];

        // 标志一次退款请求 格式为：退款日期（8位）+流水号（3～24位）。不可重复，且退款日期必须是当天日期。流水号可以接受数字或英文字符，建议使用数字，但不可接受“000”
        $out_request_no = date('YmdHis').$out_trade_no;

        //应用证书路径
        $appCertPath = dirname(__FILE__) . "/cert/appCertPublicKey.crt";

        //支付宝公钥证书路径
        $alipayCertPath = dirname(__FILE__) . "/cert/alipayCertPublicKey_RSA2.crt";

        //支付宝根证书路径
        $rootCertPath = dirname(__FILE__) . "/cert/alipayRootCert.crt";

        $aop = new AopCertClient ();
        $aop->gatewayUrl = 'https://openapi.alipay.com/gateway.do';
        $aop->appId = $appId;
        $aop->rsaPrivateKey = $rsaPrivateKey;
        // $aop->alipayrsaPublicKey = $alipayrsaPublicKey;
        $aop->apiVersion = '1.0';
        $aop->signType = 'RSA2';
        $aop->postCharset='UTF-8';
        $aop->format='json';

        //调用getPublicKey从支付宝公钥证书中提取公钥
        $aop->alipayrsaPublicKey = $aop->getPublicKey($alipayCertPath);
        //是否校验自动下载的支付宝公钥证书，如果开启校验要保证支付宝根证书在有效期内
        $aop->isCheckAlipayPublicCert = true;
        //调用getCertSN获取证书序列号
        $aop->appCertSN = $aop->getCertSN($appCertPath);
        //调用getRootCertSN获取支付宝根证书序列号
        // $aop->alipayRootCertSN = $aop->getRootCertSN($rootCertPath);
        $aop->alipayRootCertSN = '687b59193f3f462dd5336e5abf83c5d8_02941eef3187dddf3d3b83462e1dfcf6';  //到2028年之前都不会变

        $request = new AlipayFundTransUniTransferRequest ();
        $request->setBizContent("{" .
        "\"out_biz_no\":\"" . $out_trade_no . "\"," .
        "\"trans_amount\":\"" . $amount . "\"," .
        "\"product_code\":\"TRANS_ACCOUNT_NO_PWD\"," .
        "\"biz_scene\":\"DIRECT_TRANSFER\"," .
        "\"order_title\":\"" . $desc . "\"," .
        "\"payee_info\":{" .
        "\"identity\":\"" . $account . "\"," .
        "\"identity_type\":\"ALIPAY_LOGON_ID\"," .
        "\"name\":\"" . $name . "\"" .
        "    }," .
        "\"remark\":\"" . $desc . "\"" .
        "  }");

        $result = $aop->execute($request);

        $responseNode = str_replace(".", "_", $request->getApiMethodName()) . "_response";
        $resultCode = $result->$responseNode->code;
        $sub_code = $result->$responseNode->sub_code;
        $sub_msg = $result->$responseNode->sub_msg;
        $status = $result->$responseNode->status;

        //初始化日志
        include_once(HUONIAOROOT."/api/payment/log.php");
        $_alipayTransfersLog= new CLogFileHandler(HUONIAOROOT . '/log/alipayTransfers/'.date('Y-m-d').'.log', true);
        $_alipayTransfersLog->DEBUG(json_encode($order, JSON_UNESCAPED_UNICODE));
        $_alipayTransfersLog->DEBUG($resultCode . '=>' . $status . '=>' . $sub_msg);

        if(!empty($resultCode) && $resultCode == 10000 && $status == "SUCCESS"){

            global $dsql;
            //记录ordernum，以及等待生成回单状态
            $sql = $dsql::SetQuery("update `#@__member_withdraw` set `ordernum`='$out_trade_no',`receipting`=3 where `id`=".$order['id']);
            $dsql->update($sql);

            return array("state" => 100, "date" => GetMkTime($result->$responseNode->trans_date), "payment_no" => $result->$responseNode->pay_fund_order_id);
        } else {
            return array("state" => 200, "info" => $resultCode . ":" . $sub_msg);
        }


    }

}
