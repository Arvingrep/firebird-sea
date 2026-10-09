<?php

// This file is auto-generated, don't edit it. Thanks.

use Darabonba\OpenApi\OpenApiClient;

use Darabonba\OpenApi\Models\Config;
use Darabonba\OpenApi\Models\Params;
use AlibabaCloud\Tea\Utils\Utils\RuntimeOptions;
use Darabonba\OpenApi\Models\OpenApiRequest;

class moderation_text {

    /**
     * 使用AK&SK初始化账号Client
     * @return OpenApiClient Client
     */
    public static function createClient($accessKeyId, $accessKeySecret, $endpoint){
        // 工程代码泄露可能会导致 AccessKey 泄露，并威胁账号下所有资源的安全性。以下代码示例仅供参考。
        // 建议使用更安全的 STS 方式，更多鉴权访问方式请参见：https://help.aliyun.com/document_detail/311677.html。
        $config = new Config([
            // 必填，请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_ID。
            "accessKeyId" => $accessKeyId,
            // 必填，请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_SECRET。
            "accessKeySecret" => $accessKeySecret
        ]);
        // Endpoint 请参考 https://api.aliyun.com/product/Green
        $config->endpoint = $endpoint;
        return new OpenApiClient($config);
    }

    /**
     * API 相关
     * @return Params OpenApi.Params
     */
    public static function createApiInfo(){
        $params = new Params([
            // 接口名称
            "action" => "TextModerationPlus",
            // 接口版本
            "version" => "2022-03-02",
            // 接口协议
            "protocol" => "HTTPS",
            // 接口 HTTP 方法
            "method" => "POST",
            "authType" => "AK",
            "style" => "RPC",
            // 接口 PATH
            "pathname" => "/",
            // 接口请求体内容格式
            "reqBodyType" => "formData",
            // 接口响应体内容格式
            "bodyType" => "json"
        ]);
        return $params;
    }

    /**
     * @param string[] $args
     * @return void
     */
    public static function main($config = array()){
        $client = self::createClient($config['accessKeyId'], $config['accessKeySecret'], $config['endpoint']);
        $params = self::createApiInfo();
        // body params
        $body = [];
        $body["Service"] = "llm_query_moderation";
        $body["ServiceParameters"] = "{\"content\":\"".$config['content']."\"}";
        // runtime options
        $runtime = new RuntimeOptions([]);
        $request = new OpenApiRequest([
            "body" => $body
        ]);
        // 复制代码运行请自行打印 API 的返回值
        // 返回值实际为 Map 类型，可从 Map 中获得三类数据：响应体 body、响应头 headers、HTTP 返回的状态码 statusCode。
        $resp = $client->callApi($params, $request, $runtime);
        return $resp['body'];
    }
}
$path = __DIR__ . '/vendor/autoload.php';
if (file_exists($path)) {
    require_once $path;
}