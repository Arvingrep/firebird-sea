<?php
/**
 * 根据内容生成图片
 *
 * @version        $Id: str2PNG.class.php 2014-03-25 下午14:43:20 $
 * @package        HuoNiao.Class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class str2PNG{
    public  $strMessageBody = "example"; // 要写入的字符串
    public  $strFontName = array("UKIJCJK.ttf");   //随机字体
    public  $intFontSize = 20;   //文字大小
    public  $rgbBackGroundColor = array(255, 255, 255);  //背景颜色
    public  $rgbFontColor = array(0, 0, 0);   //文字颜色
    public  $intAngle = 0;   //旋转
    public  $intPosition = array(5, 15);   //起始位置
    private $imgImage = NULL;

    public function __construct($strMessage = "example", $fontSize = 14, $fontColor = array(0, 0, 0)){
        $this->strMessageBody = $strMessage;
        $this->intFontSize = !empty($fontSize) ? $fontSize : 14;
        $this->rgbFontColor = $fontColor ? $fontColor : array(0, 0, 0);
        $this->intSize[0] = strlen($this->strMessageBody) * ($this->intFontSize-3.6);
        $this->intSize[1] = $this->intFontSize+6;
        $this->intPosition = array(2, ($this->intFontSize+3));
    }

    public function setColor(){
        if(NULL == $this->imgImage) return;
        imagecolorallocate($this->imgImage,
                           $this->rgbBackGroundColor[0],
                           $this->rgbBackGroundColor[1],
                           $this->rgbBackGroundColor[2]);
    }

    public function createFont(){
        if(NULL == $this->imgImage) return;
        $imgFontColor = imagecolorallocate($this->imgImage,
                                           $this->rgbFontColor[0],
                                           $this->rgbFontColor[1],
                                           $this->rgbFontColor[2]);
		$rand = rand(0, count($this->strFontName)-1);

        ImageTTFText($this->imgImage, $this->intFontSize, $this->intAngle,
                     $this->intPosition[0], $this->intPosition[1],
                     $imgFontColor, HUONIAOINC."/data/fonts/".$this->strFontName[$rand],
                     $this->strMessageBody);
    }
    public function createImage(){
        $this->imgImage = imagecreate($this->intSize[0], $this->intSize[1]);
        $this->setColor();
        $this->createFont();
        ImagePNG($this->imgImage);
    }

    public function __destruct(){
        if(NULL == $this->imgImage) return;
        ImageDestroy($this->imgImage);
    }
}
