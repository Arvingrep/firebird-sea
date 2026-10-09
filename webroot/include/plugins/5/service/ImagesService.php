<?php
require_once 'HttpDownService.php';

/**
 * html文本图片处理
 * Class ImagesService
 */
class ImagesService
{

    public $body;
    public $node;
    public $urlId;

    public function __construct($body, $node = 0, $urlId = 0)
    {
        $this->body  = $body;
        $this->node  = $node;
        $this->urlId = $urlId;
    }

    /**
     * @return bool|mixed|string
     */
    public function getNewsContent()
    {
        $imgs = $this->htmlImgs($this->body);
        if (empty($imgs)) return false;
        $imgNewPath = $this->downloadImg($imgs);
        $newBody    = $this->repBodyImg($imgNewPath, $imgs);
        return $newBody;
    }

    /**
     * 获取指定html中的图片
     * @param $html
     * @return array
     */
    function htmlImgs($html = '') {
        $imgs = array();
        if (empty($html)) return $imgs;
    
        // 提取img标签的src属性
        preg_match_all("/<img[^>]+>/i", $html, $imgMatches);
        foreach ($imgMatches[0] as $imgTag) {
            if (preg_match('/src=(["\'])(.*?)\1/i', $imgTag, $srcMatch)) {
                $imgs[] = html_entity_decode($srcMatch[2]);
            } elseif (preg_match('/src=([^"\'\\s>]+)/i', $imgTag, $srcMatch)) {
                $imgs[] = html_entity_decode($srcMatch[1]);
            }
        }
    
        // 提取<style>标签中的背景图片
        preg_match_all('/<style[^>]*>(.*?)<\/style>/is', $html, $styleBlocks);
        foreach ($styleBlocks[1] as $css) {
            $css = html_entity_decode($css);
            preg_match_all(
                '/background(-image)?\s*:\s*[^;}]*url\(\s*["\']?([^"\'\)]+)["\']?\s*\)/i',
                $css,
                $cssMatches,
                PREG_SET_ORDER
            );
            foreach ($cssMatches as $match) {
                $imgs[] = $match[2];
            }
        }
    
        // 提取内联样式（带引号，兼容HTML实体）
        preg_match_all('/ style=(["\']|&quot;|&#39;)(.*?)\1/i', $html, $inlineStyles, PREG_SET_ORDER);
        foreach ($inlineStyles as $styleMatch) {
            $styleContent = html_entity_decode($styleMatch[2], ENT_QUOTES);
            preg_match_all(
                '/background(-image)?\s*:\s*[^;}]*url\(\s*["\']?([^"\'\)]+)["\']?\s*\)/i',
                $styleContent,
                $inlineMatches,
                PREG_SET_ORDER
            );
            foreach ($inlineMatches as $match) {
                $imgs[] = $match[2];
            }
        }
    
        // 提取无引号的内联样式
        preg_match_all('/ style=([^"\'\\s>]+)/i', $html, $noQuoteStyles);
        foreach ($noQuoteStyles[1] as $styleContent) {
            $styleContent = html_entity_decode($styleContent, ENT_QUOTES);
            preg_match_all(
                '/background(-image)?\s*:\s*[^;}]*url\(\s*["\']?([^"\'\)]+)["\']?\s*\)/i',
                $styleContent,
                $noQuoteMatches,
                PREG_SET_ORDER
            );
            foreach ($noQuoteMatches as $match) {
                $imgs[] = $match[2];
            }
        }
    
        return array_values(array_unique($imgs));
    }

    /**
     * 下载图片到本地并且按顺序返回新的路径
     * @param $file_url
     * @return array
     */
    public function downloadImg($file_url)
    {

		global $cfg_atlasSize;
		global $cfg_atlasType;
		global $cfg_ftpType;
		global $editor_ftpType;
		global $editor_uploadDir;
		$editor_uploadDir = '/uploads';
		$editor_ftpType = $cfg_ftpType;

		$fileInfo = getRemoteImage($file_url, array(
			'savePath' => '../../../uploads/siteConfig/plugins/large/'.date( 'Y' ).'/'.date( 'm' ).'/'.date( 'd' ).'/',
			'maxSize' => $cfg_atlasSize,
			'allowFiles' => explode("|", $cfg_atlasType)
		), 'siteConfig', '../../..', false);

		$fileInfo = json_decode($fileInfo, true);

		$arr = array();
		if($fileInfo['state'] == 'SUCCESS'){
			foreach ($fileInfo['list'] as $key => $value) {
				array_push($arr, $value['url']);
			}
		}

        return $arr;
    }

    /**
     * 替换html中的图片链接为本地的链接  返回最后经过处理的body
     * @param $newSrc
     * @param $oldSrc
     * @return mixed|string
     */
    public function repBodyImg($newSrc, $oldSrc)
    {
        $newBody = '';
        foreach ($oldSrc as $k => $old) {
            $new = $newSrc[$k];
            $old1 = str_replace('&', '&amp;', $old);  //原文中有的地址参数中的&符号是&amp;在经过htmlImgs函数中的html_entity_decode处理后，会被转换成&，这里在对原文替换时，需要将&转换回&amp;
            if ($k == 0) {
                $newBody = str_replace($old, $new, $this->body);
                $newBody = str_replace($old1, $new, $newBody);
            } else {
                $newBody = str_replace($old, $new, $newBody);
                $newBody = str_replace($old1, $new, $newBody);
            }
        }
        return $newBody;
    }
}
