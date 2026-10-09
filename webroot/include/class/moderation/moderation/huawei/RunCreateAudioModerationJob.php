<?php
namespace HuaweiCloud\SDK\Moderation\V3\Model;
require_once __DIR__."/vendor/autoload.php";
use HuaweiCloud\SDK\Core\Auth\BasicCredentials;
use HuaweiCloud\SDK\Core\Http\HttpConfig;
use HuaweiCloud\SDK\Core\Exceptions\ConnectionException;
use HuaweiCloud\SDK\Core\Exceptions\RequestTimeoutException;
use HuaweiCloud\SDK\Core\Exceptions\ServiceResponseException;
use HuaweiCloud\SDK\Moderation\V3\ModerationClient;
require_once __DIR__."/vendor/huaweicloud/huaweicloud-sdk-php/Services/Moderation/V3/Model/RunCreateAudioModerationJobRequest.php";

class HuaweiCloudCreateAudioModerationJob{

    public function exec(string $ak,string $sk,string $projectId,string $endpoint,string $url,string $callback=""){
        //endPoint : "https://moderation.cn-north-1.myhuaweicloud.com";
        $credentials = new BasicCredentials($ak,$sk,$projectId);
        $config = HttpConfig::getDefaultConfig();
        $config->setIgnoreSslVerification(true);

        $client = ModerationClient::newBuilder(new ModerationClient)
            ->withHttpConfig($config)
            ->withEndpoint($endpoint)
            ->withCredentials($credentials)
            ->build();
        $request = new RunCreateAudioModerationJobRequest();

        $body = new AudioCreateRequest();
        $listbodyCategories = array();
        array_push($listbodyCategories,"porn"); //涉黄检测
        array_push($listbodyCategories,"moan"); //娇喘检测
        array_push($listbodyCategories,"abuse"); //辱骂检测
        $databody = new AudioInputBody();
        $databody->setUrl($url); //音频url地址。
        if($callback){
            $body->setCallback($callback);  //回调http地址：当该字段非空时，服务将根据该字段回调通知用户审核结果。
        }
        $body->setCategories($listbodyCategories);
        $body->setEventType("default"); //音频类型，默认
        $body->setData($databody);
        $request->setBody($body);
        try {
            $response = $client->RunCreateAudioModerationJob($request);
            return $response;
        } catch (ConnectionException $e) {
            return false;
            $msg = $e->getMessage();
            echo "\n". $msg ."\n";
        } catch (RequestTimeoutException $e) {
            return false;
            $msg = $e->getMessage();
            echo "\n". $msg ."\n";
        } catch (ServiceResponseException $e) {
            return false;
            echo "\n";
            echo $e->getHttpStatusCode(). "\n";
            echo $e->getRequestId(). "\n";
            echo $e->getErrorCode() . "\n";
            echo $e->getErrorMsg() . "\n";
        }

    }
}

