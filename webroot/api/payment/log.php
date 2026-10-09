<?php
//以下为日志

class CLogFileHandler
{
    private $_filepath; //文件路径
    private $_filename; //日志文件名
    private $_filehandle; //文件句柄
    private $_force;

    function __construct($fileName = 'log', $force = false)
    {
        // date_default_timezone_set('PRC');
        $this->_filename = $fileName;
        $this->_force = $force;
        $this->init($force);
    }

    /*
     * 构造函数调用，初始化文件保存路径，文件名
     */
    function init($force = false)
    {

		if(HUONIAOBUG == TRUE || $this->_force){
			if(!is_file($this->_filename)){
				createFile($this->_filename);
			}

	        //打开文件
	        $this->_filehandle = @fopen($this->_filename, "a+");

			$strLog = "\r\n[";
	        $strLog .= date("Y-m-d H:i:s") . ']  ' . $this->_getUrl() . "\r\n";

            //userAgent
            $strLog .= "userAgent: " . $_SERVER['HTTP_USER_AGENT'] . "\r\n";

            //获取POST数据
            $postData = $this->_postData();

            //记录POST数据
            if($postData){
	            $strLog .= "POST: " . $postData . "\r\n";
            }

            //获取INPUT数据
            $_INPUT = $GLOBALS["HTTP_RAW_POST_DATA"] ? $GLOBALS["HTTP_RAW_POST_DATA"] : file_get_contents("php://input");

            //判断是否是$_INPUT和$_POST数据相同，如果相同，则$_INPUT为空
            if($postData == $_INPUT){
                $_INPUT = '';
            }

            //记录$_INPUT数据
            if((!$this->_getData() && !$postData) || $_INPUT){
               $strLog .= "INPUT: " . $_INPUT . "\r\n";
            }

			//写日志
	        @fwrite($this->_filehandle, $strLog) !== false;
		}
    }

    /**
     *作用:初始化记录类,写入记录
     *输入:要写入的记录,可以是数组
     *输出:写入成功返回true失败返回false
     */
    public function DEBUG($log, $force = false)
    {
		if(HUONIAOBUG == TRUE || $this->_force){
	        if (empty($this->_filehandle))
	            return false;
	        $strLog = '';
	        if (is_array($log)) {
	            $strLog .= $this->array2string($log) . "\r\n";
	        } else {
	            $strLog .= $log . "\r\n";
	        }

	        //写日志
	        @fwrite($this->_filehandle, $strLog) !== false;
		}
    }

    function array2string($data)
    {
        $log_a = "";
        foreach ($data as $key => $value) {
            if (is_array($value)) $log_a .= "[" . $key . "] => (" . $this->array2string($value) . ") \r\n";
            else                    $log_a .= "[" . $key . "] => " . $value . "\r\n";
        }
        return $log_a;
    }

    /**
     *作用:获取完整URL路径
     *输入:完整URL路径
     *输出:URL路径字串
     */
    private function _getUrl()
    {
        $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : (isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'localhost');
        return 'http' . (((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https') || (isset($_SERVER['HTTP_X_CLIENT_SCHEME']) && $_SERVER['HTTP_X_CLIENT_SCHEME'] == 'https')) ? 's' : '')
        . '://'
        . $host
        . $_SERVER['REQUEST_URI'];
    }

    /**
     *作用:获取GET数据
     *输入:GET数据
     *输出:GET数组
     */
    private function _getData()
    {
        $strGet = '';
        if (isset($_GET) && count($_GET) > 0) {
            foreach ($_GET as $key => $val) {
                $strGet .= $key . '=' . $val . '&';
            }
        }
        $strGet=trim($strGet,'&');
        return $strGet;
    }

    /**
     *作用:获取POST数据
     *输入:POST数据
     *输出:POST数组
     */
    private function _postData()
    {
        $strPost = '';
        if (isset($_POST) && count($_POST) > 0) {
            foreach ($_POST as $key => $val) {
                $strPost .= $key . '=' . $val . '&';
            }
        }
        $strPost=trim($strPost,'&');
        return $strPost;
    }

    /**
     *功能: 析构函数，释放文件句柄
     *输入: 无
     *输出: 无
     */
    function __destruct()
    {
        //关闭文件
        if (!empty($this->_filehandle))
            @fclose($this->_filehandle);
    }
}
