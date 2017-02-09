<?php

namespace amnah\yii2\debug\controllers;

use Yii;
use yii\helpers\Url;
use yii\debug\models\search\Debug;

class DefaultController extends \yii\debug\controllers\DefaultController
{
    /**
     * Index page - show list of debug logs
     * @param string $tag
     * @param string $currentTag
     * @return string
     */
    public function actionIndex($tag = null, $currentTag = null)
    {
        $searchModel = new Debug();
        $dataProvider = $searchModel->search($_GET, $this->getManifest());

        // load latest request
        if (!$tag) {
            $tags = array_keys($this->getManifest());
            $tag = reset($tags);
        }
        $this->loadData($tag);

        // remove current tag if it's the same as the tag to view
        if ($currentTag && $currentTag == $tag) {
            $currentTag = null;
        }

        return $this->render('index', [
            'panels' => $this->module->panels,
            'dataProvider' => $dataProvider,
            'searchModel' => $searchModel,
            'manifest' => $this->getManifest(),
            'tag' => $tag,
            'currentTag' => $currentTag,
        ]);
    }

    /**
     * Toolbar (loaded via ajax)
     * @param string $tag
     * @param string $currentTag
     * @return string
     */
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
            $numCharsToTrim = 50;
            $route = str_replace($homeUrl, "", $row["url"]);
            if (strlen($route) > $numCharsToTrim) {
                $route = substr($route, 0, $numCharsToTrim) . " ...";
            }

            // add method and ajax to select option label
            $method = "[{$row["method"]}]";
            $ajax = $row["ajax"] ? "[ajax]" : "";
            $urls[$rowTag] = "$method $ajax $route";

            // set current tag if not explicitly set
            if (!$currentTag && !$row["ajax"]) {
                $currentTag = $rowTag;
            }

            // check for the current request tag
            if ($currentTag && $currentTag == $rowTag) {
                $count = $i;
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
            'currentTag' => $currentTag,
            'panels' => $this->module->panels,
            'position' => 'bottom',
        ]);
    }
}
