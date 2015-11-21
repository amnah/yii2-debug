<?php

namespace amnah\yii2\debug;

use Yii;
use yii\helpers\Url;
use yii\web\View;

class Module extends \yii\debug\Module
{
    /**
     * @inheritdoc
     */
    public $controllerNamespace = 'amnah\yii2\debug\controllers';

    /**
     * @var bool Whether or not to limit the dropdown to current request only (plus ajax)
     *           If false, it will show ALL requests stored (which is ~ 50-60)
     */
    public $limitToCurrentRequest = true;

    /**
     * @var string Current request separator. This will appear in the dropdown to separate
     *             the current and old requests. Used only if [[limitToCurrentRequest]] = false
     */
    public $currentRequestSeparator= " ----- Current Request Above ----- ";

    /**
     * Override renderToolbar() function so we can use our own assets
     * @inheritdoc
     */
    public function renderToolbar($event)
    {
        if (!$this->checkAccess() || Yii::$app->getRequest()->getIsAjax()) {
            return;
        }

        $baseUrl = Url::toRoute(['/' . $this->id . '/default/toolbar']);
        $tag = $this->logTarget->tag;

        echo "<div id='yii-debug-toolbar' data-tag='{$tag}' style='display:none' class='yii-debug-toolbar-bottom'></div>";
        /* @var $view View */
        $view = $event->sender;

        // echo is used in order to support cases where asset manager is not available
        echo '<style>' . $view->renderPhpFile(__DIR__ . '/assets/toolbar.css') . '</style>';
        echo '<script>' . $view->renderPhpFile(__DIR__ . '/assets/toolbar.js', compact('baseUrl', 'tag')) . '</script>';
    }
}