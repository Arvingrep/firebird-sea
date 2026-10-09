<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * API接口调用公共文件
 *
 * @version        $Id: handlers.class.php 2013-3-20 下午17:35:18 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class handlers {
	private $service;         //服务名
	private $action;          //动作名
	private $callBack = array(
		"state" => "",
		"info"  => ""
	);

	/**
     * 构造函数
	 *
     * @param string $action 动作名
     */
    public function __construct($service = "", $action = ""){
		$this->service = $service;
		$this->action  = $action;
	}

	/**
     * 主方法
     * @return array
     */
	public function getHandle($param = array()){
		$service = (string)$this->service;
		$action  = (string)$this->action;

		if($service == "" || $action == ""){
			$this->callBack['state'] = 200;
			$this->callBack['info'] = "Error.";
			return $this->callBack;
		}

        $classfile = HUONIAOROOT.'/api/handlers/' . $service. '.class.php';
        if(!file_exists($classfile)){
            $this->callBack['state'] = 200;
			$this->callBack['info'] = "Error Service.";
			return $this->callBack;
        }

		//根据服务名载入类文件
        global $autoload;
        $autoload = false;
		$serviceHandler = new $service($param);

        //判断是否有权限
        if($service == 'task' && $action != 'config' && $serviceHandler->taskModuleAuth != ''){
            $this->callBack['state'] = 200;
			$this->callBack['info'] = $serviceHandler->taskModuleAuth;
            return $this->callBack;
        }

		//检测方法是否存在
		if(method_exists($serviceHandler, $action)){

			//执行动作
			$action = $serviceHandler->$action();
			if($action){
				if(@$action['state'] == 200 || @$action['state'] == 101){
					$this->callBack['state'] = 101;
					$this->callBack['info'] = $action['info'];
				}elseif(isset($action['info']) && isset($action['state'])){
                    $this->callBack = $action;
                }else{
                    
                    //微信支付返回的数据处理
                    if(is_string($action) && strstr($action, 'appId') && strstr($action, 'nonceStr') && strstr($action, 'package') ){
                        $action = json_decode($action, true);
                        $action = $action['info'];
                    }
                    
					$this->callBack['state'] = 100;
					$this->callBack['info'] = $action;
				}
			}else{
				$this->callBack['state'] = 102;
				$this->callBack['info'] = "No data!";
			}
		}else{
			$this->callBack['state'] = 200;
			$this->callBack['info'] = "Error Code: action no found";
		}
		return $this->callBack;
	}

}
