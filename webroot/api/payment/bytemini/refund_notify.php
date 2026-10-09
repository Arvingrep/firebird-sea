<?php
//服务器异步通知页面路径
require_once(dirname(__FILE__)."/../../../include/common.inc.php");

//初始化日志
require_once dirname(__FILE__)."/../log.php";
$_byteminiLog= new CLogFileHandler(HUONIAOROOT . '/log/bytemini/' . date('Y-m-d').'_refund.log', true);

//引入配置文件
// require_once(dirname(__FILE__)."/bytemini.php");
// $payRequest = new bytemini();
//
// if($payRequest->respond()){
//     echo json_encode(array(
//         'err_no' => 0,
//         'err_tips' => 'success'
//     ));
// }else{
//     echo "fail";
// }
