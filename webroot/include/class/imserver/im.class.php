<?php

class im {

    private $appid;
    private $appkey;

    /**
     * 构造函数
     *
     * @param string $appid  sdkappid
     * @param string $appkey sdkappid对应的appkey
     */
    public function __construct($appid, $appkey)
    {
        $this->appid =  $appid;
        $this->appkey = $appkey;
        include_once 'rongcloud.php';
        $this->RongCloud = new RongCloud($this->appid,$this->appkey);
    }

    /**
     * 获取token方法
     * $userid  $username $userlogo必传
     */
    public function getToken($userid,$username,$userlogo){
    	$userlogo = !empty($userlogo) ? $userlogo : 'static/images/default_user.jpg';
		$result = $this->RongCloud->user()->getToken($userid, $username, $userlogo);
		return $result;
    }

    /**
     * 封禁用户方法（每秒钟限 100 次）
     */
     public function block($userid,$limitTime='10'){
		$result = $this->RongCloud->user()->block($userid, $limitTime);
		return $result;
     }

     /**
     * 解除用户封禁方法（每秒钟限 100 次）
     */
     public function unblock($userid){
		$result = $this->RongCloud->user()->unBlock($userid);
		return $result;
     }

    /**
     * 创建聊天室
     * $chatRoomInfo=array();可传多个
     */
     public function createRoom($chatRoomInfo){
		$result = $this->RongCloud->chatroom()->create($chatRoomInfo);
		return $result;
     }

     /**
      * 添加禁言聊天室成员方法
      */
     public function addGagUser($userid,$roomid,$time='1'){
		$result = $this->RongCloud->chatroom()->addGagUser($userid,$roomid,$time);
		return $result;
     }

     /**
      * 移除禁言聊天室成员方法
      */
     public function rollbackGagUser($userid,$roomid){
		$result = $this->RongCloud->chatroom()->rollbackGagUser($userid,$roomid);
		return $result;
     }
}
?>