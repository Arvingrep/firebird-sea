<?php  if(!defined('HUONIAOINC')) exit("Request Error!");
/**
 * 阿里云验证码
 *
 * @version        $Id: aliyunCaptcha.class.php 2024-4-29 下午15:42:32 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2024, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

use AlibabaCloud\SDK\Captcha\V20230305\Captcha;
use AlibabaCloud\Tea\Exception\TeaError;

use Darabonba\OpenApi\Models\Config;
use AlibabaCloud\SDK\Captcha\V20230305\Models\VerifyCaptchaRequest;
use AlibabaCloud\Tea\Utils\Utils\RuntimeOptions;

class aliyunCaptcha {

    /**
     * @param string[] $args
     * @return void
     */
    public static function main($args){

        $config = new Config(array(
            "accessKeyId" => $args['accessKeyId'],
            "accessKeySecret" => $args['accessKeySecret'],
            "endpoint" => $args['endpoint']
        ));
        $client = new Captcha($config);

        $verifyCaptchaRequest = new VerifyCaptchaRequest(array(
            "captchaVerifyParam" => str_replace(' ', '+', $args['captchaVerifyParam'])
        ));
        $runtime = new RuntimeOptions(array());

        try {
            $resp = $client->verifyCaptchaWithOptions($verifyCaptchaRequest, $runtime);
            $ret = objtoarr($resp);
            $verifyResult = (int)$ret['body']['result']['verifyResult'];
            if($verifyResult){
                return array('state' => 100, 'info' => $verifyResult);
            }else{
                return array('state' => 200, 'info' => "验证失败");
            }
        }
        catch (Exception $error) {
            if (!($error instanceof TeaError)) {
                $error = new TeaError([], $error->getMessage(), $error->getCode(), $error);
            }
            $ret = objtoarr($error);
            return array('state' => 200, 'info' => 'error code: ' . $ret['data']['statusCode'] . ', ' . $ret['data']['Message']);
        }

    }

}
$path = __DIR__ . \DIRECTORY_SEPARATOR . '..' . \DIRECTORY_SEPARATOR . 'vendor' . \DIRECTORY_SEPARATOR . 'autoload.php';
if (file_exists($path)) {
    require_once $path;
}