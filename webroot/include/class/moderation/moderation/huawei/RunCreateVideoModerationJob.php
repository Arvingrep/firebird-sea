<?php
namespace HuaweiCloud\SDK\Moderation\V3\Model;
require_once __DIR__."/vendor/autoload.php";
use HuaweiCloud\SDK\Core\Auth\BasicCredentials;
use HuaweiCloud\SDK\Core\Http\HttpConfig;
use HuaweiCloud\SDK\Core\Exceptions\ConnectionException;
use HuaweiCloud\SDK\Core\Exceptions\RequestTimeoutException;
use HuaweiCloud\SDK\Core\Exceptions\ServiceResponseException;
use HuaweiCloud\SDK\Moderation\V3\ModerationClient;

class HuaweiCloudCreateVideoModerationJob{
    public function exec(string $ak,string $sk,string $projectId,string $endpoint,array $video,string $callback=""){
        $credentials = new BasicCredentials($ak,$sk,$projectId);
        $config = HttpConfig::getDefaultConfig();
        $config->setIgnoreSslVerification(true);

        $client = ModerationClient::newBuilder(new ModerationClient)
            ->withHttpConfig($config)
            ->withEndpoint($endpoint)
            ->withCredentials($credentials)
            ->build();
        $request = new RunCreateVideoModerationJobRequest();

        $body = new VideoCreateRequest();
        $listbodyAudioCategories = array();
        array_push($listbodyAudioCategories,"porn");  //涉黄检测
        array_push($listbodyAudioCategories,"moan");  //娇喘检测
        array_push($listbodyAudioCategories,"abuse"); //辱骂检测
        $listbodyImageCategories = array();
        array_push($listbodyImageCategories,"porn");  // 鉴黄内容的检测
        array_push($listbodyImageCategories,"terrorism");  // 暴恐内容的检测
        // array_push($listbodyImageCategories,"image_text");  // 图文违规内容的检测（检测图片中出现的广告、色情、暴恐的文字违规内容以及二维码内容）
        $databody = new VideoCreateRequestData();
        $videoUrl = $video['url'] ?? '';
        if(empty($videoUrl)){
            throw new \Exception("缺少视频Url地址");
        }
        $interView = $video['interval'] ? (int)$video['interval'] : 5;
        $databody->setUrl($videoUrl)  //视频url地址。
            ->setFrameInterval($interView);  //视频间隔
        if($callback){
            $body->setCallback($callback);  //回调地址
        }
        $body->setAudioCategories($listbodyAudioCategories);
        $body->setImageCategories($listbodyImageCategories);
        $body->setEventType("default");
        $body->setData($databody);
        $request->setBody($body);
        try {
            $response = $client->RunCreateVideoModerationJob($request);
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
            return false;         //异常直接false
            echo "\n";
            echo $e->getHttpStatusCode(). "\n";
            echo $e->getRequestId(). "\n";
            echo $e->getErrorCode() . "\n";
            echo $e->getErrorMsg() . "\n";
        }
    }
}

