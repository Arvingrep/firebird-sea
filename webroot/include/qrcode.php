<?php
error_reporting(E_ERROR);

$qrType = (int)$_GET['qrType']; //0普通二维码  1小程序码  2条形码
$_qrUrl = urldecode($_GET["data"]);

//微信小程序码，分销商、外卖扫码点餐
if(($_GET['type'] == 'fenxiao' || $_GET['type'] == 'waimaiDesk') && $qrType != 2){

	//分销商
	if($_GET['type'] == 'fenxiao'){
		include dirname(__FILE__)."/config/fenxiaoConfig.inc.php";
		$qrType = (int)$cfg_fenxiaoQrType;

	//外卖扫码点餐
	}elseif($_GET['type'] == 'waimaiDesk'){
		include dirname(__FILE__)."/config/waimai.inc.php";
		$qrType = (int)$customDeskQrType;
	}

	//启用微信小程序码
	if($qrType == 1){

		//系统核心配置文件
		require_once(dirname(__FILE__).'/common.inc.php');
		$miniQr = createWxMiniProgramScene($_qrUrl, HUONIAOROOT, true);

		//生成成功
		if(!is_array($miniQr)){

			//分销商推广二维码需要生成海报，不支持302跳转模式，这里改成输入图片的方式
			if($_GET['type'] == 'fenxiao'){

				//本地图片
				class imgdata{
					public $imgsrc;
					public $imgdata;
					public $imgform;
					public function getdir($source){
						$this->imgsrc  = $source;
					}
					public function img2data(){
						$this->_imgfrom($this->imgsrc);
						return $this->imgdata=@fread(@fopen($this->imgsrc,'rb'),@filesize($this->imgsrc));
					}
					public function data2img(){
						header("content-type:$this->imgform");
						echo $this->imgdata;
					}
					public function _imgfrom($imgsrc){
						$info = @getimagesize($imgsrc);
						return $this->imgform = $info['mime'];
					}
				}

				//远程图片
				function GrabImage($url) {
					if ($url == "") return false;

					//通过CURL方式读取远程图片内容
					$curl = curl_init();
					curl_setopt($curl, CURLOPT_URL, $url);
					curl_setopt($curl, CURLOPT_HEADER, 0);
					curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
					curl_setopt($curl, CURLOPT_TIMEOUT, 5);
                    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
					$img = curl_exec($curl);
					curl_close($curl);

					header("content-type:image/jpeg");

					//如果下载失败则显示一张本地error图片
					if(empty($img)){
                        header('location:' . $url);die;
						$n = new imgdata;
						$n -> getdir(HUONIAOROOT."/static/images/404.jpg");
						$n -> img2data();
						$n -> data2img();
					}else{
						return $img;
					}
				}

                // header('location:' . $miniQr);die;
				echo GrabImage($miniQr);die;

			//不需要特殊处理的，直接跳转到二维码图片地址
			}else{
				header('location:' . $miniQr);
			}
			die;
		}

	//扫码点餐
	}elseif($_GET['type'] == 'waimaiDesk'){

		//系统核心配置文件
		require_once(dirname(__FILE__).'/common.inc.php');

		//引入配置文件
        $wechatConfig = HUONIAOINC."/config/wechatConfig.inc.php";
        if(!file_exists($wechatConfig)) return array("state" => 200, "info" => '请先设置微信开发者信息！');
        require($wechatConfig);

		//是否生成关注后发送链接
        $cfg_wechatPoster = (int)$cfg_wechatPoster;

		if($cfg_wechatPoster == 1){

			//提取店铺ID
			$urlArr = explode('-', $_qrUrl);
			$shopid = explode('.', $urlArr[1]);
			$shopid = $shopid[0];

			//获取店铺详情接口
			$shopTitle = $shopLogo = '';
			$configHandels = new handlers('waimai', 'storeDetail');
			$moduleConfig  = $configHandels->getHandle($shopid);
			if($moduleConfig['state'] == 100){
				$shopTitle = $moduleConfig['info']['shopname'];
				$shopLogo = $moduleConfig['info']['shop_banner'][0];
			}

			$param = array(
				'module' => 'waimai',
				'type' => 'desk',
				'aid' => $shopid,
				'title' => $shopTitle,
				'info' => '开始点餐~',
				'imgUrl' => $shopLogo,
				'redirect' => $_qrUrl
			);
			$configHandels = new handlers('siteConfig', 'getWeixinQrPost');
			$moduleConfig  = $configHandels->getHandle($param);

			if($moduleConfig['state'] == 100){
				$_qrUrl = $moduleConfig['info'];
			}

		}


	}

}

//条形码
if($qrType == 2){

    require_once 'picqer/barcode/Exceptions/BarcodeException.php';
    require_once 'picqer/barcode/Types/TypeInterface.php';
    require_once 'picqer/barcode/Types/TypeCode128.php';
    require_once 'picqer/barcode/Barcode.php';
    require_once 'picqer/barcode/BarcodeBar.php';
    require_once 'picqer/barcode/BarcodeGenerator.php';
    require_once 'picqer/barcode/BarcodeGeneratorPNG.php';

    try {
        // 直接通过完整命名空间调用
        $generator = new Picqer\Barcode\BarcodeGeneratorPNG();

        // 生成Code 128格式条码
        $barcodeData = $generator->getBarcode(
            $_qrUrl,        // 条码内容
            Picqer\Barcode\BarcodeGeneratorPNG::TYPE_CODE_128, // 条码类型
            $widthFactor = 2,   // 条码宽度系数
            $height = 80,       // 条码高度
            $foregroundColor = [0, 0, 0] // RGB颜色（黑色）
        );
        
        // 直接输出到浏览器
        header('Content-Type: image/png');
        echo $barcodeData;die;
        
        // 或者保存到文件
        // file_put_contents('barcode.png', $barcodeData);
        
    } catch (Exception $e) {
        die('生成条码失败: ' . $e->getMessage());
    }
}

//二维码
else{
    require_once 'phpqrcode/phpqrcode.php';
    QRcode::png($_qrUrl, false, 'L', 10, 1);
}
