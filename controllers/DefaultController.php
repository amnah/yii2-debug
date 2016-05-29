<?php

namespace amnah\yii2\debug\controllers;

use Yii;
use yii\helpers\Url;

class DefaultController extends \yii\debug\controllers\DefaultController
{
    public function actionToolbar($tag = null, $currentTag = null)
    {
        // get manifest and calculate tag if needed
        $manifest = $this->getManifest(true);
        if (!$tag) {
            $first = reset($manifest);
            $tag = $first["tag"];
        }

        // use manifest to build urls array for dropdown
        $i = 0;
        $count = 0;
        $urls = [];
        $homeUrl = rtrim(Url::to(["/"], true), "/");
        foreach ($manifest as $rowTag => $row) {

            // keep count of number of requests to get to current request
            $i++;

            // replace $homeUrl with empty and truncate
            $route = str_replace($homeUrl, "", $row["url"]);
            $route = mb_strimwidth($route, 0, 50, " ...");

            // add method and ajax to select option label
            $method = "[{$row["method"]}]";
            $ajax  = $row["ajax"] ? "[ajax]" : "";
            $urls[$rowTag] = "$method $ajax $route";

            // check for the start tag
            if ($currentTag && $currentTag == $rowTag) {
                $count = $i;

                // end here
                if ($this->module->limitToCurrentRequest) {
                    break;
                }
                $urls[0] = $this->module->currentRequestSeparator;
            }
        }

        // add count to labels
        $count = $count ?: count($manifest);
        if ($count > 1) {
            foreach ($urls as $k => $url) {
                if ($count > 0) {
                    $urls[$k] = "[$count] $url";
                }
                $count--;
            }
        }

        // load data and render
        $this->loadData($tag, 5);
        return $this->renderPartial('toolbar', [
            'urls' => $urls,
            'tag' => $tag,
            'panels' => $this->module->panels,
            'position' => 'bottom',
        ]);
    }
}
