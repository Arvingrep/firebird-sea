<?php
/**
 * 百度云相关接口调用
 *
 * @version        $Id: baidu.aip.func.php 2019-7-15 下午14:47:26 $
 * @package        HuoNiao.Libraries
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if (!defined('HUONIAOINC')) exit('Request Error!');

require_once(HUONIAOINC."/class/AipImageSearch.class.php");
require_once(HUONIAOINC."/class/AipNlp.class.php");

class baiduAipImageSearchClient {

    private $AppID = '';
    private $ApiKey = '';
    private $SecretKey = '';
    private $client;

    public function __construct(){

        include(HUONIAOINC . '/config/shop.inc.php');
        $this->AppID = $imagesearch_AppID;
        $this->ApiKey = $imagesearch_APIKey;
        $this->SecretKey = $imagesearch_Secret;

        if(!$this->AppID || !$this->ApiKey || !$this->SecretKey) return false;

        $this->client = new AipImageSearch($this->AppID, $this->ApiKey, $this->SecretKey);
    }

    // 带参数调用商品检索—入库, 图片参数为远程url图片
    public function productAddUrl($url = '', $config = ''){

        if(!$this->AppID || !$this->ApiKey || !$this->SecretKey) return false;

        $options = array();
        $options["brief"] = $config;

        return $this->client->productAddUrl($url, $options);
    }

    // 带参数调用商品检索—检索, 图片参数为远程url图片
    public function productSearchUrl($url = '', $config = array()){

        if(!$this->AppID || !$this->ApiKey || !$this->SecretKey) return false;

        return $this->client->productSearchUrl($url, $config);
    }

    // 带参数调用商品检索—更新, 图片参数为远程url图片
    public function productUpdateUrl($url = '', $config = ''){

        if(!$this->AppID || !$this->ApiKey || !$this->SecretKey) return false;

        $options = array();
        $options["brief"] = $config;

        return $this->client->productUpdateUrl($url, $options);
    }

    // 带参数调用商品检索—删除, 图片参数为远程url图片
    public function productDeleteByUrl($url = ''){

        if(!$this->AppID || !$this->ApiKey || !$this->SecretKey) return false;

        return $this->client->productDeleteByUrl($url);
    }

}


class baiduApiAddrsss{
    private $AppID = '';
    private $ApiKey = '';
    private $SecretKey = '';
    private $client;

    public function __construct(){
        global $cfg_juhe;
        $cfg_juhe = is_array($cfg_juhe) ? $cfg_juhe : unserialize($cfg_juhe);
        $this->AppID = $cfg_juhe['addressAppid'];
        $this->ApiKey = $cfg_juhe['addressApikey'];
        $this->SecretKey = $cfg_juhe['addressSecretkey'];
        if(!$this->AppID || !$this->ApiKey || !$this->SecretKey) return false;
        $this->client = new AipNlp($this->AppID, $this->ApiKey, $this->SecretKey);
    }
    //地址识别
    public function addRess($test = '', $options=array()){
        if(!$this->AppID || !$this->ApiKey || !$this->SecretKey) return false;
        return $this->client->address($test, $options);
    }
}

